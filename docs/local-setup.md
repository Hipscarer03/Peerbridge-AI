# Chạy web local trên Windows

Yêu cầu: Node.js 22, Python 3.12 và Git. Cài dependencies trước khi chạy lần đầu. Hướng dẫn này dùng cho Windows; [README chính](../README.md) có cách chạy thủ công và Docker.

Từ thư mục dự án, chuẩn bị môi trường:

```powershell
cd frontend
npm ci
cd ../backend
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-deploy.txt
Copy-Item .env.example .env
cd ..
```

Sau khi đặt `JWT_SECRET` riêng trong `backend/.env`, chạy:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-local.ps1
```

- Web: http://localhost:3001
- API docs: http://127.0.0.1:8000/docs
- Health: http://127.0.0.1:8000/health
- Log: `logs/frontend.out.log`, `logs/frontend.err.log`, `logs/backend.out.log`, `logs/backend.err.log`.

Script chạy hai server nền và bỏ qua cổng đã có tiến trình lắng nghe. Nó dùng `backend/.venv`, nên cần làm bước cài đặt bên trên. Log cho biết lỗi nếu server chưa khởi động thành công.

Cấu hình riêng nằm tại `frontend/.env.local` và `backend/.env`. Backend local dùng AI offline và SQLite; không cần API key hay Qdrant để mở web và thử luồng cơ bản. Đăng ký tài khoản mới trên giao diện để bắt đầu.

Danh sách `requirements-deploy.txt` đủ cho web local; embedding E5 và thư viện kiểm thử không có trong danh sách nhẹ này. Muốn chạy bộ kiểm thử đầy đủ, cài `backend/requirements.txt` như README chính.
