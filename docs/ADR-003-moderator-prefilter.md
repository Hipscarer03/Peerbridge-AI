# ADR-003: Lọc trước (prefilter) tin nhắn trước khi gọi LLM trong moderator

- Trạng thái: Đã chấp nhận
- Ngày: 09/10/2026
- Liên quan: `backend/app/agents/moderator/prefilter.py`, `backend/app/agents/moderator/graph.py`
  (`MODERATION_PREFILTER_ENABLED`, mặc định bật); commit `7666587`

## Bối cảnh
Mỗi tin trong phòng học đi qua graph moderator (luật → LLM phân loại → có thể RAG + sinh gợi ý → output guard), tối
đa `MAX_LLM_CALLS=3` lần gọi. Phần lớn tin trong phòng là xã giao ("ok", "mai 8h nhé"), gọi LLM cho chúng tốn tiền và
thêm ~1–4 giây trễ (eval 01/10: p50 1344 ms, p95 3869 ms).

## Quyết định
`needs_llm()` cho phép bỏ qua LLM **chỉ khi đồng thời**: tin ngắn (≤ 80 ký tự), không có dấu "?" hay xuống dòng, luật không bắt được tín hiệu nào,
không có từ gợi ý học tập/đáp án/code (so khớp trên chữ đã bỏ dấu), không có ký hiệu code/toán/URL, và không đang
trong lượt hỏi Socratic. Mọi trường hợp khác vẫn qua LLM như cũ. Tin được bỏ qua ghi `prefiltered=True` để Admin thống kê.

## Hệ quả
- (+) Giảm chi phí và độ trễ cho tin xã giao; không nới kiểm duyệt với tin có dấu hiệu rủi ro (luật vẫn chạy trước).
- (−) Tin ngắn lách từ khoá (viết tắt lạ, emoji) có thể lọt qua mà không có LLM xem — được ghi nhận trong red-team (`redteam/report.md`).
- Số liệu tiết kiệm thực tế: trang Admin (`messages_prefiltered`, `saved_rate`); chưa có số đo trên người dùng thật.
