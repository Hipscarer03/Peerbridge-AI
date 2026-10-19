# Kiểm thử Plan/Coach

## Kiểm thử tự động

Từ root repository, cài các phụ thuộc backend theo [hướng dẫn chạy local](../README.md#chạy-local), rồi chạy:

```powershell
Set-Location backend
python -m pytest -q tests/test_plan_coach.py tests/test_plan_scheduler.py tests/test_plans_api.py tests/test_plan_rubric.py tests/test_plan_nudge.py
Set-Location ..
```

Nhóm test này kiểm tra lập lịch, xác thực API, rubric và nudge. Các test còn lại trong `backend/tests/` kiểm tra những tích hợp khác. Để kiểm tra toàn backend, chạy `python -m pytest -q` từ `backend/`.

## Đánh giá offline

Làm theo [hướng dẫn eval](../eval/plan/README.md) để tạo bốn run template/fake trên development/holdout và một summary. Dataset là synthetic; không dùng tỷ lệ lỗi của `FakeLLM` làm tỷ lệ lỗi model thật. Dùng [rubric](plan-eval-rubric.md) nếu cần người chấm đánh giá chất lượng kế hoạch.

## Kiểm tra trong ứng dụng

Đăng nhập bằng hai tài khoản đã kết nối thành cặp, rồi kiểm tra từng tài khoản chỉ thấy kế hoạch của cặp mình: mở phần thiết lập kế hoạch, tạo kế hoạch, đọc kế hoạch và thử chỉnh lịch/replan. API tương ứng nằm ở `backend/app/routers/plans.py` (`/plans/{pair_id}/setup`, `/plans/generate`, `/plans/{pair_id}`). Khi thử một pair không thuộc tài khoản, dữ liệu không được trả về. Dùng dữ liệu thử riêng và giữ lại request/response đã loại bỏ thông tin cá nhân nếu cần báo lỗi.

Không chạy adapter AI Vision, phát thông báo thật hoặc dùng dataset holdout để chỉnh prompt khi thực hiện kiểm thử offline này.
