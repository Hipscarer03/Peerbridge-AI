# Danh mục nội dung học

Phiên bản `2026-10-14.3`: **129 nội dung, 26 nhóm môn**. Giữ nguyên 60 ID SQL/Python có sẵn, thêm 67 nội dung theo nhu cầu/khả năng hỗ trợ trong `../seed_profiles.json`, thuật toán không gắn mặc định với một ngôn ngữ lập trình và Business Analysis/Phân tích nghiệp vụ.

- `catalog.json`: ID, nhóm môn, tên dễ hiểu, mô tả, alias và kiến thức cần học trước. Onboarding, truy xuất nội dung và metrics dùng file này.
- `plan_catalog.json`: cùng tập ID và quan hệ học trước, thêm việc thực hành, đầu ra kiểm tra được và thời lượng 30–90 phút. `lessons` có thể khai báo nhiều buổi cụ thể cho một nội dung; từng buổi giữ concept ID gốc và có `session_index` riêng. Đây là catalog mặc định của Plan; có thể chọn nguồn khác bằng `PLAN_CATALOG_PATH`. Script build giữ lại các lộ trình `lessons` đã biên soạn.

Các nhóm mới gồm ngoại ngữ, lập trình và bảo mật, bảng tính/phân tích dữ liệu, toán/lý, thiết kế/kiến trúc/video, marketing, kế toán/tài chính/kinh doanh, luật, y khoa/sinh học/tâm lý, giáo dục và kỹ năng học tập.

## Quy tắc cập nhật

1. Giữ ID ổn định khi đổi cách gọi; thêm alias thay vì tạo ID mới cho cùng kỹ năng.
2. Kỹ năng liên quan nhưng khác nhau cần ID riêng: IELTS Writing và Speaking không được gộp thành một kỹ năng.
3. Mỗi ID phải có trong cả hai file, với cùng nhóm môn và prerequisite. Không tạo vòng prerequisite hoặc tham chiếu ID không tồn tại.
4. Alias lấy từ ngôn ngữ người dùng, gồm tiếng Việt và cách gọi phổ biến. Nội dung ở UI dùng tên/việc học dễ hiểu, không hiển thị thuật ngữ kỹ thuật nội bộ.
5. Nhóm môn được khai báo chung ở `app/learning_domains.py`, đồng thời phản ánh trong type frontend `StudyDomain`.

Database SQLite cũ được mở rộng ràng buộc nhóm môn khi `initialize_onboarding` chạy, giữ nguyên concept ID, index/trigger và liên kết `user_concepts`. Nhóm `ai` được chấp nhận trong contract/schema để giữ các nội dung AI đã lưu trong database; số 26 nhóm ở trên chỉ tính catalog JSON hiện tại. Migration kiểm tra đầy đủ các nhóm được phép, không chỉ dựa vào sự xuất hiện của `english`. Có migration Alembic `20261014_0017` cho thay đổi này. Backend cần nạp lại cấu hình và catalog sau khi cập nhật file.

Danh mục phong phú hơn vẫn là tra alias/quy tắc trong cấu hình mặc định; nó không tự bật LLM hoặc tự tạo kỹ năng mới. Form hồ sơ `/profiles/me` vẫn cần được nối với onboarding nếu muốn dùng kết quả chuẩn hóa cho toàn bộ matching.

Plan cá nhân dùng catalog JSON làm nguồn nội dung đã duyệt. Khi mục tiêu cụ thể không khớp, `/plans/generate-personal` tạo lộ trình riêng và lưu vào `pb_concept_drafts` theo người dùng/cặp/Idempotency-Key. Nếu `PLAN_LLM_PROVIDER=openai_compatible`, nội dung được AI đề xuất và backend kiểm tra cấu trúc, cấp ID, thứ tự và quan hệ học trước. Cấu hình mặc định dùng lộ trình khởi đầu theo mẫu. Bản nháp chỉ đi vào context của plan sở hữu; nó không ghi vào hai file JSON hoặc tự tham gia matching/onboarding. Muốn đưa một nội dung vào catalog chung cần biên tập và phát hành cả hai file theo quy tắc trên.
