# PeerBridge: đối chiếu Day slides và triển khai trên repository

Ngày kiểm tra: 2026-10-03. Baseline là code `HEAD` của repository này, không phải ZIP được mô tả trong tài liệu tham chiếu. Các số đo bên dưới là offline; chưa có cấu hình LLM/E5 thật trên máy.

## Căn cứ và phạm vi

<<<<<<< HEAD
Nguồn tham chiếu lịch sử: bản thiết kế PeerBridge DaySlides AI Design và các PDF Day3, Day4, Day4.2, Day4.3, Day7, Day8. Các tệp này không được lưu trong repository; cần bản gốc từ nhóm để đối chiếu lại nội dung bên dưới.
=======
Nguồn: [bản thiết kế](reference/PeerBridge_DaySlides_AI_Design.md), [Day3](reference/Day3.pdf), [Day4](reference/Day4.pdf), [Day4.2](reference/Day4.2.pdf), [Day4.3](<reference/Day 4.3.pdf>), [Day7](reference/Day7.pdf), [Day8](reference/Day8.pdf).
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

- Day3: Agentic Fit, anti-pattern và ReAct. Matching giữ thuật toán hiện có; moderator dùng workflow hữu hạn để đáp ứng chat realtime.
- Day4: system/user boundary, JSON contract, injection và LangGraph state/node/edge. Nội dung chat/tài liệu là dữ liệu, không cấp quyền phát tin.
- Day4.2/4.3: prompt/context/loop/harness; success predicate, budget, escalation, permission gate ngoài model và version log. DAG không cần no-progress detector cho vòng lặp chưa tồn tại.
- Day7: knowledge/operational/contextual data, E5 prefix, cấu trúc chunk, metadata, ACL trong ANN và Recall@k.
- Day8: ba pipeline offline indexing/online retrieval/generation; tách lỗi retrieval khỏi generator; golden evidence và triad.

PDF có 94, 204, 78, 121, 97 và 139 trang tương ứng. Trích xuất pypdf có cảnh báo thiếu fontTools với font CFF toán học; không coi biểu đồ và công thức trích xuất thành text là đã được kiểm chứng thị giác.

## Sai khác đã xác nhận bằng mã nguồn

| Thành phần | Baseline thực tế | Thay đổi hiện tại |
|---|---|---|
| Study Room WS | Luôn broadcast nội dung gốc, kể cả BLOCK/WARN/ESCALATE | Chỉ ALLOW/GUIDE phát chung; các quyết định giữ lại gửi riêng socket người gửi |
| REST history | Đọc tất cả `chat_messages` | Chỉ tin có quyết định ALLOW/GUIDE hiệu lực; pending/legacy không được tự cho phép |
| Moderator lỗi | Classifier lỗi có thể quay về CONCEPT_QUESTION và ALLOW | ESCALATE nếu classifier unavailable và không có hard rule; lỗi service được lưu review event |
| Hard rules | Vẫn gọi LLM với PII/gian lận rõ | `preflight_rules` bỏ qua LLM cho hard rule |
| Graph | Không có verify node/call counter/tổng timeout | `verify_contract`, verified gate, 1–3 call mỗi lượt, timeout và stop reason |
| Provider | Thiếu key khi chọn OpenAI thì âm thầm dùng fake | Cấu hình thiếu key thất bại; wrapper giữ tin để review |
| Giảng viên | Role INSTRUCTOR có quyền trên mọi phiên/event | Phải có `session_instructors`; list/read/review cùng kiểm tra assignment |
| Course | Study Room mặc định truy xuất `demo-course` | Course lấy từ DB; cả learner/helper phải có membership; chưa gán course dùng template và không retrieve |
| Review | Chỉ lưu quyết định | Explicit OVERRIDE ALLOW/GUIDE có thể phát tin bị giữ sau commit; APPROVE ESCALATE không phát |
| UI review | Queue, nội dung, kết quả xử lý và số đếm giả | API thật, loading/error/empty, nội dung đúng event, ghi review backend |
| Privacy | Raw contact được giữ trong chat | Email/SĐT được che trước lưu; nội dung gốc chỉ sống trong invocation; lỗi hệ thống trả mã loại, không trả exception text |
| Quota | REST rate limit không bảo vệ WS | Quota DB theo user/phút, áp dụng qua nhiều instance |
| Indexing | Delete trước embedding; không source hash | Chuẩn bị/validate vectors trước delete; SHA-256, section/page/model metadata; có rebuild staging + atomic alias |
| RAG eval | Source hit@k | Bổ sung `expected_chunk_ids`, evidence Recall@k và dataset CLI |
| Audit | DTO audit riêng không đi xuyên service DB | Trace ID/prompt version/call count/stop reason/latency và nguồn được truyền vào moderation context |

## Thứ tự triển khai và tình trạng

1. **P0 release boundary:** WS sender-only, REST filter, fail-closed errors, lưu review. Đã triển khai và có test hai socket với sentinel để phát hiện tin rò trong hàng đợi.
2. **P0 authorization/HITL:** assignment DB/migration/ORM, course membership, override sau commit, duplicate review không phát lại. Đã triển khai; cần operator gán dữ liệu thật.
3. **P0 privacy/quota/UI:** redaction contact, quota DB, utility retention, review API thật và trạng thái held trên Study Room. Đã triển khai. Chưa tự chạy erasure trên dữ liệu của người dùng.
4. **P1 bounded agent/RAG:** hard-rule preflight, verify/call/time controls, filtered history vào classifier, structure/page/provenance và staging rebuild. Đã triển khai.
5. **P1 measurement:** chạy baseline/rules/evidence evaluation và ghi scorecard. Đã chạy offline; bộ demo/golden là nhãn kỹ thuật ban đầu, chưa có người thuộc đơn vị đào tạo duyệt.
6. **P1 vận hành thực:** corpus được phê duyệt, live LLM/E5/Qdrant, triad với judge độc lập/human, tokenizer theo model, usage/cost accounting, encryption và chính sách retention của đơn vị. Chưa đủ dữ liệu/cấu hình để xác nhận production.
7. **P2:** hybrid/reranker/query rewrite/multi-hop/ReAct chỉ triển khai khi failure cases của live evaluation chứng minh giá trị. Không thêm vòng agent tự lập kế hoạch vào MVP hiện tại.

## Cách chạy

Backend làm việc từ `backend/`, với `PYTHONPATH` trỏ vào thư mục này.

```powershell
python -m alembic upgrade head
python -m app.moderation_admin --session-id 123 --course-id CS201 --instructor-id 45
python -m pytest -q
python -m app.agents.moderator.eval.run --mode rules --split all --out-dir ../eval/day_redesign
python -m app.agents.moderator.eval.rag_eval --fake --k 5 --dataset ../eval/golden_rag.jsonl --out-dir ../eval/day_redesign
```

`moderation_admin` là CLI operator đáng tin cậy, không phải endpoint để sinh viên hoặc giảng viên tự cấp quyền. CLI xác nhận session và role trước khi gán instructor/course/memberships. Không có migration tự cấp quyền đại trà cho giảng viên cũ.

Rebuild một snapshot đầy đủ của **một course** vào alias riêng:

```powershell
python -m app.agents.moderator.ingest --course-id CS201 --path data/courses/CS201 --rebuild-alias cs201_active
```

Trỏ `QDRANT_COLLECTION` vào alias được chọn. Không đặt alias trùng một collection vật lý đang tồn tại. Collection cũ được giữ để operator rollback; không tự xóa. Helper ingest trực tiếp còn được giữ để tương thích và có rủi ro delete/upsert nếu storage lỗi; vận hành dùng staging rebuild. Chưa có bộ định tuyến alias theo course cho deployment phục vụ nhiều collection.

Retention là thao tác operator có cutoff rõ ràng, **xóa textual payload**, giữ quyết định tổng hợp:

```powershell
python -m app.moderation_privacy --before 2026-01-01T00:00:00+00:00
```

Cần quyết định retention thực tế trước khi chạy. Redaction regex chỉ bao phủ email/SĐT, không bao phủ toàn bộ tên/địa chỉ/PII ngụy trang. Chưa triển khai encryption-at-rest cho DB; không coi masking là encryption.

## Hợp đồng và giới hạn cần biết

- Pending được biểu diễn bằng chat row chưa có moderation event. Nó không xuất hiện trong lịch sử và context. Sau lỗi trước lưu event, row vẫn kín.
- WARN/BLOCK/ESCALATE không phát nội dung gốc. GUIDANCE đã qua output guard mới phát; generic fallback không khẳng định dựa trên tài liệu.
- `APPROVE` giữ quyết định agent; `INTERVENE` ghi nhận can thiệp. Muốn thả tin phải `OVERRIDE` thành ALLOW/GUIDE. Unique review ngăn phát lặp từ retry review.
- Review chưa có durable transactional outbox: crash sau commit/trước WS send có thể bỏ lỡ realtime event; REST/reconnect vẫn đọc quyết định đã commit. Nhiều worker cần pub/sub thay connection manager trong RAM.
- Chat retry chưa có client-message idempotency key: gửi lại cùng text là tin mới và kiểm duyệt mới; review retry đã được kiểm soát. Chưa khẳng định exactly-once messaging.
- Bản này giới hạn history theo lượt/ký tự và sources theo ký tự; không giả định đó là token count. Trace chưa có actual token usage/cost. Quota user/phút cùng call/time cap giúp giới hạn workload, không phải dollar accounting.
- Học liệu được ingest bởi operator; chưa có workflow upload/approval tài liệu cho giảng viên. Không thêm API upload mở khi chưa có data governance.
- Một tin đã được nhận trước khi review đổi sang BLOCK không thể bị thu hồi khỏi bộ nhớ người nhận. Filter history áp dụng quyết định hiệu lực cho lần đọc sau.
- Số 0 lỗi nghiêm trọng của bộ offline nhỏ không chứng minh an toàn trên dữ liệu thật hoặc dưới tấn công chưa có trong test.

## Kiểm thử và bằng chứng

Regression backend bao gồm matching/connections/profiles, schemas/ORM/Alembic, moderator/rules/guard/RAG, WS/REST/HITL. Các test mới kiểm tra held-message leakage, unmoderated history, instructor assignment, APPROVE vs OVERRIDE, duplicate review, embedding failure, atomic alias, evidence recall nhiều chunk, quota, hard-rule không gọi model, page/section và redaction storage.

<<<<<<< HEAD
Scorecard trước/sau và harness log được nhắc trong bản ghi lịch sử nhưng không có trong repository; cần artifact gốc để đối chiếu các số đo. Không dùng chỉ số FakeEmbedder để tuning ngưỡng E5 thật.
=======
Kết quả trước/sau: [scorecard](../eval/scorecard.md). Chi tiết thay đổi: [harness log](../eval/harness_log.md). Không dùng chỉ số FakeEmbedder để tuning ngưỡng E5 thật.
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

Kiểm tra giao diện: 43 tests đạt; production build Next.js/TypeScript đạt. Backend: 387 tests đạt ở lượt cuối. Ruff và `git diff --check` đạt. Không chạy erasure hay tự cấp quyền trên DB người dùng.
