# Chấm chất lượng kế hoạch Plan/Coach

Runner trong `eval/plan/run.py` chỉ kiểm tra hợp đồng và các ràng buộc cứng trên dữ liệu synthetic. `hard_pass` không phải điểm chất lượng. Chỉ ghi nhận mục tiêu chất lượng ≥4/5 khi có điểm người chấm trên đủ mẫu, gắn đúng lượt chạy.

Từ root repository, tạo bảng chấm mới cho một lượt eval đã chạy:

```powershell
$ratingOutput = 'eval/plan/ratings/' + [guid]::NewGuid().ToString('N')
python eval/plan/rubric.py --run-dir eval/plan/results/template-development --prepare --output $ratingOutput
```

Lệnh tạo `ratings.csv` và `rating-guide.md`. Đọc hướng dẫn riêng cho từng persona trong `rating-guide.md`, rồi điền `rater` và cả năm điểm nguyên 1–5 vào CSV. Giữ nguyên `pair_case`, `user_id`, `split`, `source=human` và `run_sha256`. Dùng file mới cho mỗi người chấm; không sửa file nguồn sau khi tổng hợp. Đường `--run-dir` ở ví dụ là kết quả synthetic đã lưu; thay bằng thư mục run cần đánh giá.

| Cột điểm | Cần xem xét |
| --- | --- |
| `goal_fit` | Concept, mục tiêu và phần mục tiêu còn thiếu |
| `feasibility` | Giờ rảnh, ngân sách thời gian và việc có thể thực hiện |
| `specificity` | Hành động và đầu ra cụ thể |
| `schedule_accuracy` | Lịch, deadline và tiên quyết |
| `if_then_accuracy` | Câu Nếu–thì có khớp ngày, giờ, nơi và việc |

Mỗi cột: 1 = không đạt, 3 = còn thiếu đáng kể, 5 = đáp ứng đầy đủ; dùng 2 và 4 cho mức trung gian. Nếu plan có `partial=true`, đánh giá đúng phần đã lập và ghi rõ phần còn thiếu trong `notes`; không suy ra toàn bộ mục tiêu đã hoàn thành.

Sau khi điền CSV, tổng hợp bằng một thư mục output mới:

```powershell
$summaryOutput = 'eval/plan/ratings/' + [guid]::NewGuid().ToString('N')
python eval/plan/rubric.py --run-dir eval/plan/results/template-development --ratings "$ratingOutput/ratings.csv" --output $summaryOutput
```

Runner từ chối ID, split, hash lượt chạy, nguồn, điểm hoặc người chấm không hợp lệ; không ghi đè output cũ. Điểm `llm_judge` phải có `model` và `prompt_version`, và được báo cáo riêng. Điểm trung bình được tính theo từng mẫu rồi mới tính trên các mẫu. `quality_target_verified` chỉ đúng khi toàn bộ mẫu của run có điểm người chấm gắn hash và trung bình của từng chiều đạt ít nhất 4.
