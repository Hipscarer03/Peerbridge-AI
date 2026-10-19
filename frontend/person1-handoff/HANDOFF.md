# Bàn giao Người 1 — Matching và Connections

Matching và Connections đã dùng REST thật của FastAPI. UI nhận điểm, thứ hạng và trạng thái từ backend; thông báo thành công chỉ xuất hiện sau response thành công. Chưa thể nghiệm thu toàn bộ yêu cầu: backend chưa trả thông tin chủ đề/lịch rảnh/reasons của ứng viên, và phiên công cụ chưa có browser để kiểm tra console hoặc layout desktop/mobile.

## 1. Phạm vi file của Người 1

Các file sẵn có đã sửa, có bảo toàn thay đổi chưa commit trước khi bắt đầu:

- `app/page.tsx`: bỏ Matching/Connections mẫu, gắn component thật, truyền token/user ID, khôi phục route Matching/Connections khi reload, xử lý đăng xuất do 401.
- `app/globals.css`: trạng thái tải/lỗi/rỗng, badge, disabled button, focus bàn phím và CSS màn hình nhỏ.
- `lib/api.ts`: response generics, search không body, lấy danh sách connections, ID kiểu number, giữ ApiError và thông báo 401 cho UI.
- `lib/types.ts`: types khớp Pydantic, giữ shared enums, bổ sung ConnectedPeerSummary.

<<<<<<< HEAD
Component/hook hiện tại trong `features/peer-connections/components/` và `features/peer-connections/hooks/` (bản cũ được giữ tại `legacy/components/peer-connections/`):
=======
Component/hook mới trong `components/peer-connections/`:
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

- `Matching.tsx`
- `Connections.tsx`
- `useConnections.ts`
- `shared.tsx`

Kiểm thử riêng trong `tests/person1/`:

- `api-client.test.cjs`
- `peer-ui.test.cjs`
- `live-api-smoke.cjs`
- `package.json` và `package-lock.json` cho dependencies kiểm thử riêng.
- `evidence/live-rest-result.json`: kết quả 34 request HTTP thật, không chứa bearer token, mật khẩu hoặc JWT secret.

Tài liệu mới: `person1-handoff/HANDOFF.md` và `person1-handoff/DEMO-3-MINUTES.md`. Không chỉnh tài liệu G2.

Những thay đổi Git có sẵn ngoài danh sách này thuộc trạng thái ban đầu của repository; chúng không phải thay đổi do phần Người 1 tạo ra. `next-env.d.ts` được Next tự cập nhật khi build, sau đó đã đưa về nội dung ban đầu. Root package-lock giữ nguyên.

## 2. API được tích hợp

Tất cả request có token gửi `Authorization: Bearer <token>`.

| Method | Endpoint | Body | Response dùng trong UI |
|---|---|---|---|
| POST | `/api/v1/matches/search` | Không có | MatchSearchResponse: request_id, candidates |
| GET | `/api/v1/matches/{request_id}` | Không có | MatchSearchResponse; client hỗ trợ, POST đã trả đủ kết quả nên UI không gọi GET thừa |
| GET | `/api/v1/connections` | Không có | incoming, sent, connected |
| POST | `/api/v1/connections` | `{ recipient_id }` | ConnectionResponse |
| POST | `/api/v1/connections/{id}/accept` | Không có | MATCHED và peer_match_id |
| POST | `/api/v1/connections/{id}/reject` | Không có | REJECTED và peer_match_id null |

Luồng đăng nhập/hồ sơ có sẵn đã được bảo toàn: POST `/api/v1/auth/login`, POST `/api/v1/auth/register`, GET/PUT `/api/v1/profiles/me`.

Backend quyết định score, quyền, trạng thái và PeerMatch. Frontend chỉ định dạng số để hiển thị; không tính compatibility score, không truy cập database hoặc LangGraph.

## 3. Dữ liệu mẫu đã bỏ

- Mảng candidates với Minh Trang, Đức Anh và Hoàng Linh khỏi Matching/Connections.
- Điểm 94/89/86, lý do phù hợp, chủ đề, lịch rảnh và ngành/năm học mẫu của các candidate.
- Lời mời Đức Anh, thời gian “15 phút trước” và thao tác chỉ hiện toast ở Connections.
- Danh sách bạn học Minh Trang/Hoàng Linh, số lượng kết nối/lời mời cố định và trạng thái local theo index.
- Filter chủ đề/mức độ/hình thức không được endpoint hỗ trợ và fallback từ danh sách rỗng về mẫu.

Dashboard, Sessions và các trang ngoài phạm vi vẫn có nội dung demo cũ. Không dùng các phần này làm bằng chứng cho dữ liệu thật của Matching/Connections.

## 4. Trạng thái UI

- Loading và spinner; nút cập nhật bị khóa trong lúc tìm kiếm.
- Success, danh sách rỗng rõ ràng, error alert và retry.
- PENDING: “Đang chờ phản hồi”.
- MATCHED: “Đã kết nối”.
- REJECTED: “Đã từ chối”.
- EXPIRED: “Đã hết hạn”.
- Khóa thao tác khi request đang chạy bằng ref và disabled button.
- Kiểm tra lời mời đến/đã gửi và cặp đã kết nối trước khi gửi thêm.
- Chỉ recipient thấy nút accept/reject cho lời mời PENDING; backend tiếp tục kiểm tra quyền.
- Sau accept/reject, cập nhật theo response rồi GET lại danh sách.
- Hiển thị message backend cho 409 và các lỗi khác; 401 với token hiện tại xóa phiên và yêu cầu đăng nhập lại.
- Focus-visible rõ ràng, nút tối thiểu 44px, responsive CSS và hỗ trợ prefers-reduced-motion.

GET Connections hiện chỉ trả lời mời PENDING trong incoming/sent. Sau reject, item biến mất ở lần GET mới; thông báo REJECTED được hiển thị từ response. Endpoint chưa có collection lịch sử REJECTED/EXPIRED. Frontend không tự tạo lịch sử này.

## 5. Đối chiếu 15 case

“HTTP thật” là API client gọi server FastAPI riêng với database tạm. “Component” là React test renderer, có giả lập response để kiểm tra thao tác/state; không thay thế browser end-to-end.

| # | Case | Kết quả và giới hạn |
|---|---|---|
| 1 | Sinh viên đăng nhập | Đạt HTTP thật: POST login cho 3 sinh viên trả 200, user_id đúng tài khoản đã đăng ký. Chưa thao tác form trong browser. |
| 2 | Hồ sơ được tải từ backend | Đạt HTTP thật: GET profiles/me kiểm tra user_id, tên và nhu cầu hỗ trợ đã lưu. Component Home cũng tải profile qua client. |
| 3 | Matching thành công | Đạt HTTP thật: POST search trả 201, có ứng viên đúng; GET request trả lại kết quả đã lưu. |
| 4 | Hiển thị score và reasons | Score đạt HTTP thật + component. Reasons bị chặn: MatchSearchCandidate không có field reasons. UI hiển thị “Chưa có lý do phù hợp”. |
| 5 | Không có candidates | Đạt HTTP thật: sinh viên không có nhu cầu hỗ trợ nhận candidates rỗng. Component hiển thị empty state, không fallback mẫu. |
| 6 | Matching trả lỗi | HTTP thật kiểm tra search với token sai trả 401. Component kiểm tra 503, message và retry; chưa gây lỗi 5xx thật trên server. |
| 7 | Gửi lời mời | Đạt HTTP thật: POST connections trả 201/PENDING. Component chỉ thông báo thành công sau response. |
| 8 | Không gửi trùng | Đạt HTTP thật: lần gửi trùng trả 409. Component double-click chỉ tạo một request và khóa nút sau PENDING. |
| 9 | Người nhận thấy lời mời | Đạt HTTP thật: GET của recipient chứa incoming đúng ID; component hiển thị incoming. |
| 10 | Accept → MATCHED | Đạt HTTP thật: recipient accept trả MATCHED và peer_match_id; GET của hai bên chứa cặp đã kết nối. Component tải lại đúng nhóm. |
| 11 | Reject → REJECTED | Đạt HTTP thật: trả REJECTED, peer_match_id null; GET không còn lời mời; không accept lại được. Component hiển thị thông báo và tải lại. |
| 12 | Non-recipient không accept/reject | Đạt HTTP thật: cả requester và người thứ ba gọi accept/reject đều bị 403. Component chỉ cho recipient thấy nút. |
| 13 | Reload giữ dữ liệu backend | Đạt đăng nhập lại + GET mới qua HTTP và remount component. Chưa xác minh F5 trong browser; code khôi phục hash và tải lại backend. |
| 14 | Token hết hạn | Đạt HTTP thật với JWT fixture ký đúng khóa của server kiểm thử và exp=0: 401, client phát thông báo unauthorized. Component Home kiểm tra xóa token và yêu cầu login. |
| 15 | Mobile không vỡ layout | Chưa xác minh trực quan. CSS responsive đã bổ sung; không có browser kết nối trong công cụ. |

## 6. Kết quả kiểm thử/build

- Backend: `python -m pytest tests/test_matches_api.py tests/test_connections_api.py -q` — **7 passed**. Không sửa backend test.
- Lệnh `pytest ...` trực tiếp ở môi trường này từng lỗi import `app`; dùng `python -m pytest` với Python của project giải quyết đường dẫn import.
- Frontend: `npm install` — thành công, dependencies đã cập nhật trong node_modules, root package-lock không thay đổi.
- Frontend: `npm run build` — thành công; Next.js 16.3.6 compile, TypeScript và static generation đạt.
- `npm test` trong `tests/person1` — **27 passed**.
- REST thật: `live-api-smoke.cjs` — **34 request, PASS**, bằng chứng ở `tests/person1/evidence/live-rest-result.json`.
- `git diff --check` — đạt ở lần kiểm tra cuối.
- Lint: `npm run lint` lỗi vì script là `next lint`; output: `Invalid project directory provided, no such directory: ...\\frontend\\lint`. Giữ script, không tự đổi cấu hình ngoài phạm vi.
- Browser: inventory trả `[]`; IAB và Chrome đều báo không có browser khả dụng. Chưa kiểm tra console/runtime trong browser hoặc ảnh chụp desktop/mobile.

## 7. Phần chưa làm/blocker

1. Backend chưa trả needs_help_with, can_help_with, availability hoặc reasons trong candidate response. Frontend hiển thị thông tin chưa có, không bịa nội dung; muốn đầy đủ cần mở rộng contract backend trong phần việc riêng được thống nhất.
2. Cần kết nối browser để kiểm tra form login, F5, console, network và layout ở 1440px/390px/360px. Không đánh dấu đã xác nhận “không có runtime error” khi chưa mở browser.
3. Không tích hợp StudyRoom vào page.tsx: chưa có yêu cầu rõ ràng. Không sửa hai file StudyRoom, WebSocket event parser, LangGraph moderation hoặc tài liệu G2. Hash hai file StudyRoom giữ nguyên.
4. Không commit, push hoặc tạo Pull Request.

## 8. Chạy ứng dụng

Terminal backend (Python hiện có trong venv ở root project):

```powershell
Set-Location 'D:\Vin\P-005\backend'
# Nếu thiếu dependencies mới chạy dòng sau:
& '..\.venv\Scripts\python.exe' -m pip install -r requirements.txt
# backend/.env cần JWT_SECRET không rỗng; giữ khóa local ổn định giữa các lần chạy demo.
$env:CORS_ORIGINS = 'http://localhost:3000,http://127.0.0.1:3000'
& '..\.venv\Scripts\python.exe' run.py
```

Không ghi đè file .env hiện có. Nếu chưa có JWT_SECRET, thiết lập một khóa local riêng qua biến môi trường hoặc thêm đúng field vào cấu hình của bạn. Backend mặc định chạy tại http://127.0.0.1:8000; Swagger tại http://127.0.0.1:8000/docs.

Terminal frontend:

```powershell
Set-Location 'D:\Vin\P-005\frontend'
$env:NEXT_PUBLIC_API_URL = 'http://127.0.0.1:8000'
npm.cmd install
npm.cmd run dev
```

Mở http://localhost:3000. Với production local, chạy `npm.cmd run build` rồi `npm.cmd run start` trong cùng môi trường NEXT_PUBLIC_API_URL. Không thêm `/api/v1` vào biến base URL vì API client đã thêm prefix.

Chạy lại test:

```powershell
Set-Location 'D:\Vin\P-005\backend'
& '..\.venv\Scripts\python.exe' -m pytest tests/test_matches_api.py tests/test_connections_api.py -q

Set-Location 'D:\Vin\P-005\frontend'
npm.cmd run build
Set-Location 'D:\Vin\P-005\frontend\tests\person1'
npm.cmd ci
npm.cmd test
```

REST smoke chỉ chạy trên FastAPI riêng có DATABASE_PATH/UPLOAD_DIRECTORY tạm và JWT_SECRET dành cho test. Khi server riêng đang chạy tại 127.0.0.1:18005:

```powershell
Set-Location 'D:\Vin\P-005\frontend\tests\person1'
$env:PEERBRIDGE_SMOKE_API_URL = 'http://127.0.0.1:18005'
$env:PEERBRIDGE_SMOKE_JWT_SECRET = '<khóa test đúng với server kiểm thử riêng>'
node live-api-smoke.cjs
```

Không dùng khóa production trong smoke test. Script tạo 3 tài khoản test bằng REST và ghi bằng chứng chỉ chứa method/path/status; không xóa dữ liệu.

## 9. Video demo

Checklist chuẩn bị và timeline 180 giây nằm trong `DEMO-3-MINUTES.md`. Nội dung chỉ bao gồm phần Người 1; không dùng StudyRoom/LangGraph hoặc số liệu Dashboard demo làm bằng chứng.
