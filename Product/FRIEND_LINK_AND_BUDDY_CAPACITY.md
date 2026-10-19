# Kết nối bạn quen và giới hạn bạn đồng hành

## Quyết định sản phẩm

- **Mỗi người tối đa một bạn đồng hành chính đang hoạt động tại một thời điểm**, kể cả khi có nhiều mục tiêu. Trách nhiệm nhắc nhau, tiến độ và lịch chung sẽ rõ người chịu trách nhiệm. Người dùng có thể giữ nhiều kết nối và kỷ niệm cũ; kết nối không đồng nghĩa với một slot đang hoạt động.
- Bạn quen ngoài đời **có tính vào cùng slot** khi hai người bắt đầu đồng hành cho mục tiêu đó. Không cấp slot miễn phí theo nguồn quen biết: lịch học và sức chú ý vẫn bị chia sẻ như với bạn do hệ thống gợi ý.
- Bạn quen bỏ qua bước chấm điểm phù hợp và làm quen, nhưng vẫn cần hai bên xác nhận, mục tiêu riêng, lịch có thể thực hiện, cam kết và quy tắc phiên học giống mọi cặp. Có thể học song song với hai mục tiêu khác nhau.
- Bạn do thuật toán gợi ý có điểm phù hợp và lý do ghép; link bạn quen chỉ chứng minh người nhận có link, **không chứng minh danh tính hay mức độ tin cậy**. Vì vậy link không tự ghép. Người nhận gửi yêu cầu, chủ link chấp nhận.
- Khi đang có một bạn đồng hành chính, vẫn có thể nhận lời mời; trước khi kích hoạt mục tiêu mới cần kết thúc hoặc tạm dừng chương đang hoạt động. Hệ thống hiện chưa có trạng thái chương hoạt động, nên **chưa áp dụng khóa một slot ở backend**. Không được mô tả số kết nối hiện có là số slot mục tiêu.

## Luồng hiện tại

1. Trong **Tìm bạn**, nhập đúng email tài khoản sinh viên và bấm **Tìm**. Kết quả chỉ hiện tên cùng trạng thái kết nối trong hàng gọn; không có danh sách gợi ý email.
2. Bấm **Kết nối** để gửi yêu cầu. Người nhận chấp nhận hoặc từ chối trong **Kết nối**. Tài khoản của chính mình, cặp đã kết nối và yêu cầu đang chờ không thể gửi lặp.
3. Link mời đã tạo trước đây vẫn có thể mở để người nhận gửi yêu cầu; UI không còn nút tạo link mới. Sau kết nối, hai người dùng kế hoạch và học chung hiện có. Việc kết nối không tự tạo kế hoạch hoặc tính điểm thành tích.

## Việc tiếp theo trước khi khóa slot

Thêm trạng thái `active / paused / ended` cho **chương mục tiêu của từng cặp**, không gắn cứng vào `peer_matches`. Khi kích hoạt chương mới, backend kiểm tra mỗi người chỉ có tối đa một chương đang hoạt động bằng giao dịch nguyên tử. Chương cũ và dữ liệu check-in, giờ học, ảnh tiếp tục được giữ để hiển thị hành trình. Nếu muốn thử hai bạn đồng hành đồng thời, cần đo tải lịch và tỷ lệ hoàn thành trước khi tăng giới hạn.
