---
marp: true
size: 16:9
paginate: true
style: |
  section {
    background: #0f1720;
    color: #e8eef2;
    font-family: "Segoe UI", "Be Vietnam Pro", Arial, sans-serif;
    font-size: 34px;
    padding: 56px 72px;
    justify-content: flex-start;
  }
  h1 { color: #7fd6b0; font-size: 60px; margin: 0 0 24px; }
  h2 { color: #7fd6b0; font-size: 48px; margin: 0 0 20px; }
  strong { color: #ffd479; }
  a { color: #9fc7ff; }
  ul { margin: 0; padding-left: 1.1em; }
  li { margin: 10px 0; }
  img { border-radius: 12px; }
  section::after { color: #8aa0ad; font-size: 24px; }
  .note { color: #9fb1bc; font-size: 32px; }
  .row { display: flex; gap: 32px; align-items: flex-start; }
  .row > * { flex: 1; }
---

<!-- Nguồn của docs/pitch-deck.pdf và presentation/pitch_deck.pptx.
     Dựng lại bằng Marp CLI 4.0.3; số liệu CI ghi rõ commit/lần chạy trong báo cáo đánh giá. -->

# PeerBridge

## Học cùng nhau, tiến xa hơn

Đề EDU-07 · Nhóm P-005 · AI20K Cohort 4

![h:340](images/landing.png)

---

## Vấn đề

- Tự học AICB Phase 1 **dễ bỏ dở**
- Không ai cùng nhịp, nhắc nhở
- Nhóm chat thành chỗ **xin đáp án**

<p class="note">[CẦN SỐ THẬT: khảo sát]</p>

---

## Giải pháp

<div class="row">
<div>

- Ghép **cặp bổ trợ**
- AI lập **kế hoạch tuần**
- **Check-in** bằng ảnh
- Coach nhắc đúng lúc

</div>

![w:560](images/app-match.png)

</div>

---

## Demo

<div class="row">

![w:540](images/app-plan.png)

![w:540](images/app-partner-feed.png)

</div>

peerbridge-deploy.vercel.app

---

## Kiến trúc

- Next.js (Vercel) → **FastAPI** (Render)
- SQLite, sao lưu Litestream (**chưa bật**)
- OpenAI gpt-4.1-mini
- Mọi AI chung **trần 2 USD/ngày**

<p class="note">Sơ đồ đầy đủ: docs/architecture.md</p>

---

## Công nghệ

- Next.js 16 + React 19 (Vercel)
- FastAPI + Python 3.12 (Render)
- LangGraph + OpenAI gpt-4.1-mini
- BM25 trên 15 bài học AICB Phase 1

<p class="note">AI đề xuất · code kiểm · người chốt</p>

---

## Kết quả kiểm thử

- **972** test backend · coverage **90.21%**
- Moderator: **0** lỗi nghiêm trọng/72 tin
- Red-team: **10/10** ca
- E2E luồng chính + Docker build qua CI

<p class="note">CI PR #40 ngày 16/10 · Bộ đánh giá AI là dữ liệu tổng hợp</p>

---

## Người dùng và phạm vi

- Mục tiêu: học viên AICB Phase 1 học theo cặp
- Nội dung demo: 15 bài học Phase 1
- **Chưa** thử nghiệm với người dùng thật
- **Chưa** có số khảo sát để ước lượng thị trường

<p class="note">Video demo: xem tài liệu nộp bài (chưa có URL)</p>

---

## Đội ngũ

- **Chính**: ghép cặp, tiến độ
- **Sang**: kế hoạch, coach
- **Tú**: Vision, moderator, deploy
- **Hiệp**: UX/UI và phần nền

---

## Cần hỗ trợ tiếp

- Mời sinh viên thử sản phẩm và góp ý
- Thu ảnh học tập có đồng ý để đánh giá Vision
- Bật sao lưu trước khi pilot có dữ liệu thật

<p class="note">Còn phải nộp: video ≤5 phút, ≥5 phản hồi thật</p>
