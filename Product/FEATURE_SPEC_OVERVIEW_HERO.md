# Feature spec — Hero “Hành trình & Hôm nay”

> **Bản UI hiện tại:** Hero và bảng `?dev=1` đã được dựng bằng dữ liệu giả lập ở trang Tổng quan. Các nút trong Hero chỉ thay đổi bản xem trước trên trình duyệt; chưa kết nối các chỉ số, mục tiêu và tình huống với dữ liệu cặp ghép thật. Phần view-model/API ở mục 6 là yêu cầu cho giai đoạn tích hợp sau.

> **Trạng thái:** Đã triển khai bản xem trước giao diện bằng dữ liệu giả lập; tích hợp dữ liệu thật là bước tiếp theo.  
> **Vị trí:** Đầu trang **Tổng quan** của PeerBridge.  
> **Tham chiếu:** Bốn ảnh giao diện và ảnh bảng “Giả lập tình huống” do PO cung cấp ngày 17/10/2026.

## 1. Mục tiêu

Khi mở Tổng quan, người học thấy ngay việc cần chốt hôm nay và hành trình học đã có cùng bạn đồng hành. Hero có hai tab **Hành trình đã qua** và **Hôm nay** trong cùng một vùng giao diện. Việc học riêng của mỗi người vẫn được tôn trọng; buổi học chung là điểm hai hành trình gặp nhau.

Hero ưu tiên hành động có thật: không tạo checkbox chỉ để trang trí, không hiển thị số liệu chưa tính được, không ghi công một buổi chung nếu chỉ một người tham gia. Nội dung và hành động trong hero dùng lại các luồng Plan, Học cùng, Check-in và đánh giá đang có.

## 2. Bố cục chung

- Nền gradient xanh đậm sang tím như ảnh tham khảo, góc bo lớn, chữ sáng và điểm nhấn vàng. Hero là một khối nổi bật, không thêm panel phụ bên ngoài.
- Hàng đầu có hai tab dạng segmented control ở trái, một vạch mảnh chỉ thời gian chuyển tab ở giữa và trạng thái ngắn ở phải. Khi tự chuyển bị tạm dừng, hiện “Đang tạm dừng”.
- Desktop: nội dung chính hai cột. Dưới 820 px: xếp một cột; dưới 600 px: giảm kích thước số và khoảng cách, giữ nút đủ lớn để chạm. Tiêu đề vừa đủ đọc, không chiếm phần lớn chiều cao.
- Tab **Hôm nay** được mở đầu tiên nếu có việc cần chốt. Nếu không có việc, mở **Hành trình đã qua**. Người dùng luôn có thể đổi tab bằng chuột, chạm hoặc bàn phím.
- Không đặt tên email lên hero; dùng tên hiển thị hoặc “Bạn học”. Không thêm lời chú thích dài khi số liệu hoặc thao tác đã tự giải thích được.

## 3. Tab “Hôm nay”

### 3.1 Danh sách mục tiêu trong ngày

Cột trái của ảnh tham khảo là một card chia hai làn **Bạn** và **[Tên bạn học]**. Mỗi làn lấy các buổi/bài trong kế hoạch thuộc ngày hiện tại, hiển thị tên ngắn, trạng thái hoàn thành và thanh tiến độ `đã hoàn thành / tổng buổi trong ngày`.

- Người dùng có thể bấm mục của mình để thực hiện hoặc xác nhận hoàn thành bằng luồng Plan hiện có. Nếu việc hoàn thành cần check-in hoặc xác nhận khác, mở đúng luồng đó; không đánh dấu hoàn thành chỉ bằng thay đổi giao diện.
- Mục của bạn học chỉ đọc. Không cho người dùng tick hộ hoặc thấy dữ liệu riêng ngoài phần tiến độ đã được chia sẻ của cặp.
- Với danh sách dài, ưu tiên tối đa ba mục gần nhất cho mỗi làn và một liên kết gọn “Xem lịch” tới Plan. Card không kéo dài vô hạn để đẩy các việc cần chốt khỏi màn hình.
- Khi không có kế hoạch hoặc không có bài hôm nay, hiển thị trạng thái ngắn, đúng thực tế. Không tính mục chưa chốt giờ là đã hoàn thành.

### 3.2 Các việc cần chốt

Cột phải hiển thị tối đa **3 card** đang cần người dùng quyết định. Card thứ tư trở đi được báo bằng dòng “+N việc khác sẽ hiện khi bạn chốt xong”; khi một card được xử lý thành công, card kế tiếp lấp chỗ. Khi hết việc, hiện “Bạn đã chốt xong mọi việc hôm nay”; thông tin huy hiệu, nếu có, nằm dưới trạng thái này. Tiêu đề “Hôm nay còn N việc cần bạn chốt” đếm **case có hành động**, không đếm card thông tin về huy hiệu. Một card gộp nhiều bài chưa chọn giờ vẫn tính là một việc cần chốt; trong card ghi số bài cụ thể.

Quy tắc xếp: `priority` nhỏ hơn đứng trước; cùng mức thì thời điểm cần phản hồi sớm hơn đứng trước; vẫn bằng nhau thì theo `id` để thứ tự ổn định. Card khẩn có viền nhấn nhẹ. Sau khi bấm, chờ API xác nhận rồi cập nhật danh sách; nếu lỗi thì giữ card và báo toast, không tạo cảm giác đã xử lý thành công.

| Case | Điều kiện xuất hiện | Nội dung và thao tác chính | Mức |
| --- | --- | --- | ---: |
| Đánh giá buổi trước | Có buổi chung đã diễn ra, người dùng chưa đánh giá | Tên/mục tiêu buổi; `Ổn`, `Ngắn hơn`, `Dễ hơn`. Chốt qua đánh giá của phiên. | 1 |
| Xác nhận đổi giờ chung | Bạn học đề xuất giờ khác và đang chờ mình | Giờ cũ → giờ mới; `Đồng ý`, `Giữ giờ cũ`, `Đề xuất giờ khác`. Chỉ cập nhật lịch khi hai bên xác nhận. | 1 |
| Chốt mục tiêu buổi chung | Có lịch chung sắp tới nhưng chưa có phiên/mục tiêu và timeline được hai bên chốt | Mở chi tiết buổi học trong luồng **Học cùng**. Mục tiêu nháp chưa được coi là đã chốt. | 2 |
| Chọn giờ tự học | Một hoặc nhiều bài trong hôm nay/ngày sắp tới đã có ngày nhưng chưa có giờ | Một card gộp, tối đa hai dòng đầu; từng dòng có `Chọn giờ`, phần còn lại mở trong Plan. | 2 |
| Bạn học báo vào muộn | Có phiên đang chờ, bạn học đã báo ETA hoặc chưa vào tới mốc nhắc | Nêu ETA nếu đã được báo; gợi ý `Đợi bạn` hoặc `Học trước`. Không dùng nhãn trách móc hay suy đoán lý do. | 2 |
| Check-in hôm nay | Hôm nay chưa có check-in hợp lệ và có hoạt động cần ghi nhận | `Check-in` mở luồng chụp ảnh hiện có. | 3 |
| Câu khẳng định | Có nhiệm vụ nói trong ngày và luồng nói đã sẵn sàng | Mở đúng màn nói; chưa có luồng hoạt động thì không sinh case. | 3 |
| Gần đạt huy hiệu | Còn ít buổi học chung hợp lệ để đạt mốc kế tiếp | Card thông tin; không có nút giả hoặc tính vào N việc cần chốt. Chỉ dùng để lấp slot còn trống. | 4 |

Mỗi case có khóa ổn định theo `case id + đối tượng` (ví dụ `rate_yesterday:meeting_id`) để tránh hiện trùng. Với nhiều phiên cùng loại, sinh từng việc cần phản hồi, trừ **Chọn giờ tự học** được gộp thành một card. Không tạo case từ dữ liệu demo trong môi trường người dùng.

### 3.3 Trạng thái sau thao tác

- Xử lý một case chỉ làm biến mất case đó nếu điều kiện `isActive` không còn đúng sau khi cập nhật dữ liệu. Case mới xuất hiện trong slot trống, không đổi thứ tự các card còn lại tùy tiện.
- Nếu người dùng vừa thực hiện thao tác ở màn khác, Tổng quan tải lại khi quay về và phản ánh kết quả. Không cần thông báo trùng với nội dung vừa thấy trong chat.
- Khi bạn học báo không vào được, card dùng lời trung tính và mở lựa chọn tiếp tục phần riêng hoặc hẹn lại theo trạng thái phiên. Việc tự học không được tính là hoàn thành buổi chung.

## 4. Tab “Hành trình đã qua”

Bố cục theo ảnh: bên trái là câu chuyện ngắn về cặp, avatar hai người và chồng tối đa ba ảnh/kỷ niệm mới nhất; bên phải là card số liệu và timeline. Nút **Chia sẻ hành trình** nằm cuối card; bản chia sẻ chỉ chứa thông tin người dùng được phép công khai.

### 4.1 Số liệu và ảnh

- **Ngày cùng giữ nhịp:** số ngày lịch mà cả hai đã đạt điều kiện học của ngày theo quy tắc Tracking; không đồng nhất với số buổi chung. Một ngày chỉ tính một lần.
- **Giờ học chung:** tổng thời gian của các phiên đã kết thúc hợp lệ với cả hai đã vào, lấy thời lượng được ghi nhận, không cộng thời gian hẹn của buổi hủy hoặc chỉ một người vào.
- **Hình đã check-in:** số check-in ảnh hợp lệ của chính người dùng. Ảnh chồng hiển thị ảnh của người dùng và ảnh bạn học đã được chia sẻ theo quyền xem hiện hành; ảnh của cặp cũ chỉ hiện nếu quyền lưu/xem kỷ niệm cho phép. Thiếu ảnh thì dùng khung thay thế, không lặp ảnh để đủ ba tấm.
- **Tiến độ mục tiêu:** hai tỷ lệ từ kế hoạch tương ứng, ghi rõ “Bạn” và tên bạn học. Không hiển thị `0%` khi chưa có dữ liệu; dùng `—` hoặc ẩn số của người chưa có kế hoạch.
- **Huy hiệu kế tiếp:** lấy ngưỡng từ cấu hình huy hiệu và số buổi chung hợp lệ. Nói rõ còn bao nhiêu buổi; khi đã đạt, hiện huy hiệu đã nhận thay cho số âm hoặc tiến độ giả.

### 4.2 Timeline hai làn

Làn trên là bạn học, làn dưới là người dùng; các mốc riêng nối tới chấm chung tại **buổi học chung đã diễn ra**. Mỗi mốc có ngày và tên ngắn; chạm/focus để xem chi tiết. Tối đa vài mốc gần nhất trong hero, có thể xem lịch sử đầy đủ ở nơi phù hợp sau này. Kỷ niệm như “Bạn đến muộn, bạn học vẫn đợi” chỉ hiện khi dữ liệu xác nhận được hành động, người liên quan cho phép chia sẻ và câu chữ không làm ai xấu hổ.

### 4.3 Ba trạng thái hành trình

1. **Đang có bạn đồng hành:** hiện avatar cặp hiện tại, hai làn và các điểm gặp, số liệu/tỷ lệ của cặp hiện tại cùng tổng tích lũy cá nhân.
2. **Vừa đổi bạn đồng hành:** chương trước mờ hơn và nối sang chương mới. Kỷ niệm và thành quả của chính người dùng vẫn được giữ; tên/ảnh/số liệu của bạn cũ tuân theo quyền riêng tư. Thông điệp tập trung vào hành trình tiếp tục, không nêu lý do kết thúc cặp.
3. **Chờ ghép cặp:** hiện làn và ảnh của người dùng cùng các chương đã có; vị trí bạn đồng hành mới là dấu hỏi nét đứt và câu “Đang tìm bạn đồng hành mới”. Không để trống hero, không giả lập tiến độ của người chưa có.

Một người có thể có nhiều chương theo thời gian. “Chương” gắn với một giai đoạn cặp đã xác định `started_at`/`ended_at`, không suy ra từ tên hiện tại. Số liệu tích lũy cá nhân không bị đặt lại khi đổi bạn; số liệu riêng của cặp mới bắt đầu từ cặp mới.

## 5. Chuyển tab và chuyển động

- Tự chuyển mỗi 9 giây khi người dùng chưa thao tác; vạch mảnh ở đầu hero cho biết thời gian còn lại. Tạm dừng khi hover, focus trong hero hoặc tab trình duyệt bị ẩn. Sau khi người dùng tự chọn tab, giữ tab đó đến khi rời trang.
- Chuyển tab dùng fade và dịch nhẹ; ảnh thay phiên khoảng 3 giây; timeline vẽ nét và mốc xuất hiện lần lượt; số đếm tăng trong khoảng 1,4 giây. Chuyển động không được làm nội dung nhảy vị trí hoặc che nút đang bấm.
- Với `prefers-reduced-motion`, tắt tự chuyển, xoay ảnh và các hiệu ứng đếm/vẽ; hiển thị trạng thái cuối ngay. Không dùng chuyển động để truyền đạt thông tin duy nhất.
- Nếu có card mức 1 cần quyết định, tab **Hôm nay** không tự rời đi trước khi người dùng chủ động chuyển. Các hiệu ứng nhấn khẩn phải nhẹ, không nhấp nháy liên tục.

## 6. Dữ liệu và kiến trúc cần có khi triển khai

Trang Tổng quan hiện có `HomeOverview` với kế hoạch hôm nay, tiến độ hai người và một ảnh check-in gần nhất. Các phần **lịch sử nhiều cặp, danh sách ảnh/kỷ niệm, giờ học chung hợp lệ, huy hiệu và case đổi lịch** chưa đủ dữ liệu trong API hiện tại. Cần bổ sung view-model hero từ dữ liệu thật; không điền số mẫu vào production.

```ts
type HeroState = {
  today: string;
  buddy: { id: number; name: string; avatarUrl?: string } | null;
  journey: {
    status: "paired" | "new_buddy" | "waiting_match";
    chapters: JourneyChapter[];
    daysTogether: number;
    jointMinutes: number;
    myCheckinPhotos: number;
    nextBadge: { name: string; remainingSessions: number; progress: number } | null;
    memories: JourneyMemory[];
    myGoalPercent: number | null;
    buddyGoalPercent: number | null;
  };
  todayGoals: { me: GoalItem[]; buddy: GoalItem[] };
  cases: TodayCaseData[];
};
```

`TodayCaseData` là dữ liệu JSON gồm `id`, `type`, đối tượng liên quan, `dueAt?` và các giá trị cần hiển thị; không chứa hàm hoặc component trong API. Ở frontend, mỗi loại case được đăng ký bằng `{ id, priority, isActive(ctx), component, urgent? }`. `selectCases(allCases, ctx, max=3)` là hàm thuần để lọc, sắp xếp, trả `visible` và `overflowCount`; thành phần giao diện không tự chứa luật ưu tiên. Tất cả chữ hiển thị tập trung trong constants tiếng Việt để dễ sửa copy. Hành động đi qua API/route hiện có; cập nhật lạc quan chỉ khi có cách hoàn tác rõ ràng.

Các phép tính tổng hợp cần thống nhất timezone Việt Nam và quyền xem trước khi trả dữ liệu. Không gọi LLM để chọn slot, tính thành tích hay viết kỷ niệm. Các card là quy tắc xác định được từ trạng thái sản phẩm.

## 7. Chế độ giả lập cho dev

Chỉ hiện khi bật `?dev=1` hoặc cấu hình dev tương đương; tách khỏi hero của người học. Bảng giống ảnh tham khảo có hai nhóm:

- **Giả lập tình huống:** 8 nút bật/tắt độc lập: quên đánh giá buổi hôm qua; bạn học đề xuất đổi giờ; có lịch chung chưa chốt mục tiêu; hai buổi tự học chưa chốt giờ; bạn học báo đến muộn/không tham gia; chưa check-in ảnh hôm nay; câu khẳng định cần nói; sắp đạt huy hiệu.
- **Trạng thái hành trình:** chọn một trong ba trạng thái đang có bạn, vừa đổi bạn (giữ kỷ niệm), hoặc chờ ghép cặp.

Bật/tắt case cập nhật slot ngay để PO kiểm tra ưu tiên, tối đa ba card, dòng `+N`, trạng thái rỗng và việc card kế tiếp lấp chỗ. Giả lập dùng fixture tách biệt, không ghi vào Plan, phiên học, check-in hoặc dữ liệu thật.

## 8. Khả dụng và nghiệm thu

- Tab dùng ngữ nghĩa `tablist/tab/tabpanel`, có thể điều khiển bằng bàn phím; nút và mốc timeline có tên đọc được. Vùng cập nhật card thông báo ngắn qua `aria-live="polite"`. Chữ trên nền gradient và card đạt tương phản WCAG AA.
- Mọi hành động của card dẫn tới đúng luồng hoặc thực hiện mutation thật; lỗi API giữ card và báo toast. Bạn học không thể sửa mục của người dùng và ngược lại.
- Tám tình huống dev xếp đúng ưu tiên/tie-break, tối đa ba slot; nhóm chọn giờ vẫn là một card; card huy hiệu không làm tăng số việc cần chốt. Hết case có empty state.
- Ba trạng thái hành trình luôn có nội dung; đổi bạn giữ phần lịch sử được phép hiển thị, không đặt lại thành tích cá nhân và không lộ dữ liệu cặp cũ ngoài quyền xem.
- Không tính buổi chung chưa đủ hai người vào vào giờ học chung hoặc huy hiệu. Thiếu dữ liệu dùng `—`/trạng thái rỗng đúng nghĩa.
- Auto chuyển dừng khi hover/focus/ẩn tab hoặc khi có việc khẩn; sau khi bấm tab thủ công thì dừng. Chế độ giảm chuyển động không có auto chuyển hay hiệu ứng.
- Bố cục không tràn ngang ở 820 px và 600 px; card không làm trang nhảy khi slot thay đổi.

## 9. Phạm vi

Tài liệu này mô tả hero và điểm vào các luồng hiện có. Form chọn giờ, form tạo phiên, camera check-in và màn câu khẳng định nằm ở tính năng tương ứng. Trường hợp chưa có API hoặc luồng hoạt động phải được ẩn có chủ đích, không thay bằng dữ liệu mẫu trong trang thật.
