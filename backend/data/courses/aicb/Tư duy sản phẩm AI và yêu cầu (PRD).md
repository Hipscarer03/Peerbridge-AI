# Tư duy sản phẩm AI và yêu cầu (PRD)

<!-- page:1 -->
AI Product Thinking & Requirements
AICB-P1 · Ngày 5 · Build agent xong, nhưng sản phẩm cho ai?
T ên Giảng Viên
VinUniversity · Phase 1 · T uần 1 · 2026

<!-- page:2 -->
?
HÃ Y SUY NGHĨ...
“Bạn đã build agent đẹp. Nhưng
user không dùng. Tại sao?”
Giữ câu hỏi này trong đầu khi học bài hôm nay

<!-- page:3 -->
Nội Dung Bài Học
1. Product thinking cho AI
2. Responsible AI fundamentals
3. User research cho AI products
4. Requirements engineering
5. PRD anatomy cho AI products
6. User stories cho AI
7. Risk register & go/no-go
8. Lab 5 + deliverable cuối buổi

<!-- page:4 -->
Mục Tiêu Ngày 5
■ Hiểu khác biệt giữa AI product và software feature thông thường
■ Biết cách chuyển user needs thành requirements đo được
■ Viết được PRD có thể dùng chung cho PM, BA, Engineer, Stakeholder
■ Lập được risk register cho AI product với logic likelihood × impact
Cuối buổi này, học viên phải trả lời được: cho ai, giá trị gì, đo bằng gì, rủi ro nào, và
khi nào go/no-go.

<!-- page:5 -->
Deliverable Cuối Ngày
1 PRD dài 3–5 trang + 1 Risk Matrix cho sản phẩm AI đang đề xuất.
■ PRD chính bám vào multi-agent system của Day 04
■ Có thể tham chiếu thêm các use case quen thuộc: AI support agent, trợ lý
tra cứu chính sách , ticket routing, AI sales assistant
■ Risk matrix phải có ít nhất 5 rủi ro: hallucination, bias, privacy, cost, adoption

<!-- page:6 -->
Product Thinking Cho AI
Build agent xong chưa đủ; phải build đúng thứ cho đúng
người dùng

<!-- page:7 -->
Hai Kiểu Thất Bại Phổ Biến
Build the wrong thing
■ Không hiểu job-to-be-done
■ Chọn sai persona mục tiêu
■ User không thấy giá trị đủ lớn
để quay lại
Build the thing wrong
■ Requirements mơ hồ
■ Không có acceptance criteria
đo được
■ Không lường trước risk và edge
cases
Lưu ý: Với AI product, value clarity và requirement quality quan trọng không
kém model quality.

<!-- page:8 -->
AI Product Khác Software Product Ở Đâu?
Khía cạnh Software thường AI product
Output deterministic hơn xác suất, có biến thiên
Kỳ vọng user ít mơ hồ hơn dễ kỳ vọng quá mức hoặc
hiểu sai
Definition of
done
pass/fail khá rõ cần threshold chất lượng,
SLA, fallback
Iteration loop build rồi ship build, test, observe, cali-
brate, re-ship
Đừng viết requirement cho AI như viết requirement cho một CRUD form. AI cần thêm
quality bands, fallbacks, và trust design.

<!-- page:9 -->
Jobs-to-be-Done Cho AI
User muốn hoàn
thành việc gì?
Ví dụ: trả lời ticket
nhanh hơn.
User muốn cảm thấy
thế nào?
T ự tin hơn, ít sợ sai
hơn.
User muốn được nhìn
nhận ra sao?
Trông chuyên nghiệp
hơn, phản hồi nhanh
hơn.
Lưu ý: Nếu chỉ nhìn functional job, bạn dễ build một agent “đúng chức năng”
nhưng không được dùng lại.

<!-- page:10 -->
Use Cases Quen Thuộc Để Nghĩ Product Value
■ AI support agent: giảm thời gian
trả lời, tăng consistency
■ Tra cứu chính sách nội bộ : giảm
thời gian tìm văn bản, giảm hỏi lặp
lại
■ Ticket routing agent: phân luồng
nhanh, giảm queue sai nhóm
■ AI sales assistant: sàng lọc lead,
tóm tắt nhu cầu, gợi ý bước tiếp
theo
Ưu tiên use case trả lời được 4 câu: ai dùng, đau ở đâu, thành công đo bằng
gì, fail gây hại gì.

<!-- page:11 -->
North Star Metric Cho AI Product
Use case North star gợi ý Cảnh báo
AI support agent first-response resolution
rate
đừng chỉ đo số lượng trả lời
Tra cứu văn bản time-to-answer đúng
nguồn
đừng chỉ đo độ dài câu trả
lời
Ticket routing đúng nhóm ngay từ lần
đầu
đừng chỉ đo tốc độ phân loại
AI sales assistant tỷ lệ lead đủ điều kiện đừng chỉ đo số lead được
chấm điểm
Define success before scope

<!-- page:12 -->
Responsible AI Fundamentals
Responsible AI cần được phản ánh ngay trong yêu cầu sản
phẩm và cách kiểm soát rủi ro

<!-- page:13 -->
5 Trụ Cột Responsible AI
Không thiên lệch bất
hợp lý
Đủ ổn định để user tin
dùng
Chỉ dùng dữ liệu thật
sự cần thiết
Phù hợp với nhiều nhóm người dùng Biết AI làm gì và giới hạn ở đâu
Các nguyên tắc này cần được chuyển thành product decisions , require-
ments, và risk items.

<!-- page:14 -->
Bias, Privacy, Transparency: Nói Theo Ngôn Ngữ PM/BA
Vấn đề Hỏi gì khi discovery Phải đi vào require-
ment nào
Bias AI có đối xử khác
nhau giữa các nhóm
user không?
test set đa dạng, hu-
man review cho case
nhạy cảm
Privacy Có PII / dữ liệu nhạy
cảm không?
data minimization,
masking, retention
policy
Transparency User có biết đây là
AI và khi nào nên
override không?
disclosure, citation,
escalation path

<!-- page:15 -->
AI Act EU 2024: Góc Nhìn Product
■ Không cần học thuộc luật trong buổi này; cần hiểu rằng một số use case AI sẽ
bị yêu cầu risk management, documentation, và human oversight chặt hơn.
■ Với PM/BA, tác động thực tế là: requirement, logging, disclosure, exception
handling, và review process phải được nghĩ từ đầu.
■ Khi sản phẩm đi vào ngành nhạy cảm như tuyển dụng, tín dụng, y tế, giáo
dục, mức độ cẩn trọng phải tăng mạnh.
Lưu ý: Responsible AI không chỉ là “đúng về mặt đạo đức”, mà còn là giảm rủi
ro vận hành và pháp lý.

<!-- page:16 -->
User Research Cho AI Prod-
ucts
Nếu không hiểu trust, control, và expectation, bạn sẽ viết
requirement sai ngay từ đầu

<!-- page:17 -->
4 Câu Hỏi User Research Đặc Thù Cho AI
1. User muốn AI tự làm đến mức nào, và ở bước nào họ muốn giữ quyền kiểm
soát?
2. User tin AI dựa trên điều gì : tốc độ, citation, confidence, hay kết quả thực
tế?
3. Khi AI sai, user muốn fallback nào: chỉnh tay, escalate người thật, hay thử lại?
4. User đang kỳ vọng AI là trợ lý, copilot, hay người thay thế ?
Lưu ý: Nhiều AI product fail vì team ngầm giả định user muốn “full automation”,
trong khi thực tế user chỉ muốn decision support.

<!-- page:18 -->
Persona Cho AI Cần Thêm Chiều Nào?
Persona thường có:
■ Vai trò
■ Mục tiêu công việc
■ Pain points
■ Bối cảnh sử dụng
Persona cho AI cần thêm:
■ AI literacy level
■ Mức sẵn sàng tin automation
■ Ngưỡng chấp nhận sai
■ Mức độ muốn explainability

<!-- page:19 -->
Feedback Loops: Thu Tín Hiệu Gì Từ User?
Loại tín hiệu Ví dụ Dùng để làm gì
Explicit feed-
back
thumbs up/down,
rating
xác định chất lượng user
cảm nhận
Behavioral
signal
copy, rephrase,
override, abandon
phát hiện trust, friction,
và điểm nghẽn
Outcome sig-
nal
resolved, booked,
escalated
nối AI quality với business
value
Nếu không biết sẽ thu feedback gì sau khi launch, bạn đang viết requirement cho một
hệ thống khó học và khó cải thiện.

<!-- page:20 -->
Requirements Engineering
T ừ ý tưởng mơ hồ sang đặc tả đủ rõ để team build, test,
và vận hành

<!-- page:21 -->
Từ Vague Đến Specific
Requirement mơ hồ
“Agent phải trả lời nhanh, chính xác, và
thông minh.”
Requirement đo được
“Agent phải trả lời trong dưới 5 giây
ở p95, trích dẫn đúng nguồn nội bộ,
và escalate sang người thật khi confi-
dence thấp.”
Lưu ý: Nếu engineer không biết cách test, thì requirement đó chưa đủ rõ.

<!-- page:22 -->
3 Nhóm Requirement Cần Có Cho AI Product
Nhóm Ví dụ Vì sao quan trọng
Functional tóm tắt ticket, phân loại
lead, tra cứu văn bản
mô tả AI phải làm việc gì
Non-functional latency SLA, uptime, cost
budget
bảo vệ trải nghiệm và khả
năng vận hành
AI-specific hallucination threshold, ex-
plainability, fallback
phản ánh bản chất rủi ro của
AI
Translate value into testable requirements

<!-- page:23 -->
Acceptance Criteria Cho AI Phải Trông Như Thế Nào?
■ Có trigger rõ: Khi user hỏi về chính sách hoàn tiền...
■ Có hành vi mong đợi : agent phải trích dẫn văn bản nguồn và trả lời bằng
tiếng Việt lịch sự.
■ Có ngưỡng đo được : trong dưới 6 giây; nếu thiếu thông tin thì agent phải hỏi
lại.
■ Có failure handling: nếu không tìm thấy nguồn phù hợp, agent phải nói rõ giới
hạn và chuyển hướng.
When X happens, the agent shouldY within Z seconds, and if failure condition
occurs, it should fallback behavior .

<!-- page:24 -->
PRD Anatomy
PRD là contract giữa PM, BA, Engineer, và Stakeholder

<!-- page:25 -->
8 Phần Của Một PRD AI Product
1. Problem 2. T arget User 3. Success Metrics
4. T echnical
Architecture
5. Feature
Requirements 6. Non-functional
7. Acceptance
Criteria 8. Risks
Lưu ý: Đừng xem PRD là file để “điền cho đủ”. PRD tốt phải làm rõ quyết định,
giảm tranh cãi mơ hồ, và giúp team biết thế nào là done.

<!-- page:26 -->
Success Metrics Hierarchy
T ầng Ví dụ Câu hỏi PM/BA phải trả lời
Business KPI cost saved, revenue, CSAT sản phẩm này tạo giá trị gì?
Product metric task completion, repeat us-
age, escalation rate
user có thực sự dùng và hoàn
thành việc không?
AI metric accuracy, latency, citation
rate
hệ AI có vận hành đủ tốt để
nâng product metric không?
Metrics hierarchy keeps teams aligned

<!-- page:27 -->
Anti-patterns Trong PRD AI
■ Chỉ mô tả tính năng, không mô tả problem và target user
■ Viết metric kiểu “càng cao càng tốt”, không có baseline hay threshold
■ Thiếu non-functional requirements: latency, cost, privacy, escalation
■ Không có risk section nên đến lúc triển khai mới tranh luận về bias, privacy,
adoption
■ Viết solution quá sớm, chưa chứng minh user value hoặc workflow fit

<!-- page:28 -->
User Stories Cho AI
User story tốt phải đủ rõ để engineer build, tester verify,
và stakeholder đồng thuận

<!-- page:29 -->
T emplate User Story Chuẩn
As [persona], I want [AI capability] , so that [business value] .
■ Persona phải là người dùng thật, không phải “hệ thống”
■ AI capability phải mô tả hành vi, không phải tên model
■ Business value phải nối được sang KPI hoặc pain point

<!-- page:30 -->
Ví Dụ User Stories Cho Các Use Case Quen Thuộc
■ AI support agent: As a support agent, I want AI to draft the first response
from past policy and ticket context, so that I can resolve routine cases faster.
■ Tra cứu chính sách: As an HR staff member, I want AI to answer policy
questions with source citation, so that I can respond consistently and reduce
manual lookup time.
■ Ticket routing: As an operations lead, I want AI to suggest the right queue for
incoming requests, so that misrouting drops and response time improves.

<!-- page:31 -->
Acceptance Criteria Và Edge Cases Đi Kèm User Story
Thành phần Ví dụ Vì sao cần
Happy path trả lời đúng nguồn
trong dưới 6 giây
định nghĩa kết quả
mong đợi
Edge case câu hỏi mơ hồ, câu
hỏi thiếu dữ liệu,
tiếng lóng
tránh ảo tưởng cov-
erage
Error state không có nguồn,
tool timeout, con-
fidence thấp
buộc thiết kế fall-
back & escalation

<!-- page:32 -->
Risk Register
Không có risk register, team sẽ nói về risk quá muộn và
quá cảm tính

<!-- page:33 -->
AI Risk T axonomy
Nhóm risk Ví dụ Mitigation gợi ý
Technical hallucination, tool failure,
latency spike
eval, fallback, timeouts, mon-
itoring
Data PII leak, stale source, bad
labeling
masking, access control, data
QA
Business adoption thấp, unclear ROI,
wrong workflow fit
pilot, success metrics, JTBD
validation
Ethical unfair outcome, opaque
decision
human review, disclosure, au-
dit sample
Regulatory logging thiếu, compliance
gap
documentation, approval
flow, policy review
Risk thinking must be explicit

<!-- page:34 -->
Risk Matrix: Likelihood × Impact
Impact
Likelihood
Monitor Mitigate
ReduceEscalate / Go-No-Go1
1: Privacy leak 2: Hallucination on sensitive advice
3: Cost spike 4: Adoption risk 5: Minor wording inconsistency

<!-- page:35 -->
Go / No-Go Criteria Dựa Trên Risk Threshold
■ Go: risk cao đã có mitigation rõ, acceptance criteria đo được, owner rõ.
■ Conditional go: pilot giới hạn, human-in-the-loop, guardrails chặt, scope
hẹp.
■ No-go: chưa xử lý privacy / compliance risk lớn, chưa có fallback, hoặc chưa
chứng minh user value.
Risk register giúp team biết build trong điều kiện nào, ship ở mức nào, và khi
nào phải dừng.

<!-- page:36 -->
Thực Hành
Lab 5: Viết PRD và Risk Matrix cho sản phẩm AI đủ rõ để
cả PM, BA, Engineer cùng dùng

<!-- page:37 -->
Hands-on 5: Cách Chạy Lab
1. Chọn artifact chính: multi-agent system Day 04 hoặc 1 use case quen thuộc
được giảng viên duyệt.
2. Viết Problem, T arget User, Success Metrics, Architecture ở mức đủ để
team hiểu scope.
3. Viết ít nhất 3 user stories với acceptance criteria và edge cases.
4. Lập risk matrix cho 5 rủi ro chính: hallucination, bias, privacy, cost,
adoption.
Lưu ý: Lab này không chấm “văn hay”. Lab này chấm mức độ rõ, đo được,
hành động được.

<!-- page:38 -->
Deliverable Cuối Buổi
■ PRD 3–5 trang gồm đủ 8 phần cốt lõi
■ Risk Matrix likelihood × impact
■ 3 user stories có acceptance criteria và failure handling
■ Decision note: đề xuất go / conditional go / no-go và lý do
Có target user rõ chưa? Metric có đo được chưa? Non-functional có đủ chưa?
Risk có owner và mitigation chưa?

<!-- page:39 -->
PRD Skeleton — Ví Dụ T ối Thiểu
Internal Policy Assistant
Problem
HR team mất nhiều thời gian trả lời câu
hỏi lặp lại về chính sách.
T arget User
HR staff và line managers cần tra cứu
nhanh, đúng nguồn.
Success Metrics
■ Time-to-answer giảm 50%
■ Citation coverage > 95%
■ Escalation rate < 15%
Risks
■ Hallucination on policy
interpretation
■ PII leakage in uploaded documents
PRD skeleton không cần dài ngay từ đầu. Điều quan trọng là mỗi mục đều nối
được sang quyết định, metric, hoặc risk cụ thể.

<!-- page:40 -->
T ổng kết — Key T akeaways
Những ý chính cần nhớ trước khi sang bài tiếp theo
1 Product thinking trước code: phải hiểu user, workflow, và value trước khi bàn sâu đến
tính năng hay model.
2 PRD là contract giữa PM, BA, Engineer, và Stakeholder; file này phải giảm mơ hồ chứ
không được tăng mơ hồ.
Responsible AI phải đi vào requirement, acceptance criteria, và risk register ngay từ
đầu thay vì xử lý muộn.
4 Nếu thiếu acceptance criteria và go/no-go threshold, team rất dễ build sai hướng dù
implementation có tốt.

<!-- page:41 -->
Tiếp theo & Bài tập
AI Product & Project Manage-
ment
“Day 05 giúp bạn viết đúng sản
phẩm. Nhưng khi stakeholder đổi
ý, uncertainty tăng, và sprint chạy
thật, bạn sẽ quản lý dự án AI như
thế nào?”
■ Xem lại PRD vừa viết và đánh
dấu 2 giả định chưa được
kiểm chứng
■ Chuẩn bị 1 use case muốn đem
sang bài MVP / PoC của ngày
tiếp theo

<!-- page:42 -->
T ài Liệu Tham Khảo
1 Google PAIR. People + AI Guidebook . pair.withgoogle.com/guidebook-v2/
2 NIST. AI Risk Management Framework (AI RMF 1.0). nist.gov
3 European Union. AI Act - Regulation (EU) 2024/1689. eur-lex.europa.eu
4 Duke University. AI Product Management Specialization. coursera.org

<!-- page:43 -->
Hỏi & Đáp
PRD của bạn đang giúp team quyết định
nhanh hơn, hay chỉ làm file dài hơn?

<!-- page:44 -->
Cảm ơn!
Email: lecturer@vinuni.edu.vn
Slides & tài liệu: github.com/aicb-vinuni
Lab template: bit.ly/aicb-day05-lab
