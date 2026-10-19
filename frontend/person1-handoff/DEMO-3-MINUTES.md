# Video demo Người 1 — 3 phút

Mục tiêu: thể hiện luồng hồ sơ thật → matching score từ backend → lời mời → đồng ý/từ chối → dữ liệu vẫn còn khi tải lại. Video không bao gồm StudyRoom, WebSocket hoặc LangGraph của Người 2.

## Chuẩn bị trước khi quay

- [ ] Backend và frontend cùng chạy; JWT_SECRET ổn định; NEXT_PUBLIC_API_URL và CORS_ORIGINS đúng.
- [ ] Có browser kết nối; kiểm tra console sau login/Matching/Connections và không có lỗi runtime.
- [ ] Kiểm tra desktop 1440px, mobile 390px và 360px; không có tràn ngang, chữ/nút bị cắt.
- [ ] Kiểm tra Tab/Shift+Tab/Enter, focus-visible, nút disable và nút retry.
- [ ] Có ba tài khoản sinh viên A, B, C dùng cho demo. Dùng dữ liệu demo riêng, không trình chiếu token hoặc mật khẩu.
- [ ] Hồ sơ A có nhu cầu `Python`, khả năng hỗ trợ `SQL`; B và C có khả năng hỗ trợ `Python`. Trường/ngành điền rõ ràng để có nội dung thật trên card.
- [ ] Hai cửa sổ/profile browser để A và B đăng nhập độc lập. Sau scene accept, dùng cửa sổ thứ hai cho C.
- [ ] A–B và A–C chưa có kết nối hoặc lời mời đang chờ trước scene gửi. Ưu tiên tài khoản demo mới; không xóa/reset dữ liệu của thành viên khác.
- [ ] Chuẩn bị scene rỗng/lỗi và kết quả kiểm thử nếu cần; không thay đổi production UI để giả lỗi hay giả thành công.
- [ ] Ghi rõ giới hạn contract: candidate chưa có chủ đề/lịch rảnh/reasons. Không nói “đã hiển thị reasons từ backend”; điểm thành phần không phải reasons.
- [ ] Không vào Dashboard để chứng minh số liệu kết nối, vì trang đó vẫn có nội dung demo ngoài phạm vi.

## Timeline đủ 180 giây

| Thời gian | Màn hình/thao tác | Lời dẫn gợi ý |
|---|---|---|
| 00:00–00:15 | Giới thiệu PeerBridge và phần Người 1 | “Phần này giúp sinh viên tìm bạn học và chỉ tạo kết nối khi người nhận đồng ý.” |
| 00:15–00:40 | A đăng nhập, mở Hồ sơ | “Thông tin được tải từ FastAPI và được lưu trên backend.” |
| 00:40–01:05 | Mở Matching, nhấn Cập nhật kết quả, mở điểm thành phần | “Backend tính và xếp hạng điểm; frontend hiển thị kết quả trả về. Những thông tin chưa có trong contract được ghi rõ.” |
| 01:05–01:35 | A gửi lời mời B; mở Lời mời đã gửi | “Sau response thành công, lời mời chuyển sang đang chờ phản hồi. Nút bị khóa để tránh gửi trùng.” |
| 01:35–02:05 | B xem Lời mời đến, nhấn Chấp nhận; A tải lại Connections | “Chỉ người nhận được phản hồi. Backend tạo PeerMatch và hai bên thấy trạng thái đã kết nối.” |
| 02:05–02:30 | A gửi lời mời C; C từ chối | “Từ chối trả REJECTED và không tạo PeerMatch. Sau khi tải lại, lời mời không còn trong nhóm đang chờ.” |
| 02:30–02:50 | Scene responsive đã xác minh; mở kết quả tests nếu phù hợp | “Các trạng thái lỗi, rỗng, hết hạn token và quyền phản hồi được kiểm thử. Dữ liệu được tải lại từ backend.” |
| 02:50–03:00 | Kết thúc ở Connections | “Matching và Connections chỉ gọi REST; backend quản lý nghiệp vụ. StudyRoom thuộc phần Người 2.” |

Scene mobile chỉ quay sau khi thực sự kiểm tra layout. Không trình bày browser/console/mobile đã đạt khi blocker kết nối browser chưa được giải quyết.

## Checklist sau khi quay

- [ ] Video dài khoảng 3 phút và thấy rõ tên, trạng thái, thao tác gửi/accept/reject.
- [ ] Mỗi thao tác thành công có request/response thật; không dùng toast, state hoặc fixture làm bằng chứng độc lập.
- [ ] Không lộ Authorization header, mật khẩu, JWT_SECRET hoặc thông tin thật không cần thiết.
- [ ] Có cảnh tải lại dữ liệu Connections; không chỉ chuyển tab giữ state cũ.
- [ ] Không nhầm REJECTED với lịch sử từ chối: GET hiện chỉ trả pending và connected.
- [ ] Không tuyên bố reasons đã được backend cung cấp.
- [ ] Không chỉnh sửa hoặc demo phần StudyRoom/G2 trong phạm vi bàn giao Người 1.
