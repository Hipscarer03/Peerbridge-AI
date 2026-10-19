# Báo cáo quét PII / bí mật — PeerBridge

> Đây là kết quả quét **tại ngày 14/10**, không phải xác nhận trạng thái repo sau đợt dọn file nộp bài. `frontend/index.html` là bản frontend cũ được nhắc trong kết quả lịch sử và đã xóa khỏi cây hiện tại. Chạy lại lệnh cuối tài liệu trước khi nộp để có số liệu mới.

## Lần quét bổ sung 16/10/2026

Chạy lại `python privacy/pii_scan.py` trên cây đang chuẩn bị nộp: **không phát hiện mẫu khóa API/JWT**, không có file database hoặc file trên 10 MB. Bộ quét đếm 41 email ở `backend/`, 1 ở `frontend/`, 1 ở `scripts/`; 7 số giống điện thoại ở `backend/`, 4 ở `eval/`, 2 ở `privacy/`; 1 chuỗi 12 số ở `backend/`, 2 ở `eval/`, 1 ở `privacy/`. Đây là số lần khớp biểu thức, **không phải số người hay số PII thật**. Cần người phụ trách rà các mục đã che và log AI theo F3 trước khi công bố ngoài phạm vi BTC. Kết quả 14/10 bên dưới được giữ làm bằng chứng lịch sử.

- Ngày quét: 14/10/2026, trên nhánh `feature/btc-eval-kit` (tách từ `feature/btc-deliverables`).
- Công cụ: `python privacy/pii_scan.py` — quét **mọi file git đang theo dõi** tìm SĐT Việt Nam, email, số 12 chữ số dạng
  CCCD, khoá API (OpenAI `sk-`, GitHub `ghp_`, Google `AIza`, AWS `AKIA`, JWT), file database, file > 10MB. Email miền
  giả (`example.*`, `*.test`, `demo.peerbridge`…) được bỏ qua. Script chỉ in mẫu đã che.
- Kiểm tra thủ công thêm: chỗ code ghi log nội dung người dùng, chỗ bí mật đi qua URL.

## Kết quả tự động

| Loại | Số chỗ | Nằm ở đâu | Đánh giá |
|---|---|---|---|
| Khoá API / token / JWT | **0** | — | Không có bí mật bị commit |
| File database (`.db`, `.sqlite`…) | **0** | — | `.gitignore` đã chặn `*.db` |
| File > 10MB | **0** | — | — |
| Email thật | 10 | `backend/.ai-log/session.jsonl` (email cá nhân của một thành viên trong log AI) | MEDIUM — xem F3 |
| Email trong slide giảng viên | 9 | `backend/data/courses/aicb/*.md` (email liên hệ giảng viên in trên slide) | LOW — xem F4 |
| Email/SĐT/CCCD giả trong test, eval, ví dụ | 26 email, 9 SĐT, 3 chuỗi 12 số | `backend/tests/`, `eval/moderator/*`, `eval/plan/results/*`, `scripts/log_manual.py`, `frontend/index.html` | Không phải PII: số mẫu (0901234567, 0912345678…), ví dụ CCCD "012345678901" trong slide, chuỗi số trong kết quả eval |
| File ảnh / nhị phân | 26 | `docs/images`, `eval/vision/images/synthetic`, `frontend/public` | Ảnh tổng hợp và icon; **không có ảnh check-in thật** (`eval/vision/images/real/` rỗng) |

## Phát hiện và xử lý

| ID | Mức | Phát hiện | Xử lý |
|---|---|---|---|
| F1 | **HIGH** | WebSocket phòng học gửi JWT trong query (`/ws/sessions/{id}?token=…`, `frontend/lib/api.ts`). Uvicorn ghi nguyên đường dẫn này vào log (`"WebSocket … [accepted]"`), Render lưu log → ai đọc được log là chiếm được phiên đăng nhập (token sống 24h). | **Đã sửa trong nhánh này**: `backend/app/log_redaction.py` gắn bộ lọc vào logger `uvicorn.error`/`uvicorn.access`, thay `token=`/`sig=` bằng `[REDACTED]`. Test: `tests/test_log_redaction.py`. Hướng sửa gốc (chưa làm): gửi token trong tin nhắn đầu tiên của WebSocket thay vì query. |
| F2 | MEDIUM | Log lỗi AI Vision ghi nguyên thông điệp lỗi (`pipeline.py`); với lỗi "sai cấu trúc", thông điệp pydantic có thể chứa nguyên văn kết quả model (có thể lặp lại ghi chú người dùng). | **Đã sửa**: chỉ ghi loại lỗi. Thông điệp đầy đủ vẫn lưu ở `vi_checkins.error` trong DB (chỉ chủ check-in và nhóm vận hành truy cập). |
| F3 | MEDIUM | `backend/.ai-log/session.jsonl` (log AI do hook của BTC tạo) chứa email cá nhân của một thành viên. Email này cũng có trong lịch sử git (thông tin người commit). | **Không sửa**: quy định BTC cấm sửa/xoá `.ai-log/`. Thành viên đó cần biết email nằm trong log nộp cho BTC. |
| F4 | LOW | Slide AICB (corpus RAG) có email liên hệ giảng viên. | Không sửa (nội dung slide gốc, công khai cho lớp). Đã có hai lớp chặn: `_sanitize` che email trong đoạn slide trước khi đưa vào prompt, output guard chặn gợi ý chứa email/SĐT. |
| F5 | LOW | Tin nhắn phòng học lưu bản đã che SĐT/email; nội dung gốc chỉ tồn tại trong lúc kiểm duyệt. | Không cần sửa (`test_study_room_ws.py::test_raw_contact_is_not_retained_but_moderator_sees_original`). |
| F6 | INFO | Ảnh check-in đã xoá metadata, lưu trong SQLite; đường dẫn xem ảnh ký và hết hạn sau 1–2 giờ (chữ ký `sig=` cũng được bộ lọc F1 che trong log). | — |

## Chưa kiểm tra được

- Log thật đang lưu trên Render (cần đăng nhập Render — người làm). Sau khi merge F1, token cũ trong log trước đó vẫn còn: nên đổi `JWT_SECRET` trên Render để vô hiệu hoá token đã lộ.
- Lịch sử git cũ (chỉ quét bản hiện tại). Gợi ý: `git log -p | python privacy/pii_scan.py` chưa hỗ trợ; dùng `gitleaks` nếu cần quét lịch sử.

## Chạy lại

```powershell
python privacy/pii_scan.py              # in bảng đếm theo loại/thư mục
python privacy/pii_scan.py --json out.json
```
