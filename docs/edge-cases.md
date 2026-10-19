# Edge cases — xử lý thế nào và test nào chứng minh

> Mỗi dòng: tình huống biên, hệ thống làm gì, và test tự động khẳng định điều đó (đường dẫn tính từ `backend/tests/`).
> Dòng "Chưa có test" là chỗ hở đã biết. Các ca prompt injection: `redteam/report.md`.

## Check-in bằng ảnh (AI Vision)

| Tình huống | Hệ thống làm gì | Test |
|---|---|---|
| Gửi lại cùng một check-in (mạng chập chờn) | Trả kết quả cũ, không tạo bản ghi mới | `test_checkin_api.py::test_idempotent_resend` |
| Người khác dùng lại id check-in của mình | 409, không ghi đè | `test_checkin_api.py::test_same_id_other_user_conflict` |
| AI không chắc (độ tin cậy thấp) | Hỏi lại, người học chọn mục | `test_checkin_api.py::test_low_confidence_then_confirm` |
| AI lỗi hoàn toàn | Trạng thái FAILED, vẫn cho chọn mục hoặc "học thứ khác" | `test_checkin_api.py::test_failed_then_studied_something_else` |
| Ảnh không phải đang học | NOT_STUDY, người học có thể khẳng định lại | `test_checkin_api.py::test_not_study_and_override` |
| Xác nhận mục của bạn cặp / mục chưa tới giờ | Từ chối | `test_cannot_confirm_partners_item`, `test_confirm_future_item_is_rejected_by_data2` |
| Chưa có cặp | 403 | `test_user_without_pair_is_forbidden` |
| Link ảnh hết hạn | Từ chối | `test_expired_media_link_is_rejected` |
| File không phải ảnh / rỗng / quá lớn / PNG trong suốt | Từ chối, hoặc làm phẳng nền | `test_checkin_imaging.py` (`test_rejects_non_image`, `test_rejects_empty`, `test_rejects_too_large`, `test_transparent_png_flattened`) |
| Ảnh có GPS / xoay ngang | Xoay đúng chiều, xoá metadata | `test_checkin_imaging.py::test_exif_rotation_applied_and_metadata_stripped` |
| Vượt 10 check-in/ngày | Chặn | `test_checkin_api.py::test_daily_cap` |
| Hết ngân sách AI hôm nay | Không gọi AI, người học tự chọn mục | `test_checkin_api.py::test_daily_budget_stops_ai_calls` |
| Ảnh gần như một màu (chụp nhầm) | Coi là không phải ảnh học | Chưa có test riêng (`checkin/llm.py`) |

## Kế hoạch (plan agent)

| Tình huống | Hệ thống làm gì | Test |
|---|---|---|
| LLM trả JSON sai / concept bịa / URL bịa / tự đặt giờ | Sửa tối đa 2 lần, vẫn sai thì không lưu (422) | `test_plan_llm.py`, `test_plans_api.py::test_invalid_llm_never_persists_and_has_safe_trace` |
| Hai bạn bấm tạo plan cùng lúc | Chỉ một yêu cầu được xử lý | `test_plan_edge_cases.py::test_initial_concurrent_generation_is_claimed_once` |
| Không đủ giờ rảnh / ngân sách | Plan thiếu (partial), việc hoãn có lý do | `test_plans_api.py::test_partial_plan_and_profile_availability_adapter` |
| Sửa giờ ra ngoài khung / vượt ngân sách / sửa việc của bạn cặp | Từ chối | `test_plans_api.py::test_schedule_edit_rejects_window_horizon_budget_and_partner_changes` |
| Lập lại kế hoạch giữa tuần | Giữ việc đã xong, chỉ chấp nhận một lần | `test_plans_api.py::test_replan_preserves_completed_ids_accepts_once_and_does_not_compound` |
| Múi giờ hồ sơ sai | Lỗi có kiểm soát, giải phóng yêu cầu | `test_plans_api.py::test_invalid_profile_timezone_returns_controlled_error_and_releases_request` |
| Plan vừa lập, chưa tới giờ học | Không bị tính là chậm, coach không nhắc | `test_loop.py::test_fresh_plan_is_not_counted_as_behind` |

## Phòng học (moderator + RAG)

| Tình huống | Hệ thống làm gì | Test |
|---|---|---|
| Tin xã giao ngắn | Bỏ qua LLM (tiết kiệm), vẫn ghi audit | `test_moderator_prefilter.py::test_small_talk_skips_llm` |
| Hết ngân sách AI | Chỉ dùng luật + gợi ý mẫu | `test_moderator_prefilter.py::test_budget_exhausted_uses_rules_only_and_never_escalates_by_default` |
| Moderator lỗi hệ thống | Tin giữ lại chờ Admin (ESCALATE) | `test_study_room_ws.py::test_moderator_exception_is_persisted_as_pending_review` |
| Tin bị giữ | Không tới bạn cặp, không có trong lịch sử | `test_study_room_ws.py::test_held_message_never_reaches_peer_or_rest_history` |
| Tin chứa SĐT/email | Lưu bản đã che, moderator vẫn thấy bản gốc để chặn | `test_study_room_ws.py::test_raw_contact_is_not_retained_but_moderator_sees_original` |
| Người ngoài phiên kết nối WebSocket | Từ chối | `test_study_room_ws.py::test_study_room_websocket_rejects_unauthorized_session` |
| Gửi quá nhanh | Giới hạn 30 tin/phút, áp dụng chung mọi tiến trình | `test_study_room_ws.py::test_database_quota_applies_across_service_instances` |
| Gia sư Socratic kéo dài | Dừng sau số lượt tối đa | `test_study_room_ws.py::test_tutor_state_closes_at_configured_max_turns` |
| Câu lạc đề vẫn được RAG trả slide điểm cao (BM25 chuẩn hoá điểm theo câu hỏi) | Không gây hại vì RAG chỉ chạy ở nhánh GUIDE; nhưng điểm không dùng làm ngưỡng "có liên quan" được | Chưa có test — phát hiện khi làm `eval/datasets/run_golden.py` |

## Ghép cặp và kết nối

| Tình huống | Hệ thống làm gì | Test |
|---|---|---|
| Chấp nhận lời mời hai lần / từ chối rồi chấp nhận | Chỉ một cặp, chặn lần sau | `test_connections_api.py::test_accept_flow_creates_one_peer_match_and_blocks_reaccept`, `test_reject_flow_does_not_create_peer_match_and_blocks_later_accept` |
| Tự mời chính mình / người khác trả lời thay | Từ chối | `test_connections_api.py::test_only_receiver_can_respond_and_self_request_is_rejected` |
| Kết nối có nhưng chưa thành cặp Data 1 | Tự thành cặp khi có hoạt động | `test_loop.py::test_connection_only_pair_becomes_data1_pair_on_activity` |
