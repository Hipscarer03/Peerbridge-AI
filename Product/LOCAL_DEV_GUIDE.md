# Hướng dẫn Khởi chạy Dự án Web Local (PeerBridge / P-005)

Dự án có kiến trúc tách rời **Backend (FastAPI)** và **Frontend (Next.js)**. Để chạy đầy đủ ứng dụng trên máy cục bộ (Windows), bạn cần mở **2 cửa sổ Terminal riêng biệt**.

---

## 📌 Tổng quan Cổng Mạng (Ports) & Địa chỉ Truy cập

| Dịch vụ | Công nghệ | Host & Port | Mục đích |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 16 (React 19) | [http://localhost:3000](http://localhost:3000) | Giao diện người dùng Web App |
| **Backend** | FastAPI (Python 3.11) | [http://127.0.0.1:8001](http://127.0.0.1:8001) | REST API & AI Service |
| **API Docs** | Swagger UI | [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs) | Tài liệu & Test API trực quan |

> ⚠️ **LƯU Ý QUAN TRỌNG VỀ CỔNG 8001**:  
> Cổng mặc định `8000` trên Windows thường bị một số dịch vụ hệ thống chiếm dụng (`Access is denied`). Dự án đã được đồng bộ cấu hình sang cổng **`8001`**. Frontend tự động kết nối Backend qua cổng `8001`.

---

## 🚀 Bước 1: Khởi động Backend (FastAPI)

Mở **Terminal 1** tại thư mục gốc dự án (`g:\AI_20K\BuildPhase\P-005`):

```powershell
# 1. Di chuyển vào thư mục backend
cd backend

# 2. Kích hoạt môi trường ảo Python (.venv)
.\.venv\Scripts\Activate.ps1

# 3. Khởi động máy chủ backend
python run.py
```

* Backend sẽ tự động nạp cấu hình từ `.env` (`APP_PORT=8001`).
* Tự động khởi tạo Database SQLite tại `backend/data/dongdieu.db` và nạp dữ liệu mẫu (`seed_profiles.json`).
* Kiểm tra backend đã sẵn sàng bằng cách mở trình duyệt vào: [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs).

---

## 💻 Bước 2: Khởi động Frontend (Next.js)

Mở **Terminal 2** tại thư mục gốc dự án (`g:\AI_20K\BuildPhase\P-005`):

```powershell
# 1. Di chuyển vào thư mục frontend
cd frontend

# 2. Khởi chạy dev server (bắt buộc dùng cờ --webpack trên Windows)
npm run dev
```

* Lệnh `npm run dev` đã được cấu hình sẵn: `next dev -p 3000 --webpack` (tránh lỗi xung đột symlink của Turbopack trên Windows).
* Mở trình duyệt và truy cập ứng dụng tại: **[http://localhost:3000](http://localhost:3000)**.

---

## Học cùng có AI điều phối

Sau khi hai tài khoản đã kết nối, mở **Học cùng** trên thanh điều hướng, chọn bạn học và trò chuyện. Tin nhắn mới đến qua WebSocket; khi mất kết nối, chat tự tải lại định kỳ và kết nối lại. Tin chưa đọc hiện bằng số trên tab Học cùng và ô bạn học, không xuất hiện trong chuông thông báo. Từ một buổi đã chốt giờ trên lịch, chủ buổi có thể chọn **Lên chi tiết buổi học** để tạo timeline tự học ngay, không cần bạn ghép nhận lời hay cam kết kế hoạch chung. Form có ô mô tả từng hoạt động và thời lượng để tạo timeline tùy chỉnh; có thể chỉnh tiếp trong phần timeline. Phiên tự học có đồng hồ, hoạt động và AI điều phối; chỉ chủ buổi vào và hoàn thành phiên. Khi khung giờ vẫn còn, chủ buổi có thể mời bạn học tham gia, hoặc bạn học có thể chủ động đề xuất tham gia từ phiên tự học đang hiện trong Học cùng. Hai người chốt kế hoạch ban đầu một lần trước khi gửi hoặc nhận lời tham gia. Sau khi bên nhận đồng ý, người đó chốt mục tiêu và timeline của buổi trước khi vào học chung. Tạo phiên học chung trực tiếp cũng vẫn được khi hai bên đã chốt kế hoạch ban đầu. Nếu vào sau giờ bắt đầu, timeline giữ giờ gốc, đánh dấu các hoạt động đã qua là hoàn thành theo lịch và tiếp tục phần còn lại. Thông báo trong app báo lời mời, đề xuất tham gia, đổi timeline, đến muộn và các mốc chờ.

Khung học chung ưu tiên phiên đang diễn ra, rồi phiên sắp tới gần nhất. Nếu không có hai loại này, phiên đã kết thúc nhưng người dùng chưa đánh giá sẽ được mở để hoàn tất. Khi đã có phiên đang diễn ra hoặc sắp tới, các đánh giá cũ được thu thành nhắc nhỏ **Đánh giá buổi trước** ở góc khung chat; bấm vào mới mở phần đánh giá.

Đăng ký học chung hoặc chuyển phiên tự học thành học chung yêu cầu cả hai đã cam kết kế hoạch ban đầu một lần cho kết nối này. Cam kết giữ hiệu lực khi thêm, sửa, xóa hoặc đổi giờ buổi học; chỉ kết thúc khi kết nối ghép cặp kết thúc. Tạo timeline tự học chỉ yêu cầu chủ buổi có bài đã chốt giờ và dài 15–180 phút. Có thể lên chi tiết và gửi lời mời sau giờ bắt đầu nếu khung giờ chưa kết thúc; lời mời chưa được chấp nhận sẽ hết hiệu lực khi khung giờ kết thúc. Một bài chỉ có một phiên đang mở. Kiểm tra trùng giờ chỉ tính người thực sự tham gia, nên lịch tự học không giữ chỗ của bạn ghép. Từ chối đề xuất tham gia giữ phiên tự học; từ chối lời mời học chung trực tiếp hoặc hủy phiên giải phóng lịch. Phiên tạo từ chat chưa gắn bài đã chốt giờ sẽ được hướng dẫn mở lịch Plan.

Từng buổi học chung cần hai người chốt mục tiêu và timeline trước khi cùng vào phòng; nhận lời tham gia phiên tự học chưa thay thế bước chốt này. Mỗi lần mục tiêu hoặc timeline thay đổi, người đề xuất xác nhận bản mới và người kia chốt lại; bản đang dùng được giữ cho đến khi cả hai đồng ý. Mục tiêu có thể được hai bên đề xuất sửa đến T−15; sau đó khóa mục tiêu. Timeline tối đa 8 hoạt động, mỗi hoạt động ít nhất 5 phút, tổng không vượt khung giờ đã đặt. Khi đang học chỉ sửa hoạt động chưa bắt đầu. Mỗi lần chỉ có một đề xuất chưa xử lý; sau 60 giây chưa xác nhận thì giữ bản đã chốt. Nếu bài trên lịch đổi giờ, phiên chuyển sang trạng thái cần xác nhận lại giờ và timeline buổi đó; không cần cam kết lại kế hoạch ban đầu. Nếu thời lượng đã đổi, timeline được đặt lại thành một hoặc hai hoạt động để cùng chỉnh tiếp. Phiên chưa xác nhận lại không thể vào phòng.

T+5 hệ thống nhắc riêng người chưa vào; T+10 người chờ có thể tự học hoặc hẹn lại. Phiên chưa đủ người tham gia chỉ được ghi là bỏ lỡ khi khung giờ kết thúc, để người vào muộn vẫn tiếp tục phần còn lại. Chỉ khi cả hai đã vào và hoàn tất, phiên học chung mới được ghi hoàn thành. Đánh giá mở sau buổi đã diễn ra. Tin gửi cho bạn học dùng lời trung tính và không tiết lộ lý do cá nhân.

Backend tạo bảng `facilitated_*` và `peer_study_messages` khi khởi động; migration từ `20261016_0021` đến `20261017_0024` cập nhật các bảng phiên, tin nhắn, ảnh và giờ bài học đã đặt. API nằm dưới `/api/v1/study-meetings`. Dữ liệu và route phòng học cũ không được mở lại.

Ảnh gửi trong chat hỗ trợ JPEG, PNG và WebP, tối đa 5 MB. Backend xoay ảnh theo EXIF, thu kích thước, chuyển sang JPEG và loại metadata trước khi lưu vào `CHAT_UPLOAD_DIRECTORY` (mặc định `backend/data/chat_images`); database chỉ lưu tên file cùng MIME type trong `peer_study_messages`. Thư mục này không được public qua `/uploads`; API tải ảnh kiểm tra người xem thuộc đúng cặp học. Khi deploy, cần gắn `CHAT_UPLOAD_DIRECTORY` vào persistent volume. Nếu chạy nhiều backend instance, chuyển ảnh sang object storage như S3/R2 và lưu object key trong database để mọi instance đọc được cùng một file.

Không có `OPENAI_API_KEY` hoặc giá model, phòng vẫn hoạt động bằng các gợi ý mẫu. Để bật lời gợi ý và gói chuẩn bị từ provider, cấu hình trong `backend/.env`:

```dotenv
OPENAI_API_KEY=...
STUDY_AI_ENABLED=true
STUDY_AI_MODEL=...
STUDY_AI_INPUT_PRICE_PER_MILLION=...
STUDY_AI_OUTPUT_PRICE_PER_MILLION=...
```

Điền giá theo model thực tế đang dùng. Mỗi người có tối đa 2 lượt gợi ý trong một buổi, 8 lượt trong 24 giờ; backend dùng trần chi phí AI chung và mẫu dự phòng nếu hết ngân sách hoặc provider lỗi. Gói chuẩn bị được tạo một lần cho mục tiêu và nguồn đã xác nhận.

---

## 🛠️ Bước 3: Đồng bộ AI Log (Antigravity IDE)

Khi bạn trao đổi, yêu cầu AI viết code và muốn đồng bộ lịch sử hội thoại lên server quản lý tiến độ:

```powershell
# Chạy script đồng bộ log tại thư mục gốc:
.\submit_log.cmd

# Hoặc từ thư mục frontend:
npm run log
```

Prompt và phản hồi cuối được tự động ghi vào `.ai-log/session.jsonl` bằng hook Codex hoặc Antigravity sau khi hook tương ứng được bật/trust. Lệnh trên gửi log hiện có lên máy chủ giám sát.

---

## 🔍 Khắc phục sự cố thường gặp (Troubleshooting)

1. **Lỗi `[WinError 10013] An attempt was made to access a socket in a way forbidden`:**
   * Nguyên nhân: Đang có tiến trình cố mở cổng `8000`.
   * Khắc phục: Đảm bảo chạy lệnh `python run.py` (chạy trên cổng `8001`), không dùng `uvicorn main:app --port 8000`.

2. **Lỗi `Symlink node_modules is invalid` hoặc Turbopack panic ở Next.js:**
   * Khắc phục: Luôn chạy với cờ `--webpack` (đã cấu hình sẵn trong `package.json` của `frontend`).

3. **Lỗi CORS khi Frontend gọi Backend:**
   * Kiểm tra file `backend/.env` đã có cấu hình: `CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000`.
