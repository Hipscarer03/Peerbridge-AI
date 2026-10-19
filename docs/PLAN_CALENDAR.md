# Lịch Plan chỉ chọn ngày

Ngày cập nhật: 14/10/2026.

## Input và luồng xử lý

- `PlanInput.tsx` gửi mục tiêu, hạn chót, nền tảng, `recurring`, `days`, `calendar_complete` và `weeks`. Không gửi giờ học hoặc tự đoán ngân sách phút.
- Lịch lặp: `days` là các thứ 0–6 (T2–CN). Backend mở rộng từ hôm nay theo múi giờ Việt Nam đến hạn chót, tối đa một năm.
- Lịch thay đổi: `weeks` chứa `start_date` (thứ Hai), `days` và `complete` của từng tuần. Các tuần chưa thêm vẫn là chưa khai báo; tuần không tự lặp.
- `calendar_complete`/`complete` là xác nhận đã khai báo đầy đủ lịch. Chỉ khi có xác nhận, ngày không chọn mới trở thành ngày đệm. Không chọn ngày nào và không xác nhận vẫn tạo được nội dung trong hàng đợi.
- `routers/plans.py` kiểm tra lịch, nhận diện kỹ năng qua catalog và tạo `Member.calendar`. Không chọn tùy tiện bài cuối khi không nhận diện được kỹ năng.
- AI/template chỉ sinh task, đầu ra và số phút ước lượng. `scheduler.plan_days` gán tối đa một buổi mỗi ngày học theo thứ tự tiên quyết; không dùng ngày đệm và không tạo giờ giả.
- Một nội dung có nhiều buổi, phân biệt bằng `concept_id` và `session_index`. Catalog Plan có thể khai báo `lessons`; giao tiếp tiếng Anh công việc có 8 buổi cụ thể. Nếu chưa khai báo, Plan theo ngày chia thành học mẫu, tự thực hành và ôn kiểm tra. AI phải trả đầy đủ các buổi này, không gộp thành một.
- Số buổi không phụ thuộc số ngày rảnh. Gán lần lượt vào ngày rảnh đã chọn; buổi không có ngày vẫn nằm trong danh sách. Chưa khai báo lịch vẫn sinh đầy đủ buổi.

## Dữ liệu và hiển thị

`StudyCalendar` lưu `start_date`, `end_date`, `study_dates`, `buffer_dates`; ngày còn lại trong khoảng này là chưa khai báo. Dữ liệu nằm trong JSON context hiện có của Plan, không cần thêm cột database. Plan cũ không có calendar tiếp tục dùng khung giờ cũ.

Buổi có ngày nhưng chưa có giờ giữ `planned_date`, trạng thái nội bộ `DEFERRED`, lý do `AWAITING_TIME`; không tạo `scheduled_start/end`. Buổi chưa có ngày dùng `NO_STUDY_DATE`. Tracking không được xem buổi chưa chọn giờ là đã đến hạn. `partial` hiện vẫn phản ánh có buổi chưa được xếp đầy đủ cả ngày và giờ; UI phân biệt bằng `planned_date`.

- Xanh: ngày học.
- Vàng: ngày đệm, dành cho nghỉ hoặc học bù.
- Xám: ngày chưa khai báo lịch.
- Buổi chưa chọn giờ xuất hiện ở hàng cả ngày trong lịch ngày/tuần và trong lịch tháng.
- Danh sách cạnh lịch hiển thị toàn bộ buổi ở cả chế độ xem riêng và lịch chung, gồm đã chọn ngày, chưa chọn ngày và đã hoàn thành.
- Plan cũ thiếu buổi có nút “Cập nhật lộ trình”, gọi `POST /plans/{pair}/expand-lessons` cùng phiên bản hiện tại. Tạo phiên bản mới, giữ ID buổi đã có và các buổi đã hoàn thành; không sửa Plan của bạn đồng hành.
- Chi tiết buổi có nút chọn giờ/đổi lịch. Bạn đồng hành dùng dropdown. Thông báo lỗi và thành công nằm ở góc trên phải.

## Bổ sung giờ và đệm thời gian

`PATCH /plans/{pair}/items/{item}/schedule` nhận giờ bắt đầu, thời lượng và `confirm_buffer`. Backend kiểm tra quyền sửa, phiên bản, thời gian quá khứ, hạn chót, trùng các buổi/phiên học, thứ tự tiên quyết và thời gian kết thúc trong ngày. Ngày đệm yêu cầu xác nhận rõ ràng. Gán lịch vào ngày chưa khai báo sẽ ghi nhận ngày đó là ngày học.

Nếu đã có ngân sách phút mỗi tuần (Plan cũ), cả xếp tự động và sửa lịch giữ trần 80%, chừa 20%. Plan chỉ có ngày đặt ngân sách bằng 0 nghĩa là chưa biết, không phải cấm học. Không quy đổi ngày thành giờ và không tuyên bố đã chừa 20% thời lượng. Giảm tải theo phần trăm thời gian trả thông báo rõ khi chưa có ngân sách. Hiện không có khoảng nghỉ cố định giữa hai buổi hoặc tự chuyển buổi lỡ sang ngày đệm.

Chọn giờ trên UI dùng giờ/phút và múi giờ Việt Nam. API vẫn kiểm tra lại tất cả điều kiện; checkbox ở frontend không thay thế xác nhận backend.

## Người dùng quản lý buổi học

- Danh sách có thêm buổi, sửa nội dung/đầu ra/thời lượng và xóa buổi chưa hoàn thành. Các thao tác dùng panel bên phải; xóa có xác nhận trong panel.
- `POST /plans/{pair}/items`, `PATCH /plans/{pair}/items/{item}`, `DELETE /plans/{pair}/items/{item}` kiểm tra quyền chủ kế hoạch và `expected_version`; mỗi thay đổi tạo phiên bản mới. Buổi cũ vẫn ở lịch sử, không xóa nhật ký hoàn thành.
- Buổi tự thêm có `is_custom`; ID được lưu trong `Member.custom_item_ids` và giữ khi điều chỉnh Plan. Buổi do AI sinh đã xóa được lưu trong `removed_lessons`, nội dung đã sửa trong `lesson_overrides`; cập nhật lộ trình không thêm lại buổi bị xóa hoặc ghi đè nội dung đã sửa.
- Thêm/sửa có thể chỉ lưu nội dung, hoặc lưu ngày chưa có giờ. Khi chọn lại ngày cho buổi đã có giờ, frontend nạp giờ/phút cũ và giữ khi đổi ngày. API cũng giữ giờ cũ nếu PATCH chỉ gửi `planned_date`.

## Nhận xét buổi học và đăng ký học chung

- Panel chi tiết chỉ hiện nội dung, đầu ra, lịch học và thao tác buổi học; không có textarea hoặc lịch sử nhận xét. Nút chọn giờ/đổi lịch, sửa nội dung và xóa được thu nhỏ, đặt cùng hàng.
- Chỉ góp ý lịch bạn học từ nút dưới lịch bạn học (hoặc chọn ngày trên lịch bạn học). Panel góp ý giữ lịch sử trao đổi; API chặn gửi góp ý theo ID buổi của chính mình. Dữ liệu nhận xét cũ được giữ nguyên.
- `POST /plans/{pair}/notes` nhận thêm `plan_item_id`; `GET /plans/{pair}/notes?item_id=...` chỉ trả trao đổi của buổi đó. Lời nhắn cũ và góp ý chung được giữ nguyên. Backend kiểm tra buổi thuộc kế hoạch hiện tại của cặp trước khi đọc/ghi nhận xét theo buổi.
- Nút “🤝 Gợi ý học chung” đăng ký mong muốn tham gia buổi học của bạn đồng hành; có thể hủy. `PUT /plans/{pair}/items/{item}/together` nhận `{enabled: true/false}`, kiểm tra thành viên cặp, buổi còn trong kế hoạch hiện tại và chưa hoàn thành khi đăng ký. Không được đăng ký buổi của chính mình.
- Đăng ký lưu trong `pb_plan_together` theo cặp, ID buổi và người đăng ký. `GET /plans/{pair}` trả `study_together`; icon 🤝 xuất hiện trên lịch, danh sách buổi và chi tiết của cả hai người. Trang có kế hoạch cập nhật nền mỗi 15 giây khi đang hiển thị.
- Đây là đăng ký mong muốn học chung; không tự xác nhận thay bạn học, sao chép buổi hay đổi ngày/giờ của hai kế hoạch. Khi sửa lịch giữ nguyên ID buổi, đăng ký vẫn được giữ; buổi bị xóa không còn hiển thị icon.

### Thông báo góp ý và học chung

- Gửi góp ý kế hoạch hoặc buổi học tạo thông báo `plan_comment` cho người còn lại trong cặp. Đăng ký học chung mới tạo `study_together` cho chủ buổi học; gửi lại cùng đăng ký không phát thông báo lặp, hủy đăng ký không phát thông báo mới.
- Thông báo lưu cùng giao dịch với thao tác, dùng kết nối SQLite hiện tại để tránh khóa. Tiêu đề có tên người gửi; nội dung gồm buổi học/góp ý; `target` lưu cặp và ID buổi. Bấm thông báo góp ý mở panel trao đổi của cặp; thông báo học chung mở chi tiết buổi. Buổi đã bị xóa được báo rõ khi mở chi tiết.
- Chuông kiểm tra thông báo mỗi 10 giây và khi cửa sổ được focus. Khi app đang hiển thị, hai loại thông báo mới có popup góc phải. Khi tab đang ẩn và đã cấp quyền thông báo, sử dụng thông báo của trình duyệt. Cơ chế hiện tại cần app đang mở; chưa có Web Push gửi khi trình duyệt đóng.
