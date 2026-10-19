# ADR-002: Trần chi phí AI chung 2 USD/ngày, hết trần thì quay về mẫu/luật

- Trạng thái: Đã chấp nhận
- Ngày: 07/10/2026 (mở rộng cho phòng học 09/10)
- Liên quan: `backend/app/loop/ai_budget.py`, `backend/app/checkin/stats.py`, `backend/app/loop/ai_clients.py`,
  `backend/app/agents/moderator/graph.py` (`BudgetedLLM`), `backend/app/session_review/service.py`; commit `494cea2`, `cd6034b`, `7666587`

## Bối cảnh
Có năm chỗ gọi OpenAI (check-in ảnh, chia việc plan, xếp hạng ghép cặp, moderator phòng học, chấm phiên). Một vòng lặp
hay lỗi lặp lại có thể đốt tiền không giới hạn, trong khi dự án dùng khoá API cá nhân.

## Quyết định
- Mọi lần gọi ghi token và USD (theo bảng giá trong `ai_budget.PRICES`) vào sổ chung (`ai_usage` + bảng check-in).
- `budget_left_usd() = VISION_DAILY_BUDGET_USD (mặc định 2) − chi phí từ đầu ngày học (03:00 giờ VN)`.
- Trước khi gọi LLM, mỗi phần kiểm tra trần; hết trần thì **không gọi** và dùng cách không cần AI:

| Phần | Khi hết trần |
|---|---|
| Check-in ảnh | Bỏ bước AI, người dùng tự chọn mục trong plan (`checkin/pipeline.py`) |
| Chia việc plan | Đổi provider sang `template` (`loop/ai_clients.get_team_plan_service`) |
| Xếp hạng ghép cặp | Giữ thứ tự điểm công thức |
| Moderator | `BudgetedLLM` ném lỗi → node dùng luật + gợi ý mẫu |
| Chấm phiên | Chỉ chấm bằng luật |

## Hệ quả
- (+) Chi phí tối đa có thể dự đoán; sản phẩm vẫn dùng được khi hết tiền.
- (−) Chất lượng giảm khi hết trần (gợi ý mẫu, không nhận diện ảnh). Người dùng phải được báo là đang ở chế độ
  giảm chức năng — xem PR "no silent fallback".
- (−) Bảng giá cứng trong code; cần kiểm lại khi OpenAI đổi giá.
