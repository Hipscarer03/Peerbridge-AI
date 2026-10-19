# Feature Spec: Trò chuyện và điều phối buổi học chung

**Cập nhật:** 17/10/2026. **Phạm vi:** phiên hai người trên màn chat hiện có.

## 1. Vai trò và bố cục

Hai người tiếp tục nhắn trong khung chat riêng. Bubble gửi/nhận và ô nhập giữ nguyên; tin AI không được thêm vào danh sách tin của hai người. Khối **AI hỗ trợ** nằm giữa thanh phiên học và chat, có chiều cao giới hạn và tự cuộn để ô nhập chat luôn ở trong viewport.

Thanh phiên học hiện đồng hồ, mục hiện tại, trạng thái bạn học và timeline. AI chỉ đưa nội dung khi có trigger của phiên hoặc khi người dùng bấm chip gọi AI. Gợi ý riêng không tự gửi sang chat; muốn chia sẻ, người học sửa rồi tự gửi.

## 2. Tình huống điều phối

| Trigger | Nội dung trong AI hỗ trợ | Hành động |
| --- | --- | --- |
| `dau_gio` | Chào và nhắc tối đa ba mục đầu; các mục khác vẫn ở timeline. | Quiz khởi động, phản biện, bắt đầu, báo giờ vào. |
| `tre_gio` | Số phút đã qua, mục đã qua và mục hiện tại. | Tóm tắt 1 phút, quiz bắt kịp 2 câu, đọc chat. |
| `quiz_dau_gio` | Ba câu trắc nghiệm, mỗi lần một câu và giải thích ngay sau khi chọn. | Ba phương án mỗi câu. |
| `nhac_moc` | Nhắc đúng tên mục lúc còn 5 phút; có nhắc cuối lúc còn 1 phút. | Đang kịp, chưa kịp, dời mốc 5 phút. |
| `hoi_ngu_canh` | Tối đa một lần mỗi mục, ở giữa mục hoặc khi chat im lặng 5 phút. | Điền phần đang bàn, tiến độ, mức vướng. |
| `phan_bien` | Ba hướng: kiểm tra giả định, so sánh, tìm bằng chứng. | Chọn một hướng rồi tự giải thích hai câu trước khi nhận góp ý. |
| `het_gio` | Hỏi mức độ phiên và điểm cần cải thiện. | Quá dễ, vừa sức, quá khó; ô ghi chú tùy chọn. |
| `quiz_cuoi_gio` | Bốn câu theo mức dễ/nhớ lại, vừa/hiểu, khó/vận dụng. | Cuối quiz tóm hai điểm đã luyện, một điểm cần ôn và bước cho phiên sau. |

AI không tự suy ra đáp án từ chat, không thêm hoạt động vào plan và không phán xét việc đến muộn. Câu nhắc mốc chỉ phát một lần ở T−5 và một lần ở T−1. Mỗi câu quiz chỉ có một đáp án đúng và hai nhiễu.

## 3. Người vào sau và người chờ

Trước khi vào, người đến sau có thể **Báo vào sau 10 phút**. API lưu ETA và gửi thông báo buổi học cho bạn đang chờ. Người đang chờ thấy ETA trong khối AI qua cập nhật phiên khoảng 2 giây; nếu chưa có phản hồi, UI dùng câu trấn an ở mốc chờ 5 phút và cho chọn tiếp tục tự học hoặc hẹn lại ở mốc 10 phút.

Khi người đến sau vào, timer khớp giờ phiên đã trôi qua, các mục trước được coi là đã qua theo lịch. Họ chọn tóm tắt từ plan/ngữ cảnh/hai tin chat gần nhất, làm quiz 2 câu, hoặc tự đọc chat. Lựa chọn này lưu theo người học và hiện trong khối AI phía bạn đang chờ tối đa 5 phút, để bạn ấy biết người kia đang bắt kịp; không tạo tin chat giả.

Chọn **Dời mốc 5 phút** tăng mục hiện tại 5 phút và giảm mục kế tiếp 5 phút, chỉ khi mục kế tiếp còn ít nhất 10 phút; giờ kết thúc phiên giữ nguyên. API cập nhật timeline dùng chung và người còn lại thấy thay đổi qua cập nhật phiên. Khi có đề xuất timeline khác đang chờ, thao tác này bị chặn.

## 4. Dữ liệu và định dạng AI

Mỗi lần gọi quiz, backend nhận `trigger`, chỉ số câu, `level`, `context`, tối đa 20 tin chat gần nhất và các câu đã hỏi. Backend tự lấy `now`, giờ phiên, mục kế hoạch, mục tiêu và mô tả từ buổi học đã xác thực. Nội dung chat, plan và mô tả được xem là dữ liệu, không phải chỉ dẫn cho model.

Phản hồi có dạng JSON `{trigger, messages, chips, quiz, form, save}`. `quiz` gồm `{question, options[3], correct, why}`; các trường không dùng là `null` hoặc mảng rỗng. UI dùng quiz từ model khi cấu hình AI và ngân sách cho phép; nếu không, dùng câu mẫu bám vào plan và cách học, không giả vờ kiểm tra kiến thức môn học chưa có nguồn.

`context`, `level`, `improve` được lưu riêng cho từng người trong `facilitated_assistant_state`; chỉ trạng thái bắt kịp được hiển thị cho bạn học. Phản hồi AI, tiến độ quiz và lịch sử câu nhắc vẫn nằm trong state của trình duyệt; khi tải lại, UI khôi phục theo thời gian thật và trạng thái đã lưu, còn lịch sử AI cũ không được dựng lại.

## 5. Hiển thị và giới hạn

- Đồng hồ chạy theo giây thật. `?dev=1` mới tua nhanh 60 lần và hiện công cụ mô phỏng.
- Khối AI có chiều cao tối đa 260 px trên desktop, 30% viewport trên màn nhỏ; chat và sidebar cuộn riêng, không kéo dài trang.
- Trạng thái vào sau, chờ và timeline được cập nhật bằng polling 2 giây, chưa dùng push realtime cho điểm danh.
- AI tạo quiz khi có nguồn và khóa API hợp lệ. Các trigger điều phối khác hiện dùng câu mẫu có quy tắc, chưa phải câu trả lời sinh tự do.
- Khi người dùng đổi timeline qua sheet, các hoạt động đang diễn ra/đã qua vẫn khóa và đề xuất cần phản hồi theo cơ chế cũ. Dời mốc 5 phút là thao tác nhanh riêng của phiên đang chạy.

## 6. Tiêu chí nghiệm thu

| ID | Điều cần thấy |
| --- | --- |
| AC01 | Tin chat của hai người giữ style và thứ tự cũ; tin AI chỉ ở khối phía trên. |
| AC02 | Ô nhập chat luôn tới được trong viewport; khối AI tự cuộn khi có quiz/form. |
| AC03 | Báo vào sau hiện ETA cho người chờ; không có phản hồi thì có câu trấn an, không phán xét. |
| AC04 | Người vào sau bắt kịp từ mốc thực tế; hành động bắt kịp hiện cho người kia nhưng không thành tin chat. |
| AC05 | Câu hỏi ngữ cảnh tối đa một lần mỗi mục; nhắc mốc ở T−5 và T−1. |
| AC06 | Quiz hiện một câu mỗi lượt, giải thích trước câu sau; mức khó cuối phiên thay theo phản hồi. |
| AC07 | Dời mốc 5 phút không đổi giờ kết thúc và hiển thị ở cả hai phía. |
## 7. Câu hỏi PO cần chốt

Các câu hỏi từ bản spec trước vẫn được giữ để không biến giả định pilot thành quyết định sản phẩm.

| ID | Câu hỏi | Hướng đang xem xét |
| --- | --- | --- |
| PO01 | Pilot ưu tiên học song song, cùng nội dung hay người hướng dẫn–người học? | Chọn một nhóm pilot rõ ràng để đánh giá. |
| PO02 | T+10 là mốc gợi ý đổi cách học hay giới hạn chờ cứng? | Để người chờ tự quyết, không tự phán xét bạn học. |
| PO03 | Người báo vào muộn có được tự rút ngắn timeline không? | Chỉ gửi đề xuất, hai người cùng quyết. |
| PO04 | Cần tối thiểu bao lâu để tiếp tục một buổi chung có ích? | Thử 15 phút rồi đo kết quả. |
| PO05 | Khi nào buổi chung được tính hoàn thành? | Cần tiêu chí có kết quả và xử lý khi một người không xác nhận. |
| PO06 | Nguồn bài tập/đáp án nào được phép dùng trong pilot? | Nội dung đã duyệt và văn bản được phép chia sẻ. |
| PO07 | Gợi ý AI riêng là mặc định hay cho phép gửi trực tiếp vào chat chung? | Người nhận phải chủ động sửa và gửi. |
| PO08 | Có cho mở lời giải đầy đủ không? | Nếu có, ghi rõ đã dùng hỗ trợ và yêu cầu tự thử lại. |
| PO09 | Nhắc cuộc hẹn ngoài giờ yên lặng như thế nào? | Cần opt-in nếu push. |
| PO10 | Trần chi phí AI, quy mô pilot và latency chấp nhận được? | Tính theo usage thực và giá cấu hình trước pilot. |
| PO11 | Lưu chat, bài làm và gợi ý riêng trong bao lâu? | Chốt thời hạn lưu/xóa trước pilot. |
| PO12 | Muộn lặp lại đến mức nào mới gợi ý đổi hình thức/bạn học? | Hỏi riêng, không tự hủy cặp. |
| PO13 | Đề xuất timeline nên chờ bao nhiêu **giây thật** để hai người đủ thời gian quyết định? | Bản mô phỏng 60 giây giả chỉ khoảng 1 giây thật, chưa phù hợp sử dụng thật. |

