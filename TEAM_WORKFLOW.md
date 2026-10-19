# Cách team cùng sửa code PeerBridge

Một nhánh chung, mỗi việc một nhánh riêng, gộp bằng pull request. Không ai push thẳng lên nhánh chung.

## Nhánh

| Nhánh | Dùng để |
| --- | --- |
<<<<<<< HEAD
| `integration/peerbridge` | **Nhánh chung** của team: luôn chạy được, đủ Data 1, Data 2, AI Vision và phần nền (Hiệp). |
=======
| `integration/peerbridge` | **Nhánh chung** của team: luôn chạy được, đủ Data 1, Data 2, AI Vision và phần nền (người 1). |
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
| `feat/<ten-viec>` | Nhánh riêng cho từng việc, tách từ `integration/peerbridge`. Ví dụ `feat/vision-heic`, `fix/plan-timezone`. |
| `main` | Bản nộp. Chỉ gộp từ `integration/peerbridge` khi cả team đồng ý. |

## Mỗi lần bắt đầu một việc

Mở terminal ở thư mục repo (PowerShell chạy từng dòng):

```
git checkout integration/peerbridge
git pull
git checkout -b feat/ten-viec
```

## Làm xong một đoạn

```
<<<<<<< HEAD
cd backend; .\.venv\Scripts\python.exe -m pytest -q tests; cd ..
=======
cd backend; ..\.venv\Scripts\python.exe -m pytest -q tests; cd ..
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
cd frontend\tests\person1; npm test; cd ..\..\..
git add <các file mình sửa>
git commit -m "feat(vision): mô tả ngắn việc vừa làm"
git push -u origin feat/ten-viec
```

<<<<<<< HEAD
- Test phải xanh trước khi push. GitHub chạy cả CI template và [PeerBridge CI](.github/workflows/peerbridge-ci.yml): Ruff, pytest backend, typecheck/build frontend, Docker build và E2E. Chạy test liên quan tại máy trước khi tạo PR để nhận phản hồi nhanh.
=======
- Test phải xanh trước khi push. CI trên GitHub chỉ kiểm tra code template cũ (`src/`, `tests/`), **không chạy test backend**, nên phải chạy tay như trên.
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
- Commit theo kiểu `feat:`, `fix:`, `docs:`, `test:`, `chore:` kèm phạm vi, ví dụ `fix(plan): ...`.
- Không commit `.env`, key, token, file database (`*.db`), ảnh thật của người dùng.

## Gộp vào nhánh chung

1. Trên GitHub mở pull request: **base = `integration/peerbridge`**, compare = nhánh của bạn.
2. Viết ngắn: trước thế nào, giờ thế nào, đã test gì.
3. Nhờ **một bạn khác** xem. Người viết code không tự bấm gộp.
4. Gộp xong thì xóa nhánh riêng. Lần sau làm việc khác, tạo nhánh mới từ `integration/peerbridge`.

Nếu GitHub báo conflict: `git checkout feat/ten-viec`, `git pull origin integration/peerbridge`, sửa chỗ xung đột, chạy lại test rồi push.

## Ai giữ vùng nào

Sửa vùng của người khác thì nhắn người đó trước, hoặc nhờ họ xem pull request.

| Người | Vùng code |
| --- | --- |
| Chính (AI Data 1) | `backend/app/onboarding/`, `backend/app/matching/`, `backend/app/metrics/`, `backend/data/concepts/` |
<<<<<<< HEAD
| Sang (AI Data 2) | `backend/app/agents/plan_coach/`, `backend/app/services/plans.py`, `services/coach.py`, `repositories/plans.py`, `routers/plans.py`, `frontend/features/study-plan/` |
| Tú (AI Vision) | `backend/app/checkin/`, `backend/app/home/`, `eval/vision/`, `frontend/features/checkin/`, `frontend/features/overview/`, `frontend/features/moderation/` |
| Hiệp (UX/UI và phần nền) | `frontend/app/` (khung, đăng nhập, menu), `frontend/components/common/`, `frontend/features/peer-connections/`, `frontend/features/study-sessions/`, `backend/app/routers/` chung, `security.py`, `db.py`, `render.yaml`, `backend/start.sh` |
| Tú (moderator phòng học) | `backend/app/agents/moderator/`, `services/moderation_agent.py` |

Bảng này ghi **phạm vi phụ trách**; người trực tiếp viết từng phần và thời gian thực hiện cần đối chiếu
[WORKLOG.md](WORKLOG.md) rồi để các thành viên xác nhận.
=======
| Sang (AI Data 2) | `backend/app/agents/plan_coach/`, `backend/app/services/plans.py`, `services/coach.py`, `repositories/plans.py`, `routers/plans.py`, `frontend/components/StudyPlan*` |
| Tú (AI Vision) | `backend/app/checkin/`, `backend/app/home/`, `eval/vision/`, `frontend/components/StudyCheckin*`, `Overview*`, `NotificationBell*`, `AiAnalytics*` |
| Người 1 (nền tảng) | `frontend/app/` (khung, đăng nhập, menu), `frontend/components/Landing*`, `peer-connections/`, `StudySessions*`, `backend/app/routers/` chung, `security.py`, `db.py`, `render.yaml`, `backend/start.sh` |
| Moderator (phòng học) | `backend/app/agents/moderator/`, `services/moderation_agent.py` |
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

File dùng chung (`backend/app/main.py`, `backend/app/db.py`, `frontend/lib/api.ts`, `frontend/lib/types.ts`, `frontend/app/globals.css`): sửa ít nhất có thể, ghi rõ trong pull request.

## Lên web

- Backend: Render (`render.yaml`). Giao diện: Vercel (thư mục `frontend`). Chi tiết ở `docs/DEPLOY.md`.
- Khi BTC đã duyệt Render và Vercel cho repo này: web **tự cập nhật** mỗi lần gộp vào nhánh deploy.
- Trước đó, web lấy code từ repo phụ `peerbridge-deploy`. Sau khi gộp, người giữ quyền deploy chạy:
  `git push deploy integration/peerbridge:main integration/peerbridge:feat/ai-vision`

## Thiết kế giao diện

Repo có sẵn bộ quy tắc Taste Skill trong `.claude/skills/`. Khi nhờ Claude Code sửa giao diện, Claude tự theo cùng một phong cách:
nền sáng, một màu nhấn xanh lục (`--accent`), font Be Vietnam Pro, bo góc 16px cho khối và 10px cho nút.

## Log AI của chương trình

- Mở Claude Code / Cursor / Codex **trong thư mục repo này** thì log tự ghi, và tự gửi lên web chương trình mỗi lần `git push`.
- Dùng AI trên web (ChatGPT, Claude.ai...) thì ghi tay:
  `scripts\_pyrun.cmd scripts\log_manual.py --tool claude-web --prompt "mô tả việc đã làm"`
