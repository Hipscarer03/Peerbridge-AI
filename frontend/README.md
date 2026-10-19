# PeerBridge Frontend

Frontend Next.js cho Student UI, Instructor Moderation Dashboard và realtime Study Room.

## Chạy local

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`. Mặc định frontend gọi backend tại `http://localhost:8000`; đổi bằng `NEXT_PUBLIC_API_URL` trong `.env.local`.

## Màn hình

- Tổng quan sinh viên
- Tìm bạn học với compatibility score do backend tính
- Kết nối theo mutual consent
- Phòng học realtime với Socratic guidance
- Hồ sơ học tập
- Instructor moderation / HITL
- Analytics lớp học
- Sơ đồ kiến trúc có thể tải dưới dạng SVG

<<<<<<< HEAD
## Cấu trúc thư mục

```text
frontend/
├── app/                     # Route, layout, khung ứng dụng và CSS toàn cục
├── features/                # Mỗi tính năng sở hữu component, hook và CSS của mình
│   ├── landing/             # Trang giới thiệu
│   ├── overview/            # Tổng quan học tập
│   ├── peer-connections/    # Gợi ý ghép cặp và kết nối
│   ├── study-plan/          # Kế hoạch và lịch học
│   ├── study-sessions/      # Phiên học, phòng học, bộ đếm giờ
│   ├── checkin/             # Check-in và ảnh học tập
│   ├── notifications/       # Thông báo
│   └── moderation/          # Kiểm duyệt và phân tích của giảng viên
├── components/
│   ├── ui/                  # Avatar, icon, input dùng chung
│   └── common/              # Component dùng ở nhiều tính năng, như JourneyCard
├── lib/                     # API client, dữ liệu contract và tiện ích
├── types/                   # Tổng hợp các type công khai
├── public/                  # Tài nguyên được phục vụ trực tiếp
├── tests/                   # Kiểm tra component, client API và smoke test
└── legacy/                  # Bản UI cũ và prototype được giữ để đối chiếu
```

Component của một tính năng đặt trong `features/<tính-năng>/components/`; CSS module nằm cạnh component. Hook riêng đặt trong `hooks/`, hàm xử lý riêng đặt trong `utils/` khi cần. Chỉ đưa component vào `components/ui` hoặc `components/common` khi nhiều tính năng sử dụng.

Không tạo thêm màn hình trong thư mục gốc `components/`. Code đang chạy không import từ `legacy/`; thư mục này được loại khỏi kiểm tra TypeScript của ứng dụng. Các bài kiểm tra UI cũ trong `tests/person1/` vẫn trỏ đến bản lưu tương ứng để giữ nguyên đối tượng kiểm tra.

=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
## Contract

Shared enums và lớp gọi REST/WebSocket nằm trong `lib/types.ts` và `lib/api.ts`. UI không truy cập PostgreSQL, Qdrant hay LangGraph trực tiếp.
