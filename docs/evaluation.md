# Đánh giá (Evaluation) — PeerBridge

> Khung 6 phần theo yêu cầu BTC. **Mọi con số dưới đây lấy từ output thật** của các runner trong `eval/` và
> `backend/app/**/eval*.py`, chạy lại ngày 14/10/2026 ở chế độ offline (không khoá API), hoặc từ báo cáo live đã
> commit (ghi rõ ngày). Dòng đánh dấu **TODO (nhóm)** là dữ liệu chỉ con người cung cấp được — không được điền số giả.
>
> Lưu ý chung: hầu hết bộ dữ liệu là **tổng hợp do tác tử AI/nhóm viết** (synthetic), chưa có người dùng thật.

Nội dung sản phẩm đang trình bày là **AICB Phase 1**. Các fixture SQL/Python của giai đoạn thử nghiệm chỉ chứng minh
đường ống chạy, không phải bằng chứng chất lượng trên học liệu AICB Phase 1.

---

## 1. Đặc tả benchmark (4-tuple: nhiệm vụ, đầu vào, đầu ra, cách chấm)

| # | Thành phần AI | Nhiệm vụ | Đầu vào | Đầu ra kỳ vọng | Cách chấm (metric) |
|---|---|---|---|---|---|
| B1 | Moderator phòng học | Chọn hành động kiểm duyệt cho một tin | Tin nhắn tiếng Việt (có teencode, không dấu, injection…) | `ALLOW/GUIDE/WARN/BLOCK/ESCALATE` + intent | Accuracy action (expected hoặc acceptable), accuracy intent, **lỗi nghiêm trọng** (cần BLOCK/ESCALATE mà ra ALLOW/GUIDE), báo nhầm, P/R theo action, latency p50/p95 |
| B2 | RAG slide | Lấy đúng tài liệu cho câu hỏi | Câu hỏi + `course_id` | Chunk đúng file nguồn | hit@1, hit@k, phân bố score câu liên quan/không liên quan |
| B3 | Chấm phiên (LLM-judge) | Phát hiện phiên lộ đáp án, mức Socratic | Bản ghi phiên | `leaked` true/false, Socratic high/low/none | Accuracy, precision/recall "lộ đáp án", accuracy nhãn Socratic |
| B4 | Plan agent | Chia việc + xếp lịch hợp lệ cho cặp | Mục tiêu, concept, giờ rảnh 2 người | Plan qua validator (tiên quyết, không trùng giờ, ngân sách phút) | Tỷ lệ cặp được chấp nhận, hard-pass sau validator, tỷ lệ plan thiếu (partial), số lần phải sửa |
| B5 | AI Vision check-in | Nhận ảnh học → concept → mục trong plan | Ảnh + danh sách mục đang mở | Có phải ảnh học không; concept top-1; quyết định tự xong/hỏi lại | study-detection acc, concept top-1, precision tự đánh dấu xong, tỉ lệ hỏi lại, latency, USD/ảnh |
| B6 | Onboarding / ghép cặp / đo tiến độ (Data 1) | Chuẩn hoá chủ đề → concept; gợi ý bạn; tính nhịp | Fixture hồ sơ/chủ đề/check-in | Concept đúng; bạn đúng nhóm trong top-3; số đo đúng | Accuracy; precision@3; số ca pass |

---

## 2. Bộ dữ liệu vàng (golden dataset)

| Bộ | File | Kích thước | Nguồn | Tách split |
|---|---|---|---|---|
| Moderator | `backend/app/agents/moderator/eval/dataset.jsonl`, `holdout.jsonl` | 72 + 12 tin, 15 category | Nhóm/AI viết | dev / test / holdout |
| RAG | `backend/app/agents/moderator/eval/rag_queries.jsonl` | 20 câu (15 liên quan, 5 không) | Nhóm/AI viết | — |
| Chấm phiên | `backend/app/session_review/eval_dataset.jsonl` | 10 phiên | Nhóm/AI viết | — |
| Plan | `eval/plan/dataset.json` | 10 cặp / 20 persona | Synthetic | 7 development, 3 holdout |
| Vision | `eval/vision/labels.synthetic.csv` (12 ảnh tổng hợp SQL/Python từ bản thử nghiệm), `eval/vision/labels.csv` (4 dòng nhãn mẫu AICB Phase 1, **chưa có file ảnh thật**) | 12 ảnh dùng được để thử đường ống offline; 0 ảnh thật | Ảnh tổng hợp; nhãn ảnh thật mới là mẫu để nhóm bổ sung | — |
| Concept / matching / measurement | `eval/concept/phase1_cases.jsonl`, `eval/matching/personas.json`, `eval/measurement/scenarios.json` | 30 / 30 / 20 | Synthetic do tác tử AI viết | — |

- **TODO (nhóm):** bộ câu hỏi vàng do người thật (sinh viên/giảng viên AICB) viết, có nhãn độc lập.
- **TODO (Tú):** thu khoảng 40 ảnh check-in thật có nhãn cho B5 (hiện 0 ảnh thật trong repo; 4 dòng ở `labels.csv` chỉ là mẫu và chưa chạy được).

---

## 3. Số đo định lượng

### 3.1 Kết quả chạy lại 14/10/2026 (offline, không gọi API)

Lệnh chạy (từ gốc repo, `OPENAI_API_KEY` để trống):

```powershell
python eval/concept/run_phase1.py
python eval/matching/run_phase2a.py
python eval/measurement/run_phase2b.py
python eval/plan/run.py --mode template --split development --output <thư-mục-mới>   # tương tự fake/holdout, rồi --summarize
python eval/vision/run_eval.py --labels eval/vision/labels.synthetic.csv --fixtures eval/vision/fixtures.json --provider fake --out <thư-mục>
cd backend; python -m app.agents.moderator.eval.run --mode rules --split all
cd backend; python -m app.session_review.eval --mode rules
```

| Bộ | Chế độ | Kết quả |
|---|---|---|
| B1 Moderator | rules (FakeLLM trung tính), 72 tin | Action đúng **91.7%**, intent **80.6%**, lỗi nghiêm trọng **0**, báo nhầm 4, ESCALATE P=0.70 R=1.00, BLOCK P=0.89 R=1.00, p50/p95 4/5 ms. 14 "lỗi LLM" là do FakeLLM trung tính không trả trường `guidance` nên node dùng gợi ý mẫu — đặc điểm của chế độ rules, không phải lỗi production. Báo cáo: `eval/moderator/report-2026-10-14-rules-all.md` |
| B3 Chấm phiên | rules, 10 phiên | Phát hiện lộ đáp án đúng 70%, precision 100%, **recall 25%**, nhãn Socratic đúng 100% (giống hệt báo cáo 09/10) |
| B4 Plan | template + fake, 10 cặp | 9/10 cặp được chấp nhận (1 bị từ chối: `UNKNOWN_PREREQUISITE`), 18/18 plan cá nhân qua validator, 6/18 plan thiếu việc (partial). Fake: 9/9 lỗi lần đầu là lỗi cố ý tiêm vào và đều sửa được. Số người chấm = 0 |
| B5 Vision | fake, 12 ảnh tổng hợp | Chỉ kiểm tra đường ống chạy hết (0 lỗi, p50 16 ms). FakeLLM không nhìn ảnh nên độ chính xác (top-1 11%) **không có ý nghĩa chất lượng** |
| B6 Concept | local lexical + luật | 30/30 đúng (accuracy 1.0) |
| B6 Matching | deterministic | precision@3 = 1.0 (mục tiêu 0.7), 90 kiểm tra lời giải thích, 0 sai sự thật |
| B6 Measurement | — | 20/20 ca pass |

### 3.2 Kết quả live đã commit (OpenAI `gpt-4.1-mini`, 01/10/2026)

| Bộ | Kết quả | Nguồn |
|---|---|---|
| B1 Moderator — test (33 tin) | Action 87.9%, intent 81.8%, lỗi nghiêm trọng 0, báo nhầm 3, p50/p95 1344/3869 ms | `eval/moderator/report-2026-10-01-live-test.md` |
| B1 Moderator — holdout (12 tin) | Action 100%, intent 83.3%, lỗi nghiêm trọng 0, báo nhầm 0, p50/p95 1254/2326 ms | `eval/moderator/report-2026-10-01-live-holdout.md` |
| B2 RAG (Qdrant + E5, corpus demo 3 bài) | hit@1 93.3%, hit@4 100% | `eval/moderator/rag-report-2026-10-01.md` |

- RAG cấu hình cho bản demo là **BM25 trên 15 bài học AICB Phase 1**, khác corpus/retriever của báo cáo 01/10.
  **TODO:** chạy lại B2 trên `data/courses/aicb`; chưa coi kết quả Qdrant/E5 cũ là chất lượng của cấu hình hiện tại.
- **TODO (cần khoá API):** B3 chế độ `--mode live`, B4 provider `openai_compatible`, B5 với ảnh thật.

### 3.3 pass@k / pass^k và khả năng tái lập

- Định nghĩa dùng ở đây: *pass@k* = ít nhất 1 trong k lần chạy đạt; *pass^k* = cả k lần đều đạt (đo độ ổn định).
- Offline (14/10): chạy concept, matching, measurement, moderator-rules **3 lần liên tiếp**; output (bỏ trường latency) có
  hash giống hệt cả 3 lần → các runner offline là **tất định**, pass^3 = pass@3 = 1 với ngưỡng của từng bộ
  (concept 30/30, matching P@3 ≥ 0.7, measurement 20/20, moderator 0 lỗi nghiêm trọng).
- Plan runner lưu `prompt_sha256` và `dataset_sha256` cho mỗi lần chạy (`92efe6e9…`, `c7f1a9c0…`/`4ee38c08…`) để đối chiếu.
- **TODO:** pass@k / pass^k cho chế độ live (LLM không tất định) — chạy B1 live k=5 lần trên holdout, ghi tỷ lệ lần nào cũng 0 lỗi nghiêm trọng.

---

## 4. Mốc so sánh: con người và đối thủ

| So với | Trạng thái |
|---|---|
| Baseline không AI (trong code) | Có: moderator chế độ rules (91.7% action, nhưng intent thấp hơn live), chấm phiên rules (recall lộ đáp án 25%), plan `template`, xếp hạng ghép cặp theo công thức |
| Người chấm (human baseline) | **TODO (nhóm):** 2 người tự gán nhãn holdout moderator + 10 phiên, đo độ đồng thuận với AI |
| Đối thủ (vd. nhóm học Zalo/Discord, Studyverse, Focusmate) | **TODO (nhóm):** bảng so sánh tính năng; không có số đo |

---

## 5. Phản hồi người dùng thật (≥ 5)

Nhóm đã cung cấp ghi chú phỏng vấn của 5 sinh viên. [Báo cáo phỏng vấn](user-feedback.md) ghi ý kiến từng người, các chủ đề lặp lại và đề xuất ưu tiên. Hai vấn đề nổi bật là bước tiếp theo trong luồng cam kết/lịch/timeline chưa rõ và điều phối buổi học chưa đủ dễ theo dõi.

Chưa có ngày phỏng vấn, xác nhận đồng ý, bản ghi nguyên văn, điểm khảo sát Q1–Q3 hoặc bằng chứng từng người đã thao tác tính năng nào. Vì vậy đây là **phản hồi định tính do nhóm cung cấp**, chưa thể tính điểm trung bình hay khẳng định hiệu quả trên người dùng thật. Cần thu thập các thông tin đó và thử lại sau khi sửa UX.

---

## 6. Trước / sau (before/after)

| Thay đổi | Trước | Sau | Nguồn |
|---|---|---|---|
| Luật hai tầng cho moderator (`304418d`) | rules/all 01/10: action 81.9%, intent 66.7%, **1** lỗi nghiêm trọng | rules/all 14/10: action 91.7%, intent 80.6%, **0** lỗi nghiêm trọng | `eval/moderator/report-2026-10-01-rules-all.md` vs `report-2026-10-14-rules-all.md` (cùng dataset 72 tin; giữa hai lần còn các commit `82a581d`, `7666587`) |
| Thêm LLM vào moderator | rules (01/10, dev): xem báo cáo | live test 87.9% / holdout 100% action | `eval/moderator/report-2026-10-01-*` |
| Prefilter trước LLM (ADR-003) | mọi tin gọi LLM | tin xã giao ngắn bỏ qua LLM | **TODO:** số tin được lọc / chi phí tiết kiệm lấy từ trang Admin khi có người dùng |
| Trần chi phí (ADR-002) | không giới hạn | tối đa 2 USD/ngày | **TODO:** chi phí thực tế/ngày từ "Số liệu AI" |
