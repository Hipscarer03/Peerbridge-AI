# Feature Spec: Cú Bridge theo dõi và cứu nhịp học (v1.2)

**Cập nhật:** 18/10/2026 · **Trạng thái:** Kế hoạch triển khai theo các tình huống PO mô tả. Tài liệu này thay bản v1.1 trong thư mục tích hợp.

## 1. Mục tiêu và phạm vi

Cú giúp người học giữ được kế hoạch khi lịch đổi, bài quá sức hoặc hai bạn lệch nhịp. Cú hỏi thăm trước, đề xuất bước nhỏ, để người học duyệt mọi thay đổi. Bạn học được báo đúng điều cần biết để tiếp tục học chung, không nhận lý do riêng tư hay điểm tiến độ của người kia.

Có ba nơi hiển thị, cùng đọc một danh sách tình huống:

- **Hero > Hôm nay:** tối đa 3 thẻ cần quyết định, ưu tiên việc gấp. Giữ bố cục hero đã có; thẻ theo mẫu nhãn màu nhạt, tiêu đề ngắn, tối đa 2 dòng nội dung và 1–3 nút như hình tham chiếu của PO. Không thêm banner dài. Tab “Hành trình” vẫn dành cho kỷ niệm, không nhét nhắc việc vào.
- **Chat với Cú:** Cú Bridge là một người chat mặc định; bỏ nhãn “AI coach”. Tin từ Cú chỉ có chữ rõ, nền trắng/xám rất nhạt, một màu nhấn cho nút chính. Tin nhắc việc có thể nằm trong lịch sử chat riêng với Cú nhưng không tạo tin trùng mỗi lần tải trang.
- **Chuông thông báo:** dùng cho việc tới giờ hoặc thay đổi từ bạn học. Từ một sự kiện chỉ tạo một nội dung nhất quán trên hero, chat Cú và chuông; đã xử lý ở nơi nào thì các nơi còn lại cập nhật ngay.

Không mặc định đưa lời Cú vào chat riêng giữa hai người. Chỉ thông báo cần thiết cho bạn học hoặc lời hỏi thăm người dùng đã bấm gửi mới xuất hiện ở phía người nhận, có ghi rõ người gửi.

## 2. Điều kiện chung và thứ tự ưu tiên

Mọi mốc thời gian dùng giờ server và múi giờ người học; bản đầu có thể dùng Asia/Ho_Chi_Minh. Chỉ xét kế hoạch hiện hành, buổi chưa hoàn thành, cặp đang kết nối. Check-in đang xử lý ảnh hoặc phản hồi muộn cần được xác nhận trước khi kết luận người học bỏ lỡ. Một tình huống có mã riêng theo người + buổi + loại, tránh gửi lặp khi refresh, mở hai thiết bị hoặc job chạy lại.

**Thứ tự trên hero:** sắp vào phòng chung / bạn đang chờ > quay lại sau buổi chung không gặp nhau > buổi cá nhân quá giờ hoặc nghỉ liên tiếp > lời mời và lịch ngày mai chưa chốt > lệch nhịp. Nếu nhiều việc cùng loại, gom số lượng; không xếp chồng nhiều thẻ cho cùng một buổi. Khi còn thẻ gấp, tạm dừng hero tự chuyển tab để người dùng kịp đọc và bấm. Sau khi xử lý, thẻ tiếp theo mới xuất hiện.

Thông báo trong app là mặc định. Bản đầu chưa cần email/push hay tác vụ LLM chạy nền. Việc nhắc lúc 20h hôm trước xuất hiện khi người dùng vào app từ 20h đến trước buổi học; nếu có job sẵn thì job cũng chỉ tạo cùng một sự kiện. Lời nhắc không làm phiền trong 22h–7h, ngoại trừ trạng thái buổi học mà người dùng đang chủ động mở.

## 3. Các tình huống Cú can thiệp

### C1. Chốt giờ ngày mai và lịch trình học chung

**Kích hoạt:** từ 20h hôm nay hoặc lần mở app tiếp theo, khi ngày mai có bài đã chọn ngày nhưng chưa chọn giờ; có phiên học chung đã mời nhưng chưa được cả hai chốt cùng phiên bản lịch trình; hoặc bạn học mới đề xuất giờ/mục tiêu/lịch trình. Phiên sắp bắt đầu được ưu tiên hơn nhắc ngày mai.

**Chat Cú / chuông:** “Mai bạn có {n} buổi chưa chọn giờ. Buổi {tên} cần bạn chốt trước nhé.”; “Buổi học với {B} còn chờ hai bạn chốt lịch trình.”; “{B} vừa gợi ý đổi buổi học. Bạn xem và trả lời nhé.” Không nói “đã chốt” khi chỉ có một người xác nhận.

**Hero:** một thẻ “Cần chốt cho ngày mai” với tối đa 2 tên buổi, nút **Chọn giờ** hoặc **Xem đề xuất** dẫn đúng bài/phiên. Nếu cùng lúc có cả ba loại, thẻ gom số lượng và mở trang Kế hoạch/Học chung có lọc việc chờ.

**Khi bấm:** dùng màn đặt giờ và xác nhận lịch trình hiện có; ghi trạng thái chỉ sau khi API chấp nhận. Nếu hết hạn lời mời ở T−15, thẻ đổi thành “Hẹn giờ khác”, không cho bấm vào đề xuất cũ.

### C2. Buổi cá nhân quá giờ hôm nay hoặc còn dang dở từ hôm qua

**Kích hoạt:** sau giờ kết thúc dự kiến và thêm 10 phút, hoặc khi mở app hôm sau, nếu bài vẫn chưa hoàn thành và không có check-in đang chờ xác nhận. Không nhắc theo kiểu đếm nợ, không lặp lại một bài đã dời hoặc đã làm xong.

**Lời Cú:** “Buổi {tên} chưa xong. Mình có thể làm nhẹ lại để bạn dễ bắt đầu.” Các lựa chọn là **Thử bản 15 phút**, **Chuyển sang ngày đệm**, **Nội dung quá sức**.

| Lựa chọn | Bước tiếp theo và điều kiện ghi dữ liệu |
| --- | --- |
| Thử bản 15 phút | Cú hiện đúng **một việc nhỏ** lấy từ mục tiêu/đầu ra của bài hiện có, gợi ý khung 15 phút và một cách kiểm kết quả ngắn. Người dùng chọn bắt đầu; cuối 15 phút chọn “Đã làm” hoặc “Cần thêm thời gian”, có thể check-in chữ/ảnh như luồng hiện có. Ghi hoàn thành bản rút gọn; không tự coi toàn bộ bài gốc đã xong nếu chỉ làm một phần. |
| Chuyển sang ngày đệm | Tìm ngày đệm sớm nhất sau hôm nay trong lịch hiện hành, còn chỗ và không đụng phiên chung. Hiện ngày/giờ cũ → mới cho người dùng xác nhận; nếu không có ngày đệm, gợi ý bản 15 phút hoặc cho tự chọn ngày. Không tự dời. |
| Nội dung quá sức | Cú dẫn tới **Điều chỉnh kế hoạch** với bốn nguyện vọng: **Bớt số buổi** (chọn số buổi bớt trong phần còn lại), **Làm nhẹ một buổi** (chọn bài, rút xuống một ví dụ nhỏ và đầu ra ngắn), **Tập trung phần quan trọng** (chọn chủ đề ưu tiên, giữ bài nền tảng và bớt bài còn lại), hoặc **Giảm tải lịch tuần**. Agent chỉ tính lại **các buổi chưa học**, giữ bài đã hoàn thành và phiên chung đã chốt; hiện bản trước/sau để người học xác nhận. Nếu không còn buổi có thể bớt, giải thích rõ để người học chọn cách khác. |

**Gợi ý giờ khi đổi lịch:** từ các giờ học đã được người đó chủ động xác nhận gần đây, lấy khung hay chọn và chọn giờ trống gần nhất sau thời điểm hiện tại. Nếu lịch sử chưa đủ hoặc không có khung trống, dùng giờ rảnh trong plan và nói “Bạn muốn chọn giờ nào?”. Cú hỏi “{ngày} lúc {giờ} được không?” với **Chốt giờ** / **Đổi giờ**. Giờ gợi ý chỉ là bản nháp, không gửi sang bạn học trước khi xác nhận.

### C3. Lùi lịch hoặc nghỉ từ 2 buổi liên tiếp

**Kích hoạt:** hai buổi cá nhân liên tiếp đã đến hạn mà vẫn chưa xong, hoặc cùng một chuỗi có hai lần dời; đếm theo bài thật, không tính hai lần mở app của cùng một buổi. Reset chuỗi sau khi hoàn thành một buổi; loại ngày đã đóng băng và lỗi check-in ra khỏi phép đếm.

**Lời Cú:** “Tuần này lịch căng quá nhỉ. Mình làm nhẹ đi để bạn tiếp tục nhé.” Nút **Bản 15 phút ngay** / **Tạm đóng băng tuần này**.

**Bản 15 phút:** đi vào C2, chọn một bài cần nhất. **Đóng băng:** hiện xác nhận ngắn với mốc đến hết Chủ nhật theo múi giờ người học, số buổi cá nhân được tạm dừng và các buổi chung còn hẹn. Sau khi xác nhận, tạm ngừng nhắc bài cá nhân và không tính các buổi trong khoảng đóng băng là lỡ; lên phương án các bài chưa học cho tuần sau. Buổi chung đã chốt **không tự hủy**: hỏi người dùng giữ hay đề nghị hẹn lại, rồi mới báo bạn học.

**Tin cho bạn ghép cặp:** “{A} đang tạm nghỉ check-in tuần này. Hai bạn có thể hẹn lại khi A sẵn sàng.” Không gửi lý do, không nói A lười/bỏ học. Thẻ ở phía B cho **Gửi lời động viên** hoặc mở lịch nếu có buổi chung cần xử lý. Hết tuần chỉ mời A xem và xác nhận plan mới; không tự mở lại hàng loạt thông báo nợ.

### C4. Sắp vào phòng học chung

**Kích hoạt:** 15 phút trước giờ bắt đầu của phiên đã chốt, đến khi người học vào phòng hoặc buổi kết thúc. Thẻ nằm **đầu hero**, cao hơn mọi tình huống khác. Nếu trang đang ở tab Hành trình thì chuyển sang Hôm nay một lần và dừng tự chuyển tab trong lúc thẻ còn hiệu lực.

**Lời Cú:** “Buổi với {B} bắt đầu lúc {giờ}. Bạn tham gia thế nào?” Nút **Sẽ vào đúng giờ** / **Trễ 10 phút** / **Không kịp**. Nút mở phòng vẫn có trên thẻ khi đến giờ.

**Khi bấm:** lưu lựa chọn trên phiên và gửi thông báo trung tính cho B: “{A} sẽ vào đúng giờ”, “{A} báo sẽ vào sau khoảng 10 phút”, hoặc “{A} chưa tham gia được; bạn muốn tự học trước hay hẹn lại?”. Trễ 10 phút chỉ là ETA, không tự sửa timeline của hai người. “Không kịp” mở bước chọn hẹn lại/tự học; không âm thầm hủy phiên chung. Nếu không bấm, cơ chế T+5 nhắc riêng và T+10 hỗ trợ người chờ của phòng học vẫn hoạt động.

### C5. Không gặp nhau trong buổi học chung: cứu cả hai phía

**Kích hoạt:** từ trạng thái phiên và dấu vào phòng thật. T+5 nếu một người chưa vào thì hỏi riêng, chưa gắn nhãn hay kết luận lý do. Khi phiên được xác nhận không diễn ra theo quy tắc phòng học (hiện là T+15), tạo một sự kiện cho mỗi người. Nếu đã báo “Không kịp”, dùng thông điệp tương ứng, không coi là biến mất không lý do.

**Phía B đang chờ:** Cú nói ngay “Có thể {A} gặp việc đột xuất và chưa kịp báo. Bạn không cần chờ mãi; mình vẫn có thể giúp bạn học phần ngắn hôm nay.” Nút **Tự học 25 phút** / **Hẹn lại**. Cú hỏi tùy chọn “Bạn muốn gửi {A} một lời hỏi thăm không?” với câu mẫu sửa được, chỉ gửi khi B bấm **Gửi**. Không nói A đã gửi lời giải thích khi A chưa nói.

**Phía A khi mở app lần sau:** thẻ đầu hero “Hôm trước hai bạn chưa học cùng được. Bạn có bận đột xuất hay quên lịch với {B} không?” với **Có việc đột xuất** / **Quên lịch** / **Lý do khác**; ô lý do ngắn là tùy chọn, có thể **Bỏ qua**. Cú phản hồi “Cảm ơn bạn đã quay lại. Mình cùng chọn một bước để tiếp tục với {B} nhé.” rồi hiện **Hẹn lại** / **Gửi lời nhắn cho B**. Nếu B đã chủ động gửi lời hỏi thăm, A thấy “{B} gửi lời hỏi thăm bạn” ở thẻ và trong chat riêng với Cú dưới dạng “Cú chuyển lời từ {B}: …”. Lý do A đã nhập chỉ A thấy; tin gửi B là bản ngắn trung tính, A đọc/sửa và xác nhận trước khi gửi.

**Khi B nhận phản hồi:** Cú chuyển lời đã được A duyệt, ghi “Lời nhắn từ {A}”, cho B chọn hẹn lại hoặc trả lời. Tin do Cú chuyển cần có người gửi thật và mã sự kiện; không giả vờ là tin chat trực tiếp của người đó. Nếu không ai muốn nhắn, thẻ có thể đóng; không ép giải thích hay xin lỗi. Buổi không diễn ra không cộng thành tích học chung; việc B tự học được tính theo kết quả học cá nhân nếu có check-in.

### C6. Hai người lệch nhịp

**Công thức hiện có:** mỗi người = phút ước tính đã hoàn thành / phút ước tính đến hạn; chênh lệch = trị tuyệt đối của hai nhịp. Code hiện so chênh lệch một ngày với 0,3, chưa có điều kiện kéo dài. Việc chưa đặt giờ chưa vào mẫu số; nếu chưa có việc đến hạn thì không kết luận người nào chậm.

**Điều kiện đề xuất cho luồng mới:** lưu nhịp theo ngày cho cả hai; dùng giá trị trong khoảng 0–1 để xét can thiệp, chỉ xét ngày cả hai có việc đến hạn và dữ liệu check-in đã chốt. Kích hoạt khi chênh lệch > 0,3 trong **3 ngày hợp lệ liên tiếp**; tính trung bình 7 ngày và xu hướng để chọn nội dung, không dùng một lần đo làm cảnh báo. Trước buổi chung, xét thêm phần mỗi người cần hoàn thành tới “điểm hẹn” đó; nếu chưa đủ dữ liệu thì chỉ gợi ý chuẩn bị buổi chung, không gắn nhãn chậm. Mỗi cặp tối đa một lần can thiệp lệch nhịp/ngày; khi cả hai đều dưới 0,7, ưu tiên lời mời giảm tải chung thay vì chỉ ra một người.

**Người đang khó theo kịp:** Cú hỏi riêng “Dạo này lịch của bạn có hơi nhiều không? Mình có thể làm nhẹ tuần này.” Nút **Xem lịch nhẹ hơn** / **Thử bản 15 phút**. Xem trước thay đổi chỉ với buổi chưa học, rồi xác nhận. Không công khai số nhịp hay lý do riêng cho bạn học.

**Người đang đi trước:** Cú nói “{B} có thể cần thêm thời gian cho phần sắp học chung. Bạn muốn gửi một lời động viên hoặc xem phần nào hai bạn có thể học cùng không?” Nút **Gửi lời động viên** / **Gợi ý buổi chung** / **Xem plan của B**. Chỉ xem phần plan đã được cặp chia sẻ, có thể góp ý nội dung nên tập trung, không sửa plan của B. Gợi ý buổi chung lấy giờ cả hai cùng rảnh, đề xuất một mục tiêu vừa sức; B phải nhận lời, hai người chốt timeline. Không dùng “B chậm hơn bạn 30%” hay gửi kết quả nhạy cảm.

## 4. Luồng thực thi tối thiểu

| Việc | Đã có trong code | Cần bổ sung để chạy thật |
| --- | --- | --- |
| Nguồn kế hoạch và buổi chung | Plan hiện hành, ngày đệm, sửa lịch, bản xem trước giảm tải; phiên có lời mời, xác nhận timeline, ETA và trạng thái vào phòng. | Nối các trạng thái này vào một danh sách tình huống cho từng người. |
| Theo dõi tiến độ | Số đo nhịp/ngày của cặp, check-in, thông báo trong app, lời coach cơ bản. | Bộ đếm lỡ/dời theo bài, ba ngày lệch nhịp, phần cần xong trước buổi chung, lý do tùy chọn, trạng thái đã xử lý. |
| Giao diện | Hero thẻ tình huống đang là bản xem trước với dữ liệu giả; trang Tổng quan khác có vài thẻ demo; chat Cú đã có. | Cấp dữ liệu thật cho hero hiện có, giữ kiểu thẻ; bỏ chữ “AI coach” ở chat và giảm màu nền; không dùng các nút demo để giả lập cập nhật kế hoạch thật. |
| Hành động | API sửa giờ, tạo đề xuất giảm tải, lời mời/phiên học và thông báo đã có một phần. | Thao tác bản 15 phút, ngày đệm, đóng băng, lời nhắn hỏi thăm hai chiều và chấp nhận thay đổi có kiểm tra phiên bản plan. |

**Đầu vào của bộ chọn tình huống:** user, cặp đang chọn, plan hiện hành của cả hai, check-in đã chốt, phiên học chung, số đo nhịp theo ngày, giờ server. **Đầu ra:** mã tình huống, ID bài/phiên, người nhận, thứ tự ưu tiên, câu mẫu, nút hợp lệ, hạn hiển thị và trạng thái. Backend quyết định; frontend chỉ hiển thị và gọi hành động. Một API đọc danh sách tình huống có thể dùng chung cho hero và chat Cú; thao tác ghi dùng API hiện có khi phù hợp, bổ sung endpoint nhỏ cho chức năng chưa có. Sau mọi thao tác, backend kiểm tra lại trạng thái và phiên bản plan, ghi một lần, trả dữ liệu mới để thẻ biến mất hoặc đổi bước.

**Nhật ký tối thiểu:** case_id duy nhất, user_id, pair_id, plan_item_id/meeting_id, loại, thời điểm kích hoạt, trạng thái chờ/đã xem/đã xử lý, hành động, thời điểm gửi bạn học; với lý do cá nhân lưu riêng, không để trong payload thông báo cho B. Không tạo tin chat Cú mới mỗi lần polling hoặc refresh.

## 5. Trình tự triển khai

1. **Khung chung:** nối dữ liệu thật vào thẻ hero hiện có; có sắp ưu tiên, xử lý một lần và đồng bộ với chat Cú/chuông. Giữ hero cũ, bỏ “AI coach” trong chat, giảm màu chat. Đây là điều kiện để các case không thành bản demo rời rạc.
2. **Việc sắp tới:** C1 và C4. Dùng các API chọn giờ, xác nhận timeline và báo ETA sẵn có; hoàn tất luồng từ bấm thẻ đến bạn học nhận thông báo.
3. **Cứu buổi cá nhân:** C2 rồi C3. Làm bản 15 phút và ngày đệm trước; tiếp theo mới thêm giảm độ khó, giảm số buổi và đóng băng tuần. Mọi thay đổi plan có màn xem trước/xác nhận.
4. **Giữ cặp sau buổi lỡ:** C5. Dùng trạng thái phiên thật, hiển thị lời Cú cho hai phía, cho hỏi thăm và chuyển lời có xác nhận.
5. **Lệch nhịp:** C6 sau khi có lịch sử đo hợp lệ ba ngày và phần tới điểm hẹn. Không bật can thiệp chỉ từ ngưỡng một ngày hiện tại.

Mỗi bước dùng câu mẫu cố định trước, chỉ gọi LLM ở chat Cú khi người dùng chủ động hỏi và cấu hình/chi phí cho phép. Không cần sinh riêng một câu AI cho mỗi card, không truyền lịch sử chat hai người vào bộ chọn tình huống. Khi AI lỗi, các nút và lời mẫu vẫn dùng được.

## 6. Tiêu chí nghiệm thu

| ID | Tình huống | Kết quả cần thấy |
| --- | --- | --- |
| T1 | Mai có buổi chưa chọn giờ / học chung chưa chốt / B vừa đề xuất | Một thẻ gọn và một tin Cú tương ứng; bấm tới đúng bài/phiên; khi chốt xong mọi nơi cập nhật, refresh không gửi lại. |
| T2 | Bài cá nhân quá giờ hôm nay hoặc còn từ hôm qua | Ba lựa chọn đúng; bản 15 phút có một việc và cách kiểm kết quả; ngày đệm và giờ gợi ý đều chờ xác nhận trước khi đổi plan. |
| T3 | Hai buổi liên tiếp lỡ/dời | Chỉ một thẻ hỏi thăm; đóng băng tuần ngừng nhắc bài cá nhân, B nhận tin trung tính, phiên chung đã chốt không tự bị hủy. |
| T4 | T−15 phiên chung | Thẻ ở đầu hero, hero không tự chuyển tab; ba lựa chọn cập nhật trạng thái và thông báo B đúng một lần. |
| T5 | Một người không đến phiên chung | B được trấn an và có thể tự học/hẹn lại; A lần sau được hỏi không phán xét; lời hỏi thăm hai chiều chỉ gửi khi người gửi đồng ý, lý do riêng không lộ. |
| T6 | Chênh lệch nhịp một ngày / ba ngày | Một ngày không can thiệp; ba ngày hợp lệ mới hiện thẻ riêng cho từng người; không hiển thị số nhịp cá nhân của B cho A. |
| T7 | Mở lại app, hai thiết bị, dữ liệu đổi giữa lúc bấm | Không nhân bản thẻ/tin hay ghi hai lần; hành động cũ được làm mới thay vì âm thầm sửa plan. |

## 7. Giới hạn và điểm cần giữ nhất quán

- Tin Cú không đoán cảm xúc hoặc hoàn cảnh; chỉ hỏi “có phải lịch bận không?” và để người dùng chọn/bỏ qua. Không công khai lý do cá nhân.
- Không tự hoàn thành bài gốc chỉ vì làm bản 15 phút; không tự đổi ngày/giờ, đóng băng, hủy buổi chung hay nhắn thay người học khi chưa được xác nhận.
- Việc chat Cú giúp theo plan vẫn hoạt động; bỏ nhãn kỹ thuật “AI coach” trên UI, không bỏ Cú hoặc các luồng chat hiện có.
- Spec điều phối bên phòng học tiếp tục nằm trong FEATURE_SPEC_SESSION_FACILITATION.md. Tài liệu này quyết định **khi nào Cú xuất hiện trước/sau phiên** và cách hai người quay lại học tiếp; không thay logic quiz/timeline đang chạy trong phòng.
