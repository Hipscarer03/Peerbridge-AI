# Demo PeerBridge

Web: http://localhost:3001. Chạy lại bằng `powershell -ExecutionPolicy Bypass -File .\start-local.ps1` tại thư mục dự án.

## Tài khoản mẫu

- Minh Anh: `demo.minhanh@peerbridge.local`
- Quốc Huy: `demo.quochuy@peerbridge.local`
- Thảo My: `demo.thaomy@peerbridge.local`
- Đức Minh: `demo.ducminh@peerbridge.local`

Mật khẩu chung: `PeerBridgeDemo2026!`. Đây là tài khoản giả lập local. Minh Anh và Quốc Huy đã kết nối, có kế hoạch và cam kết chung. Mở cửa sổ riêng tư để đăng nhập bạn thứ hai.

## Trình bày nhanh

1. Tổng quan: tiến độ ngày của mình, tình hình bạn và hành trình học chung.
2. Tìm bạn: mục tiêu nổi bật, thế mạnh hỗ trợ nhau và lịch rảnh. Gửi/chấp nhận lời mời bằng hai tài khoản chưa kết nối.
3. Kế hoạch: việc của mình và bạn, gợi ý điều chỉnh, cam kết cùng học, lời khuyên lưu chung.
4. Phiên học: chọn bạn, mục tiêu, thời lượng, ô lịch rảnh chung; đặt lịch rồi vào phòng. Bấm gợi ý phá băng để điền vào ô chat. Tin nhắn lưu sau tải lại.
5. Check-in: chọn ảnh hoặc tick việc đã đến giờ học; tiến độ cập nhật. Gửi cảm xúc và xem chuỗi ngày/cột mốc.
6. Đăng ký mới: thông tin cơ bản, sau đó đặt mục tiêu và lịch rảnh ở hồ sơ.

## Phạm vi

AI lập kế hoạch, phân tích check-in và hỗ trợ học đang mô phỏng (`LLM_PROVIDER=fake`), có nhãn trên UI. Ghép bạn dựa vào hồ sơ. Kế hoạch, cam kết, lời khuyên, check-in và chat lưu dữ liệu local. Chế độ yên lặng lưu trên thiết bị; chưa tích hợp gọi video. Cột mốc dùng tiến độ thật của dữ liệu mẫu.

Đã kiểm tra TypeScript/build, trình duyệt desktop/mobile, API hoàn thành nhiệm vụ, chống gửi trùng, quyền sở hữu, lời khuyên và tiến độ hai bạn. Script tại `scripts/verify_product_ui.cjs`, `scripts/verify_progress.py`; ảnh/kết quả trong `logs/`.


## 30 hồ sơ và gợi ý cá nhân hóa

Đã thêm `demo.buddy01@peerbridge.local` đến `demo.buddy30@peerbridge.local`, cùng mật khẩu demo bên trên. Gồm 5 nhóm nền tảng, 6 hướng học và 30 mục tiêu khác nhau. Danh sách chi tiết tại `logs/demo-30-accounts.json`. Chạy lại dữ liệu bằng `backend/.venv/Scripts/python.exe -X utf8 scripts/seed_30_profiles.py`.

Ghép tối đa 15 người, dựa vào nhu cầu, mục tiêu, hỗ trợ hai chiều và lịch rảnh; không bổ sung người không liên quan chỉ để đủ số. Điểm phù hợp là điểm xếp hạng, không phải xác suất thành công. Avatar icon có sẵn trên thiết bị.

Đã nối adapter AI xếp hạng thật vào tìm bạn. Muốn bật cần cấu hình trong `backend/.env`: `PLAN_LLM_PROVIDER=openai_compatible`, `PLAN_LLM_API_KEY`, `PLAN_LLM_MODEL` và `PLAN_LLM_BASE_URL` tương ứng nhà cung cấp, rồi restart backend. Không gửi khóa trong chat. Khi chưa có cấu hình, hệ thống dùng xếp hạng cá nhân hóa nội bộ và hiển thị nhãn đúng; nếu AI gặp lỗi, tự chuyển về nội bộ. Các ảnh/check-in khác vẫn theo cấu hình provider riêng.

## Sửa lịch và check-in

Trong Kế hoạch, chọn **Sửa lịch** ở một việc chưa hoàn thành của mình; đổi ngày, giờ và thời lượng 30–90 phút. Lưu sẽ tạo phiên bản mới, giữ tiến độ cũ và yêu cầu xem lại cam kết. Lịch của bạn đồng hành chỉ để xem. Hệ thống kiểm tra trùng việc, trùng phiên học, thứ tự cần học trước và phiên bản đã thay đổi.

Ngày/giờ dùng `dd/MM/yyyy · HH:mm`, 24 giờ theo giờ Việt Nam; ô nhập cũng dùng ngày dd/MM/yyyy và giờ HH:mm. Hồ sơ lưu Unicode NFC và giữ viết hoa người dùng nhập. Ảnh check-in tải qua quyền của tài khoản; có báo lỗi và nút tải lại. Phá băng chỉ xuất hiện ở chat đầu tiên, không xuất hiện trên tổng quan/đặt lịch hay khi cặp đã trò chuyện trước đó.
