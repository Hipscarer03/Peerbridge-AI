# Nền tảng AI và LLM

<!-- page:1 -->
AI & LLM Foundation
AICB-P1 · Ngày 1 · Nền tảng
Phạm Mạnh
VinUniversity · Phase 1 · T uần 1 · 15/

<!-- page:2 -->
?
HÃ Y SUY NGHĨ...
“Bạn đang dùng AI mỗi ngày —
nhưng thực sự bên trong nó làm gì?”
Giữ câu hỏi này trong đầu khi học bài hôm nay

<!-- page:3 -->
Nội dung bài học
1. Bức tranh AI tính đến 2026 và sau đó
2. LLM — Trái tim của AI hiện đại
3. Token Economy
4. Gọi API lần đầu
5. Thực hành

<!-- page:4 -->
Bức tranh AI tính đến 2026 và
sau đó
T ừ Machine Learning đến Generative AI, Voice AI và Agen-
tic AI

<!-- page:5 -->
Mục tiêu bài học
Sau buổi học này, bạn sẽ:
1. Đọc được bản đồ ứng dụng GenAI hiện nay: chatbot, voicebot, ảnh, video,
code
2. Giải thích được Agentic AI và 3 khái niệm lõi: agent harness, agent skills,
tool/MCP
3. Giải thích được cách LLM hoạt động (Transformer, token, next-token
prediction)
4. Tính được chi phí API call dựa trên token economy
5. Gọi được API từ 3 providers: Anthropic, OpenAI, Google Gemini
6. Xây dựng chatbot đơn giản có streaming
Python 3.10+, VS Code/Cursor, API key (Anthropic hoặc OpenAI)

<!-- page:6 -->
AI T axonomy — Các tầng của trí tuệ nhân tạo
Artificial Intelligence
Machine Learning
Deep Learning
Foundation Models
LLM
■ AI: Máy thực hiện tác vụ “thông
minh”
■ ML: Học từ dữ liệu, không cần lập
trình tường minh
■ DL: Neural networks nhiều tầng
■ Foundation Models: Mô hình nền
tảng huấn luyện trên dữ liệu khổng
lồ, áp dụng nhiều tác vụ — không
chỉ text mà cả ảnh, âm thanh,
video
■ LLM: Foundation Model chuyên
ngôn ngữ — nền tảng của GenAI và
Agentic AI
Khóa học này tập trung vào LLM → xây dựng

<!-- page:7 -->
Ba nhóm AI chính
Discriminative AI
Chức năng: Phân loại, dự đoán
Ví dụ:
• Spam filter
• Image classifier
• Fraud detection
• Chấm điểm tín dụng
Input → Label
Generative AI
Chức năng: Sinh nội dung mới
Ví dụ:
• Text: ChatGPT, Claude
• Voice: ElevenLabs, callbot
• Ảnh: Midjourney, Flux
• Video: Sora, Veo, Kling
• Code: Copilot, Cursor
Prompt → Content
Agentic AI
Chức năng: T ự lập kế hoạch &
hành động
Ví dụ:
• AI coding agents
• Auto customer support
• Research agents
• Agent xử lý hồ sơ, đối soát
Goal → Plan → Action
LLM là engine chung cho cả Generative AI lẫn Agentic AI
Hành trình khóa học: LLM Foundation → Agent → Multi-Agent → Deploy → Evaluate

<!-- page:8 -->
Generative AI hôm nay — bản đồ ứng dụng
Modality Công cụ tiêu biểu Ứng dụng thực tế
Text / Chat ChatGPT, Claude, Gemini Chatbot CSKH, trợ lý nội bộ tra cứu quy
trình, tóm tắt hợp đồng
Voice / Speech Whisper, ElevenLabs,
Realtime API, Gemini Live
Callbot tổng đài, nhắc lịch hẹn, khảo
sát tự động, trợ lý giọng nói
Ảnh Midjourney, Flux, Stable
Diffusion, Nano Banana
Ảnh sản phẩm thương mại điện tử,
banner marketing, thử đồ ảo
Video Sora, Veo, Kling, Runway TVC ngắn, video đào tạo, minh họa nội
dung mạng xã hội
Code Claude Code, Cursor,
Copilot
Sinh code, refactor, viết test, migrate
hệ thống cũ
Đa phương
thức
GPT/Claude/Gemini vision,
OCR
Đọc hóa đơn, CCCD, biểu mẫu; kiểm
tra ảnh hiện trường bảo hiểm
Tên sản phẩm chỉ mang tính minh họa — thị trường thay đổi rất nhanh, hãy kiểm tra lại khi triển khai.

<!-- page:9 -->
GenAI trong doanh nghiệp — Chatbot và Voicebot
Chatbot (text)
Kênh: web, app, Zalo OA, Messenger, Slack-
/Teams
Ví dụ đang chạy thật:
• Ngân hàng: tra cứu sao kê, hướng dẫn mở thẻ
• E-commerce: tư vấn sản phẩm, tra cứu đơn
hàng
• Nội bộ: hỏi đáp quy trình, chính sách nhân sự
Điểm mạnh: rẻ, dễ log, dễ kiểm soát, gửi được
link/ảnh/nút bấm
Ràng buộc: người dùng phải gõ; độ trễ vài giây
vẫn chấp nhận được
Voicebot (giọng nói)
Kênh: tổng đài, hotline, app có mic, thiết bị/xe
Ví dụ đang chạy thật:
• Callbot nhắc lịch hẹn, nhắc đóng phí
• Tổng đài tự động thay IVR bấm phím
• Khảo sát hài lòng sau cuộc gọi
• Trợ lý giọng nói trong xe, trong nhà máy (rảnh
tay)
Điểm mạnh: tiếp cận cả người không quen dùng
app; xử lý song song hàng nghìn cuộc gọi
Ràng buộc: độ trễ là sống còn — trên 1 giây là
hội thoại “gượng”

<!-- page:10 -->
Voice AI — Hai kiến trúc xây voicebot
Cascaded pipeline (STT → LLM →
TTS)
Ghép 3 model rời nhau:
1. STT (Speech-to-Text): Whisper, Deepgram,
hoặc engine tiếng Việt nội địa
2. LLM : xử lý ý định, gọi tool, tra CSDL
3. TTS (Text-to-Speech): ElevenLabs, Carte-
sia, giọng đọc tiếng Việt
Ưu: kiểm soát từng khâu, log được transcript, dễ
thay thế nhà cung cấp, rẻ hơn
Nhược: độ trễ cộng dồn (thường 1–2s), mất ngữ
điệu và cảm xúc của người nói
Speech-to-speech (realtime)
Một model nhận thẳng audio và trả thẳng audio:
• OpenAI Realtime API
• Google Gemini Live API
Ưu: độ trễ thấp (~300–800ms), giữ được ngữ
điệu, ngắt lời (barge-in) tự nhiên
Nhược: khó chèn logic nghiệp vụ giữa chừng,
transcript kém tin cậy hơn cho audit, chi phí cao
hơn, ít lựa chọn nhà cung cấp
Thực tế: nhiều hệ thống dùng lai — realtime cho
hội thoại, pipeline cho luồng cần audit

<!-- page:11 -->
Voice AI — Những thứ “giết” một voicebot
Ngân sách độ trễ cho một lượt nói (mục tiêu < 1s):
Phát hiện dứt câu
(endpointing)
200–400 ms
STT 100–300 ms
LLM (token đầu tiên) 300–600 ms
TTS (âm thanh đầu tiên) 100–300 ms
T ổng 0.7–1.6 s
Mẹo: stream mọi khâu — đừng chờ LLM sinh xong cả
câu trả lời rồi mới đọc.
Các vấn đề đặc thù:
■ Barge-in: người dùng ngắt lời → phải dừng TTS
ngay
■ Endpointing: biết khi nào người ta nói xong,
không cướp lời
■ WER tiếng Việt: giọng vùng miền, tên riêng, số
tài khoản, đơn vị tiền
■ Đọc số: “1.500.000” phải đọc thành “một triệu
năm trăm nghìn”
■ Nhiễu & đường truyền: audio tổng đài 8kHz khác
hẳn mic điện thoại
■ Chuyển người thật: luôn cần đường thoát khi bot
bí
Voicebot không phải “chatbot gắn thêm loa”. Ràng buộc thời gian thực buộc
bạn thiết kế lại cả prompt (câu trả lời phải ngắn), cả luồng tool call, cả cách
xử lý lỗi.

<!-- page:12 -->
Ảnh, video và đa phương thức — ngoài chuyện trò chuyện
Sinh & sửa ảnh
• Ảnh sản phẩm: 1 ảnh gốc →
20 bối cảnh
• Banner, thumbnail theo chiến
dịch
• Xóa/thay nền, thử đồ ảo
• Minh họa cho tài liệu đào tạo
Midjourney, Flux, SDXL, Nano
Banana, Firefly
Sinh video & avatar
• Video ngắn quảng cáo, social
• Người dẫn AI cho video đào
tạo
• Lồng tiếng & dịch đa ngôn
ngữ giữ giọng gốc
Sora, Veo, Kling, Runway, Hey-
Gen
Cảnh báo: deepfake — cần
quy tắc sử dụng nội bộ
Hiểu đa phương thức
Đây mới là phần tạo ROI nhanh
nhất:
• Đọc hóa đơn, CCCD, biểu
mẫu viết tay
• Kiểm tra ảnh hiện trường (bảo
hiểm, giao hàng)
• Đọc bản vẽ, biểu đồ trong tài
liệu kỹ thuật
• Kiểm duyệt nội dung ảnh
Vision của GPT / Claude /
Gemini
Cùng một pattern API: gửi prompt + dữ liệu → nhận nội dung. Khác nhau chủ yếu ở modality, chi phí và độ trễ.

<!-- page:13 -->
Agentic AI
Agent — LLM biết hành động
Agent = LLM đặt trong một vòng lặp, được cấp công cụ và quyền hành
động, tự quyết định các bước để đạt mục tiêu — thay vì chỉ trả lời một câu
hỏi.
Nhận mục tiêu Lập kế hoạch Gọi tool Quan sát
kết quả Trả kết quả
chưa xong → lặp lại
Chatbot dừng ở một lượt hỏi–đáp. Agent lặp cho tới khi xong việc — và vì thế nó cần một bộ khung để
chạy an toàn.

<!-- page:14 -->
Agent Harness — bộ khung chạy agent
Harness là toàn bộ phần không phải model bao quanh LLM. Cùng một model, harness tốt hay tệ tạo ra khác
biệt rất lớn.
Harness gồm những gì:
■ Vòng lặp agent: gọi model → chạy tool → đưa
kết quả về → lặp
■ Quản lý ngữ cảnh: nhồi gì vào context, khi nào
nén (compaction)
■ T ool registry: khai báo tool, validate tham số, xử
lý lỗi
■ Quyền & sandbox: được gọi API nào, lúc nào
phải hỏi người
■ Bộ nhớ & phiên: giữ trạng thái giữa các lượt
■ Subagent: tách việc phụ để không làm bẩn
context chính
■ Quan sát được: log, trace, chi phí, điểm dừng
Harness có sẵn: Claude Agent SDK / Claude Code,
OpenAI Agents SDK, LangGraph (Ngày 8).
Vì sao quan trọng:
■ Model mạnh + harness kém = agent lan man, đốt
token, không dừng
■ Phần lớn lỗi “agent ngu” thực ra là lỗi harness:
context tràn, tool trả lỗi khó hiểu, thiếu điều kiện
dừng
■ Đổi model mới chỉ mất vài dòng; đổi harness là
viết lại hệ thống
Ngày 3–8: tự xây một harness, rồi chuyển sang
LangGraph.

<!-- page:15 -->
Agent Skills — đóng gói know-how cho agent
Agent Skill là một thư mục chứa hướng dẫn + script + tài liệu, mô tả cách làm một loại việc cụ thể. Agent chỉ nạp
skill khi thật sự cần — gọi là progressive disclosure.
bao-cao-tai-chinh/
SKILL.md # hướng dẫn chính
mau-bao-cao.xlsx
quy-tac-ke-toan.md
scripts/doi-soat.py
# đầu file SKILL.md
^^-
name: bao-cao-tai-chinh
description: Lập báo cáo tài
chính quý theo mẫu công ty
^^-
Agent chỉ đọc dòng description của mọi skill. Khi
việc khớp, nó mới mở toàn bộ nội dung skill đó ra.
Vì sao cần skills:
■ Context window có hạn — không thể nhét toàn bộ
quy trình công ty vào system prompt
■ Know-how nội bộ (mẫu biểu, quy tắc, giọng văn
thương hiệu) không nằm trong dữ liệu huấn luyện
■ Viết bằng Markdown → người làm nghiệp vụ sửa
được, không cần lập trình viên
■ Đóng gói được, chia sẻ được giữa các team và các
agent
Ví dụ skill thực tế:
■ Lập báo cáo quý: mẫu Excel + quy tắc hạch toán
■ Viết theo brand voice: giọng điệu + ví dụ tốt/xấu
■ Xử lý hồ sơ vay : checklist giấy tờ + ngưỡng cảnh
báo
■ Review code: chuẩn code nội bộ + lỗi hay gặp

<!-- page:16 -->
Bốn mảnh ghép của một agent — dùng cái nào khi nào?
Khái niệm Là gì Trả lời câu hỏi Ví dụ
T ool calling Hàm agent gọi được, có
schema tham số
Agent làm được gì? tra_cuu_don_hang(id)
MCP Chuẩn kết nối agent với
tool/dữ liệu bên ngoài
Cắm vào hệ thống nào? MCP server cho CRM,
Jira, database
Agent Skills Thư mục hướng dẫn + tài
nguyên, nạp khi cần
Làm việc đó thế nào
cho đúng?
Quy trình lập báo cáo
quý
Harness Vòng lặp, ngữ cảnh,
quyền, log bao quanh
model
Chạy an toàn và bền ra
sao?
Claude Agent SDK,
LangGraph
Bốn khái niệm này bổ sung cho nhau, không thay thế nhau. Chi tiết ở Ngày 4, 8, 9.

<!-- page:17 -->
Từ AI cổ điển đến Agentic AI
Perceptron
(1957)
Deep
Learning
bùng nổ
(2012)
Transformer
(2017)
ChatGPT
(2022)
Tool calling
RAG, MCP
(2023–24)
Agent, Skills
Harness
(2025–26+)
Mỗi bước không thay thế bước trước — nó chồng thêm một lớp năng lực lên trên.

<!-- page:18 -->
Vì sao 2026 là bước ngoặt?
78%
Doanh nghiệp
dùng AI
$15.7T
GDP toàn cầu
từ AI (2030)
3.7x
ROI trung bình
trên mỗi $1 đầu tư
Giai đoạn 2023–24 là “AI trả lời hay”. T ừ 2025–26 trở đi, câu hỏi của doanh
nghiệp đã đổi: AI có tự làm xong việc không, có cắm được vào hệ thống sẵn
có không, và có đo được ROI không. Đó chính là lý do Agentic AI — và bộ ba
harness, tool/MCP, skills — trở thành trọng tâm.

<!-- page:19 -->
LLM — Trái tim của AI hiện đại
Transformer, Token, và cách LLM “suy nghĩ”

<!-- page:20 -->
Định nghĩa
Large Language Model (LLM)
Mô hình ngôn ngữ lớn dựa trên kiến trúc Transformer, được huấn luyện trên
lượng dữ liệu văn bản khổng lồ (hàng nghìn tỷ token). LLM có khả năng sinh
văn bản, trả lời câu hỏi, viết code, và thực hiện reasoning phức tạp.
Đặc điểm chính:
■ Decoder-only Transformer architecture
■ Self-supervised pre-training + RLHF fine-tuning
■ Next-token prediction — dự đoán từ tiếp theo
■ Emergent capabilities xuất hiện khi scale lên

<!-- page:21 -->
Đường đi tới LLM — từ Perceptron đến Transformer
Năm Cột mốc Ý tưởng mới Hạn chế còn lại
1958 Perceptron (Rosenblatt) Nơ-ron nhân tạo học được từ dữ
liệu
Chỉ phân tách tuyến tính, một
lớp
1986 MLP + Backpropagation
(Rumelhart et al.)
Nhiều lớp ẩn → học quan hệ phi
tuyến
Đầu vào cố định, không hiểu thứ
tự
1990 RNN (Elman) Trạng thái ẩn quay vòng = bộ nhớ
cho chuỗi
Vanishing gradient → quên ngữ
cảnh xa
1997 LSTM (Hochreiter &
Schmidhuber)
Cell state + cổng quên/vào/ra giữ
phụ thuộc dài
Chạy tuần tự từng token →
chậm
2013 Word2Vec(Mikolov) T ừ→ vector, ngữ nghĩa thành
phép toán
Một từ một vector, bất kể ngữ
cảnh
2014 Seq2Seq + GRU (Sutskever;
Cho)
Encoder–decoder dịch máy; GRU
gọn hơn LSTM
Nén cả câu vào một vector →
hụt ở câu dài
2014 Attention (Bahdanau et al.) Decoder “nhìn lại” mọi vị trí đầu
vào
Vẫn gắn với RNN nên vẫn tuần tự
2017 Transformer (Vaswani et al.) Chỉ cần self-attention, bỏ
recurrent → song song hóa
Tốn dữ liệu, GPU; chi phí O(n2)
2018 BERT (encoder) & GPT-1
(decoder)
Pre-train quy mô lớn rồi fine-tune BERT không sinh văn bản; GPT-1
còn nhỏ
2020–
GPT-3 → ChatGPT Scale + instruction tuning/RLHF Ảo giác, thiếu dữ liệu mới → cần
tool & agent
Mỗi cột mốc gỡ đúng một hạn chế của cột mốc trước — LLM là điểm cuối của chuỗi đó, không phải một phát minh đơn lẻ.
Nguồn: bài báo gốc của từng cột mốc — liệt kê ở slide Tài liệu tham khảo.

<!-- page:22 -->
Transformer — Kiến trúc cách mạng (2017)
Input T okens
Embedding + Position
Self-Attention
Feed-Forward Network ×N layers
Next T oken Prediction ■ Self-Attention: Mỗi token “nhìn”
tất cả token khác trong context
■ Multi-Head: Nhiều “góc nhìn”
song song
■ Feed-Forward: Xử lý phi tuyến
từng vị trí
■ Residual connections: Gradient
chảy dễ dàng
Hai kiến trúc chính: Encoder-Decoder (BERT, T5) hiểu ngữ cảnh 2 chiều để phân
loại, dịch thuật. Decoder-only (GPT, Claude, Gemini) đọc trái→phải để dự đoán to-
ken tiếp và sinh văn bản. Ngày nay Decoder-only thắng thế nhờ scale tốt hơn.

<!-- page:23 -->
Self-Attention — Cơ chế cốt lõi
Attention — Cơ chế cho phép model “chú ý” đến các phần quan trọng nhất
của input khi xử lý mỗi token
Ví dụ:
“Con mèo ngồi trên bàn. Nó rất đáng yêu.”
Khi xử lý “Nó”, attention sẽ gán trọng số cao cho
“mèo” — hiểu “Nó” chỉ con mèo, không phải cái bàn.
Công thức:
Attention(Q, K, V) = softmax
(
QKT
√
dk
)
V
Q = Query, K = Key, V = Value
dk = dimensionality (để normalize)

<!-- page:24 -->
T oken — Đơn vị cơ bản của LLM
T oken — Đơn vị nhỏ nhất mà LLM xử lý
— khoảng 0.75 từ tiếng Anh, 0.5 từ tiếng
Việt
T okenization:Tách text thành subword units
"Hello world" → 2 tokens
"Xin chào" → 3–4 tokens
"anthropic" → 3 tokens
"def func():" → 4 tokens
[``Tôi''] [`` yêu'']
[`` Việt''] [`` Nam'']
→ 4+ tokens (mỗi từ có dấu = 1–2 to-
kens)
So sánh: “I love Vietnam” → 3 tokens
Thử: platform.openai.com/tokenizer
Lưu ý: Tiếng Việt tốn nhiều token hơn tiếng Anh (dấu, ký tự Unicode)
→ chi phí API cao hơn cho cùng nội dung.

<!-- page:25 -->
Next-T oken Prediction — LLM “suy nghĩ” thế nào
Hà Nội là thủ đô của Việt Nam
p = 0.94
■ LLM không “hiểu” ngôn ngữ — nó dự đoán token có xác suất cao nhất
■ T emperature: Điều chỉnh độ “sáng tạo” (0 = deterministic, 1 = random hơn)
■ Autoregressive: Output token trở thành input cho bước tiếp theo
Lưu ý: LLM có thể tự tin đưa ra thông tin sai (hallucination) vì nó tối ưu xác
suất, không phải sự thật.

<!-- page:26 -->
LLM được tạo ra như thế nào?
1. Pre-training 2. SFT 3. RLHF / DPO
Đọc Internet
học ngôn ngữ, kiến thức
Học theo ví dụ
để biết “trả lời đúng kiểu”
Căn chỉnh theo
sở thích con người, an toàn hơn
Lưu ý: Analogy dễ nhớ: Pre-training = “đọc rất nhiều”, SFT = “được chỉ cách
trả lời”, RLHF/DPO = “được uốn nắn để cư xử đúng hơn”.

<!-- page:27 -->
Giới hạn bẩm sinh của LLM
Knowledge cutoff
Model không biết những gì xảy ra
sau thời điểm training nếu không
được cấp thêm dữ liệu/tools.
Hallucination
Model có thể trả lời rất tự tin nhưng
sai vì đang tối ưu xác suất token,
không phải tính đúng-sai.
Context window
Model chỉ “nhìn” được lượng token
hữu hạn trong mỗi lần gọi. Quá dài
thì tốn chi phí, và thông tin giữa
prompt dễ bị quên.
Analogy
LLM giống một “học giả đọc rất
nhiều” nhưng sống trong một bong
bóng thời gian và chỉ được nhìn một
số trang trước mặt.
Gợi ý dạy: nhấn mạnh rằng các giới hạn này giải thích vì sao sau này cần prompt tốt, context management, RAG
và tools.

<!-- page:28 -->
T oken Economy
Chi phí, tốc độ và cách tính giá API

<!-- page:29 -->
API Pricing Model — Cách tính chi phí
Input T okens
(prompt) + Output T okens
(response) = T otal Cost
($/call)
■ Giá tính theo 1 triệu tokens (1M tokens)
■ Output tokens đắt hơn input tokens (3–5x)
■ Giá giảm ∼10x mỗi năm (GPT-4 level: $20/M → $2/M trong 2 năm)

<!-- page:30 -->
So sánh LLM phổ biến — Chọn gì cho đúng việc?
Model In Out Ctx Loại Khi nên dùng
Claude Opus 4.6 $5.0 $25 1M Closed Reasoning,
code khó
Claude Sonnet 4 $3.0 $15 1M Closed Balanced
choice
Claude Haiku 4.5 $0.8 $4 200K Closed Fast, cheap,
routing
GPT-4o $5.0 $20 128K Closed Multimodal,
ecosystem
Gemini 2.5 Pro $1.25 $10 1M Closed Long-context
tasks
Llama 4 Scout Free Free 1M Open Self-host, pri-
vate data
Lưu ý: Closed = API hosted; Open = self-host / control nhiều hơn. Giá tham khảo tháng 3/2026.

<!-- page:31 -->
Framework chọn model nhanh
Nếu ưu tiên cost/latency
■ FAQ, phân loại, trích xuất đơn
giản
■ Batch jobs số lượng lớn
■ Trả lời ngắn, ít reasoning
Gợi ý: Haiku, Gemini Flash, model
nhỏ/open-source
Nếu ưu tiên quality/reasoning
■ Phân tích nhiều bước, code,
planning
■ Tài liệu dài, ngữ cảnh phức tạp
■ Bài toán cần độ tin cậy cao
Gợi ý: Sonnet, Opus, GPT-4o,
Gemini Pro
Lưu ý: Rule of thumb: bắt đầu từ model đủ tốt và đủ rẻ . Chỉ nâng model khi
chất lượng thực sự chặn use case.

<!-- page:32 -->
Cùng một prompt — 3 model, 3 phong cách
Prompt ví dụ: “Tóm tắt báo cáo tài chính Q1 trong 3 bullet và nêu 1 rủi ro chính.”
Claude
Mạch lạc, thiên về
cấu trúc.
Phong cách: cẩn
thận, “consulting
style”.
GPT-4o
Ngắn gọn, tự nhiên,
linh hoạt.
Phong cách: hợp
app/chat, đa dụng.
Gemini
Mạnh khi context
dài, nhiều tài liệu.
Phong cách: hợp
workflow nhiều file.
Gợi ý dạy: chạy live cùng 1 prompt để học viên thấy model selection không chỉ là “giá”, mà còn là phong cách +
độ phù hợp task .

<!-- page:33 -->
Context Window — Bộ nhớ làm việc của LLM
Context Window — Số token tối đa mà
LLM xử lý trong 1 lần gọi API (input + out-
put)
■ 128K tokens ≈ 1 cuốn sách 300 trang
■ 1M tokens ≈ 4–5 cuốn sách
■ Context càng dài → chi phí càng cao
■ Thông tin ở giữa context dễ bị “quên”
(Lost in the Middle)
Gemini 2.5 1M
Claude Sonnet 4 1M
Claude Opus 4.6 1M
GPT-4o 128K
Llama 4 1M

<!-- page:34 -->
Tính chi phí thực tế — Ví dụ
Scenario: Chatbot hỗ trợ khách hàng, 1000 lượt/ngày
Input trung bình: 500 tokens/lượt (câu hỏi + context)
Output trung bình: 200 tokens/lượt (câu trả lời)
Dùng Claude Sonnet 4:
Input: 500K × $3/1M = $1.50
Output: 200K × $15/1M = $3.00
T ổng/ngày: $4.50
T ổng/tháng:∼$135
Dùng Claude Haiku 4.5:
Input: 500K × $0.80/1M = $0.40
Output: 200K × $4/1M = $0.80
T ổng/ngày: $1.20
T ổng/tháng:∼$36
Lưu ý: Chọn model phù hợp: Haiku cho tác vụ đơn giản, Sonnet/Opus cho
reasoning phức tạp.

<!-- page:35 -->
Gọi API lần đầu
T ừ “Hello World” đến production-ready call

<!-- page:36 -->
Luồng một API call
Prompt API Call T oken Stream Response
■ Prompt: system + user input + context
■ API Call: gửi request tới model provider
■ T oken Stream: model sinh output từng chunk
■ Response: text hoàn chỉnh + usage + stop reason
Lưu ý: T ư duy đúng cho PM/engineer: mỗi API call luôn có 3 thứ cần kiểm soát
cùng lúc: quality, latency, cost.

<!-- page:37 -->
Prerequisites — Trước khi bắt đầu
□✓ Python 3.10+ đã cài đặt
□✓ VS Code hoặc Cursor IDE
□✓ Tài khoản Anthropic API (có credit)
□✓ Biến môi trường: ANTHROPIC_API_KEY
□ OpenAI API key (không bắt buộc, dùng trong Lab)
□ Google AI Studio key (không bắt buộc, dùng trong Lab)

<!-- page:38 -->
Gọi Anthropic API — Hello World
import anthropic
# Reads API key from env var ANTHROPIC_API_KEY
client = anthropic.Anthropic()
message = client.messages.create(
model="claude-sonnet-4-6",
max_tokens=1024,
messages=[
{"role": "user",
"content": "Explain what LLM is in 2 sentences"}
]
)
print(message.content[0].text)

<!-- page:39 -->
Giải phẫu một API Call
Request (gửi đi):
■ model: Model nào sử dụng
■ max_tokens: Giới hạn output (bắt
buộc Anthropic)
■ messages: Lịch sử hội thoại
■ system: System prompt (tuỳ chọn)
Response (nhận về):
■ content: Nội dung trả lời
■ model: Model thực tế được dùng
■ usage.input_tokens: Số input
tokens
■ usage.output_tokens: Số output
tokens
■ stop_reason: end_turn | max_tokens |
tool_use

<!-- page:40 -->
Tham số Điều Khiển Output
temperature Độ “sáng tạo” (0–1) 0 = deterministic; 1 = diverse.
Dùng thấp cho code/phân tích,
cao hơn cho sáng tạo
top_p Nucleus sampling (0–
1)
Chỉ chọn từ top tokens chiếm p%
xác suất. Thường dùng 0.9–0.95
stop_sequences Dừng ở chuỗi chỉ định Hữu ích khi cần output có cấu trúc
cố định hoặc cắt đúng điểm mong
muốn
Bắt đầu với temperature=0 cho tác vụ cần ổn định. Chỉ tăng sampling khi thật sự cần đa dạng
câu trả lời.

<!-- page:41 -->
So sánh cú pháp — Anthropic vs OpenAI
# === ANTHROPIC (Claude) ===
import anthropic
client = anthropic.Anthropic()
resp = client.messages.create(
model="claude-sonnet-4-6", max_tokens=1024,
messages=[{"role": "user", "content": "Hello"}]
)
print(resp.content[0].text) # .content[0].text
# === OPENAI (GPT) ===
from openai import OpenAI
client = OpenAI()
resp = client.chat.completions.create(
model="gpt-4o",
messages=[{"role": "user", "content": "Hello"}]
)
print(resp.choices[0].message.content) # .choices[0]...

<!-- page:42 -->
So sánh cú pháp — Google Gemini
# === GOOGLE GEMINI ===
import google.generativeai as genai
model = genai.GenerativeModel( "gemini-2.5-flash")
resp = model.generate_content( "Hello")
print(resp.text) # .text (simple!)
T óm tắt khác biệt chính:
Anthropic OpenAI Google
API call messages.create() chat.completions.create() generate_content()
max_tokens Required Optional Optional
Response .content[0].text .choices[0]^^.content .text

<!-- page:43 -->
Streaming — Response theo từng chunk
import anthropic
client = anthropic.Anthropic()
# Streaming: receive response chunk by chunk
with client.messages.stream(
model="claude-sonnet-4-6",
max_tokens=1024,
messages=[{"role": "user", "content": "Write a poem"}]
) as stream:
for text in stream.text_stream:
print(text, end= "", flush=True)
# Get token usage after stream completes
final = stream.get_final_message()
print(f"\nUsage: {final.usage.input_tokens} in"
f" / {final.usage.output_tokens} out")

<!-- page:44 -->
Thực hành
Live Demo & Lab

<!-- page:45 -->
Vibe Coding Mindset — Làm việc cùng AI, không chỉ dùng AI
1. Intent-driven
Nói rõ mục tiêu, output mong muốn,
tiêu chí thành công.
2. Context-first
Đưa đủ file, ví dụ, ràng buộc, lỗi gặp
phải.
3. Human review
AI viết nhanh; con người chịu trách
nhiệm chốt.
T ừ “mình gõ code”
→ sang “mình đạo diễn AI viết code”.
T ool stack gợi ý:
Cursor / VS Code + Copilot hoặc
Claude Code.
Prompt coding tốt = mục tiêu rõ + context đủ + pattern cần theo + cách test.

<!-- page:46 -->
Live Demo — Chatbot cơ bản
1. Mở terminal, tạo project: mkdir chatbot ^& cd chatbot
2. Tạo virtual env: python -m venv .venv ^& source .venv/bin/activate
3. Cài packages: pip install anthropic openai
4. Set API key: export ANTHROPIC_API_KEY="sk-ant-^^."
5. Viết chatbot.py — gọi API + streaming
6. Chạy và test với 3 prompts khác nhau
7. Đo latency: time.time() trước/sau API call

<!-- page:47 -->
Lab #1
Mục tiêu: Gọi API thực tế: so sánh 3 providers về latency, cost, quality
Deliverable: Script Python hoàn chỉnh: gọi Anthropic + OpenAI + Gemini,
chatbot có streaming, bảng so sánh kết quả
Thời gian: 45 phút

<!-- page:48 -->
T ổng kết — Key T akeaways
Những ý chính cần nhớ trước khi sang bài tiếp theo
1 LLM = Transformer dự đoán token tiếp theo từ context
2 Để usable, LLM đi qua Pre-training → SFT → alignment
3 Chọn model theo trade-off quality, latency, cost
4 Một API call luôn có prompt, response, usage và stop reason
5 Vibe Coding tốt = intent rõ + context đủ + review kỹ

<!-- page:49 -->
Tiếp theo & Bài tập
Ngày 2: Prompt Engineering
“Prompt tốt tạo ra output tốt.
Nhưng “tốt” nghĩa là gì?”
■ Hoàn thành Lab #1
■ Đọc: “Attention Is All Y ou
Need” (2017)
■ Thử gọi API với 3 prompts
khác nhau

<!-- page:50 -->
T ài liệu tham khảo
1. Hochreiter & Schmidhuber (1997). “Long Short-Term Memory”. Neural Computation 9(8)
2. Bahdanau, Cho & Bengio (2014). “Neural Machine Translation by Jointly Learning to Align and
Translate”. arXiv:1409.0473
3. Vaswani et al. (2017). “Attention Is All Y ou Need”. arXiv:1706.03762
4. Devlin et al. (2018). “BERT: Pre-training of Deep Bidirectional Transformers”.
arXiv:1810.04805
5. Ouyang et al. (2022). “InstructGPT / RLHF”. arXiv:2203.02155
6. Rafailov et al. (2023). “DPO”. arXiv:2305.18290
7. Karpathy (2023). “State of GPT” practitioner talk
8. Anthropic / OpenAI / Google API quickstarts

<!-- page:51 -->
Hỏi & Đáp
Bạn có câu hỏi nào về LLM, Trans-
former, Token Economy, hoặc API?

<!-- page:52 -->
Cảm ơn!
Phạm Mạnh
Email: a.nguyen@vinuni.edu.vn
Tài liệu: github.com/vinuni/aicb-materials
Bài tập nộp trước Ngày 2 · Đọc thêm: Vaswani et al. (2017)
