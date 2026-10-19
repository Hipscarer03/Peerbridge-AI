# Đồng Điệu backend demo

Backend FastAPI độc lập cho giao diện trong `froned/index.html`. Dữ liệu seed là **hồ sơ hư cấu**, không đại diện cho người thật.

## Chạy nhanh (PowerShell)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python run.py
```

Mở Swagger tại <http://127.0.0.1:8000/docs>. Luồng thử nhanh: `POST /auth/register` → bấm **Authorize** và nhập token → cập nhật `/profiles/me` → xem `/discover` → like qua `/interactions` → xem `/matches` và gửi tin nhắn.

## Chạy website local

Giữ backend chạy ở terminal đầu tiên. Mở terminal thứ hai tại thư mục gốc dự án:

```powershell
cd froned
python -m http.server 5500
```

Sau đó mở <http://127.0.0.1:5500>. Frontend sẽ gọi API ở `http://127.0.0.1:8000/api/v1`, lưu access token để duy trì phiên, và tự quay về màn hình đăng nhập khi token không còn hợp lệ.

Nếu backend chạy ở địa chỉ khác, truyền địa chỉ API qua query string, ví dụ:

```text
http://127.0.0.1:5500/?api=http://localhost:9000/api/v1
```

## Thành phần

<<<<<<< HEAD
- SQLite tự khởi tạo ở `data/dongdieu.db`; 44 hồ sơ mẫu hư cấu được đồng bộ khi backend khởi động, gồm hai hồ sơ liên quan Product và Phân tích nghiệp vụ. Hồ sơ mẫu có mục tiêu đo được, nhu cầu/có thể hỗ trợ, lịch rảnh và phong cách học theo cơ chế matching hiện tại.
=======
- SQLite tự khởi tạo ở `data/dongdieu.db`; 12 hồ sơ mẫu tự seed lần đầu.
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
- JWT HMAC + mật khẩu PBKDF2, không cần dịch vụ ngoài để chạy demo.
- Matching minh bạch theo mục tiêu, sở thích, lịch rảnh, thành phố và độ gần tuổi.
- Cache TTL trong bộ nhớ cho danh sách khám phá.
- LangGraph AI agent có intent router, memory trong SQLite và các tool đọc hồ sơ, match, gợi ý và an toàn.
- Không có API key thì agent dùng câu trả lời offline; có `OPENAI_API_KEY` thì gọi Responses API.
- Upload avatar JPEG/PNG/WebP tối đa 5 MB, lưu file ở `data/uploads` và chỉ lưu URL trong database.
- Chat realtime bằng WebSocket; frontend tự chuyển sang polling 4 giây khi mất kết nối.
- Trạng thái online, số tin chưa đọc, dấu đã xem, chặn và báo cáo tài khoản.
- Lọc email/số điện thoại khỏi bio và tin nhắn, rate limit mặc định 120 request/phút và 10 lần/phút cho auth.

## API chính

| Method | Endpoint | Mục đích |
|---|---|---|
| POST | `/api/v1/auth/register` | Tạo tài khoản và nhận token |
| POST | `/api/v1/auth/login` | Đăng nhập |
| GET/PUT | `/api/v1/profiles/me` | Đọc/cập nhật hồ sơ |
| POST | `/api/v1/profiles/me/avatar` | Upload ảnh đại diện |
| GET | `/api/v1/discover` | Gợi ý đã chấm điểm |
| POST | `/api/v1/interactions` | Like hoặc bỏ qua |
| GET | `/api/v1/matches` | Danh sách match |
| GET/POST | `/api/v1/matches/{id}/messages` | Chat giữa hai người đã match |
| WS | `/api/v1/ws?token=...` | Tin nhắn và trạng thái realtime |
| GET/POST/DELETE | `/api/v1/blocks` | Xem, chặn hoặc bỏ chặn tài khoản |
| POST | `/api/v1/reports` | Báo cáo tài khoản |
| POST | `/api/v1/agent/chat` | Chat với trợ lý AI |
| GET | `/api/v1/agent/status` | Kiểm tra graph và các intent |
| GET | `/api/v1/dashboard` | Số liệu tổng quan demo |

## Kiểm thử

```powershell
cd backend
pytest -q
```

## Lưu ý trước production

Đổi `JWT_SECRET`, chuyển SQLite sang PostgreSQL, cache/rate limit/presence sang Redis, thêm Alembic, email verification và dịch vụ kiểm duyệt chuyên dụng. Chuyển avatar từ `data/uploads` sang S3/Cloudinary trước khi chạy nhiều instance. Không dùng `simulated_interest` khi có người dùng thật.
