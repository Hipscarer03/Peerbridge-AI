# Tổng quan học tập

## Bố cục

- Lịch hôm nay: mọi buổi trong kế hoạch được gán ngày hôm nay, gồm đã có giờ, chưa có giờ và đã hoàn thành. Buổi chưa chọn giờ đánh dấu nền đỏ; bấm buổi để mở chi tiết trong kế hoạch.
- Ngày mai: chỉ hiện khi có buổi đã gán ngày mai nhưng chưa chọn giờ. Các phiên học chung hôm nay hiện thêm trong khối lịch.
- Tiến độ hai bạn: mỗi người có số buổi hoàn thành hôm nay và phần trăm hoàn thành cả kế hoạch. Không có kế hoạch và không có buổi học hôm nay là hai trạng thái riêng.
- Check-in bạn học: ảnh học gần nhất đã được ghi nhận của người cùng cặp, tên và thời gian tương đối. Ảnh tải qua component có xác thực; không dùng ảnh minh họa khi thiếu dữ liệu.
- Hai thao tác chính là Check-in và Xem lịch. Khối hành trình, chia sẻ hành trình và Bước tiếp theo đã bỏ khỏi Tổng quan.

## Nguồn dữ liệu

`backend/app/home/overview.py` trả dữ liệu qua `GET /api/v1/home`. `_plan_snapshot` đọc kế hoạch ACTIVE bằng `PlanRepository.hydrated`, gộp `items` và `deferred_items`. Ngày buổi học lấy từ `scheduled_start` theo giờ Việt Nam, hoặc `planned_date` khi chưa có giờ. Hôm nay dùng ngày lịch tại Việt Nam.

- Tiến độ hôm nay = buổi đã hoàn thành / tất cả buổi được gán hôm nay.
- Tiến độ cả kế hoạch = buổi đã hoàn thành / tất cả buổi của kế hoạch ACTIVE, kể cả buổi chưa gán ngày hoặc giờ.
- Phiên học chung không tự cộng vào số buổi hoàn thành của kế hoạch.
- ID cặp Plan được tra trong `peer_matches` theo hai thành viên; không dùng lẫn ID cặp tracking khi không có kết nối tương ứng.
- Ảnh lấy từ `vi_checkins` của bạn học trong cặp hiện tại, trạng thái `done`, có `image_path`.

Frontend: `features/overview/components/ProductOverview.tsx` và `ProductOverview.module.css`. Chỉ gọi API home, cập nhật mỗi 30 giây khi tab hiển thị và khi cửa sổ được focus; không cần tải lại hồ sơ để lấy mục tiêu.
