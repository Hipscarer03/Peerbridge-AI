# Feature Spec: Ghép cặp (Matching)

> **Phiên bản:** v2.1 – 11/10/2026  
> **Trạng thái:** Đang hoàn thiện – Đã tích hợp cơ chế Thác nước Hạ cấp Ưu tiên (Waterfall Fallback). Một số mục đánh dấu `[Chưa chốt]` cần xác nhận với team.  
> **Painpoint liên quan:** P1 (ngại tìm bạn), P2 (vỡ plan khi học một mình)

---

## 1. Bối cảnh & Vấn đề

**P1 — Muốn có người học cùng nhưng ngại chủ động tìm, thử vài lần rồi thôi.**
- Sinh viên biết học nhóm có lợi, nhưng tìm được đúng người tốn công. Thử 1–2 lần thất bại → bỏ luôn.
- Nhu cầu đặc biệt cao khi sắp thi hoặc có cuộc thi (thời điểm kích hoạt, không phải painpoint).
- **Mức bằng chứng:** Tín hiệu từ vài phỏng vấn ngắn, chưa có dữ liệu pilot.

---

## 2. Người dùng & Tình huống kích hoạt

| Người dùng | Tình huống | Họ làm gì hiện tại |
|---|---|---|
| Sinh viên chưa có bạn học | Sắp thi, muốn ai đó cùng ôn nhưng không biết hỏi ai | Hỏi 1–2 bạn quen, bị từ chối → học một mình |
| Sinh viên đã có bạn | Có bạn nhưng muốn thêm 1 bạn học khác chủ đề | Mở app, mời bạn qua link |

**Kích hoạt khi:** Người dùng hoàn thành hồ sơ có đủ mục tiêu học.

---

## 3. Kết quả mong đợi (Outcome)

- Người dùng **chọn được >= 1 bạn học** và **tạo cam kết** trong cùng phiên đầu tiên.
- Cặp được ghép cảm thấy "hợp lý" — giải thích rõ lý do ghép (Match Reason Badge) để không bị hụt hẫng khi không có người bù trừ 100%.
- Người chưa tìm được bạn vẫn không bỏ app → được gợi ý mời bạn quen hoặc chờ thêm ở hàng đợi.

---

## 4. Dữ liệu hồ sơ — Phân loại rõ mục đích

### 4.1 Hiển thị hồ sơ (không dùng để tính điểm ghép)

| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| Tên hiển thị | Có | — |
| Trường / Nơi học, làm việc | Không | Hiển thị để người dùng tự đánh giá, **không** dùng trong thuật toán ghép |
| Ngành học | Không | Tương tự trên |
| Năm học | Không | Hiển thị trên hồ sơ, không ghép |

> **Vì sao không dùng Trường / Ngành / Năm học để ghép:**
> - Dễ tạo bong bóng (CNTT chỉ ghép CNTT, trường top chỉ ghép top).
> - Pool pilot nhỏ (~30 người), nếu lọc thêm theo trường/ngành thì gần như không còn ai để ghép.
> - Rủi ro thiên kiến (bias) khi dùng thuộc tính nhân khẩu học.
> 
> **Tuy nhiên — Có người dùng phỏng vấn nói muốn chung trường để cùng giáo trình.** Xem mục **Bộ lọc tùy chọn** ở phần 6.3.

### 4.2 Tiêu chí ghép (AI + Code dùng để tính điểm)

| Trường | Bắt buộc | Vai trò trong ghép |
|---|---|---|
| **Mục tiêu học** (muốn hoàn thành gì + thời gian bao lâu) | Có | Xác định chủ đề, mốc thời gian → tính overlap & độ gấp gáp |
| **Giới thiệu bản thân** (text tự do) | Có | AI trích xuất đặc điểm phong cách → tính complementary/similarity |
| **Mong muốn về bạn học** (text tự do) | Có | AI trích mong muốn → so sánh ngược với đặc điểm của ứng viên |
| **Concept cần học & Concept có thể hướng dẫn** (tag/text) | Có | Đo mức bù trừ 2 chiều (swap) hoặc cùng học chung 1 concept |
| ~~Giờ cam kết học~~ | ~~Có~~ | **Tạm bỏ khỏi Ver 1** — xem mục 8 |
| ~~Lịch rảnh~~ | — | **Không nằm trong hồ sơ** — chỉ hỏi sau khi đã ghép, để đặt buổi học đầu tiên |

> **Quy tắc Ver 1:** Mỗi người chỉ có **1 mục tiêu học active** tại một thời điểm. Khi hoàn thành hoặc hủy mục tiêu cũ → mới được tạo mục tiêu mới.

### 4.3 Dữ liệu vận hành (ẩn, hệ thống quản lý)

| Trường | Cách cập nhật | Dùng để |
|---|---|---|
| Trạng thái ghép (đã ghép ai, bao nhiêu cặp) | Tự động | Kiểm soát giới hạn 2 cặp tối đa |
| Tỷ lệ duy trì (% thời gian duy trì / tổng thời gian mục tiêu) | Tự động | Điều chỉnh thứ tự gợi ý |
| Số lần drop + lý do drop | Tự động + AI hỏi khi user lâu không vào | Điều chỉnh nhẹ thứ tự gợi ý |
| Tình trạng report (bị report + Admin phê duyệt) | Admin thủ công | Loại khỏi pool |

---

## 5. Vai trò AI — Chi tiết cho dev

### 5.1 AI trích xuất đặc điểm phong cách

**Input:** Text tự do từ 2 trường "Giới thiệu bản thân" và "Mong muốn tìm người".  
**Output:** Bộ nhãn có cấu trúc theo 5 chiều:

| # | Chiều đặc điểm | Giá trị có thể | Cách ghép |
|---|---|---|---|
| 1 | **Vai trò khi học** | Thích giải thích / Thích nghe / Cân bằng | **Bổ trợ** (Giải thích + Nghe = tốt nhất) |
| 2 | **Nhịp học** | Học dồn theo đợt / Học đều đặn mỗi ngày | **Tương đồng** (cùng nhịp = ít xung đột) |
| 3 | **Phong cách phản hồi** | Thích được hỏi lại, tranh luận / Thích tự làm rồi mới hỏi / Linh hoạt | **Bổ trợ hoặc Tương đồng** tuỳ mức |
| 4 | **Môi trường học** | Im lặng, tập trung / Nói chuyện, trao đổi nhiều | **Tương đồng** (tránh xung đột khi học chung) |
| 5 | **Khi gặp khó** | Tự research trước / Hỏi ngay / Tùy tình huống | **Tương đồng nhẹ** (lệch lớn gây khó chịu) |

**Kèm Độ chắc chắn (Confidence):** Mỗi chiều AI gán thêm 1 mức confidence:
- `Cao` = text user nói rõ ràng (ví dụ: *"mình thích ngồi im học một mình rồi mới thảo luận"*)
- `Trung bình` = suy luận từ ngữ cảnh
- `Thấp` = text quá mơ hồ hoặc không đề cập chiều này

> **Quy tắc khi text quá ngắn / mơ hồ:** Gán giá trị `Chưa rõ`, confidence = `Thấp`. **Không trừ điểm**, chỉ giảm trọng số của chiều đó xuống gần 0 khi tính tổng.

### 5.2 AI trích xuất mong muốn về bạn học
Cùng cơ chế 5 chiều trên, nhưng chiều ngược: "Người này mong bạn học như thế nào?"  
**Cách dùng:** So sánh **mong muốn của A** với **đặc điểm thực tế của B** (và ngược lại).

### 5.3 AI KHÔNG làm gì
- **Không** tự ý gán cặp cứng — người dùng tự bấm chọn bạn học từ danh sách gợi ý.
- **Không** dùng giới tính, trường, ngành để tính điểm dưới mọi hình thức.
- **Không** so sánh người dùng với nhau trên giao diện (ví dụ: "Bạn A giỏi hơn bạn B").

### 5.4 Khi AI sai / Không đủ dữ liệu
| Tình huống | Xử lý |
|---|---|
| Pool < 5 người đạt ngưỡng 0.50 | Bổ sung thêm cho đủ 5, gắn nhãn `[Chưa chắc]` |
| Sau 24h không ai đạt 0.50 | Coach Agent gửi 1 tin gợi ý mời bạn quen hoặc team ghép tay |
| Text giới thiệu quá mơ hồ → AI trích sai | Không phạt user, giảm weight chiều đó. User có thể sửa hồ sơ bất cứ lúc nào |

---

## 6. Hành vi hệ thống & Thuật toán Matching Phân tầng (Waterfall Hierarchy)

### 6.1 Cơ chế Hạ cấp Ưu tiên (Waterfall Fallback)

> **Vấn đề thực tế:** Yêu cầu bù trừ hai chiều (A dạy X cần Y ↔ B dạy Y cần X) là bài toán cực khó khi pool người dùng nhỏ (dễ dẫn tới >80% không có match). Vì vậy hệ thống bắt buộc phải có cơ chế hạ cấp ưu tiên tự động từ Bậc 1 đến Bậc 4.

```
[Bậc 1: Golden Match] ──(Không có)──> [Bậc 2: Peer Match] ──(Không có)──> [Bậc 3: Body Double] ──(Không có)──> [Bậc 4: Queue]
 (Bù trừ 2 chiều)                     (Cùng học 1 môn + Hợp gu)          (Khác môn + Cùng nhịp gắt)          (Chờ pool mới)
```

| Bậc | Tên phân loại | Điều kiện logic | Vai trò cặp đôi | Phân bổ trọng số | Badge hiển thị trên UI |
|---|---|---|---|---|---|
| **Bậc 1** | **Bù trừ 2 chiều** *(Lý tưởng)* | A có X cần Y **và** B có Y cần X | Trao đổi kiến thức (Skill-swap) | Concept: 35%<br>Phong cách: 45%<br>Mục tiêu: 20% | 🌟 **Cặp đôi bù trừ hoàn hảo**<br>*(A chỉ B concept X, B hỗ trợ A concept Y)* |
| **Bậc 2** | **Cùng tiến** *(Ưu tiên 2)* | Cả A và B **cùng cần học X** + Phong cách tương thích cao | Bạn cùng tiến (Study-buddy) | Concept (trùng môn): 25%<br>**Phong cách: 50%**<br>Mục tiêu: 25% | 🤝 **Cùng cày một môn**<br>*(Cả hai bạn cùng đang ôn môn X và cùng nhịp học)* |
| **Bậc 3** | **Đồng hành kỷ luật** *(Ưu tiên 3)* | Khác môn hoàn toàn, nhưng **cùng mức độ gấp (Deadline) + Phong cách rất hợp** | Điểm danh / Kỷ luật chéo (Accountability) | Concept: 0%<br>**Phong cách: 60%**<br>Mục tiêu (Deadline): 40% | ⚡ **Đồng đội giữ kỷ luật**<br>*(Cùng chạy deadline gấp trong 10 ngày tới, check-in hằng ngày)* |
| **Bậc 4** | **Hàng đợi** *(Không ghép)* | Điểm tổng hợp < 0.50 | Chưa ghép | — | Thông báo: *"Đang tiếp tục tìm bạn phù hợp"* hoặc gợi ý mời bạn bè |

---

### 6.2 Công thức tính điểm tổng hợp

```
Score(A, B) = W_style x StyleScore(A, B)
            + W_goal  x GoalScore(A, B)
            + W_concept x ConceptScore(A, B)
            + Bonus_drop(A, B)
```
*(Trọng số W_style, W_goal, W_concept tự động điều chỉnh linh hoạt theo từng Bậc ở bảng 6.1)*

#### 1. ConceptScore — Cách tính chi tiết theo 3 kịch bản:
- **Kịch bản Bù trừ 2 chiều (Bậc 1):** `A.can_hoc ∩ B.co_the_day ≠ ∅` VÀ `B.can_hoc ∩ A.co_the_day ≠ ∅` → `ConceptScore = 1.0`
- **Kịch bản Bù trừ 1 chiều:** A dạy được B, nhưng B không dạy được A → Không trừ điểm B, `ConceptScore = 0.7`. B đóng vai trò hỗ trợ kỷ luật/ghi chép bài.
- **Kịch bản Cùng học chung (Bậc 2):** `A.can_hoc ∩ B.can_hoc ≠ ∅` → `ConceptScore = SemanticSimilarity(A.concept, B.concept) x 0.8`
- **Kịch bản Khác môn (Bậc 3):** Không có concept chung → `ConceptScore = 0.0`. Hệ thống tự động triệt tiêu trọng số `W_concept` và dồn vào `W_style` (60%) và `W_goal` (40%).

#### 2. StyleScore — Tính tương thích phong cách (5 chiều):
```
StyleScore(A, B) = 0.6 x Trung_binh(score_i) + 0.4 x Trung_binh(want_match_i)
```
- Mỗi chiều `score_i = MatchRule(dac_diem_A[i], dac_diem_B[i]) x min(confidence_A[i], confidence_B[i])`
- `want_match_i = MatchRule(mong_muon_A[i], dac_diem_B[i])`

**Bảng MatchRule cho từng chiều:**
- Vai trò: Bổ trợ (Giải thích + Nghe) = 1.0; Giống nhau = 0.7; Lệch (cùng muốn nói) = 0.3.
- Nhịp học: Cùng nhịp = 1.0; Lệch = 0.2.
- Phản hồi: Tương thích = 0.8; Lệch = 0.4.
- Môi trường học: Cùng môi trường = 1.0; Lệch = 0.2.
- Khi gặp khó: Tương đồng = 0.8; Lệch = 0.5.

#### 3. GoalScore — Mức độ gấp và hạn chót:
```
GoalScore(A, B) = 0.6 x TimeframeMatch + 0.4 x TopicSimilarity
```
- `TimeframeMatch`: Cùng mức (Gấp-Gấp, Vừa-Vừa, Dài-Dài) = 1.0; Lệch 1 mức = 0.5; Lệch 2 mức = 0.1.

---

### 6.3 Bộ lọc tùy chọn — "Ưu tiên cùng trường"
- **Vị trí:** Toggle trên UI danh sách gợi ý, **không phải tiêu chí tính điểm thuật toán**.
- **Cách hoạt động:** Khi bật toggle, sắp xếp đưa các ứng viên cùng trường trong top K lên đầu danh sách; không loại bỏ bất kỳ ai khỏi pool.
- **Lý do:** Giữ nguyên pool lớn cho pilot, nhưng vẫn đáp ứng nhu cầu học chung giáo trình của nhóm phỏng vấn.

### 6.4 Số lượng gợi ý & Giới hạn
- Số lượng gợi ý: `K = max(5, min(20, floor(pool_hop_le x 0.20)))`.
- Giới hạn: Mỗi người tối đa **2 bạn học active**.

### 6.5 Hard filter — Loại trước khi tính điểm
- Bị report + Admin phê duyệt: Loại hoàn toàn.
- Đã ghép đủ 2 bạn (không bật "Tìm thêm"): Ẩn khỏi pool.
- Đã từng bị user A bấm "Không hợp": Không hiển thị lại cho A.

---

## 7. Xử lý Drop & Tín hiệu hành vi

### 7.1 Rule Drop & Bonus duy trì
- Không trừ điểm cứng vì drop.
- Người duy trì >= **30% tổng thời gian mục tiêu** trước khi drop → Không tính là drop xấu.
- Người có lịch sử duy trì tốt được cộng bonus: `Bonus_drop = +0.05 max`.

### 7.2 AI hỏi lý do khi user lâu không vào
- Khi user không hoạt động >= 3 ngày, Coach Agent gửi thẻ 1 chạm:  
  `"Mình thấy bạn chưa vào ít lâu. Lý do là gì?"` kèm các lựa chọn:  
  `[ Bận lịch trường ]  [ Hết hứng ]  [ Bạn học không hợp ]  [ Quên ]  [ Khác ]`
- Thu thập dữ liệu khách quan để cải thiện sản phẩm và kích hoạt luồng đổi bạn nếu "Bạn học không hợp".

---

## 8. Những gì KHÔNG làm ở Ver 1 (Out of Scope)

| Tính năng | Lý do hoãn | Khi nào xem xét |
|---|---|---|
| **Giờ cam kết học làm tiêu chí ghép** | Tránh quá tải form nhập hồ sơ. Thay thế bằng mức độ gấp của mục tiêu. | Ver 2 |
| **Lịch rảnh trong hồ sơ** | Lịch đổi liên tục, gây ma sát lớn. Chỉ hỏi sau khi ghép để hẹn buổi đầu. | Ver 2 |
| **Bắt buộc 100% bù trừ kiến thức** | Gây ra tỷ lệ Zero-match >80%. Thay thế bằng Thác nước Hạ cấp Ưu tiên (Bậc 1 → Bậc 2 → Bậc 3). | Duy trì kiến trúc phân tầng |
| **Lọc theo giới tính / ngành** | Rủi ro thiên kiến (bias), co cụm nhóm. | Không dự kiến |

---

## 9. Tiêu chí chấp nhận (Acceptance Criteria)

| # | Given | When | Then |
|---|---|---|---|
| AC-1 | Hồ sơ đủ thông tin | User bấm "Tìm bạn học" | Hiển thị >= 5 gợi ý trong <= 5 giây, kèm Badge lý do ghép (Bậc 1, 2 hoặc 3) |
| AC-2 | Không tìm thấy ai bù trừ 2 chiều (Bậc 1) | Hệ thống chấm điểm | Tự động hạ cấp sang Bậc 2 (Cùng môn + Hợp phong cách) hoặc Bậc 3 (Đồng hành kỷ luật) |
| AC-3 | Pool dưới 5 người đạt ngưỡng 0.50 | Hiển thị gợi ý | Bổ sung cho đủ 5, người dưới 0.50 gắn nhãn `[Chưa chắc]` |
| AC-4 | Sau 24h không ai đạt 0.50 | Hệ thống kiểm tra | Coach Agent gửi tin nhắn gợi ý mời bạn quen |
| AC-5 | User bật toggle "Ưu tiên cùng trường" | Xem danh sách gợi ý | Người cùng trường hiển thị lên đầu, không ai bị ẩn |
| AC-6 | User A bấm "Không hợp" với B | Tìm bạn lại | B không xuất hiện trong danh sách gợi ý của A |

---

## 10. Q&A Phản biện — Giám khảo hỏi & PO trả lời

### Q1: "Nếu không tìm được người bù trừ kiến thức (A dạy B, B dạy A), hệ thống sẽ ghép dựa vào đâu? Cái gì ưu tiên thứ 2?"
> **PO trả lời:**  
> Bù trừ 2 chiều chỉ là Bậc 1 (Golden Match). Khi pool không có cặp lý tưởng, hệ thống tự động hạ cấp xuống:
> - **Ưu tiên 2 (Bậc 2 - Cùng tiến):** Cả hai bạn **cùng đang học chung một môn** và có **phong cách tương đồng**. Nghiên cứu tâm lý chỉ ra có người cùng chịu khổ chạy deadline chung môn tạo động lực bám đuổi rất lớn.
> - **Ưu tiên 3 (Bậc 3 - Đồng hành kỷ luật):** Khác môn hoàn toàn, nhưng **cùng độ gấp (deadline) và cùng nhịp kỷ luật** (Virtual Co-working). Lúc này Phong cách chiếm 60% trọng số, vì thứ giữ 2 người lại với nhau sau 3 ngày đầu chính là sự hợp gu về nhịp sinh hoạt và cam kết.
> Trên UI, AI sẽ gắn Badge giải thích rõ lý do ghép (ví dụ: *"Cùng cày một môn"*, *"Đồng đội giữ kỷ luật"*) để user hiểu đúng kỳ vọng và không thất vọng.

### Q2: "Tại sao không lọc cứng theo trường/ngành khi phỏng vấn user có nhu cầu?"
> **PO trả lời:**  
> Với pool MVP (~30-50 người), lọc cứng theo trường sẽ làm rỗng pool ngay lập tức. Chúng tôi giải quyết bằng **toggle filter ưu tiên trên UI**: Ai muốn cùng trường thì bật để đưa bạn cùng trường lên đầu, ai không quan tâm thì vẫn có đủ bạn để ghép.

### Q3: "Tại sao trọng số Phong cách lại cao nhất (50-60%) thay vì Kiến thức/Concept?"
> **PO trả lời:**  
> Kiến thức kéo người ta lại gần nhau, nhưng **Phong cách mới giữ họ ở lại cùng nhau**. Dù giỏi cỡ nào mà 1 người học đêm - 1 người học sáng, hay 1 người thích im lặng - 1 người thích nói liên tục thì cặp đôi sẽ gãy sau 2 buổi. Nhất là khi pool nhỏ, phong cách tương thích là chiếc phao cứu sinh để duy trì cam kết học tập.

### Q4: "User bị drop nhiều lần có bị phạt không?"
> **PO trả lời:**  
> Không dùng điểm phạt mà dùng **thưởng duy trì (+0.05 bonus)** và **AI hỏi lý do 1 chạm** khi user vắng mặt >= 3 ngày. Điều này giúp hệ thống thu thập data khách quan thay vì giả định xấu về người dùng.

---

## 11. Checklist cần làm rõ với team dev

- [ ] Thuật toán tính độ tương đồng Concept: Dùng embedding cosine hay prompt LLM trực tiếp?
- [ ] Định dạng lưu trữ tag Concept: Cho user chọn danh mục có sẵn hay nhập text tự do hoàn toàn?
- [ ] Giao diện Badge lý do ghép: Thiết kế icon và màu sắc riêng cho 3 loại badge (Bù trừ, Cùng tiến, Kỷ luật).
- [ ] Ngưỡng 30% thời gian duy trì trước khi drop để tính là drop hợp lệ.
- [ ] Xác nhận ngưỡng 0.50 điểm tối thiểu để lọt vào danh sách gợi ý.
