# Quy tắc chung cho Claude trong repo PeerBridge (P-005)

Đọc `TEAM_WORKFLOW.md` trước khi sửa code. Tóm tắt những điều bắt buộc:

## Git
- Nhánh chung là `integration/peerbridge`. Không commit hay push thẳng lên `integration/peerbridge` hoặc `main`.
- Mỗi việc làm trên nhánh riêng `feat/<ten-viec>` hoặc `fix/<ten-viec>` tách từ `integration/peerbridge` mới nhất.
- Pull request luôn vào `integration/peerbridge`. Không tự gộp pull request của chính mình.
- Hỏi người dùng trước khi push, mở pull request hay gộp.
- Không commit `.env`, key/token, file `*.db`, ảnh thật của người dùng.

## Vùng code
- Mỗi thư mục có người giữ (bảng trong `TEAM_WORKFLOW.md`). Sửa vùng của người khác thì báo người dùng, ghi rõ trong pull request.
- File dùng chung (`backend/app/main.py`, `backend/app/db.py`, `frontend/lib/api.ts`, `frontend/lib/types.ts`, `frontend/app/globals.css`): sửa tối thiểu.

## Kiểm tra trước khi báo xong
- Backend: `cd backend; ..\.venv\Scripts\python.exe -m pytest -q tests` phải xanh hết. Ruff sạch cho file đã sửa.
- Frontend: `cd frontend; npx tsc --noEmit -p .` và `cd frontend\tests\person1; npm test`.
- Test không được gọi API thật (OpenAI, Qdrant): dùng provider `fake` như các test hiện có.

## Kỹ thuật
- Backend chạy SQLite qua `app.db.database()`; trên server được Litestream sao lưu. Bảng mới: thêm vào `init_db` và một migration Alembic nối tiếp số cuối cùng trong `backend/alembic/versions/`.
- Mọi API mới đặt dưới `/api/v1`, cần `current_user`.
- Giao diện: theo Taste Skill trong `.claude/skills/` và các biến màu trong `frontend/app/globals.css` (`--accent`, `--line`, `--muted`...). Chữ tối thiểu 12px; tiếng Việt có dấu đầy đủ.
- Windows + PowerShell: không dùng `&&`, dùng `;`.

## Trả lời người dùng
- Người dùng trong team có thể không chuyên kỹ thuật: trả lời tiếng Việt, ngắn, nói kết quả trước.
