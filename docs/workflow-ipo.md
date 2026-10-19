# Workflow IPO — AI làm gì, Người làm gì

> Bảng Input → Process → Output cho từng bước của luồng chính, theo đúng code đang chạy. Cột "Ai quyết định"
> cho biết bước nào AI chỉ đề xuất, bước nào con người chốt.

## 1. Bảng IPO

| # | Bước | Input | Process | Output | AI làm | Người làm | Ai quyết định |
|---|---|---|---|---|---|---|---|
| 1 | Onboarding | Mục tiêu, chủ đề người học gõ | Chuẩn hoá chủ đề → concept chuẩn (lexical + luật; LLM tuỳ chọn), ngưỡng tin cậy 0.75 | Hồ sơ concept cần/giỏi | Đề xuất concept | Xác nhận concept (`POST /profile/confirm`) | Người |
| 2 | Ghép cặp | Hồ sơ, lịch rảnh | Điểm công thức (bổ trợ, lịch, sở thích) → LLM xếp hạng lại (nếu bật, có trần chi phí) | Danh sách gợi ý + lời giải thích | Xếp hạng, giải thích | Gửi lời mời, chấp nhận/từ chối, rời cặp | Người (cả hai bên đồng ý) |
| 3 | Lập kế hoạch | Mục tiêu 2 bạn, concept, giờ rảnh, ngân sách phút | LLM chia việc → validator (tiên quyết, URL bịa, concept ngoài danh mục) → scheduler xếp giờ | Plan tuần mỗi người | Chia việc | Cam kết plan, đổi giờ từng việc, chấp nhận/từ chối đề xuất lập lại | Người cam kết; code chặn plan sai luật |
| 4 | Check-in ảnh | Ảnh, ghi chú, concept trong plan | Bỏ metadata, thu nhỏ → LLM đa phương thức (concept chỉ trong danh sách cho phép) → `decide()` theo ngưỡng 0.75 / 0.4 | DONE / hỏi lại / tự chọn mục | Nhận diện, đề xuất mục | Xác nhận hoặc chọn mục; "ảnh này đúng là mình đang học" | AI chỉ tự đánh dấu khi chắc (≥ 0.75, đúng 1 mục); còn lại người chọn |
| 5 | Đo tiến độ | Check-in đã chốt, plan | Tính nhịp học (phút xong ÷ phút đến hạn), điểm cặp — không dùng LLM | Thẻ "Nhịp học" | — | — | Code (tất định) |
| 6 | Coach | Số đo, plan | Luật chọn hành động được phép → LLM chọn trong danh sách đó + viết lời nhắc (v2); giới hạn 1 lần/người/ngày, không nhắc 22h–7h | Thông báo gợi ý (giảm tải, nhắc, hẹn phiên) | Chọn + viết lời nhắc | Chấp nhận/bỏ qua đề xuất | Người (đề xuất lập lại cần đồng ý) |
| 7 | Phòng học | Tin nhắn | Prefilter → luật → LLM phân loại → RAG BM25 → gợi ý Socratic → output guard | ALLOW / GUIDE / WARN / BLOCK / ESCALATE | Phân loại, viết gợi ý | Admin/giảng viên xử lý tin ESCALATE | Luật HARD + người (HITL) cho ca rủi ro cao |
| 8 | Chấm phiên | Bản ghi phiên | Luật + LLM-judge (nếu còn trần) | Có lộ đáp án không, mức Socratic | Chấm | Admin xem, ghi chú | Người (Admin) |

## 2. Sáu tính chất tin cậy (BTC, Technical Book ch.7 §7.2) — tự chấm

> Mỗi tính chất ghi đúng cách BTC yêu cầu kiểm chứng, test trong repo chứng minh (đường dẫn từ `backend/tests/`),
> và phần còn thiếu. "Đạt / Một phần / Chưa" là tự chấm trung thực. Bằng chứng dưới đây được đối chiếu với
> nhánh `main` sau khi các thay đổi guardrails và red-team đã được gộp.

| # | Tính chất | Cách BTC kiểm chứng | Bằng chứng trong repo | Tự chấm | Còn thiếu |
|---|---|---|---|---|---|
| 1 | **Fault-tolerant** | Mock một node giữa ném lỗi; workflow vẫn trả kết quả hoặc lỗi dễ hiểu | `test_moderator_graph.py::test_llm_exception_still_yields_valid_output`, `::test_graph_failure_escalates_with_system_error_reason`; `test_moderator_guidance.py::test_retriever_failure_still_generates_guidance`; `test_study_room_ws.py::test_moderator_exception_is_persisted_as_pending_review`; `test_checkin_api.py::test_failed_then_studied_something_else`; `test_plan_llm.py::test_provider_timeout_stops_after_two_repairs_without_leaking_transport_details` | Đạt | — |
| 2 | **Observable** | Mỗi bước log OK/WARN/FAIL, đủ trả lời "hỏng ở đâu, input gì, bao nhiêu ca" | Moderator ghi `errors` + `node_latency_ms` từng node vào sự kiện kiểm duyệt (`test_moderator_hitl.py::test_event_records_errors_sanitized`); mọi nhánh dự phòng ghi WARN/ERROR (nhánh guardrails); sổ chi phí `ai_usage`; trace plan (`test_plans_api.py::test_invalid_llm_never_persists_and_has_safe_trace`) | Một phần | Không có log OK cho từng bước của check-in/plan; chưa có số đếm lỗi theo bước trên dashboard; không có cảnh báo tự động |
| 3 | **Scalable** | 10 yêu cầu song song, không ERR_ABORTED | `test_parallel_requests.py::test_ten_parallel_checkins_all_succeed_once` — **test này lúc đầu FAIL** (pool kết nối SQLite cạn, treo 30s); đã sửa `app/database.py` (pool SQLite 20+40) | Đạt (sau khi sửa) | Chỉ đo trong test; SQLite + WebSocket trong bộ nhớ nên chỉ chạy 1 instance (ADR-001); chưa load test trên Render |
| 4 | **Workable** | E2E smoke đường chính mỗi lần deploy | `peerbridge-ci.yml` chạy Playwright E2E (đăng nhập demo → tìm bạn → plan → check-in) trên PR và `main`; `deploy.yml` chạy pytest và build trước khi đồng bộ repo deploy; `test_loop.py::test_full_loop_coach_intervenes_for_lagging_partner` kiểm tra vòng backend | Một phần | Chưa có bước Playwright E2E **sau khi deploy live**; nhánh `main` không tự triển khai web, và chưa xác nhận `DEPLOY_TOKEN` cho luồng triển khai riêng |
| 5 | **Idempotent** | Gửi cùng payload 2 lần → không trùng bản ghi | `test_checkin_api.py::test_idempotent_resend`; `test_plans_api.py::test_generate_persist_read_idempotency_and_privacy` (header `Idempotency-Key`); `test_connections_api.py::test_accept_flow_creates_one_peer_match_and_blocks_reaccept`; `test_moderator_hitl.py::test_enqueue_is_idempotent_per_message_id`; `test_plans_api.py::test_concurrent_vision_events_complete_item_once_and_keep_history` | Đạt | — |
| 6 | **Auditable** | Từ một output xấu, lần ra prompt, context và bước nào đã duyệt nó | Moderator: sự kiện có action, intent, risk, rule khớp, nguồn RAG (chỉ tham chiếu), model, lỗi (`test_moderator_hitl.py::test_event_record_has_all_audit_fields_for_escalate`, `::test_event_keeps_only_source_refs_not_text`); Plan: trace có `prompt_version`, `trace_id`, các lần thử và lỗi validator; Check-in: `vi_checkins` lưu `ai_result`, `model`, chi phí, lỗi | Một phần | Check-in không lưu phiên bản prompt; chưa có màn hình tra một output → trace cho Admin |

## 3. Checklist quản trị (đặt cạnh bảng IPO)

| Yêu cầu BTC | Trạng thái | Ở đâu |
|---|---|---|
| Audit log mọi quyết định AI, không chứa PII thô | Một phần — moderator: có, nội dung SĐT/email bị che (`test_study_room_ws.py::test_raw_contact_is_not_retained_but_moderator_sees_original`); plan: trace; check-in: lưu kết quả AI. Ghép cặp xếp hạng lại chỉ ghi chi phí, chưa lưu quyết định | `moderation_events`, `pb_traces`, `vi_checkins`, `ai_usage` |
| README nói rõ ai chịu trách nhiệm khi AI sai | Có | README mục "Khi AI sai, ai chịu trách nhiệm?" |
| Sơ đồ workflow có đường chuyển lên người (≥ 1 đích là người) | Có | `docs/architecture.md`: Moderator → ESCALATE → Admin/giảng viên (HITL); check-in không chắc → người học tự chọn |
