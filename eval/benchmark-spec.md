# Đặc tả benchmark (4-tuple) cho từng tính năng AI

Mỗi tính năng ghi đủ 4 thành phần **(Nhiệm vụ, Đầu vào, Đầu ra, Cách chấm)**, kèm bộ dữ liệu, lệnh chạy và ngưỡng.
Ngưỡng ghi "(đề xuất)" là mục tiêu nhóm đặt ra, chưa được kiểm chứng trên người dùng thật. Số liệu đã đo: `docs/evaluation.md`.

Phạm vi nội dung hiện tại là **AICB Phase 1** (`course_id=aicb`). Bộ câu hỏi vàng do người thật chưa được thu;
`eval/datasets/golden.template.jsonl` chỉ chứa ví dụ và không thay thế dữ liệu thật.

## 1. Moderator phòng học

| | |
|---|---|
| Nhiệm vụ | Quyết định xử lý mỗi tin nhắn trong phòng học |
| Đầu vào | Tin nhắn tiếng Việt/Anh (≤ 2000 ký tự) + lịch sử gần nhất + `course_id` |
| Đầu ra | `action` ∈ {ALLOW, GUIDE, WARN, BLOCK, ESCALATE}, `intent`, `risk_score`, `guidance` (nếu GUIDE/WARN) |
| Cách chấm | Action đúng (expected hoặc acceptable); **lỗi nghiêm trọng** = cần BLOCK/ESCALATE mà ra ALLOW/GUIDE; báo nhầm; precision/recall theo action; output guard vi phạm; latency p50/p95 |
| Dữ liệu | `backend/app/agents/moderator/eval/dataset.jsonl` (72, dev/test), `holdout.jsonl` (12); golden người thật: `eval/datasets/golden.jsonl` (**chưa có**, xem file mẫu) |
| Chạy | `cd backend; python -m app.agents.moderator.eval.run --mode rules --split all` · `python eval/datasets/run_golden.py` |
| Ngưỡng | Lỗi nghiêm trọng = 0 (bắt buộc); action đúng ≥ 85% (đề xuất); p95 < 5 s với LLM thật (đề xuất) |

## 2. RAG gia sư (gợi ý Socratic dựa trên slide AICB)

| | |
|---|---|
| Nhiệm vụ | Tìm đúng slide cho câu hỏi và viết gợi ý dạng câu hỏi, không lộ đáp án |
| Đầu vào | Câu hỏi + `course_id=aicb`; corpus 15 file `backend/data/courses/aicb/*.md` (BM25) |
| Đầu ra | Top-k nguồn (file, slide, điểm) + `guidance` kèm dòng trích nguồn |
| Cách chấm | hit@k (slide `expected_source` nằm trong top-k); tỉ lệ gợi ý chứa chuỗi cấm `must_not_contain`; tỉ lệ gợi ý qua output guard; pass@3 / pass^3 |
| Dữ liệu | `eval/datasets/golden.jsonl` (**chưa có**; câu `on_topic` cần `expected_source`); báo cáo cũ trên corpus demo: `eval/moderator/rag-report-2026-10-01.md` |
| Chạy | `python eval/datasets/run_golden.py` (offline) · `--mode live` |
| Ngưỡng | hit@4 ≥ 80% (đề xuất); lộ chuỗi cấm = 0 (bắt buộc) |

## 3. Plan agent (chia việc + xếp lịch cho cặp)

| | |
|---|---|
| Nhiệm vụ | Chia mục tiêu của 2 bạn thành việc theo concept chuẩn và xếp vào giờ rảnh |
| Đầu vào | Mục tiêu, concept cần học (danh mục Data 1), giờ rảnh, ngân sách phút/tuần của mỗi người |
| Đầu ra | Plan cá nhân: việc (concept, hành động, sản phẩm đầu ra, phút), giờ bắt đầu/kết thúc, việc hoãn |
| Cách chấm | Tỉ lệ cặp được chấp nhận; hard-pass sau validator (tiên quyết, trùng giờ, vượt ngân sách, URL bịa); tỉ lệ plan thiếu việc; số lần sửa; điểm rubric người chấm 1–5 |
| Dữ liệu | `eval/plan/dataset.json` (10 cặp/20 persona synthetic; 7 dev, 3 holdout); rubric trong `eval/plan/rubric.py` |
| Chạy | `python eval/plan/run.py --mode template --split development --output <thư-mục-mới>` (xem `eval/plan/README.md`) |
| Ngưỡng | Hard-pass 100% (bắt buộc); rubric người chấm ≥ 4.0 (mục tiêu sẵn có trong runner, **chưa có người chấm**) |

## 4. AI Vision check-in

| | |
|---|---|
| Nhiệm vụ | Nhận ra ảnh có phải đang học không, học concept nào, gắn vào mục plan nào |
| Đầu vào | Ảnh (đã bỏ metadata, ≤ 1568 px) + ghi chú + danh sách concept trong plan tuần |
| Đầu ra | `is_study`, `concepts` (chỉ trong danh sách cho phép), `confidence`, mô tả; quyết định DONE / NEEDS_CONFIRM / NOT_STUDY / FAILED |
| Cách chấm | Độ đúng phát hiện ảnh học; concept top-1; precision khi tự đánh dấu xong; tỉ lệ hỏi lại; recall ảnh không học; latency p50/p90; USD/ảnh; quét ngưỡng 0.5–0.9 |
| Dữ liệu | `eval/vision/labels.csv` (ảnh thật AICB Phase 1, **cần ~40**), `labels.synthetic.csv` (12 ảnh tổng hợp SQL/Python cũ — chỉ thử đường ống) |
| Chạy | `python eval/vision/run_eval.py --labels eval/vision/labels.csv --fixtures eval/vision/fixtures.aicb-phase1.json --models gpt-4.1-mini` (xem `eval/vision/README.md`) |
| Ngưỡng | Precision tự đánh dấu xong ≥ 90% (đề xuất, vì tự đánh dấu sai làm hỏng tiến độ); recall ảnh không học ≥ 80% (đề xuất) |

## 5. Ghép cặp (Data 1)

| | |
|---|---|
| Nhiệm vụ | Gợi ý bạn học bổ trợ nhau (A cần cái B giỏi và ngược lại), hợp lịch rảnh |
| Đầu vào | Hồ sơ concept cần/giỏi, lịch rảnh, sở thích của người tìm và các ứng viên |
| Đầu ra | Danh sách xếp hạng kèm điểm thành phần và lời giải thích |
| Cách chấm | precision@3 theo nhóm bổ trợ đã gán nhãn; kiểm tra lời giải thích không sai sự thật; review tay 20 lời giải thích |
| Dữ liệu | `eval/matching/personas.json` (30 persona synthetic), `explanation_review.json` |
| Chạy | `python eval/matching/run_phase2a.py` |
| Ngưỡng | precision@3 ≥ 0.7 (mục tiêu trong runner); 0 lời giải thích sai sự thật |
