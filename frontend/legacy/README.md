# Frontend legacy

Thư mục này giữ nguyên các phiên bản giao diện trước khi chuyển sang cấu trúc theo tính năng.

- `components/`: các component và CSS cũ từng nằm ở thư mục gốc `frontend/components/`.
- `prototype/`: bản HTML/CSS/JavaScript tĩnh ban đầu; mở `prototype/index.html` để đối chiếu.

Ứng dụng Next.js hiện tại dùng `features/` và `components/ui`, `components/common`. Không import `legacy/` vào code đang chạy. Thư mục này được loại khỏi chương trình TypeScript của ứng dụng; một số bài kiểm tra UI lịch sử trong `tests/person1/` vẫn dùng các component cũ.

Các file được di chuyển và giữ nội dung để có thể đối chiếu hoặc khôi phục. Những import nội bộ cần thiết đã được cập nhật theo vị trí mới.
