# ADR-001: Dùng SQLite một file, sao lưu bằng Litestream lên Supabase Storage

- Trạng thái: Đã chấp nhận (code có sẵn; sao lưu **chưa bật** trên bản chạy thật)
- Ngày: 07/10/2026
- Liên quan: `backend/app/db.py`, `backend/start.sh`, `backend/litestream.yml`, `render.yaml`, commit `494cea2`, `6cdc7cf`

## Bối cảnh
- Toàn bộ repository runtime dùng `sqlite3` qua `app/db.py`; SQLAlchemy/Alembic chỉ dùng cho bảng `vi_*` của check-in và migration. Chuyển sang PostgreSQL đồng nghĩa viết lại tầng dữ liệu.
- Backend chạy Render gói Free: không có ổ đĩa bền, dữ liệu mất mỗi lần server ngủ/khởi động lại.
- Ảnh check-in cần lưu cùng nơi để không phụ thuộc thêm dịch vụ lưu file (`VISION_STORAGE_BACKEND=db`).

## Quyết định
Giữ SQLite một file. Khi có đủ biến `LITESTREAM_BUCKET`, `LITESTREAM_ENDPOINT`, `LITESTREAM_REGION`,
`LITESTREAM_ACCESS_KEY_ID`, `LITESTREAM_SECRET_ACCESS_KEY`, `start.sh` sẽ: khôi phục DB từ bản sao nếu file chưa có,
chạy `litestream replicate` ở nền (đồng bộ mỗi 1 giây), rồi mới chạy app. Thiếu biến thì app vẫn chạy và in cảnh báo.

## Hệ quả
- (+) Không phải viết lại tầng dữ liệu; chi phí 0 đồng; một lệnh khôi phục.
- (−) Chỉ chạy được **một** instance backend (SQLite + WebSocket trong bộ nhớ).
- (−) Đến hôm nay bucket Supabase chưa được tạo → bản chạy thật vẫn mất dữ liệu khi khởi động lại. Việc của con người: tạo bucket/khoá và điền vào Render.
- Phương án đã loại: PostgreSQL (Supabase/Render) — tốn công viết lại; Render gói trả phí có ổ đĩa — tốn tiền.
