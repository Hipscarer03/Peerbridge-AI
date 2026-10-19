# Feature Spec: Chuẩn hóa nội dung học thành concept nội bộ

> **Phiên bản:** v1.1 – 15/10/2026  
> **Trạng thái:** Định hướng sản phẩm + ghi nhận hiện trạng kỹ thuật. Phần “mong muốn sản phẩm” chưa được coi là đã triển khai nếu không nằm trong mục 3.

## 1. Mục tiêu

Người học thường mô tả cùng một nội dung bằng từ khác nhau: tên môn, tên kỹ năng, thuật ngữ tiếng Anh/Việt hoặc cách nói đời thường. Hệ thống cần nhận ra các cách gọi thực sự cùng nghĩa và nối chúng vào một đơn vị kiến thức nội bộ để hỗ trợ matching, lập plan và tracking.

Concept là chi tiết triển khai của hệ thống. Người dùng không cần biết khái niệm này và không phải chọn từ một kho concept.

## 2. Nguyên tắc sản phẩm

1. **Người dùng nhập bằng ngôn ngữ tự nhiên.** Họ có thể nói muốn học gì, đang học gì hoặc có thể hỗ trợ gì; không cần biết taxonomy.
2. **Không đưa từ “concept” lên UI.** Không hiển thị ID, tên chuẩn nội bộ, điểm tự tin, danh sách candidate kỹ thuật hoặc bắt người dùng chọn một mục từ catalog.
3. **Gom từ đồng nghĩa, không gom mọi thứ có liên quan.** “Business analysis” và “phân tích nghiệp vụ” có thể là hai cách gọi cùng nội dung nếu catalog xác nhận. “Business analysis” và “SQL” có liên quan trong một công việc nhưng không phải cùng một concept.
4. **Không ép ánh xạ.** Nếu câu mô tả mơ hồ hoặc có nhiều nghĩa, giữ nguyên văn bản và hỏi làm rõ bằng câu dễ hiểu. Mục tiêu cụ thể ngoài catalog có thể tạo lộ trình riêng cho plan; không gán nhầm vào mục đã duyệt.
5. **Nội dung và thứ tự phải có căn cứ.** Một quan hệ prerequisite biểu thị kiến thức cần trước, không phải chỉ là hai bài thường học gần nhau.
6. **Dữ liệu nội bộ đa lĩnh vực.** Catalog không được thiết kế quanh SQL hoặc một môn duy nhất; domain mới bổ sung theo taxonomy có kiểm định.

## 3. Hành vi sản phẩm mong muốn

### 3.1 Nhận mô tả

- Đầu vào có thể là mục tiêu tự do, nhu cầu học, năng lực có thể hỗ trợ hoặc nội dung trong check-in.
- Giữ nguyên câu chữ người dùng để hiển thị lại và làm căn cứ truy vết. Có thể tách nhiều chủ đề nếu người dùng nêu nhiều kỹ năng độc lập.
- Phân biệt vai trò: muốn học/cần hỗ trợ (`need`), đã biết/có thể hướng dẫn (`offer`) và đang cùng học (`learning`) khi nguồn dữ liệu cung cấp được ý định đó.

### 3.2 Ánh xạ nội bộ

- Chuẩn hóa chính tả, dấu tiếng Việt, viết tắt, biến thể ngôn ngữ và alias; sau đó tìm ứng viên trong đúng domain có cơ sở.
- Bộ phân loại ngữ nghĩa/AI là mục tiêu để hiểu paraphrase và quan hệ đồng nghĩa ngoài những alias được khai báo. Ánh xạ vào catalog chỉ dùng ID đã kiểm định. Plan cá nhân được phép tạo ID bản nháp riêng khi mục tiêu mới không khớp catalog; ID này không trở thành mục chung.
- Nếu độ chắc chắn không đủ hoặc domain còn mơ hồ, trạng thái là “chưa ánh xạ” nội bộ và hệ thống hỏi lại theo cách tự nhiên. Câu hỏi không nhắc đến concept, ID hay catalog.
- Người dùng không bị buộc xác nhận tên khái niệm. Khi cần xác nhận, chỉ hỏi họ có đang nói về nội dung được diễn giải bằng ngôn ngữ phổ thông hay không; luôn có lựa chọn giữ câu gốc/khác.

### 3.3 Dùng kết quả

- **Matching:** so nhu cầu và khả năng hỗ trợ trên cùng ID ổn định; giữ tách biệt với cùng mục tiêu hoặc cùng cam kết học.
- **Planning:** dùng domain, kiến thức prerequisite và lesson sequence đã duyệt để tạo lộ trình. Concept không tự quyết định ngày/giờ học.
- **Tracking/check-in:** có thể dùng ID để đối chiếu nội dung check-in với buổi trong plan, nhưng không tự đánh dấu hoàn thành chỉ vì nhận ra cùng chủ đề; áp dụng xác nhận của luồng check-in.
- Nếu không có ánh xạ hợp lệ, mục tiêu/check-in vẫn giữ nguyên văn bản. Riêng Plan cá nhân có thể lập lộ trình riêng từ mục tiêu cụ thể và cho phép người học sửa các buổi.

## 4. Catalog và dữ liệu

Một mục catalog nội bộ cần có:

| Trường | Mục đích |
|---|---|
| `id` | Định danh ổn định, không phụ thuộc ngôn ngữ UI |
| `domain` | Lĩnh vực rộng để giới hạn ánh xạ và kiểm tra tương thích |
| `name` | Tên chuẩn nội bộ; không mặc định hiển thị cho người dùng |
| `description` | Phạm vi/định nghĩa dùng để phân biệt nội dung gần nhau |
| `aliases` | Từ đồng nghĩa, biến thể, viết tắt và cách gọi đã xác nhận |
| `prerequisites` | ID kiến thức thật sự cần học trước, không phải liên hệ chủ đề chung |
| `lessons` | Chuỗi buổi học/đầu ra được tuyển chọn nếu domain có lộ trình |
| `catalog_version` | Phiên bản dữ liệu để truy vết ánh xạ và tái lập kết quả |

Yêu cầu quản lý:

- ID đã được dùng trong hồ sơ hoặc plan không được đổi nghĩa. Sửa nhãn/alias không được làm mất tiến độ người dùng.
- Alias mơ hồ giữa nhiều domain cần domain hoặc ngữ cảnh; không được thêm alias toàn cục tùy tiện.
- Kiểm tra ID trùng, prerequisite thiếu, prerequisite khác domain và chu trình trước khi phát hành catalog.
- Catalog nội dung học và catalog dùng cho Plan phải dùng ID tương thích hoặc có migration tường minh.
- Lưu cụm từ gốc và phiên bản mapping đủ để rà soát lỗi. Không dùng dữ liệu riêng của user làm ví dụ UI hoặc huấn luyện ngoài mục đích đã được cho phép.

## 5. AI và ranh giới tin cậy

AI có thể:

- Tách chủ đề và ý định từ câu tự do.
- Xếp hạng các ID có trong catalog dựa trên ngữ nghĩa, ngữ cảnh và domain.
- Trả về mức chắc chắn, lý do ngắn và câu hỏi làm rõ có ngôn ngữ thân thiện.
- Đề xuất chuỗi buổi học cho mục tiêu mới trong Plan cá nhân khi đã cấu hình provider; backend kiểm tra và lưu thành bản nháp riêng.

AI không được:

- Tạo ID, định nghĩa, bài học hoặc quan hệ prerequisite như thể đã được catalog phê duyệt. ID bản nháp của Plan do backend cấp, lưu riêng theo người dùng và yêu cầu.
- Biến độ gần chủ đề thành quan hệ đồng nghĩa.
- Ghi trực tiếp trạng thái mastery, hoàn thành buổi học hoặc quyền hỗ trợ chỉ từ suy luận.
- Lộ nhãn nội bộ, điểm số model hay chuỗi prompt cho người dùng.

Backend xác thực mọi ID, domain và quan hệ với catalog trước khi lưu hoặc dùng trong downstream. Nếu AI không khả dụng, có thể dùng alias/rule local đã kiểm định hoặc giữ nguyên câu chữ; không trả về ánh xạ giả.

## 6. Hiện trạng kỹ thuật (15/10/2026)

- `backend/data/concepts/catalog.json` hiện có **129 mục thuộc 26 domain**, phiên bản `2026-10-14.3`; catalog onboarding được kiểm tra ID trùng, prerequisite không tồn tại/khác domain và chu trình.
- `LocalConceptRetriever` hiện là bộ truy hồi offline: chuẩn hóa dấu/chữ, khớp tên/ID/alias/cụm từ, rồi dùng điểm lexical đơn giản cho phần còn lại. `infer_domain` dựa vào alias của domain và catalog. Đây chưa phải semantic embedding hoặc LLM, không thể nhận diện paraphrase tổng quát đáng tin cậy.
- Router concept/onboarding và luồng profile-confirm của Data 1 đã có ở backend. Theo wiring hiện tại, form hồ sơ FE lưu qua `/profiles/me`, chưa gọi `/profile` và `/profile/confirm`; do đó không được giả định người dùng app hiện tại đã có concept profile confirmed.
- Matching Data 1 đọc `onboarding_profiles` đã xác nhận và `user_concepts`. Đây là đường riêng với màn tìm bạn hiện tại; matching UI hiện hành chưa dùng concept profile này để chấm điểm.
- Plan có catalog riêng tương thích ID/prerequisite. Plan suy domain và truy nội dung từ mục tiêu bằng rule/catalog. Khi không khớp, Plan cá nhân lưu lộ trình riêng trong `pb_concept_drafts`; dùng AI có cấu hình hoặc lộ trình khởi đầu theo mẫu. Đây chưa phải semantic concept mapper dùng chung cho matching/onboarding.
- Vì vậy, trạng thái sản phẩm là: catalog và nền tảng chuẩn hóa nội bộ đã có một phần; trải nghiệm AI tự gom cách diễn đạt tự do như mong muốn ở mục 3 chưa hoàn chỉnh và chưa được nối xuyên suốt các luồng đang dùng.

## 7. Tiêu chí chấp nhận

| Tình huống | Kết quả |
|---|---|
| Hai cách diễn đạt cùng nghĩa đã được xác nhận trong catalog | Ánh xạ về cùng ID nội bộ và downstream dùng chung ID |
| Hai chủ đề chỉ có liên quan, không đồng nghĩa | Giữ hai ID riêng; chỉ nối prerequisite nếu có căn cứ nội dung |
| Người dùng viết cách gọi tự do ngoài alias | Có thể nhận diện qua semantic mapper đã chốt; nếu chưa chắc thì hỏi làm rõ hoặc giữ nguyên văn bản |
| Có nhiều domain/nghĩa khả dĩ | Không tự chốt sai domain; yêu cầu làm rõ bằng lời dễ hiểu |
| Plan cá nhân không tìm được mục phù hợp | Tạo lộ trình riêng, lưu bản nháp trong database và dùng ID nội bộ tách khỏi catalog chuẩn |
| Catalog được sửa sau khi người dùng đã có plan | ID và tiến độ cũ được bảo toàn; migration/version được ghi nhận |
| AI nhận ra concept trong ảnh/check-in | Chỉ đưa gợi ý theo luồng check-in; không tự hoàn thành buổi học nếu thiếu xác nhận |
| UI hiển thị mục tiêu, matching hoặc plan | Không lộ thuật ngữ “concept”, ID nội bộ hoặc danh sách candidate kỹ thuật |

## 8. Chưa chốt cho giai đoạn tiếp theo

- Chọn semantic model/local embedding/LLM cho ánh xạ paraphrase; đặt ngưỡng tin cậy theo từng domain bằng dữ liệu đánh giá, không tự đặt một ngưỡng dùng chung khi chưa đo.
- Thiết kế câu hỏi làm rõ thân thiện và cách người dùng sửa ánh xạ sai mà không phải duyệt catalog.
- Quy trình curator thêm domain, kiểm tra đồng nghĩa, alias đa ngôn ngữ và prerequisite.
- Thứ tự triển khai tích hợp hồ sơ concept với matching UI hiện tại và luồng profile confirmation.
- Bộ đánh giá: ánh xạ đúng, từ chối đúng khi mơ hồ, tỷ lệ gộp nhầm hai kiến thức khác nhau, độ bao phủ đa lĩnh vực và ảnh hưởng tới matching/plan.
