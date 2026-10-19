<<<<<<< HEAD
# Weekly Journal — PeerBridge (P-005, EDU-07)

Nhật ký này tổng hợp những việc **có thể kiểm chứng từ lịch sử commit và tài liệu dự án**. Những cuộc họp, thời gian làm việc và cảm nhận cá nhân chưa có bằng chứng trong repo nên nhóm cần tự bổ sung trước khi nộp. Xem [nhật ký chi tiết](docs/journal.md).

## Tuần 0: 09/09–28/09 — Khởi tạo

### Mục tiêu và kết quả

- Khởi tạo dự án từ template của BTC (`a16838d`).
- Cập nhật cấu hình hook ghi log AI (`ab2ddbf`).

### Khó khăn và bài học

- Chưa có ghi chép đủ tin cậy về việc chọn đề, khảo sát người dùng và phân công trong giai đoạn này; nhóm cần bổ sung từ ghi chép gốc.

## Tuần 1: 29/09–05/10 — MVP

### Mục tiêu và kết quả

- Dựng backend FastAPI, hồ sơ và ghép cặp bạn học có đồng thuận hai chiều.
- Nối frontend với API, tạo phòng học realtime và moderator gợi mở theo phương pháp Socratic.
- Xây bộ đánh giá moderator và kiểm thử luồng chính.

### Khó khăn, cách xử lý và bài học

| Khó khăn thấy trong repo | Cách xử lý | Kết quả có bằng chứng |
|---|---|---|
| Luật kiểm duyệt chặn nhầm tin học bình thường | Dùng luật hai tầng và cho LLM xử lý tín hiệu mềm | Báo cáo live/test 01/10: action đúng 87,9%, không có lỗi nghiêm trọng trên tập thử ([kết quả](eval/moderator/report-2026-10-01-live-test.md)) |

- Bài học về quy trình nhóm cần thành viên bổ sung; lịch sử commit không ghi lại nhận xét cá nhân.

## Tuần 2: 06/10–12/10 — Tích hợp và triển khai

### Mục tiêu và kết quả

- Tích hợp Data 1 (onboarding, matching, đo tiến độ), Data 2 (plan/coach) và AI Vision check-in thành một vòng học.
- Đưa web lên Vercel và API lên Render; thêm thông báo, trang tổng quan và giới hạn chi phí AI.

### Khó khăn, cách xử lý và bài học

| Khó khăn thấy trong repo | Cách xử lý | Trạng thái |
|---|---|---|
| Repo P-005 chưa được duyệt quyền triển khai trực tiếp | Dùng repo deploy riêng của nhóm | Web demo đã có URL; xem [hướng dẫn triển khai](docs/DEPLOY.md) |
| Render Free dùng đĩa tạm | Viết cấu hình Litestream/Supabase | Code đã có; **sao lưu chưa bật trên bản live** |
| Lời nhắc coach xuất hiện ngay sau khi lập plan | Chỉ coi việc quá khung giờ là đến hạn | Sửa trong commit `b3e66b4` |

## Tuần 3: 13/10–16/10 — Chuẩn bị nộp bài

### Mục tiêu và kết quả

- Gộp bản demo vào `main` qua PR #24; bổ sung CI, E2E, tài liệu kiến trúc, đánh giá, riêng tư và red-team.
- Rà các PR ngày 14–15/10; PR #35 và #36 sửa lỗi kiểm thử, bảo vệ payload và cách ly E2E; PR #37 sửa các vấn đề còn lại trên `main`.
- Sửa runner tự quản chạy trùng tiến trình; CI của PR #37 và hai workflow trên `main` đã xanh.

### Việc cần hoàn tất do nhóm cung cấp

- [ ] Quay và đăng video demo tối đa 5 phút, điền link vào [kịch bản](docs/video-demo.md).
- [ ] Thu ít nhất 5 phản hồi người dùng thật và ghi vào [phiếu phản hồi](docs/user-feedback.md).
- [ ] Bổ sung ảnh check-in thật có nhãn, đánh giá live và xác nhận số đo với người chấm.
- [ ] Bật sao lưu dữ liệu trên bản demo nếu tiếp tục dùng Render Free.

Các kết quả ở tuần 3 phản ánh trạng thái trước đợt rà hồ sơ nộp bài này; xem [WORKLOG.md](WORKLOG.md) để đối chiếu theo ngày.
=======
# Weekly Journal — Team [Tên Team]

> Ghi lại mỗi tuần: học được gì, khó khăn gì, quyết định gì, kế hoạch tiếp.

---

## Week 1: [Ngày bắt đầu] - [Ngày kết thúc]

### Mục tiêu tuần này
- [ ] [Mục tiêu 1]
- [ ] [Mục tiêu 2]
- [ ] [Mục tiêu 3]

### Đã hoàn thành
- [thành quả 1]
- [thành quả 2]

### Khó khăn & Giải pháp
| Khó khăn | Giải pháp | Kết quả |
|----------|-----------|---------|
| [mô tả] | [cách xử lý] | [output] |

### Bài học
- [bài học 1]
- [bài học 2]

### Kế hoạch tuần sau
- [ ] [task 1]
- [ ] [task 2]

---

## Week 2: [Ngày bắt đầu] - [Ngày kết thúc]

### Mục tiêu tuần này
- [ ] [Mục tiêu 1]

### Đã hoàn thành
-

### Khó khăn & Giải pháp
| Khó khăn | Giải pháp | Kết quả |
|----------|-----------|---------|
| | | |

### Bài học
-

### Kế hoạch tuần sau
-

---

<!-- Tiếp tục copy block trên cho Week 3, 4, 5, 6 -->
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
