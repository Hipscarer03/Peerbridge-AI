# Báo cáo sửa lỗi PeerBridge — 11/10/2026

Tài liệu ghi lại các thay đổi của đợt chạy thử và sửa app, để team hiểu lỗi gì đã được xử lý, sửa ở đâu và đã kiểm tra đến mức nào. Phạm vi gồm frontend, backend và test liên quan; không phải bản đề xuất kiến trúc AI mới.

## 1. Những hành vi đã sửa

| Vấn đề trước khi sửa | Cách xử lý và hành vi sau sửa |
| --- | --- |
| Backend tạm mất kết nối khi tải hồ sơ khiến FE xóa token, đưa người dùng về đăng nhập. | Giữ phiên và hiển thị lỗi tải hồ sơ cùng nút thử lại. HTTP 401 vẫn yêu cầu đăng nhập lại. Đã thử ngắt rồi chạy lại backend trên trình duyệt. |
| Người dùng chọn ôn một concept đã biết nhưng scheduler bỏ luôn mục tiêu đó, có thể tạo plan rỗng. | Giữ concept được chọn làm mục tiêu ôn tập; chỉ bỏ prerequisite đã biết. |
| Sửa lịch thủ công có thể đưa việc học ra ngoài khoảng lập kế hoạch, lịch rảnh hoặc ngân sách. | Kiểm tra slot hợp lệ, phiên học đã đặt, prerequisite và ngân sách bằng validator chung trước khi lưu phiên bản mới. Request không hợp lệ trả 422, không thay đổi plan. |
| Tiến độ có thể dùng snapshot cũ khi plan hoặc check-in thay đổi trong cùng ngày, nhất là sửa check-in mà số bản ghi không đổi. | Tạo fingerprint từ phiên bản plan, workload và nội dung check-in. Home kiểm tra fingerprint để tính lại; adapter không đưa snapshot lỗi thời vào coach. |
| Chưa có việc đến hạn nhưng giao diện có thể nhận pacing mặc định như đã đạt 100%. | Trả `pacing: null` khi chưa có workload đến hạn. Fallback chỉ tính việc đã kết thúc theo lịch hoặc đã hoàn thành. |
| Tuần không có việc được xếp bị diễn giải thành chưa có plan. | Đổi thông báo thành “Chưa có việc được xếp trong tuần này”, dẫn sang xem/điều chỉnh kế hoạch. |
| Lịch chung phụ thuộc timezone của thiết bị, kiểm tra giờ rảnh chưa nhất quán với timezone thành viên. | Hiển thị/chọn theo giờ Việt Nam; kiểm tra toàn bộ thời lượng phiên theo timezone của từng khung giờ rảnh. Không cho chọn ô đã qua giờ hoặc khi chưa tải setup. |
| Form có thể gửi giờ đặt phiên trong quá khứ; API nhận thiếu một đầu mốc thời gian hoặc datetime không có timezone. | FE yêu cầu giờ bắt đầu trong tương lai. BE yêu cầu cả start/end cùng có hoặc cùng không có, và các mốc được cung cấp phải có timezone. BE chưa bổ sung quy tắc cấm mọi thời điểm quá khứ. |
| Màn hình plan tự chọn concept cuối trong track, có thể chọn sai mục tiêu; catalog rỗng có nguy cơ crash. | Yêu cầu chọn nội dung rõ ràng; catalog rỗng có thông báo, khóa form và chặn submit. |
| Response tải cam kết của cặp cũ có thể về muộn, ghi đè dữ liệu cặp đang xem. | Tải setup, plan, commitments cùng nhóm; kiểm tra sequence trước khi cập nhật state. |
| Lời khuyên AI và trạng thái gửi thông báo chưa thể hiện rõ nguồn/kết quả. | Phân biệt AI thật, AI mô phỏng và gợi ý theo mẫu; hiển thị delivery status. `SENT` chỉ có nghĩa đã lưu thông báo trong ứng dụng, chưa xác nhận đã đọc. |
| Phòng học che thông báo lỗi kết nối cụ thể; matching thiếu lý do chỉ hiện tiêu đề trống. | Hiển thị `connectionMessage` thực tế; matching có thông báo khi chưa có lý do phù hợp. |

## 2. Các file backend đã sửa

Đường dẫn trong bảng tính từ thư mục gốc repo.

| File | Thay đổi và lý do |
| --- | --- |
| `backend/app/agents/plan_coach/scheduler.py` | Điều chỉnh tập concept đã duyệt để mục tiêu ôn tập được chọn vẫn được xếp lịch, còn prerequisite đã biết được bỏ qua. |
| `backend/app/services/plans.py` | Cập nhật busy intervals; kiểm tra lịch sửa nằm trong slot/horizon/deadline; giữ `slot_id`; tạo lại `if_then_text`; đồng bộ context với phiên bản mới và chạy `validate_plan` cùng budget caps trước khi lưu. |
| `backend/app/routers/plans.py` | Bắt thêm `PlanValidationError` trong API sửa lịch để trả lỗi có cấu trúc thay vì HTTP 500. |
| `backend/app/schemas.py` | Validate cặp start/end và timezone của request tạo phiên; tránh lịch thiếu một đầu và lỗi so sánh datetime naive/aware. |
| `backend/app/loop/measurement.py` | Thay revision dựa trên số check-in bằng `team.v2:` + SHA-256 của dữ liệu nguồn đã chuẩn hóa/thứ tự ổn định. Không thay schema DB. |
| `backend/app/loop/coach_bridge.py` | Kiểm tra fingerprint trước khi dùng snapshot; dùng ngày/as-of của snapshot để tính due count và chọn check-in; tính gap nhất quán từ pacing đã giới hạn. |
| `backend/app/loop/trigger.py` | Kiểm tra cả ngày và revision nguồn; snapshot trong cùng ngày vẫn bị coi là cũ nếu nguồn thay đổi. |
| `backend/app/checkin/service.py` | Đọc pacing qua adapter có kiểm tra độ mới; chưa có việc đến hạn trả null; fallback dùng cutoff nhất quán với Data 1. |

## 3. Các file frontend đã sửa hoặc tạo

| File | Thay đổi và lý do |
| --- | --- |
| `frontend/app/page.tsx` | Giữ token khi lỗi tải hồ sơ không phải 401; thêm trạng thái lỗi, thử tải lại và đăng xuất. |
| `frontend/features/study-plan/components/StudyPlan.tsx` | Chặn response cũ; bỏ tự chọn mục tiêu; bảo vệ catalog rỗng; hiển thị nguồn gợi ý và trạng thái delivery. |
| `frontend/features/checkin/components/StudyCheckin.tsx` | Sửa nội dung trạng thái tuần chưa có việc, tránh kết luận sai rằng không có plan. |
| `frontend/features/study-sessions/components/ProductSessions.tsx` | Chặn submit phiên có giờ bắt đầu không ở tương lai. |
| `frontend/features/study-sessions/components/SessionCalendar.tsx` | Dùng helper timezone; khóa ô quá khứ/đã đặt/chưa tải setup; kiểm tra đủ thời lượng trong lịch rảnh. |
| `frontend/lib/session-calendar.ts` **(mới)** | Tách tính ngày lịch Việt Nam, slot và availability theo timezone thành helper có thể kiểm thử. Timezone không hợp lệ trả không rảnh thay vì crash. |
| `frontend/features/study-sessions/components/StudyRoom.tsx` | Hiển thị nội dung lỗi kết nối thực tế. |
| `frontend/components/StudyRoom.tsx` | Áp dụng cùng sửa lỗi cho component cũ còn tồn tại để hai đường sử dụng không lệch hành vi. |
| `frontend/features/peer-connections/components/Matching.tsx` | Thêm trạng thái thiếu lý do ghép cặp, không tự tạo lý do thay thế. |

## 4. Các file test đã sửa hoặc tạo

Một phần test cũ không còn khớp contract hiện tại. Các cập nhật fixture/expectation dưới đây không phải thay đổi thuật toán matching hay quy tắc chuẩn hóa dữ liệu sản phẩm.

| File | Nội dung kiểm tra/cập nhật |
| --- | --- |
| `backend/tests/test_api.py` | Chọn persona seeded có `simulated_interest`, bỏ phụ thuộc tên persona đã bị bỏ. |
| `backend/tests/test_loop.py` | Plan đổi trong ngày; sửa check-in không đổi số bản ghi; snapshot cũ bị loại; home refresh; completion đã xác nhận được giữ; pacing null khi chưa có việc đến hạn. |
| `backend/tests/test_matches_api.py` | Đồng bộ expectation với default top_k hiện tại là 10; kiểm tra lưu/tải lại sáu ứng viên, thứ hạng và phạm vi owner. |
| `backend/tests/test_matching_engine.py` | Fixture bổ sung learning goals để kiểm tra topic score đúng đầu vào hiện tại; giữ kiểm tra trọng số và thứ tự khi bằng điểm. |
| `backend/tests/test_plan_scheduler.py` | Thêm case mục tiêu ôn tập đã biết; sửa fixture chu trình để thực sự tạo cycle, không phụ thuộc thứ tự catalog. |
| `backend/tests/test_plans_api.py` | Sửa lịch ngoài window/horizon/budget bị từ chối và không ghi dữ liệu; quyền owner; giữ ID/slot/if-then/context version; stale version 409; replan sau sửa lịch; partner xem lịch nhưng không sửa hộ. |
| `backend/tests/test_profiles_api.py` | Expectation giữ cách viết đầu tiên, trim và loại trùng không phân biệt hoa/thường, khớp implementation hiện tại. |
| `backend/tests/test_schemas.py` | Đồng bộ expectation chuẩn hóa profile/reasons theo cùng quy tắc giữ cách viết đầu tiên. |
| `backend/tests/test_sessions_api.py` | Thiếu một đầu thời gian, thiếu timezone hoặc trộn naive/aware trả 422, không tạo phiên. |
| `frontend/tests/person1/peer-ui.test.cjs` | Test các feature đang dùng, mock browser đúng contract; cập nhật label/rounding; thêm hồi phục lỗi hồ sơ tạm thời; giữ kiểm tra idempotency/quyền/401. |
| `frontend/tests/person1/plan-ui.test.cjs` | Test feature StudyPlan đang dùng; mock commitments/notes; dọn interval; cập nhật nguồn/delivery; thêm catalog rỗng và chọn mục tiêu; giữ double-submit, 409 và 503. |
| `frontend/tests/person1/session-calendar.test.cjs` **(mới)** | Kiểm tra ngày/giờ Việt Nam không phụ thuộc timezone thiết bị UTC/Los Angeles/Tokyo; timezone thành viên Tokyo; đủ thời lượng; availability rỗng và timezone lỗi. |

## 5. Ảnh hưởng tích hợp cần biết

- Không thêm endpoint và không có migration DB trong đợt sửa này.
- API sửa lịch có thể trả 422 cho request trước đây lọt qua, gồm `OUTSIDE_WINDOW` hoặc lỗi validator về lịch/ngân sách. FE cần giữ nội dung lỗi BE và cho người dùng sửa lại. Kiểm tra owner và expected version vẫn được giữ.
- Request tạo phiên có lịch phải gửi đủ start/end với offset timezone, ví dụ `2026-10-12T09:00:00+07:00` và `2026-10-12T09:50:00+07:00`; cũng có thể bỏ cả hai theo contract hiện tại.
- `pacing: null` nghĩa là chưa có dữ liệu workload đến hạn để tính, không được hiển thị thành 0% hoặc 100% mặc định.
- Snapshot có revision cũ sẽ không được đưa vào coach; cần refresh measurement từ dữ liệu hiện tại. Đây là điều kiện bảo đảm gợi ý không dựa trên plan/check-in đã thay đổi.
- Lịch chung là màn hình giờ Việt Nam; màu rảnh được quy đổi theo timezone từng thành viên. Vẫn có thể chọn giờ để trao đổi khi bạn đồng hành chưa khai báo lịch rảnh; màu rảnh không tự tạo cam kết học chung.

## 6. Kết quả kiểm tra

Các kiểm tra dùng môi trường local và dữ liệu QA riêng. AI ở chế độ fake/template/mock; **chưa xác minh chất lượng, độ trễ hoặc chi phí khi gọi model thật**.

| Kiểm tra | Kết quả và bằng chứng |
| --- | --- |
| Frontend test suite | **62 pass, 0 fail** — `frontend/.qa-tests-final-verified.log`. |
| Backend regression cuối cho sessions, loop, plans | **27 pass** — `backend/data/qa-final-regression.log`. |
| Backend matching rules, schemas, scheduler | **34 pass** — `backend/data/qa-contract-tests.log`. |
| Backend full suite lần chạy rộng | **879 pass, 3 fail / 882** — `backend/data/qa-full-tests.log`. Ba lỗi là fixture matching thiếu goals và hai expectation lowercase không còn khớp contract; đã cập nhật và chạy lại nhóm 34 test ở trên thành công. **Chưa chạy lại toàn bộ suite sau các sửa cuối**, không coi đây là full suite xanh. |
| TypeScript | `npx tsc --noEmit --incremental false` thành công. |
| Production build | `npm run build` thành công — `frontend/.qa-build-final-verified.log`. |
| HTTP smoke | 9 kiểm tra local thành công: xác thực, quyền sửa lịch, horizon/version, request phiên không hợp lệ, pacing khi chưa đến hạn, phiên hiển thị cho partner và chặn outsider vào room. Kết quả được quan sát qua đầu ra chạy kiểm tra, không có file log riêng. |
| Trình duyệt thực tế | Đã đi qua đăng nhập → matching/mời/chấp nhận → tạo và sửa plan → coach → đặt phiên → room/WebSocket/chat → check-in/xác nhận; thêm case backend ngắt/kết nối lại. Có kiểm tra giao diện mobile. |
| Ảnh QA | `backend/logs/qa/checkin-verified.png`: trạng thái không có việc tuần này và tiến độ chưa có workload đến hạn. |

Log, ảnh, DB QA và môi trường chạy là artifact local bị ignore, không được đưa vào commit. Server QA và tab thử nghiệm đã đóng sau khi kiểm tra. Các kết quả trên là kiểm tra theo phạm vi đã chạy, không khẳng định app không còn lỗi ở mọi tình huống.

Để chạy lại các nhóm chính:

```powershell
# Tại frontend/tests/person1
npm test

# Tại frontend
npx tsc --noEmit --incremental false
npm run build

# Tại backend, với môi trường phụ thuộc và cấu hình test tương ứng
.venv/Scripts/python.exe -m pytest -q tests/test_sessions_api.py tests/test_loop.py tests/test_plans_api.py --tb=short
.venv/Scripts/python.exe -m pytest -q tests/test_matching_engine.py tests/test_schemas.py tests/test_plan_scheduler.py --tb=short
```

## 7. Phạm vi bàn giao

Commit của đợt này gồm 29 file code/test được liệt kê ở trên và tài liệu báo cáo này. `docs/ai-solution-analysis.md` thuộc nhiệm vụ phân tích AI trước đó, được giữ nguyên trong workspace và không nằm trong commit sửa app này. Không commit dữ liệu QA, log, credential hoặc dependency đã cài local.

Những phần cần kiểm tra tiếp nếu muốn xác nhận trước khi phát hành: chạy lại toàn bộ backend suite trên trạng thái cuối; kiểm tra provider model thật với cấu hình triển khai; kiểm tra tích hợp notification thực tế theo delivery adapter đang được cấu hình. Đợt này không triển khai app và không push remote.
