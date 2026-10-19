"""Quét PII/bí mật trong các file git đang theo dõi. Chạy từ gốc repo: python privacy/pii_scan.py [--json out.json]

Tìm: số điện thoại VN, email, số CCCD 12 chữ số, khoá API (OpenAI, GitHub, Google, AWS, JWT), file database/nhị phân
và file > 10MB đang được commit. Chỉ in vị trí + mẫu đã che, không in giá trị đầy đủ.
"""

import argparse
import json
import re
import subprocess
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATTERNS = {
    "phone_vn": re.compile(r"(?<![\d.])(?:\+84|0)(?:3|5|7|8|9)\d{8}(?!\d)"),
    "email": re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"),
    "cccd_12": re.compile(r"(?<![\d.])0\d{11}(?!\d)"),
    "openai_key": re.compile(r"\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}"),
    "github_token": re.compile(r"\bgh[pousr]_[A-Za-z0-9]{30,}"),
    "google_key": re.compile(r"\bAIza[0-9A-Za-z_-]{35}"),
    "aws_key": re.compile(r"\bAKIA[0-9A-Z]{16}"),
    "jwt": re.compile(r"\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}"),
}
# Email/miền rõ ràng là giả, dùng trong test và tài liệu.
SAFE_EMAIL = re.compile(
    r"@(example\.(com|org|net|test)|.*\.test|.*\.invalid|.*\.local|demo\.peerbridge|mau\.peerbridge|"
    r"anthropic\.com|users\.noreply\.github\.com)$|^(git|noreply)@",
    re.IGNORECASE,
)
DB_SUFFIXES = {".db", ".sqlite", ".sqlite3", ".db-wal", ".db-shm"}
BINARY_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico", ".pdf", ".woff", ".woff2", ".ttf", ".zip"}
MAX_BYTES = 10 * 1024 * 1024


def tracked_files() -> list[str]:
    out = subprocess.run(["git", "ls-files", "-z"], cwd=ROOT, capture_output=True, check=True).stdout
    return [p for p in out.decode("utf-8").split("\0") if p]


def mask(value: str) -> str:
    return value[:3] + "…" + value[-2:] if len(value) > 6 else "…"


def scan() -> dict:
    findings, files_by_kind = [], {"database": [], "large": [], "binary": Counter()}
    for rel in tracked_files():
        path = ROOT / rel
        if not path.is_file():
            continue
        suffix = path.suffix.lower()
        size = path.stat().st_size
        if suffix in DB_SUFFIXES:
            files_by_kind["database"].append(rel)
        if size > MAX_BYTES:
            files_by_kind["large"].append(f"{rel} ({size / 1e6:.1f} MB)")
        if suffix in BINARY_SUFFIXES:
            files_by_kind["binary"][Path(rel).parts[0]] += 1
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for number, line in enumerate(text.splitlines(), 1):
            for kind, pattern in PATTERNS.items():
                for match in pattern.finditer(line):
                    value = match.group(0)
                    if kind == "email" and SAFE_EMAIL.search(value):
                        continue
                    findings.append({"kind": kind, "file": rel, "line": number, "sample": mask(value)})
    return {"findings": findings, "database_files": files_by_kind["database"],
            "large_files": files_by_kind["large"], "binary_files_by_top_dir": dict(files_by_kind["binary"])}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", type=Path)
    args = parser.parse_args()
    result = scan()
    counts = Counter((f["kind"], f["file"].split("/")[0]) for f in result["findings"])
    for (kind, top), n in sorted(counts.items()):
        print(f"{kind:13} {top:20} {n}")
    print("database files:", result["database_files"] or "none")
    print("files > 10MB:", result["large_files"] or "none")
    print("binary files by dir:", result["binary_files_by_top_dir"])
    if args.json:
        args.json.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
