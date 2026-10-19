# Chạy web local trên Windows

Môi trường đã cài: Node.js 22, Python 3.11, dependencies frontend và môi trường Python riêng tại `backend/.venv`.

Từ thư mục dự án, chạy:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-local.ps1
```

- Web: http://localhost:3001
- API docs: http://127.0.0.1:8000/docs
- Health: http://127.0.0.1:8000/health
- Log: `logs/frontend.out.log`, `logs/frontend.err.log`, `logs/backend.out.log`, `logs/backend.err.log`.

Script chạy hai server nền và bỏ qua cổng đã có tiến trình lắng nghe. Log cho biết lỗi nếu server chưa khởi động thành công.

Cấu hình riêng nằm tại `frontend/.env.local` và `backend/.env`. Backend local dùng AI offline và SQLite; không cần API key hay Qdrant để mở web và thử luồng cơ bản. Đăng ký tài khoản mới trên giao diện để bắt đầu.

Nếu cần cài lại dependencies:

```powershell
cd frontend
npm.cmd ci
cd ../backend
python -m venv .venv
.\.venv\Scripts\python.exe -X utf8 -m pip install -r requirements-deploy.txt
```

Danh sách `requirements-deploy.txt` đủ cho web local; embedding E5 và thư viện kiểm thử chưa được cài trong môi trường này.
