# Tài liệu Kỹ thuật: Kiến trúc Agent, Kinh tế học Token & Hướng dẫn Tối ưu cho Dev

> **Dành cho:** Team Tech / Backend & AI Engineers  
> **Người biên soạn:** PO / Lead System Designer  
> **Mục tiêu:** Định hướng kiến trúc AI tinh gọn, kiểm soát 100% chi phí token và đảm bảo tốc độ hoàn thiện bản Demo và Sprint 1 tuần.

---

## 1. Tổng quan Kiến trúc: Nguyên tắc "Code Trước, AI Sau"

Để hệ thống hoạt động ổn định, không bị nghẽn mạng và không "đốt tiền" vô tội vạ, toàn bộ kiến trúc 3 tính năng AI phải tuân thủ nghiêm ngặt **Mô hình 3 Tầng (3-Tier Architecture)**:

```
┌────────────────────────────────────────────────────────────────────────┐
│  TẦNG 1: 100% CODE THUẦN (RULE-BASED ENGINE)                          │
│  • Bắt logic nghiệp vụ: Quá 23h59, trễ 1 lần, dời ngày đệm.            │
│  • Chấm điểm Matching: Tính toán công thức toán học ma trận.           │
│  • Chi phí: $0.00 | Tốc độ: < 1ms | Rủi ro: 0%                         │
├────────────────────────────────────────────────────────────────────────┤
│  TẦNG 2: TEMPLATE HYBRID (BÁN TỰ ĐỘNG)                                 │
│  • Lời nhắn trên Pacing Card (Tracking): Dùng bộ 15 template tĩnh.     │
│  • Chỉ thay thế placeholder: {user_name}, {session_name}.              │
│  • Chi phí: $0.00 | Kiểm soát 100% câu từ, không sợ AI nói hớ.         │
├────────────────────────────────────────────────────────────────────────┤
│  TẦNG 3: LLM CHUYÊN DỤNG (CHỈ GỌI KHI THỰC SỰ CẦN THIẾT)               │
│  • Trích xuất nhãn phong cách từ text giới thiệu tự do (Matching).     │
│  • Sinh cấu trúc lộ trình môn học chi tiết 2 chế độ (Planning).        │
│  • Model khuyến nghị: Gemini 1.5 Flash hoặc GPT-4o-mini.              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Đánh giá Độ phức tạp & Rủi ro Kỹ thuật của 3 Tính năng

| Tính năng | Độ phức tạp Kỹ thuật | Trọng tâm Dev cần làm | Rủi ro lớn nhất |
| :--- | :---: | :--- | :--- |
| **1. Matching** | **Trung bình** *(5/10)* | • Viết prompt trích xuất JSON 5 chiều phong cách.<br>• Viết hàm Python/JS tính điểm theo công thức spec. | Dùng LLM so sánh chéo cặp đôi (Gây bùng nổ token $O(N^2)$). |
| **2. Planning** | **Cao** *(8/10)* | • Prompt sinh JSON có cấu trúc (Structured Outputs).<br>• Cắt gọt môn học theo 2 chế độ Standard vs Survival.<br>• Phân bổ task vào các ngày rảnh và ngày đệm. | JSON bị gãy format hoặc nội dung syllabus quá dài/ngô nghê. |
| **3. Tracking** | **Thấp - Trung bình** *(4/10)* | • Xây dựng **State Machine (3 trạng thái)**.<br>• Bắn Webhook / Push Notification đúng giờ hẹn.<br>• Cập nhật trạng thái hiển thị của bạn học. | Lạm dụng gọi LLM mỗi lần user mở app hoặc check-in. |

---

## 3. Ba "Bẫy Đốt Tiền" (Token Traps) Dev Tuyệt đối Tránh

### ⚠️ Bẫy số 1: So sánh Cặp đôi bằng LLM ($O(N^2)$ LLM Calls)
* **Tuyệt đối KHÔNG:** Đưa thông tin của User A và User B vào prompt rồi hỏi LLM *"Hai người này có hợp nhau không?"*. Nếu pool có 100 người, hệ thống sẽ phải chạy gần 5,000 lần gọi API!
* **Quy chuẩn đúng:**
  1. Khi User tạo profile $\rightarrow$ Gọi LLM **1 lần duy nhất** để trích xuất 5 tag phong cách lưu vào Database.
  2. Khi chạy Matching $\rightarrow$ **100% dùng Code thuật toán** tính toán ma trận điểm số giữa các Vector tag đó. Chi phí LLM cho bước so khớp = **0 token**.

### ⚠️ Bẫy số 2: Gọi LLM Thời gian thực cho mỗi lượt Tracking
* **Tuyệt đối KHÔNG:** Mỗi lần user mở app hay bấm nút dời lịch lại gọi LLM: *"Hãy an ủi user một câu ấm áp"*. Nếu 1,000 user hoạt động $\rightarrow$ Tốn hàng ngàn lượt API/ngày vô ích.
* **Quy chuẩn đúng:**
  * Dùng **Template Copywriting viết sẵn** (Hardcoded templates) cho thẻ `PacingActionCard`.
  * Chỉ gọi LLM khi user gặp bế tắc cực nặng (ví dụ: cần Replan toàn bộ lộ trình dài hạn).

### ⚠️ Bẫy số 3: Sinh toàn bộ Lộ trình 30 ngày trong 1 Prompt
* **Tuyệt đối KHÔNG:** Yêu cầu LLM sinh chi tiết 30 ngày học cùng lúc. Output sẽ vượt quá 3,000 tokens, vừa đắt vừa dễ đứt gãy JSON giữa chừng.
* **Quy chuẩn đúng:**
  * Prompt chỉ sinh danh sách các **Milestones (Cột mốc)** và **Chi tiết các buổi học của Tuần 1**.
  * Các tuần tiếp theo sẽ sinh cuốn chiếu (Lazy generation) khi user học gần hết tuần cũ.

---

## 4. Bảng tính Ước lượng Chi phí Token / User (Token Economics)

*(Dựa trên bảng giá hiện tại của **Gemini 1.5 Flash** / **GPT-4o-mini**)*

| Tác vụ AI | Tần suất gọi | Input Token TB | Output Token TB | Chi phí ước tính (USD) |
| :--- | :--- | :---: | :---: | :---: |
| **Trích xuất Tag hồ sơ (Matching)** | 1 lần duy nhất | ~350 | ~150 | $\approx \$0.00008$ |
| **Sinh Lộ trình học (Planning)** | 1 lần / mục tiêu | ~600 | ~1,500 | $\approx \$0.00095$ |
| **Hỗ trợ nhịp học (Tracking)** | Dùng Template Code | 0 | 0 | **\$0.00000** |
| **TỔNG CHI PHÍ CHO 1 USER TRONG 1 THÁNG:** | | | | **$<$ \$0.0015 (~35 VNĐ)** |

> **Kết luận:** Nếu áp dụng đúng kiến trúc này, chi phí token của dự án là **siêu rẻ**. Toàn bộ 1,000 user tham gia đợt pilot chỉ tốn chưa tới $1.5 USD chi phí API.

---

## 5. Lựa chọn Model & Cấu hình API Khuyến nghị

1. **Model chính thức cho Backend:**
   * **Khuyên dùng số 1:** `Gemini 1.5 Flash` (Tốc độ cực nhanh, context window 1M, chi phí cực thấp, hỗ trợ tiếng Việt rất tự nhiên).
   * **Dự phòng (Fallback):** `GPT-4o-mini` (Độ tuân thủ JSON cực kỳ ổn định).
2. **Kỹ thuật bắt buộc khi cấu hình API:**
   * Luôn bật chế độ: `response_format={"type": "json_object"}` hoặc dùng SDK `Structured Outputs / Pydantic schema`.
   * Đặt `temperature = 0.2 - 0.3` để output có cấu trúc ổn định, không bay bổng.

---

## 6. Hướng dẫn Triển khai Nhanh cho Demo Ngày Mai & Sprint 1 Tuần

### Cho Demo Ngày Mai:
- [ ] **Giao diện Tracking:** Dựng component `PacingActionCard` ở đầu trang Today View.
- [ ] **Data Mocking:** Dùng dữ liệu cứng (Mock data) cho 3 trạng thái của thẻ:
  - *Trạng thái 1 (Nhắc giờ):* "Mai hai bạn có hẹn bài X. Bạn định cày lúc mấy giờ?" $\rightarrow$ 3 nút chọn giờ.
  - *Trạng thái 2 (Cứu nguy lần 1):* "Hôm qua bận việc đúng không? Đừng lo nhé!" $\rightarrow$ [Dời ngày đệm] & [Bản 15 phút].
  - *Trạng thái 3 (Cứu nguy lần 2):* "Tuần này căng thẳng quá nhỉ!" $\rightarrow$ [Cày bản 15p ngay] & [Tạm đóng băng].
- [ ] **Chưa cần cắm API LLM cho Tracking:** Tập trung hoàn thiện tương tác 1 chạm trên UI trước.

### Cho Sprint 1 Tuần tới:
- [ ] Hoàn thiện prompt `AI Planner` sinh JSON lộ trình theo schema ở file `FEATURE_SPEC_PLANNING.md`.
- [ ] Hoàn thiện prompt `AI Matching` trích xuất 5 tag phong cách theo schema ở file `FEATURE_SPEC_MATCHING.md`.
- [ ] Viết hàm tính điểm Matching thuần bằng Code (không gọi LLM).
- [ ] Cài đặt Cron job 20h00 hằng ngày kiểm tra buổi học hôm sau để kích hoạt thẻ nhắc giờ.
