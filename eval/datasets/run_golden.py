"""Chấm bộ câu hỏi vàng (golden.jsonl) cho moderator phòng học + RAG slide AICB, chạy k lần.

Chạy từ gốc repo:
    python eval/datasets/run_golden.py                                  # eval/datasets/golden.jsonl, offline, k=3
    python eval/datasets/run_golden.py --dataset eval/datasets/golden.template.jsonl --allow-examples
    python eval/datasets/run_golden.py --mode live                       # LLM + retriever theo backend/.env (tốn tiền)

offline: luật + LLM giả trung tính + BM25 trên backend/data/courses (không gọi mạng, không cần khoá).
live:    cấu hình thật trong backend/.env (LLM_PROVIDER, RETRIEVER_PROVIDER...).

Một dòng PASS khi: action thuộc expected_actions, slide expected_source nằm trong top-k của RAG (nếu có),
và gợi ý không chứa chuỗi nào trong must_not_contain. pass@k = ít nhất 1/k lần PASS; pass^k = cả k lần PASS.
Kết quả ghi vào eval/results/golden-<thời gian>/ (report.md, summary.json, results.jsonl).
"""

from __future__ import annotations

import argparse
import asyncio
import json
import statistics
import sys
import time
from datetime import datetime
from pathlib import Path
from uuid import NAMESPACE_URL, uuid5

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))
# Script entry point needs the backend source path before app imports.

from app.agents.moderator.contract import ModeratorInput  # noqa: E402
from app.agents.moderator.graph import (  # noqa: E402
    _build_llm,
    _build_retriever,
    build_moderator_graph,
    run_moderator,
)
from app.agents.moderator.llm import neutral_fake_llm  # noqa: E402
from app.agents.moderator.local_retriever import LocalRetriever  # noqa: E402
from app.agents.moderator.settings import ModeratorSettings, get_moderator_settings  # noqa: E402

ACTIONS = {"ALLOW", "GUIDE", "WARN", "BLOCK", "ESCALATE"}
CATEGORIES = {"on_topic", "off_topic", "edge"}
TARGETS = {"on_topic": 30, "off_topic": 15, "edge": 5}
DEFAULT_DATASET = ROOT / "eval" / "datasets" / "golden.jsonl"


def load_rows(path: Path, allow_examples: bool) -> list[dict]:
    rows = []
    for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        row = json.loads(line)
        problems = [f for f in ("id", "category", "course_id", "question", "expected_actions") if not row.get(f)]
        if row.get("category") not in CATEGORIES:
            problems.append("category")
        if not set(row.get("expected_actions") or []) <= ACTIONS:
            problems.append("expected_actions")
        if row.get("consent") is not True:
            problems.append("consent (phải là true: chỉ dùng câu đã được đồng ý)")
        if problems:
            raise SystemExit(f"{path.name} dòng {number}: thiếu/sai {', '.join(problems)}")
        if row.get("is_example") and not allow_examples:
            continue
        rows.append(row)
    if not rows:
        raise SystemExit("Không có dòng nào để chấm (dòng ví dụ bị bỏ qua; dùng --allow-examples để thử).")
    if len({r["id"] for r in rows}) != len(rows):
        raise SystemExit("id bị trùng")
    return rows


def build(mode: str):
    if mode == "live":
        settings = get_moderator_settings()
        retriever = _build_retriever(settings)
        return build_moderator_graph(_build_llm(settings), retriever, settings), retriever, settings.rag_top_k
    settings = ModeratorSettings(_env_file=None)
    retriever = LocalRetriever(ROOT / "backend" / "data" / "courses", min_score=settings.rag_local_min_score)
    return build_moderator_graph(neutral_fake_llm(), retriever, settings), retriever, settings.rag_top_k


async def run_once(row: dict, graph, retriever, top_k: int) -> dict:
    payload = ModeratorInput(
        session_id=uuid5(NAMESPACE_URL, f"golden-session:{row['id']}"),
        message_id=uuid5(NAMESPACE_URL, f"golden-message:{row['id']}"),
        sender_id=uuid5(NAMESPACE_URL, "golden-sender"),
        message=row["question"],
        course_id=row["course_id"],
    )
    start = time.perf_counter()
    output = await run_moderator(graph, payload)
    latency_ms = (time.perf_counter() - start) * 1000
    sources = []
    if row.get("expected_source"):
        sources = [s.source for s in await retriever.search(row["question"], row["course_id"], top_k)]
    guidance = output.guidance or ""
    checks = {
        "action_ok": output.action.value in row["expected_actions"],
        "rag_hit": (row["expected_source"] in sources) if row.get("expected_source") else None,
        "no_leak": not any(bad.casefold() in guidance.casefold() for bad in row.get("must_not_contain") or []),
    }
    passed = checks["action_ok"] and checks["no_leak"] and checks["rag_hit"] is not False
    return {"action": output.action.value, "guidance": guidance, "sources": sources, "latency_ms": latency_ms,
            **checks, "passed": passed}


def summarize(rows: list[dict], runs: list[list[dict]], k: int, mode: str, dataset: Path) -> dict:
    per_row = []
    for index, row in enumerate(rows):
        attempts = [run[index] for run in runs]
        signature = {json.dumps([a["action"], a["guidance"], a["sources"]], ensure_ascii=False) for a in attempts}
        per_row.append({"id": row["id"], "category": row["category"], "pass_at_k": any(a["passed"] for a in attempts),
                        "pass_hat_k": all(a["passed"] for a in attempts), "reproducible": len(signature) == 1})

    def rate(items, key):
        return round(sum(1 for i in items if i[key]) / len(items), 4) if items else None

    rag_rows = [a for run in runs for a in run if a["rag_hit"] is not None]
    by_category = {}
    for category in sorted(CATEGORIES):
        items = [p for p in per_row if p["category"] == category]
        by_category[category] = {"n": len(items), "target_min": TARGETS[category],
                                 "pass_at_k": rate(items, "pass_at_k"), "pass_hat_k": rate(items, "pass_hat_k")}
    latencies = [a["latency_ms"] for run in runs for a in run]
    return {
        "ran_at": datetime.now().astimezone().isoformat(timespec="seconds"), "mode": mode, "k": k,
        "dataset": dataset.resolve().relative_to(ROOT).as_posix() if dataset.resolve().is_relative_to(ROOT) else str(dataset),
        "rows": len(rows), "examples_included": any(r.get("is_example") for r in rows),
        "pass_rate_per_run": [round(sum(a["passed"] for a in run) / len(run), 4) for run in runs],
        "pass_at_k": rate(per_row, "pass_at_k"), "pass_hat_k": rate(per_row, "pass_hat_k"),
        "reproducibility": rate(per_row, "reproducible"),
        "action_accuracy": round(sum(a["action_ok"] for run in runs for a in run) / (len(rows) * k), 4),
        "rag_hit_at_k": round(sum(a["rag_hit"] for a in rag_rows) / len(rag_rows), 4) if rag_rows else None,
        "leaks": sum(not a["no_leak"] for run in runs for a in run),
        "latency_ms_p50": round(statistics.median(latencies), 1),
        "by_category": by_category, "per_row": per_row,
    }


def render(summary: dict, rows: list[dict], runs: list[list[dict]]) -> str:
    warn = "\n> **CHỈ CÓ DÒNG VÍ DỤ** — không dùng số này để báo cáo.\n" if summary["examples_included"] else ""
    lines = [f"# Golden eval — {summary['mode']} — {summary['ran_at']}", warn,
             f"- Dataset: `{summary['dataset']}` ({summary['rows']} câu), k = {summary['k']}", "",
             "| Chỉ số | Giá trị |", "|---|---|",
             f"| pass@{summary['k']} | {summary['pass_at_k']} |", f"| pass^{summary['k']} | {summary['pass_hat_k']} |",
             f"| Tỉ lệ PASS từng lần | {summary['pass_rate_per_run']} |",
             f"| Tái lập (cả k lần cho cùng kết quả) | {summary['reproducibility']} |",
             f"| Action đúng | {summary['action_accuracy']} |", f"| RAG hit@k | {summary['rag_hit_at_k']} |",
             f"| Số lần lộ chuỗi cấm | {summary['leaks']} |", f"| Latency p50 (ms) | {summary['latency_ms_p50']} |", "",
             "| Nhóm | Số câu | Tối thiểu | pass@k | pass^k |", "|---|---|---|---|---|"]
    for category, c in summary["by_category"].items():
        lines.append(f"| {category} | {c['n']} | {c['target_min']} | {c['pass_at_k']} | {c['pass_hat_k']} |")
    lines += ["", "## Câu chưa đạt (lần chạy đầu)", "", "| id | action | kỳ vọng | RAG | lộ |", "|---|---|---|---|---|"]
    for row, attempt in zip(rows, runs[0], strict=True):
        if not attempt["passed"]:
            lines.append(f"| {row['id']} | {attempt['action']} | {'/'.join(row['expected_actions'])} | "
                         f"{attempt['rag_hit']} | {not attempt['no_leak']} |")
    return "\n".join(lines) + "\n"


async def main_async(args) -> Path:
    rows = load_rows(args.dataset, args.allow_examples)
    graph, retriever, top_k = build(args.mode)
    runs = [[await run_once(row, graph, retriever, top_k) for row in rows] for _ in range(args.k)]
    summary = summarize(rows, runs, args.k, args.mode, args.dataset)
    out = args.out or ROOT / "eval" / "results" / f"golden-{args.mode}-{datetime.now():%Y%m%d-%H%M%S}"
    out.mkdir(parents=True, exist_ok=False)
    (out / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    (out / "report.md").write_text(render(summary, rows, runs), encoding="utf-8")
    with (out / "results.jsonl").open("w", encoding="utf-8") as handle:
        for run_index, run in enumerate(runs, 1):
            for row, attempt in zip(rows, run, strict=True):
                handle.write(json.dumps({"run": run_index, "id": row["id"], **attempt}, ensure_ascii=False) + "\n")
    print(json.dumps({key: summary[key] for key in ("rows", "pass_at_k", "pass_hat_k", "reproducibility",
                                                     "action_accuracy", "rag_hit_at_k", "leaks")}, ensure_ascii=False))
    print(f"-> {out}")
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--dataset", type=Path, default=DEFAULT_DATASET)
    parser.add_argument("--mode", choices=["offline", "live"], default="offline")
    parser.add_argument("--k", type=int, default=3)
    parser.add_argument("--out", type=Path)
    parser.add_argument("--allow-examples", action="store_true", help="chấm cả dòng is_example (chỉ để thử)")
    asyncio.run(main_async(parser.parse_args()))


if __name__ == "__main__":
    main()
