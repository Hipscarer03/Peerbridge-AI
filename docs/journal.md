# Journal — PeerBridge (P-005, EDU-07)

> Bản ghi theo mốc commit cũ; [JOURNAL.md ở root](../JOURNAL.md) là bản tóm tắt nộp theo đường dẫn BTC và cập nhật đến 16/10. Dòng khó khăn runner dưới đây là trạng thái lịch sử của tuần 2; runner đã được sửa trước khi PR #37 gộp.

> **Bản nháp dựng lại từ lịch sử commit (`git log`) và các PR đã merge — nhóm cần đọc lại, sửa và bổ sung.**
> Phần "Bài học" và "Khó khăn" bên dưới chỉ ghi những gì commit/tài liệu trong repo cho thấy; cảm nhận, thời gian
> thực tế và quyết định họp nhóm thì git không ghi lại, nên để dòng *(nhóm bổ sung)*.

---

## Tuần 0: 09/09 – 28/09 — Khởi tạo

### Đã hoàn thành (theo commit)
- Repo tạo từ template BTC (`a16838d`, 09/09); cập nhật cấu hình hook ghi log AI (`ab2ddbf`, 15/09).

### Bài học / khó khăn
- *(nhóm bổ sung: chọn đề EDU-07, phân vai, khảo sát người dùng nếu có)*

---

## Tuần 1: 29/09 – 05/10 — MVP Gate 2

### Mục tiêu (suy ra từ commit)
- Dựng backend FastAPI, ghép cặp bạn học, phòng học realtime có AI moderator Socratic, frontend nối API thật.

### Đã hoàn thành
- **Chính**: nền tảng backend FastAPI (`36bd3f8`), hồ sơ sinh viên (`c0fa6ae`), engine ghép cặp deterministic (`62bc967`), đồng thuận hai chiều + phiên học (`1568a26`), phòng học + HITL (`098259c`, `099e7c8`), nối frontend auth/profile/matching (`d789133`, `d94add5`, `3a45d74`), README + kiến trúc G2 (`b28913e`, `3c23cbe`).
- **Tú**: moderator LangGraph — hợp đồng dữ liệu, luật, chấm rủi ro, bảng chính sách (`1ffc02a`, `00fb6ab`); RAG Qdrant + E5 (`1c196cc`); gợi ý Socratic + output guard chống lộ đáp án/code/prompt (`70d6210`, `7a17303`); HITL (`4202ab6`); bộ eval moderator + luật hai tầng (`9cf6585`, `304418d`).
- **Sang**: frontend đầu tiên (`cf4147a`, `7b77c3e`), nối phòng học end-to-end (`ff7a375`), cập nhật matching (`2cf778e`).

### Khó khăn & giải pháp (thấy trong repo)
| Khó khăn | Giải pháp | Kết quả |
|---|---|---|
| Kiến trúc v1 bị revert rồi áp lại (`51fb61a`, `5356459`) | *(nhóm bổ sung lý do)* | Giữ kiến trúc v1 |
| Luật cứng chặn nhầm tin học bình thường | Luật hai tầng: tín hiệu "mềm" để LLM được quyền ghi đè (`304418d`) | Eval live/test 01/10: action đúng 87.9%, 0 lỗi nghiêm trọng (`eval/moderator/report-2026-10-01-live-test.md`) |

### Bài học
- *(nhóm bổ sung)*

---

## Tuần 2: 06/10 – 12/10 — Chuyển hướng "cặp học + kế hoạch + check-in", lên web thật

### Mục tiêu (suy ra từ commit)
- Ghép Data 1 (onboarding, đo tiến độ), Data 2 (plan + coach) và AI Vision (check-in bằng ảnh) thành một vòng; có URL chạy thật.

### Đã hoàn thành
- **Chính (Data 1)**: onboarding, chuẩn hoá concept, ghép cặp, đo tiến độ (`2af508f`); cải thiện Socratic (`82a581d`).
- **Sang (Data 2)**: eval plan + nudge (`4371a1d`), sửa commit trước khi trả kết quả ở connections (`dd444a4`), CI deploy image lên Render (`42cb390`, `11d035e`, `f12f6e3`).
- **Tú (AI Vision + tích hợp)**: check-in ảnh nối cặp Data 1 và plan Data 2 (`597697f`, `40cb2c0`); deploy Render + Vercel (`58a2232`, `33f633a`, `a87dcfe`); màn Check-in, trang Tổng quan thật, thông báo, PWA, sổ chi phí AI (`ac164c7`, `494cea2`, `3fa94c5`); vòng AI check-in → đo → coach → thông báo (`cd6034b`); chế độ demo 36 bạn học mẫu (`6cea49f`); workflow tự deploy (`b2b9368`).
- **Hiệp**: giao diện mới (`6666498`), cấu trúc `features/` được đưa vào bản chạy (`db3d037`).
- **Claude (tác tử AI, theo yêu cầu thành viên)**: Admin + lọc trước + trần chi phí AI cho phòng học, tóm tắt/chấm phiên (`7666587`, `cc57ec9`); RAG tra slide AICB có trích nguồn (`79bbfe0`); bạn học mẫu theo 15 bài AICB (`7125891`).

### Khó khăn & giải pháp (thấy trong repo)
| Khó khăn | Giải pháp | Kết quả |
|---|---|---|
| Org chưa duyệt app Render/Vercel cho repo P-005 | Deploy từ repo riêng của Tú (`docs/DEPLOY.md`) | Web chạy từ 07/10 |
| Render Free không có ổ đĩa bền → mất dữ liệu khi khởi động lại | Litestream sao lưu SQLite lên Supabase (`6cdc7cf`, `backend/start.sh`) | Code có sẵn, **chưa bật** vì chưa có bucket/khoá Supabase |
| Render không nhận biến môi trường mới từ `render.yaml` | `start.sh` tự đặt giá trị mặc định (`07a4551`) | AI plan/coach chạy live |
| Chi phí OpenAI không kiểm soát | Trần chung 2 USD/ngày, hết trần thì dùng mẫu/luật (`494cea2`, `cd6034b`, `7666587`) | Xem `docs/ADR-002-ai-budget-cap.md` |
| Coach nhắc ngay sau khi vừa lập plan | Chỉ tính việc đã hết khung giờ là đến hạn (`b3e66b4`) | Hết nhắc sớm |
| Runner chung team-5 không có Docker | *(chưa xử lý — xem PR CI)* | Job "verify" đỏ từ 07/10 |

### Bài học
- *(nhóm bổ sung)*

---

## Tuần 3: 13/10 – … — Nộp bài

### Đã hoàn thành
- Gộp bản web đang chạy vào `main` qua PR #24 (13/10).
- 14/10: bổ sung CI thật, tài liệu BTC (kiến trúc, đánh giá, ADR, README), trang quyền riêng tư, red-team.

### Kế hoạch
- [ ] Quay video demo *(nhóm)*
- [ ] Thu ≥5 phản hồi người dùng thật *(nhóm)*
- [ ] 40 ảnh thật cho eval AI Vision *(Tú)*
- [ ] Bật Litestream/Supabase để không mất dữ liệu *(Tú)*
