# Feature Spec: Lập Kế Hoạch & Thích Ứng Nhịp Học (Adaptive Planning)

> **Phiên bản:** v1.0 – 11/10/2026  
> **Trạng thái:** Sẵn sàng cho Tech Review – Đã chốt cơ chế Hybrid Queue & 2 Chế độ thực hiện.  
> **Painpoint liên quan:** P2 (vỡ plan khi học một mình, tâm lý tội lỗi khi lỡ nhịp, kế hoạch quá dày không đúng năng lực)

---

## 1. Bối cảnh & Vấn đề

**P2 — Lập kế hoạch theo cảm hứng, nhanh chóng vỡ sau 3–5 ngày vì đời thực biến động và kế hoạch quá dày.**

- Sinh viên thường ước lượng thời gian quá lạc quan (*Planning fallacy*), lên lịch dày đặc không có ngày nghỉ.
- Khi có việc bận đột xuất từ trường/cuộc sống $\rightarrow$ Lỡ 1–2 buổi $\rightarrow$ Bị dồn việc $\rightarrow$ Tâm lý tội lỗi, xấu hổ $\rightarrow$ Bỏ luôn app (*What-the-hell effect*).
- Newbie không biết phần nào là cốt lõi để tập trung; người có nền tảng gần lại bị ép học lại từ đầu gây nhàm chán.

---

## 2. Người dùng & Tình huống kích hoạt

| Nhóm người dùng | Tình huống kích hoạt | Kỳ vọng chính |
|---|---|---|
| **Sinh viên Ôn thi nước rút** | Sắp thi (< 2–4 tuần), cần cày nhanh qua môn | Cắt bỏ râu ria, chỉ tập trung dạng bài hay ra thi, lịch rõ ràng. |
| **Sinh viên Học kỹ năng / Ngôn ngữ** | Học môn mới dài hạn (> 1–2 tháng), tự học | Nhịp học nhẹ nhàng, dễ duy trì, không bị áp lực đứt chuỗi. |
| **Cặp đôi vừa Match thành công** | Cả hai đã chọn nhau sau bước Matching | Cùng nhìn thấy lộ trình học và có thể nhắc nhở, comment cho nhau. |

**Kích hoạt khi:** Người dùng hoàn tất tạo hồ sơ mục tiêu hoặc vừa ghép cặp thành công.

---

## 3. Kết quả mong đợi (Outcome)

- **Tỷ lệ tạo Plan thành công trong phiên đầu:** $\ge 85\%$ (không bị kẹt vì phải nghĩ lịch quá nhiều).
- **North Star Metric phục hồi:** Sau khi lỡ 1 buổi đầu tiên, $\ge 70\%$ người dùng quay lại học tiếp trong vòng 48 giờ (nhờ Chế độ Sinh tồn & Ngày đệm).
- Người dùng không có cảm giác "nợ bài" hay bị app phán xét khi có việc bận.

---

## 4. Dữ liệu Đầu vào & Phân loại Người học (Onboarding Input)

Để tránh ma sát, form thu thập đầu vào chỉ gồm **3 câu hỏi một chạm** (dưới 10 giây hoàn thành):

### 4.1 Form thu thập thông tin
1. **Mục tiêu & Hạn chót:**
   - Tên môn / Kỹ năng muốn học (Text).
   - Ngày đích (Target Date) $\rightarrow$ Hệ thống tự tính số ngày còn lại để phân loại:
     - **Gấp** ($< 14$ ngày)
     - **Vừa** ($14 - 60$ ngày)
     - **Dài** ($> 60$ ngày)
2. **Kinh nghiệm / Nền tảng hiện tại (3 mức độ 3.2):**
   - `[Mới toanh từ số 0]` *(Newbie thực thụ: Chưa biết gì về môn lẫn lĩnh vực này)*.
   - `[Có nền tảng môn gần]` *(Transfer Learner: Lần đầu học môn này nhưng đã vững môn tương tự, ví dụ đã biết C++ chuyển sang học Python)*.
   - `[Đã học trên lớp, cần ôn lại]` *(Refresher: Đã học nhưng hổng kiến thức, mất gốc)*.
3. **Khung nhịp rảnh trong tuần:**
   - Checkbox các ngày có thể học: `[x] T2`, `[ ] T3`, `[x] T4`, `[ ] T5`, `[x] T6`, `[ ] T7`, `[x] CN`.
   - Giờ học cụ thể: **Optional (Không bắt buộc nhập ngay)**.

---

## 5. Vai trò AI & Cơ chế Prompt cho Kỹ thuật (AI Planner Mechanics)

### 5.1 Logic sinh Lộ trình Kiến thức (Knowledge Sequencing)
AI đóng vai trò Kiến trúc sư nội dung (Content Architect):
- **Phân tích bối cảnh:** Nhận diện loại môn học (Môn thi cử hàn lâm vs Kỹ năng tự do).
- **Lọc 80/20 theo Trình độ:**
  - Nếu là `Newbie số 0`: Bắt đầu từ khái niệm gốc rễ $\rightarrow$ Ví dụ cơ bản $\rightarrow$ Bài tập áp dụng.
  - Nếu là `Transfer Learner`: **Bỏ qua 100% các bài giải thích khái niệm nền**, đi thẳng vào so sánh sự khác biệt và thực hành.
  - Nếu là `Refresher`: Bỏ qua đọc sách dày, tập trung vào Bảng công thức tóm tắt $\rightarrow$ Phân loại dạng bài $\rightarrow$ Luyện đề.
- **Nếu mục tiêu ở mức GẤP (< 14 ngày):** AI tự động chạy bộ lọc: Chia nội dung thành 3 giỏ: `[Bắt buộc phải học]` (đủ qua môn), `[Nên học]` (lấy điểm khá), `[Cắt bỏ]` (nội dung dài tốn thời gian).

### 5.2 Cấu trúc Dữ liệu đầu ra của AI (JSON Schema cho Dev)
```json
{
  "plan_id": "string",
  "goal_name": "string",
  "timeframe_category": "GAP | VUA | DAI",
  "learner_tier": "NEWBIE | TRANSFER | REFRESHER",
  "milestones": [
    {
      "milestone_id": 1,
      "title": "Nắm vững Cú pháp & Cấu trúc cơ bản",
      "target_completion_week": 1,
      "criteria_done": "Viết được 3 hàm xử lý chuỗi không lỗi",
      "sessions": [
        {
          "session_id": "s_101",
          "title": "Biến và Kiểu dữ liệu nâng cao",
          "estimated_duration_min": 45,
          "standard_mode": {
            "description": "Đọc tóm tắt cú pháp + Hoàn thành 4 bài tập cơ bản",
            "evidence_prompt": "Chụp màn hình code bài 4 hoặc paste kết quả chạy"
          },
          "survival_mode": {
            "duration_min": 15,
            "description": "Đọc bảng Cheat-sheet 1 trang + Trả lời 1 câu trắc nghiệm nhanh",
            "evidence_prompt": "Trả lời đúng câu hỏi phản xạ: Cú pháp khai báo dictionary"
          },
          "suggested_order": 1,
          "is_core": true
        }
      ]
    }
  ]
}
```

---

## 6. Hành vi Hệ thống & Cơ chế Xếp Lịch (Scheduling & UI Architecture)

### 6.1 Mô hình Giao diện Hybrid: "Queue Công Việc" & "Lịch Thực Tế"
Để tránh ép buộc giờ giấc gây vỡ plan, giao diện chia làm 2 vùng tương tác:

```
┌──────────────────────────────────────┬──────────────────────────────────────────┐
│     HÀNG ĐỢI BUỔI HỌC (SESSION QUEUE)│            LỊCH TUẦN ĐÃ CHỌN             │
├──────────────────────────────────────┼──────────────────────────────────────────┤
│ Các buổi AI đã chia nhỏ theo thứ tự: │ [Thứ 2] ── Buổi 1: Biến & Kiểu dữ liệu   │
│                                      │ [Thứ 3] ── [NGÀY ĐỆM - Tự do / Nghỉ]     │
│ [Buổi 4: Vòng lặp For/While] [Gán ->]│ [Thứ 4] ── Buổi 2: Cấu trúc rẽ nhánh     │
│ [Buổi 5: Xử lý Chuỗi]        [Gán ->]│ [Thứ 5] ── [NGÀY ĐỆM - Tự do / Nghỉ]     │
│ [Buổi 6: Cấu trúc Danh sách] [Gán ->]│ [Thứ 6] ── Buổi 3: Viết Hàm cơ bản       │
│                                      │ [Thứ 7] ── [NGÀY ĐỆM - Tự do / Nghỉ]     │
│ (User bấm để kéo/gán vào ngày rảnh)  │ [Chủ nhật] [ + Chọn buổi từ Queue vào ]  │
└──────────────────────────────────────┴──────────────────────────────────────────┘
```

* **Quy tắc Fill tự động:**
  1. AI lấy danh sách buổi học từ Queue và **fill tự động vào các ngày rảnh user đã chọn** trong tuần đầu tiên.
  2. **Không bắt buộc fill hết 100% các buổi:** Những buổi nâng cao hoặc buổi chưa chắc chắn lịch sẽ nằm ở **Hàng đợi (Queue)** chờ user chủ động gán khi biết lịch rảnh.
* **Xử lý Giờ học chưa nhập:**
  - Nếu user chưa nhập giờ học cụ thể cho ngày mai: Vào **20h00 tối hôm trước**, AI Tracking sẽ hiện thẻ thông báo nhẹ nhàng: *"Ngày mai bạn có lịch học Buổi 2. Bạn định học lúc mấy giờ?"* `[Sáng 9h]` `[Tối 20h]` `[Tự do]`.

### 6.2 Hai Chế Độ Thực Hiện (Standard vs Survival Mode)
Mỗi buổi học luôn có 2 toggle chuyển đổi:
1. **Chế độ Tiêu chuẩn (Standard):** 30–60 phút (Lộ trình chuẩn).
2. **Chế độ Sinh tồn (Survival - 15 phút):** 
   - Dành cho ngày quá mệt hoặc bận đột xuất.
   - User bấm nút **"Hôm nay đuối quá"** $\rightarrow$ Nội dung tự thu nhỏ lại còn 15 phút (Đọc 1 trang tóm tắt hoặc làm 1 câu ngắn).
   - Hoàn thành bản Sinh tồn **vẫn được tính là Giữ Streak**, xóa bỏ hoàn toàn cảm giác tội lỗi.

### 6.3 Luật Ngày Đệm 20% (Buffer Days)
- Các ngày trong tuần mà user **không chọn học** nghiễm nhiên trở thành **Ngày đệm**.
- Ngày đệm không có task mới. Nếu lỡ buổi học trước đó, AI Tracking sẽ đề xuất: *"Dời buổi học hôm qua sang Ngày đệm hôm nay nhé?"*

---

## 7. Tương tác Bạn Học (Peer Collaboration)

Ở phiên bản MVP, chưa phân hóa phức tạp theo loại match mà tập trung vào sự hỗ trợ thiết thực:

1. **Xem tiến độ của nhau:** Bạn học có thể thấy đối phương đang ở Buổi học nào, tỷ lệ hoàn thành tuần này đạt bao nhiêu %.
2. **Comment & Note trực tiếp vào Buổi học:**
   - Bạn B có thể để lại bình luận hoặc mẹo học tập dưới buổi học của A (Ví dụ: *"Bài này nhớ chú ý điều kiện biên, tớ bị sai ở đây này"*).
3. **Hệ thống Notification thông minh:**
   - Khi có comment mới $\rightarrow$ Bắn thông báo ghi rõ tên người nhận xét: *"B vừa để lại một mẹo học tập cho Buổi 3 của bạn"*.
   - Nút thả cảm xúc (High-five / Thả tim) khi bạn học vừa hoàn thành xong 1 buổi học.

---

## 8. Các Màn Hình Hiển Thị (UI Scope Ver 1)

* **Ưu tiên 1: Chế độ xem Ngày (Focus / Today View):**
  - Màn hình mặc định khi mở app: Chỉ tập trung vào duy nhất buổi học hôm nay (hoặc buổi gần nhất).
  - Gồm: Tên bài, thời lượng, toggle "Bản Sinh Tồn 15p", nút "Báo hoàn thành", khu vực comment của bạn học.
* **Ưu tiên 2: Chế độ xem Tuần (Week View):**
  - Hiển thị 7 ngày trong tuần: Những ngày có task, những ngày là Ngày đệm, thanh tiến độ % của tuần.
  - Vùng Hàng đợi (Queue) các buổi chưa gán ngày.
* **Chế độ xem Tháng (Month View - Tinh gọn):**
  - Chỉ hiển thị **Cột mốc cần đạt (Milestone Criteria)** của từng tháng, không hiện task vụn vặt để tránh gây ngợp.

---

## 9. Những gì KHÔNG làm ở Ver 1 (Out of Scope)

| Tính năng | Lý do hoãn | Thời điểm xem xét |
|---|---|---|
| **Kéo thả lịch phức tạp trên Mobile (Drag & Drop)** | Dễ phát sinh lỗi trên cảm ứng điện thoại; thay bằng nút bấm "Gán ngày" trực quan. | Ver 2 |
| **Phân quyền chỉnh sửa sâu theo cấp độ Match** | Giữ tính năng mở và đơn giản cho pilot. Bạn học chỉ comment, không ghi đè plan của nhau. | Ver 2 |
| **Tự động trừng phạt / Đóng băng tài khoản khi trễ** | Gây ức chế và làm user bỏ app; thay bằng cơ chế phục hồi nhân văn. | Không dự kiến |
| **Tự động đọc hiểu toàn bộ file slide giáo trình tải lên** | Tốn chi phí token và xử lý OCR phức tạp; Ver 1 chỉ nhận text/link ghi chú. | Ver 2+ |

---

## 10. Tiêu chí Chấp nhận (Acceptance Criteria cho Dev & QA)

| # | Given (Điều kiện) | When (Hành động) | Then (Kết quả mong đợi) |
|---|---|---|---|
| **AC-P1** | User nhập xong mục tiêu, hạn chót, chọn loại `Transfer Learner` và tick 3 ngày rảnh | Bấm "Tạo kế hoạch" | AI trả về lộ trình JSON trong $\le 5$ giây, loại bỏ các bài nền tảng, tự động rải việc vào 3 ngày đã chọn. |
| **AC-P2** | Có các buổi học còn dư chưa có ngày | User mở màn hình Tuần | Các buổi dư hiển thị ở danh sách Queue bên cạnh, có nút gán vào ngày rảnh bất kỳ. |
| **AC-P3** | Đến 20h tối trước ngày học mà chưa có giờ cụ thể | Hệ thống chạy cron check | AI gửi thông báo nhắc user chọn khung giờ cho ngày mai. |
| **AC-P4** | User đang ở màn hình Today View nhưng thấy mệt | Bấm toggle "Chế độ Sinh tồn" | Khối lượng bài thu nhỏ còn 15 phút, yêu cầu nộp bằng chứng rút gọn. Hoàn thành vẫn tính giữ Streak. |
| **AC-P5** | Bạn B để lại nhận xét vào Buổi 2 của A | B bấm gửi comment | Hệ thống gửi notification tới A: *"B vừa để lại nhận xét cho Buổi 2 của bạn"*. |
| **AC-P6** | User lỡ 1 buổi học vào ngày hôm trước | User mở app vào Ngày đệm kế tiếp | Hệ thống hiện thẻ gợi ý 1 chạm: *"Dời buổi học hôm qua sang hôm nay?"* (Không báo đỏ Overdue phạt lỗi). |

---

## 11. Q&A Phản biện cho Tech & Note cho PO

### 11.1 Q&A cho Kỹ thuật & Giám khảo
* **Q1: "Nếu AI chia lộ trình sai kiến thức thì sao?"**
  * *Trả lời:* Ver 1 sẽ kết hợp **Template chuẩn hóa** cho các môn phổ biến (TOEIC, Lập trình Web, Giải tích đại cương) kết hợp LLM để tùy biến theo ngày rảnh của user. Người dùng và bạn học luôn có quyền bấm nút "Đổi nội dung" hoặc tự comment ghi chú lại.
* **Q2: "Tại sao không bắt buộc nhập giờ học ngay từ đầu?"**
  * *Trả lời:* Ép nhập giờ chính xác ngay từ đầu là nguyên nhân hàng đầu khiến user bỏ dở form đăng ký. Đời sống sinh viên thay đổi theo ngày, cho phép "Nhập ngày trước, hẹn giờ tối hôm trước" giảm 80% ma sát vận hành.

### 11.2 Note cho PO — Các hướng tư duy ngoài lối mòn (Để tham khảo Ver 2+)
Trong quá trình First Principles thinking, có một số hướng đột phá rất hay cần lưu trữ cho các bản nâng cấp tiếp theo:
1. **Mô hình Vượt Ải (Game Skill Tree):** Xóa bỏ hoàn toàn ngày tháng cố định, chỉ chia thành 10 Level. Rảnh lúc nào vượt ải lúc đó $\rightarrow$ Triệt tiêu 100% cảm giác trễ hạn.
2. **Reverse Diagnostic (Học ngược từ đề thi):** Ném ngay 1 bài test 5 câu then chốt lúc đầu. Sai câu nào mở đúng bài đó $\rightarrow$ Giảm 50% độ dài plan mà không cần khảo sát năng lực.
3. **Body Doubling (Phòng tự học ảo Focusmate):** Tập trung vào việc cùng ngồi học thời gian thực (hiện diện) thay vì chỉ quản lý danh sách việc tĩnh.

---

## 12. Checklist Kỹ thuật cho Team Dev

- [ ] Cài đặt JSON schema chuẩn hóa cho AI Planner prompt (đảm bảo output luôn có 2 mode Standard và Survival).
- [ ] Xây dựng Database Table cho `StudyPlan`, `PlanMilestone`, `PlanSession`, `SessionQueue`.
- [ ] Thiết kế Component giao diện Split-view: Bên trái là `SessionQueue`, bên phải là `WeeklyScheduleGrid`.
- [ ] Thiết lập Cron job gửi thông báo vào 20h00 nhắc user set giờ cho ngày hôm sau nếu chưa có.
- [ ] API nộp comment và gửi push notification giữa 2 bạn học.
- [ ] Logic tính Streak: Hoàn thành bản Survival vẫn tính `streak_increment = true`.
