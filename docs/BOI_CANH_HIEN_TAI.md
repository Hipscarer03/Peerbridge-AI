<<<<<<< HEAD
# PeerBridge: bối cảnh trước buổi demo 07/10/2026

> **Tài liệu lịch sử.** Nhánh, PR, số test và việc còn thiếu dưới đây là ảnh chụp ngày 07/10, không mô tả trạng thái nộp bài 16/10. Xem [README](../README.md), [kiến trúc](architecture.md) và [báo cáo đánh giá](../eval/results/report.md) cho trạng thái mới hơn.
=======
# PeerBridge: bối cảnh hiện tại (07/10/2026)
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

Tài liệu ngắn để cả team nắm dự án đang ở đâu trước buổi demo tối nay. Cách làm việc chung (nhánh, PR, test) xem `TEAM_WORKFLOW.md`.

## 1. Đang chạy ở đâu

| Thứ | Ở đâu |
|---|---|
| Web (frontend) | https://peerbridge-deploy.vercel.app |
| API (backend) | https://peerbridge-api-4fht.onrender.com (kiểm tra: `/health`) |
| Code đầy đủ | repo P-005, nhánh **`feat/ai-vision`** (= Data 1 + Data 2 + AI Vision + nền tảng) |
| PR | `feat/ai-vision` → `integration/peerbridge` (chưa merge) |

Web tự cập nhật **chỉ khi Tú đẩy sang repo deploy**. Các bạn push lên `feat/ai-vision` thì web **không** đổi, nên cứ push thoải mái, không ảnh hưởng demo.

Lưu ý gói miễn phí:
- Server ngủ sau 15 phút không ai dùng; lần mở đầu tiên chờ khoảng 1 phút.
- Mỗi lần server khởi động lại thì **mất hết tài khoản và dữ liệu** (chưa bật sao lưu Supabase). Riêng bạn học mẫu và 2 tài khoản thử thì tự tạo lại.

## 2. Sản phẩm làm được gì (luồng chính)

1. **Đăng ký / đăng nhập** (email + mật khẩu).
2. **Tìm bạn học**: gợi ý top 5 theo môn cần hỗ trợ ↔ môn giúp được, giờ rảnh, mục tiêu. Gửi lời mời, bạn kia chấp nhận ở chuông thông báo.
3. **Kế hoạch tuần** (Data 2): nhập mục tiêu + giờ rảnh của hai bạn, AI (OpenAI) chia việc theo 60 concept chuẩn của Data 1.
4. **Check-in bằng ảnh** (AI Vision): chụp màn hình đang học, AI đọc ảnh, mô tả vừa học gì, gắn vào việc trong kế hoạch. Bạn cặp nhận thông báo, thả cảm xúc hoặc bình luận.
5. **Đo tiến độ** (Data 1): sau mỗi check-in và mỗi giờ, tính nhịp học từng người (phút đã xong ÷ phút đến hạn), điểm cặp, ai đang chậm.
6. **Coach** (Data 2): khi một bạn chậm thì tự gợi ý giảm tải, nhắc check-in hoặc hẹn phiên học. Gửi qua chuông, tối đa 1 lần/người/ngày, không nhắc 22h–7h.
7. **Tổng quan**: các bước bắt đầu, chuỗi ngày học, kế hoạch tuần, thẻ "Nhịp học của hai bạn", thẻ "Coach gợi ý", hoạt động gần đây.
8. **Số liệu AI**: độ chính xác check-in, thời gian phản hồi, chi phí. Mọi phần AI dùng chung trần **2 USD/ngày**; hết trần thì tự chuyển về mẫu có sẵn.

## 3. Code nằm đâu (backend/app)

| Phần | Thư mục | Phụ trách |
|---|---|---|
| Onboarding, ghép cặp, đo tiến độ | `onboarding/`, `matching/`, `metrics/` | Data 1 (Chính) |
| Kế hoạch + coach | `agents/plan_coach/`, `services/plans.py`, `services/coach.py` | Data 2 (Sang) |
| Check-in bằng ảnh | `checkin/` | AI Vision (Tú) |
| Tổng quan, thông báo | `home/` | Tú |
| Vòng nối các phần (check-in → đo → coach → thông báo), sổ chi phí AI | `loop/` | Tú |
| Chế độ demo (bạn học mẫu, tài khoản thử) | `demo.py` | Tú |

Frontend Next.js ở `frontend/`, chia theo tính năng: `features/<tính năng>/components/` (overview, checkin, study-plan, study-sessions, peer-connections, moderation, admin), phần dùng chung ở `components/ui` (Avatar, icons…) và `components/common` (Landing, NotificationBell…). Trang chính: `app/page.tsx`.

Chạy test backend: `cd backend` rồi `..\.venv\Scripts\python.exe -m pytest -q tests` (hiện 879 test qua). Frontend: `cd frontend; npx tsc --noEmit; npm run build`.

## 4. Kịch bản demo tối nay (khoảng 5 phút)

**Chuẩn bị trước 5 phút:**
- Mở `/health` của API cho server thức.
- Chụp sẵn 1–2 ảnh màn hình đang làm bài SQL/Python.
- Mở 2 cửa sổ: Chrome thường và cửa sổ ẩn danh (Ctrl+Shift+N), cả hai vào trang web.

**Thao tác:**
1. Ở trang Đăng nhập, cửa sổ 1 bấm **"Vào thử: Lan"**, cửa sổ 2 bấm **"Vào thử: Minh"** (không cần đăng ký).
2. Lan vào **Tìm bạn học**: có gợi ý từ 36 bạn học mẫu, Minh đứng đầu vì bổ trợ nhau (Lan cần SQL/giỏi Python, Minh ngược lại). Gửi lời mời cho Minh.
3. Minh bấm chuông và chấp nhận.
4. Vào **Kế hoạch**, nhập mục tiêu + giờ rảnh, để AI chia việc (khoảng 10 giây).
5. Lan **check-in bằng ảnh**: AI mô tả ảnh, Lan xác nhận.
6. Sang Minh: chuông báo Lan vừa học, thả cảm xúc. Tổng quan hiện "Nhịp học của hai bạn".
7. Mở **Số liệu AI** để thấy độ chính xác, thời gian phản hồi, chi phí.

**Điểm cần nói miệng:** thẻ "Coach gợi ý" chỉ hiện khi đã quá giờ hẹn mà một bạn chưa học, nên plan vừa lập tối nay chưa có. Phần này đã có test tự động chứng minh.

Tài khoản thử dùng chung: ai bấm cũng vào cùng Lan/Minh. Nếu đã kết nối từ trước, cứ dùng tiếp.

## 5. Còn thiếu so với mục tiêu ban đầu (trước khi chạy thực nghiệm)

1. Sao lưu dữ liệu (Supabase + Litestream đã có code, chờ tạo bucket).
2. Giữ server thức (dịch vụ ping miễn phí), để vòng nhắc mỗi giờ chạy được.
3. Nhắc đúng giờ cam kết qua Web Push hoặc email (hiện mới có chuông trong app).
4. Số đo thực nghiệm: H3 giữ chân ngày 3, H5 check-in trong 24h sau khi được nhắc, so lời nhắc AI và lời nhắc mẫu.
5. Đánh giá AI Vision với 40 ảnh thật.
6. Màn onboarding Data 1 (xác nhận concept, câu hỏi tính cách) và form đồng ý tham gia.
7. Đăng nhập Google, báo cáo hoặc rời cặp, thẻ phiên học.
8. Trước khi chạy thực nghiệm với người thật: tắt chế độ demo (`DEMO_MODE=false` trên Render).

## 6. Việc có thể làm ngay trước demo

- **Mọi người:** tập kịch bản mục 4 trên web thật, ghi lại chỗ nào khó hiểu hoặc lỗi và gửi Tú.
- **Data 1 (Chính):** kiểm tra gợi ý ghép cặp với bạn học mẫu có hợp lý không (`backend/app/demo.py`), và cách tính nhịp học trên thẻ Tổng quan (`backend/app/home/overview.py`, `backend/app/loop/`).
- **Data 2 (Sang):** kiểm tra chất lượng kế hoạch AI chia và câu chữ của coach.
- Có sửa code thì push lên `feat/ai-vision` và báo Tú. Trước giờ demo Tú sẽ không cập nhật web nữa để tránh mất dữ liệu.
