# Quản lý sản phẩm và dự án AI

<!-- page:1 -->
AI Product & Project Management
AICB-P1 · Ngày 6 · Quản lý sản phẩm AI như thế nào?
T ên Giảng Viên
VinUniversity · Phase 1 · T uần 1 · 2026

<!-- page:2 -->
?
HÃ Y SUY NGHĨ...
“Team đã build 3 tuần. Nhưng stakeholder
muốn đổi requirements. Làm sao xử lý?”
Giữ câu hỏi này trong đầu khi học bài hôm nay

<!-- page:3 -->
Nội Dung Bài Học
1. Agile / Scrum cho dự án AI
2. MVP first và MVE
3. Low-code / no-code cho PoC
4. PoC với stakeholder
5. ROI analysis cho AI projects
6. Stakeholder communication
7. Hands-on 6 + pitch deck
8. Assessment cuối buổi

<!-- page:4 -->
Mục Tiêu Ngày 6
■ Hiểu cách quản lý dự án AI trong điều kiện uncertainty cao
■ Biết cách dùng Agile + hypothesis-driven delivery thay vì plan cứng
■ Chọn đúng mức đầu tư giữa MVE, MVP, và PoC
■ Tính được ROI có cơ sở và trình bày được với stakeholder
Cuối buổi này, học viên phải hoàn thiện được: PRD final, ROI model 3–6–12 tháng ,
và pitch deck 5–7 slides.

<!-- page:5 -->
Deliverable Cuối Ngày
PRD final + ROI spreadsheet / model + stakeholder slide deck + 5 phút pitch
rehearsal
■ Dùng lại product đã xác lập ở Day 05
■ ROI phải có kịch bản conservative / realistic / optimistic
■ Pitch deck phải đủ rõ cho stakeholder quyết định go / pilot / no-go

<!-- page:6 -->
Agile Cho AI Projects
AI project management hiệu quả = Agile cộng scientific
method, không phải timeline cứng

<!-- page:7 -->
Vì Sao Agile Gần Như Bắt Buộc Với AI?
■ Chất lượng đầu ra phụ thuộc vào dữ liệu, prompt, tool reliability, và user
behavior nên unknowns nhiều hơn software thường.
■ Nhiều giả định chỉ được kiểm chứng sau khi có prototype hoặc sau vài vòng
eval thực tế.
■ Requirement cho AI thường cần calibration chứ không chỉ implementation.
Lưu ý: Nếu team đối xử với AI project như một backlog feature thông thường,
họ sẽ đánh giá sai effort, sai risk, và sai Definition of Done.

<!-- page:8 -->
AI Sprint Model
Research
Spike Hypothesis Build Eval Iterate
refine scope / prompt / data
Mỗi sprint phải trả lời: đã học được gì , giả định nào bị bác bỏ , và tiếp tục
đầu tư hay dừng ở đâu .

<!-- page:9 -->
Story Point Estimation Cho AI T asks
Loại việc Sai lầm thường gặp Cách ước lượng thực dụng
Prompt / behavior
tuning
coi như task nhỏ cố định thêm buffer cho iteration và
eval
Tool integration chỉ tính phần code tính cả error handling và re-
tries
Data / retrieval work chỉ tính setup ban đầu tính thêm cleaning, coverage,
edge cases
UX / trust calibra-
tion
bỏ quên hoàn toàn dành sprint time cho test với
user thật
Unknowns must be priced in

<!-- page:10 -->
Definition of Done Cho AI Feature
■ Không chỉ là “code chạy”; phải có quality threshold, latency, fallback, và
monitoring signal.
■ Ví dụ: support agent chỉ được xem là done khi citation coverage đủ,
escalation path rõ, và test set đạt ngưỡng.
■ Backlog AI nên nhìn cả feature debt, data debt, và technical debt.

<!-- page:11 -->
MVP First
Validate value trước khi đầu tư lớn vào implementation và
tích hợp

<!-- page:12 -->
MVE, MVP, PoC: Khác Nhau Ở Mục Tiêu
Mức Mục tiêu chính Câu hỏi cần trả lời
MVE test giả định giá trị
nhanh nhất
user có thật sự muốn
thứ này không?
MVP ship phiên bản nhỏ
có thể dùng được
workflow có vận
hành được không?
PoC giảm bất định cho
stakeholder / spon-
sor
có đáng đầu tư thêm
không?
Đừng dùng 3 từ này lẫn lộn. Nếu mục tiêu là học nhanh, hãy ưu tiên MVE. Nếu
mục tiêu là xin phê duyệt tiếp, hãy thiết kế PoC.

<!-- page:13 -->
Wizard of Oz T esting Cho AI
Khi nào nên dùng
■ Chưa chắc user value có thật
■ Chưa cần đầu tư model /
integration lớn
■ Muốn test workflow hoặc
adoption risk sớm
Ví dụ
■ “AI support agent” nhưng backend
thật ra là human draft response
■ “AI sales assistant” nhưng
qualification do BA làm thủ công
phía sau
Lưu ý: Wizard of Oz không phải “giả vờ để lừa user”. Nó là cách kiểm chứng
value và workflow trước khi đầu tư sâu vào hệ thống.

<!-- page:14 -->
Time-box Experiments Và Kỷ Luật Ngân Sách
■ Mỗi thử nghiệm cần có giả định, thời hạn, budget ceiling, và tiêu chí dừng .
■ Ví dụ: “Trong 2 tuần, test internal policy assistant cho 20 câu hỏi lặp lại; nếu
time-to-answer không giảm đáng kể, dừng.”
■ Đầu tư nhỏ nhưng học nhanh tốt hơn đầu tư lớn rồi mới biết không có user
value.

<!-- page:15 -->
Low-code / No-code Cho PoC
Dùng đúng mức để validate ý tưởng nhanh, không thay thế
mọi quyết định sản phẩm

<!-- page:16 -->
Low-code T ools Nằm Ở Đâu Trong Lifecycle?
Assistants API
Phù hợp: PoC nhanh
với tool calls cơ bản
Giới hạn: chưa thay
cho architecture pro-
duction
Dify
Phù hợp: demo work-
flow, RAG, và app UI
nhanh
Giới hạn: không giải
hết bài toán enterprise
phức tạp
LangFlow
Phù hợp: giải thích flow
agent theo cách trực
quan
Giới hạn: không thay
cho product discovery
đầy đủ
Low-code nên được dùng để demo nhanh, kiểm chứng workflow , và hỗ trợ
PoC; không nên thay cho product discovery hay production planning.

<!-- page:17 -->
Khi Nào PM / BA Nên Dùng Low-code?
■ Khi cần stakeholder demo trong thời gian ngắn
■ Khi muốn test workflow fit trước khi team engineer build sâu
■ Khi muốn minh hoạ rõ user journey và điểm gãy của experience
Low-code giúp validate nhanh, nhưng không thay thế việc viết PRD rõ, risk
register rõ, và success metrics rõ.

<!-- page:18 -->
PoC Với Stakeholders
PoC tốt phải giảm bất định, không phải tạo cảm giác
“trông có vẻ thông minh”

<!-- page:19 -->
PoC Canvas
Ô cần chốt Nội dung
Key hypothesis giả định giá trị hoặc feasibility cần
kiểm chứng
Scope 1 workflow hẹp, 1 nhóm user hẹp, 1 bộ
dữ liệu hẹp
Success criteria metric đo được, chốt trước với
stakeholder
Timebox 2–4 tuần, có điểm review rõ
Next decision nếu đạt / không đạt thì làm gì tiếp

<!-- page:20 -->
PoC Goal Không Phải Là Gì?
PoC nên làm
■ giảm bất định chính
■ đo giá trị ban đầu
■ kiểm chứng workflow hẹp
PoC không nên làm
■ ôm toàn bộ scope tương lai
■ hứa production readiness
■ dùng demo đẹp để che
metric yếu

<!-- page:21 -->
ROI Analysis
ROI cho AI phải có số cụ thể, giả định rõ, và timeline rõ

<!-- page:22 -->
Cost Anatomy Và Value Anatomy
Thành phần Cost side Value side
Build dev effort, setup, integra-
tion
launch nhanh hơn, tạo năng
lực mới
Run API cost, compute, stor-
age
throughput cao hơn, bớt việc
tay
Operate human review, monitoring,
maintenance
giữ chất lượng, giảm rủi ro
Business impact — time saved, revenue, cost
avoidance
ROI starts with anatomy, not optimism

<!-- page:23 -->
3-Scenario ROI Model
Conservative
adoption chậm
cost cao hơn
value thấp hơn
Realistic
baseline hợp lý
dựa trên pilot
và benchmark nội bộ
Optimistic
adoption tốt
workflow fit cao
ít friction hơn dự kiến
Stakeholder cần thấy phạm vi kết quả có thể xảy ra, không chỉ một con số đẹp
duy nhất.

<!-- page:24 -->
Break-even Logic
Tháng
Giá trị tích luỹ / Chi phí
Cost
Value
Break-even
point
Dự án đạt break-even ở tháng nào, dưới kịch bản nào, và giả định nào có thể đẩy
mốc này ra xa hơn?

<!-- page:25 -->
Nói ROI Với CFO / Sponsor
■ Tránh nói chung chung như “AI sẽ giúp hiệu quả hơn”.
■ Nói bằng cấu trúc: baseline hôm nay -> giả định thay đổi -> giá trị 3–6–12
tháng -> điều kiện để giá trị xảy ra .
■ Luôn nêu rõ các giả định nhạy cảm nhất: adoption rate, review cost, API
cost, error handling cost.

<!-- page:26 -->
Stakeholder Communication
Cùng một sản phẩm nhưng technical audience và execu-
tive audience cần hai cách trình bày khác nhau

<!-- page:27 -->
T echnical Deck Và Executive Deck Khác Nhau Ở Đâu?
Audience Quan tâm chính Nên nhấn mạnh
Technical
team
architecture, eval,
risks, dependen-
cies
scope, flow, Defini-
tion of Done
Executive /
sponsor
ROI, timeline,
adoption, risk ex-
posure
business value, sce-
nario, decision ask

<!-- page:28 -->
Expectation Setting: Đây Là AI, Không Phải Magic
■ Cần nói rõ AI làm tốt điều gì, chưa làm tốt điều gì, và cần human review ở đâu.
■ Khi stakeholder hiểu sai capability, team sẽ bị áp scope không thực tế.
■ Communication tốt giúp giảm kỳ vọng ảo và tăng cơ hội dự án sống sót lâu
hơn.

<!-- page:29 -->
Pitch Deck 5–7 Slides Nên Có Gì?
1. Problem / pain point
2. Target user và current workflow
3. Proposed AI solution
4. Metrics và expected value
5. ROI / 3-scenario view
6. Risks + mitigation
7. Decision ask: go / pilot / no-go

<!-- page:30 -->
Thực Hành
Day 06 chốt từ tài liệu sang đề xuất đầu tư có thể trình
bày được

<!-- page:31 -->
Hands-on 6: Cách Chạy Lab
1. Hoàn thiện PRD final từ Day 05.
2. Lập ROI model 3–6–12 tháng với 3 kịch bản.
3. Chuẩn bị stakeholder deck 5–7 slides.
4. Rehearsal 5 phút pitch: một người trình bày, một người đóng vai sponsor hỏi
lại.
Lưu ý: Lab này chấm theo mức độ rõ quyết định, rõ giả định, và rõ điều kiện
để tiếp tục đầu tư .

<!-- page:32 -->
Assessment Cuối Buổi
■ PRD final: đủ scope, metrics, risks, go-forward logic
■ ROI sheet: có cost side, value side, break-even, 3 scenarios
■ Pitch deck: gọn, logic, nói được với stakeholder không kỹ thuật
■ 5-min pitch: trình bày được decision ask rõ ràng

<!-- page:33 -->
T ổng kết — Key T akeaways
Những ý chính cần nhớ trước khi sang bài tiếp theo
1 AI project management hiệu quả là Agile cộng scientific method: thử, đo, học, rồi mới
đầu tư tiếp.
2 MVP first và PoC đúng nghĩa giúp team validate value trước khi commit quá nhiều thời
gian và chi phí.
3 ROI cho AI phải có số cụ thể, giả định rõ, và timeline rõ; không thể chỉ nói “AI sẽ tốt
hơn”.
4 Stakeholder communication quyết định dự án có được tiếp tục đầu tư hay không,
không chỉ chất lượng prototype.

<!-- page:34 -->
Tiếp theo & Bài tập
Data Foundations — Embedding
& Vector Store
“Bạn đã có PRD, ROI, và câu chuyện
để xin đầu tư. Nhưng agent của
bạn sẽ biết gì nếu không có dữ liệu
riêng? Ngày tiếp theo: đưa dữ liệu
vào hệ thống AI như thế nào.”
■ Rà lại pitch deck và chỉ ra 2
giả định ROI nhạy cảm nhất
■ Chuẩn bị 1 nguồn dữ liệu nội
bộ giả định để nghĩ về bài
toán retrieval ngày mai

<!-- page:35 -->
T ài Liệu Tham Khảo
1 Stanford HAI. AI Index Report 2025. hai.stanford.edu
2 McKinsey Global Institute. The Economic Potential of Generative AI. mckinsey.com
3 Dify Docs. Build LLM Apps with Low-code / No-code . docs.dify.ai

<!-- page:36 -->
Hỏi & Đáp
Bạn đang quản lý một AI project, hay đang quản
lý một tập giả định chưa được kiểm chứng?

<!-- page:37 -->
Cảm ơn!
Email: lecturer@vinuni.edu.vn
Slides & tài liệu: github.com/aicb-vinuni
Lab template: bit.ly/aicb-day06-lab
