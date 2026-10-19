# RAG Pipeline - Truy xuất và sinh câu trả lời

<!-- page:1 -->
RAG Pipeline
AICB-P1 · Ngày 8 · Truy Xuất & Sinh Câu
Trả Lời
Tên Giảng Viên
VinUniversity · Phase 1 · Tuần 2 ·
?
HÃY SUY NGHĨ...
“Bạn đã build agent với vector
store. Nhưng agent vẫn
hallucinate và trả lời sai. Lỗi
nằm ở đâu?”
Giữ câu hỏi này trong đầu khi học bài hôm
nay
Nội Dung Bài Học
1. The RAG Paradigm & Indexing Architecture
2. Query Processing & Advanced Retrieval
3. Generation, Grounding & UX
4. The RAG Evaluation Triad
5. Lab 8 + deliverable

<!-- page:2 -->
Mục Tiêu Ngày 8
■ Giải thích được RAG như một pipeline gồm indexing, retrieval,
re-ranking, và generation
■ Hiểu vì sao retrieval quality thường quyết định chất lượng câu trả lời
nhiều hơn prompt viết đẹp
■ So sánh được dense, sparse, hybrid retrieval và biết khi nào cần rerank
■ Thiết kế được prompt grounding để model trả lời từ context thay vì bịa
thêm
■ Đo được chất lượng RAG bằng faithfulness, relevance,
context recall/completeness

<!-- page:3 -->
Deliverable Cuối Ngày
Full RAG pipeline với index, retrieval, answer function, 10 test questions,
và scorecard đánh giá chất lượng
■ 1 pipeline index → retrieve → rerank/select → generate
■ 1 bộ câu hỏi test có expected evidence hoặc expected answer
■ 1 bảng điểm ngắn để so sánh baseline và bản tuning đầu tiên

<!-- page:4 -->
The RAG Paradigm
& Indexing Architecture
RAG is not just adding context; it is a synergistic
orchestration of indexing, retrieval, and generation
systems to ensure factual grounding and accuracy.
1.1 The Need for RAG
Understanding why standard LLMs fall short and how
RAG bridging the gap between static knowledge and
dynamic, factual accuracy.
Ảo Giác Của LLM (The Illusion of Knowledge)
Kiến thức bị đóng băng (Knowledge
Cutoff)
LLM chỉ biết những gì đã xảy ra trước ngày training.
Thông tin nội bộ hay sự kiện mới là điểm mù.
Bản chất xác suất (Probabilistic Nature)
LLM là cỗ máy dự đoán từ tiếp theo, ưu tiên sự trôi
chảy (fluency) hơn tính chính xác (factual accuracy).
Hệ quả - Hallucination
Khi thiếu dữ kiện, model sẽ tự động "bịa" ra thông
tin trông rất logic và tự tin để làm hài lòng người
dùng.

<!-- page:5 -->
Fine-tuning vs. RAG (Hai Cách Tiếp Cận Khác Nhau)
Fine-tuning (Học phong cách)
Phù hợp để thay đổi cách model nói chuyện
(tone, format), nhưng cực kỳ kém và đắt đỏ nếu
dùng để nhồi nhét sự kiện (facts). Trí nhớ mạng
nơ-ron rất dễ bị "catastrophic forgetting".
RAG (Cung cấp tài liệu)
Phù hợp để truy xuất thông tin thực tế. Giống
như việc cho học sinh mang tài liệu vào phòng
thi "Open-book exam" thay vì bắt học thuộc
lòng.
Metric Fine-tuning RAG
Cost to Update Cao (Retraining required) Thấp (Update index)
Risk of Hallucination Cao (Static knowledge) Thấp (Grounded in facts)
Dynamic Access Control Khó (All-in-one weights) Dễ (Document-level permissions)
RAG Là Gì? (Retrieval-Augmented Generation)
Sự kết hợp của 2 cỗ máy:
RAG ghép nối sức mạnh tìm kiếm của một Search Engine với khả năng tổng hợp ngôn ngữ của LLM.
Quy trình ngược:
Thay vì hỏi model ngay lập tức, ta chặn câu hỏi lại → dùng nó để truy vấn cơ sở dữ liệu → lấy bài viết liên quan
nhất → ép model đọc bài viết đó để trả lời.
User
Question
Search
DB
Extract
Context
Prompt
LLM
Grounded
Answer
Vì Sao Doanh Nghiệp Bắt Buộc Phải Dùng RAG?

Nguồn gốc rõ ràng
(Auditability): Mọi câu trả lời
đều có thể đính kèm đường
link trích dẫn (citation). Nếu
AI trả lời sai, ta biết ngay là
do tài liệu sai hay do AI suy
diễn.

Bảo mật & Phân quyền
(Access Control / RBAC): LLM
không lưu dữ liệu. Người
dùng A ở phòng Marketing
chỉ được phép search
(retrieve) các tài liệu mà họ
có quyền xem.

Cập nhật Real-time
(Freshness): Khi chính sách
thay đổi, chỉ cần xóa file cũ /
thêm file mới vào Vector DB.
Không cần train lại model.
Data-Centric AI Trong Kỷ Nguyên LLM

Các model (GPT-4, Gemini, Claude) đang dần trở thành "hàng hóa cơ bản" (commodity) với
sức mạnh tương đương nhau.

Sự khác biệt của một sản phẩm AI doanh nghiệp nằm ở hệ thống dữ liệu. Pipeline xử lý, làm
sạch và tìm kiếm dữ liệu mới là lợi thế cạnh tranh cốt lõi.

"Rác vào, rác ra" (Garbage In, Garbage Out): Nếu retrieval mang về thông tin nhiễu, prompt
kỹ thuật đến đâu cũng vô dụng.
⚠ Your LLM is only as smart as your retrieval system.
1.2 High-level RAG Architecture
The anatomy of a RAG pipeline: How Indexing, Retrieval,
and Generation work together to build a reliable
search-and-synthesize engine.
RAG = 3 Pipeline Phối Hợp
RAG không phải là một hàm API gọi một lần. Nó là một hệ thống phân tán gồm 3 khối kiến trúc
riêng biệt chạy nối tiếp nhau:
1. Indexing
Xử lý và chuẩn hóa tài liệu (Chạy
ngầm/Offline).
2. Retrieval
Tìm kiếm và chọn lọc ngữ cảnh
(Chạy Real-time khi user hỏi).
3. Generation
Lắp ghép prompt và sinh ngôn
ngữ (Chạy Real-time).
Bước 1 - Indexing Pipeline (Xây Nền Móng)
• Đây là quá trình ETL (Extract, Transform, Load) dành cho dữ liệu phi cấu trúc.
• Mục tiêu: Biến các file PDF, Word, HTML khổng lồ thành các đoạn thông tin nhỏ (chunks),
mã hóa chúng thành số (vectors), và lưu vào Database chuyên dụng.
1. Shredding (Chunking) 2. AI Embedding 3. Vector DB Storage
Bước 2 - Retrieval Pipeline (Động Cơ Tìm Kiếm)
• Khi user đặt câu hỏi, hệ thống cũng phải mã hóa câu hỏi đó thành vector
bằng đúng model đã dùng ở bước Indexing.
• Sử dụng thuật toán k-NN (K-Nearest Neighbors) hoặc ANN (Approximate
Nearest Neighbors) để tính khoảng cách trong không gian toán học, từ đó rút
ra top K đoạn văn bản gần nghĩa nhất.
Bước 3 - Generation Pipeline (Tổng Hợp & Trình Bày)
• Thông tin thô từ DB rất lộn xộn và khó đọc. LLM đóng vai trò là "biên tập viên".
• Đưa toàn bộ ngữ cảnh tìm được vào System Prompt kèm theo lệnh giới hạn nghiêm
ngặt: "Chỉ trả lời dựa trên tài liệu được cung cấp".
• Xử lý ngoại lệ: Nếu DB trả về kết quả rỗng, LLM phải được lập trình để xin lỗi và báo
thiếu dữ liệu.
Raw Chunks (Metadata)
{id: 104, score: 0.89, txt: "quy trình..."}
{id: 205, score: 0.82, txt: "mã hóa..."}
{id: 091, score: 0.78, txt: "vector DB..."}
Retrieved Information
AI Response:
• Quy trình gồm 3 bước chính.
• Dữ liệu được mã hóa vector.
• Lưu trữ tại cơ sở dữ liệu.
Cohesive Answer
Nút Cổ Chai Thực Sự Nằm Ở Đâu?
Khi test RAG thấy kết quả sai, kỹ sư thường vội vàng nhảy vào sửa Prompt hoặc đổi model
lớn hơn. Đây là sai lầm!
80%
Lỗi do Retrieval
● Truy vấn tìm sai tài liệu
● Thiếu chứng cứ quan trọng
● Nhồi quá nhiều rác (noise)
20%
Lỗi do Generation
● Model bỏ qua chứng cứ
● Ảo giác sinh thêm chi tiết
● Định dạng sai
1.3 Document Parsing & Ingestion
Tackle the complexities of parsing multi-column PDFs,
extracting nested tables, and building a robust ingestion
pipeline to feed your database.
Dữ Liệu Thực Tế Luôn Lộn Xộn
Các khóa học thường demo bằng file
.txt sạch sẽ. Thực tế doanh nghiệp là:
● PDF scan (hóa đơn, hợp đồng)
● Email cũ (nhiều ký tự lạ)
● Slide thuyết trình (layout phức
tạp)
Thách thức OCR
OCR kém sẽ đọc chữ "I" thành số "1",
làm hỏng toàn bộ keyword quan
trọng.
Thử Thách Parse PDF (Vấn đề Layout)
Vấn Đề Kỹ Thuật
● Chuẩn PDF sinh ra để in ấn, nó lưu tọa độ (x, y) của chữ chứ không
hiểu cấu trúc ngữ nghĩa (đâu là tiêu đề, đâu là đoạn văn).
● Lỗi layout: Các parser cơ bản thường đọc từ trái sang phải, làm trộn
lẫn văn bản giữa 2 cột riêng biệt thành một câu vô nghĩa.
● Nhiễu Header/Footer: Số trang và tiêu đề lặp lại ở mọi trang sẽ làm
bẩn database nếu không được gỡ bỏ.
Cơn Ác Mộng Mang Tên "Bảng Biểu" (Tables)
Nếu dùng thuật toán cắt text thông
thường, bảng bị xẻ làm đôi. Nửa dưới
mất liên kết với Header → Vector vô
dụng.
Giải pháp tối ưu: Phải dùng parser
chuyên dụng (LlamaParse,
Unstructured) để bóc tách thành
HTML/Markdown.
Raw Text "Soup" Original PDF Table
Basic Pro Enterprise
$9/month $29/month $99/month
10Gb Storage 50GB Storage
Unlimited Storage
Markdown/HTML
| Basic | Pro | Enterprise |
|$9/month | $29/month | $99/month |
|---|---|---|
|10Gb Storage | 50GB Storage |
Unlimited Storage |
Multimodal Parsing (Dùng Vision Model)
Thay vì dùng công cụ bóc chữ truyền thống, ta ném
thẳng ảnh chụp trang tài liệu cho Vision LLMs (như
Gemini 1.5 Pro hoặc GPT-4o).
Ưu điểm:
● Hiểu được cấu trúc siêu phức tạp.
● Đọc được biểu đồ (charts).
● Lưu lại được diễn giải hình ảnh.
Nhược điểm:
● Tốn kém chi phí API.
● Chạy chậm (không phù hợp cho kho dữ liệu
hàng triệu trang).
Visual Pipeline
Làm Sạch Dữ Liệu (Data Cleaning)
Chuẩn hóa (Normalization): Gộp các
khoảng trắng thừa, sửa lỗi unicode (font
tiếng Việt cũ), xóa các ký tự điều khiển
(control characters) làm rối model.
Redaction (Che mờ PII): Xóa thông tin
cá nhân (CCCD, số thẻ tín dụng, số điện
thoại) trước khi đưa lên Cloud Vector DB
để đảm bảo tuân thủ bảo mật
(GDPR/PDPA).
Ví dụ minh họa (Example)
"KH Nguyễn Văn A, \n\n SDT:
0901234567"
Cleaned: "KH [REDACTED], SDT:
[REDACTED]"
Chiến Lược Ingestion Dữ Liệu
Batch Processing
Cập nhật định kỳ (VD: quét lại toàn bộ Google Drive
vào 12h đêm). Dễ triển khai nhưng thông tin bị trễ
(stale data).
Event-Driven (Delta Sync)
Dùng Webhook bắt sự kiện. Chỉ khi nào có user sửa
file trên Confluence, hệ thống mới trigger job cập
nhật riêng file đó.
Idempotency: Phải thiết kế hệ thống băm (hashing) nội dung để tránh việc lưu trùng lặp một chunk văn bản
nhiều lần.
Visual Workflow: Event-Driven Pipeline
User Edits CMS Webhook Trigger Hash Check
(Is content new?) Parse & Embed Upsert DB
1.4 Advanced Chunking Strategies
Beyond naive character splitting: Exploring recursive,
structural, and semantic chunking strategies to preserve
document context and maximize retrieval accuracy.
Chunking Là Gì? Tại Sao Không Lưu Cả Bài?
Giới hạn Context Window
Dù LLM hiện nay hỗ trợ ngữ cảnh dài (ví dụ
Gemini 1.5 hỗ trợ 2M tokens), việc nhét cả nghìn
trang tài liệu vào prompt rất đắt tiền và tốn thời
gian phản hồi (TTFT).
Giảm nhiễu (Noise)
Vector Search tìm "mật độ" ý nghĩa. Nếu nhúng
cả một chương sách vào 1 vector, các ý chính sẽ
bị pha loãng, rất khó khớp với câu hỏi cụ thể của
user.
Chiến Lược 1 - Cắt Theo Kích Thước (Fixed-Size)
Đặc điểm & Đánh giá
• Cắt cơ học theo số lượng ký tự hoặc token (Ví
dụ: Cứ 500 ký tự thì chém 1 nhát).
Ưu điểm:
Cực kỳ dễ code, chạy nhanh, dự đoán được chính
xác dung lượng database.
Nhược điểm (Tử huyệt):
Rất dễ cắt ngang một câu, làm đứt đoạn ngữ
nghĩa (ví dụ: cắt giữa chữ "không" và "được
phép").
Chính sách này áp dụng cho toàn bộ
nhân viên ngoại | trừ thực tập sinh.
Nghĩa của câu bị chia đôi tại điểm cắt
Chiến Lược 2 - Cắt Đệ Quy (Recursive Chunking)
Đặc điểm & Cách hoạt động
• Đây là tiêu chuẩn vàng mặc định (Default
standard) trong LangChain.
Thay vì cắt mù quáng, nó cố gắng tôn trọng ranh
giới ngôn ngữ bằng cách thử cắt theo thứ tự ưu
tiên:
1. Cắt ở khoảng trống giữa 2 đoạn văn (\n\n).
2. Nếu đoạn vẫn quá dài, cắt ở ký tự xuống
dòng (\n).
3. Nếu vẫn dài, cắt ở dấu chấm câu (.).
Fallback Logic Tree
Split by Paragraph (\n\n)
Fallback: Sentence (\n or .)
Fallback: Word / Character
Chiến Lược 3 - Cắt Theo Cấu Trúc (Semantic/Structural)
Đặc điểm & Ứng dụng
• Không quan tâm độ dài, chỉ cắt dựa trên cấu
trúc logic của tài liệu.
• Markdown/HTML: Tách riêng các phần dưới
thẻ <H1>, <H2>.
• Code: Dùng AST (Abstract Syntax Tree) để tách
riêng từng function (hàm) hoặc class, đảm bảo
không một hàm Python nào bị cắt đứt làm đôi.
# Heading 1
............................
..................................
## Sub-heading A
............................
...................
## Sub-heading B
............................
..................................
Tại Sao Cần Overlap (Phần Gối Nhau)?
• Khi chia văn bản, một ý quan trọng có thể
vô tình bị chia làm 2 mảnh nằm ở mép của
2 chunk khác nhau.
• Overlap (Khoảng lặp lại): Cho phép
đoạn cuối của Chunk 1 được lặp lại ở đoạn
đầu của Chunk 2 (thường set khoảng
10-15% tổng size).
• Việc này hoạt động như chất "keo dính"
giữ lại mạch ngữ cảnh.
Chunk 1
... nội dung văn bản phần đầu ... Overlap
Chunk 2
... tiếp nối nội dung từ overlap ... Overlap
Small-to-Big Retrieval (Parent-Child Indexing)
• Vấn đề: Chunk nhỏ thì search chính xác
nhưng thiếu ngữ cảnh. Chunk to thì search dễ
trượt nhưng ngữ cảnh dồi dào.
• Giải pháp Parent-Child: Lưu trữ các chunk
là những câu siêu ngắn (Small) để chạy Vector
Search lấy độ chính xác cao.
• Khi tìm trúng câu nhỏ đó, hệ thống sẽ tự
động móc nối và gửi toàn bộ đoạn văn lớn
chứa câu đó (Parent) vào LLM Prompt.
Parent Chunk
Child 1 (Small)
Child 2 (Search Hit)
Child 3 (Small)
Search
To LLM Prompt
(Full Context Included)
Xử Lý Chunking Riêng Cho Bảng Biểu
• Bảng biểu không có câu văn hoàn chỉnh,
vector search rất khó bắt nghĩa.
• Cách 1 - Row to Text: Biến từng dòng của
bảng thành một câu văn tự nhiên (VD: "Sản
phẩm iPhone 15 có giá 20 triệu, tồn kho 5
chiếc").
• Cách 2 - LLM Summarization: Dùng LLM
đọc toàn bộ bảng, viết 1 đoạn tóm tắt ý chính
của bảng đó, và lưu đoạn tóm tắt đó thành
vector đại diện cho cái bảng.
Chunking Tốt Và Chunking Tệ
Chunking tệ
■ cắt giữa một bảng hoặc
điều khoản
■ quá to: nhiều ý không liên
quan
■ quá nhỏ: mất ngữ cảnh và
thiếu source
Ví dụ:
Điều kiện hoàn tiền được áp dụng khi...
... khách hàng gửi yêu cầu trong vòng 7
ngày làm việc kể từ thời điểm xác nhận...
Chunking tốt
■ cắt theo heading,
section, paragraph tự
nhiên
■ có overlap vừa đủ
■ giữ source, section, date
■ retriever hiểu ngữ nghĩa trọn
vẹn hơn
Ví dụ:
Hoàn tiền - Điều kiện áp dụng
Yêu cầu được gửi trong 7 ngày...
Source: policy/refund-v4.pdf · Điều 3

<!-- page:9 -->
1.5 Embeddings & Metadata
Beyond naive character splitting: Exploring recursive,
structural, and semantic chunking strategies to preserve
document context and maximize retrieval accuracy.
Embedding Là Gì? (Biến Chữ Thành Số)
Bản chất của Embedding
Mô hình máy học không hiểu được ngôn ngữ
của con người. Embedding là phép biến đổi
toán học chuyển một câu thành một dải số
(Vector).
Không gian ngữ nghĩa
Các câu có ý nghĩa giống nhau (dù dùng từ
vựng hoàn toàn khác nhau) sẽ có điểm tọa độ
nằm sát nhau trong không gian đa chiều
(Semantic space).
Lựa Chọn Embedding Model Cho Production
Số chiều (Dimensions)
Model nhỏ (như bge-micro, 384 chiều) tính
toán siêu nhanh, ít tốn RAM.
Model lớn (OpenAI, 1536 chiều) phân biệt
nghĩa tinh tế hơn nhưng chi phí hạ tầng cao
gấp 4 lần.
Rào cản ngôn ngữ
Đừng dùng model chuyên tiếng Anh cho văn
bản tiếng Việt.
Phải chọn các model Multilingual (m-E5,
Cohere Multilingual) để mapping ngôn ngữ
tốt.
Điểm Mù Của Vector Search
Hạn chế của Vector Search
● Vector hoàn hảo trong việc hiểu "ý
nghĩa" và "diễn đạt lại".
● Tuy nhiên, Vector cực kỳ tồi tệ khi đối
mặt với Exact Match (Khớp chính xác):
Mã hợp đồng, ID lỗi (ERR-809), số
series.
● Model nhúng có thể xếp ERR-809 và
ERR-810 sát cạnh nhau vì cấu trúc giống
nhau, dẫn đến trả lời nhầm.
Metadata - Cứu Tinh Của Khả Năng Lọc (Filtering)
Tại sao Metadata lại quan trọng?
● Đừng bao giờ chỉ đẩy "Raw Text" vào
Database. Việc gắn thẻ dữ liệu
(Tagging/Metadata) là bắt buộc.
● Một chunk tốt phải mang theo "giấy tờ
tùy thân": source_file, doc_type,
date_created, department_owner.
● Lợi ích: Cho phép cắt giảm không gian
tìm kiếm trước khi chạy thuật toán
vector nặng nề.
// JSON Object Payload Example
{
"text": "Nội dung điều khoản...",
"metadata": {
"source": "hr_policy.pdf",
"year": 2026,
"access": "internal"
}
}
Pre-filtering vs. Post-filtering
Post-filtering (Lọc sau)
Search top 100 vector gần nhất, sau đó loại bỏ
những kết quả không thuộc năm 2026. Rủi ro: Có
thể bị rớt mất tài liệu quan trọng nếu nó nằm ở
hạng 101.
Pre-filtering (Lọc trước)
Yêu cầu DB chỉ nhìn vào vùng không gian chứa tài
liệu năm 2026, rồi mới chạy Vector Search. Nhanh
hơn, an toàn hơn, và chính xác tuyệt đối.
Vector Search
Filter
Filter
Vector
Search
Code Ingestion Tối Thiểu (Python)
Một kịch bản chuẩn bị dữ liệu tiêu chuẩn sử dụng TextSplitter và Vectorstore.
# Import các thư viện cần thiết
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
# Thiết lập cắt đệ quy kèm overlap
text_splitter = RecursiveCharacterTextSplitter(
chunk_size=1000,
chunk_overlap=150
)
# Cắt doc và nhồi metadata
chunks = text_splitter.split_documents(raw_documents)
for chunk in chunks:
chunk.metadata["source"] = "Q1_Report"
# Lưu vào Vector DB
vectorstore = Chroma.from_documents(
documents=chunks,
embedding=embeddings
)
Query Processing & Advance
Retrieval
Moving beyond basic semantic search: How to transform
ambiguous user queries, leverage the power of hybrid
retrieval, and use cross-encoder re-ranking to extract the
highest quality context.
2.1 Query Transformation
Learn how to intercept, expand, decompose, and
transform ambiguous user inputs into highly optimized
search queries using LLMs.
Người Dùng Không Bao Giờ Hỏi Đúng
Khoảng cách từ vựng
Người dùng dùng ngôn ngữ "đường phố" hoặc
mơ hồ. Tài liệu nội bộ dùng ngôn ngữ chuyên
môn trang trọng.
Thiếu ngữ cảnh
Câu hỏi cụt lủn (vd: "hoàn tiền") khiến Vector
DB trả về quá nhiều kết quả nhiễu.
Kết luận: Nếu lấy raw query đi search
thẳng, Retriever sẽ thất bại ngay từ giây
đầu tiên.
"sao app cứ văng"
Troubleshooting Unhandled Exceptions
Query Transformation Là Gì?
● Đặt một LLM nhỏ, tốc độ cao (như GPT-4o-mini, Gemini Flash) làm "màng lọc" đứng trước Vector
Database.
● LLM này đóng vai trò như một người biên tập, diễn dịch lại ý định của người dùng thành các truy vấn
tối ưu cho máy học.
● Đây là bước đệm hoàn hảo trước khi ta biến Retriever thành một "Tool" độc lập cho các Agent
(LangGraph) ở giai đoạn sau.
Raw User Query LLM Router /
Transformer Optimized Queries Vector Database
Kỹ Thuật 1 - Query Expansion (Mở Rộng & Sửa Lỗi)
• Chữa lỗi chính tả và thêm các từ đồng nghĩa (synonyms) hoặc thuật ngữ chuyên ngành có
cùng nghĩa.
• Tăng mạnh độ phủ (Recall), giúp hệ thống không bỏ sót tài liệu chỉ vì người dùng dùng sai từ.
VÍ DỤ
Raw User Query:
"nghỉ đẻ"
LLM Expanded Queries:
["nghỉ thai sản", "maternity leave",
"chế độ phụ sản", "trợ cấp sinh con"]
Kỹ Thuật 2 - Query Decomposition (Chia Để Trị)
● Xử lý các câu hỏi phức tạp (Multi-hop). Một Vector biểu diễn tài liệu không thể đồng thời trả lời
cho hai ý niệm quá khác biệt.
● Phân tách câu hỏi lớn thành nhiều câu hỏi nhỏ, chạy tìm kiếm song song (parallel retrieval), sau
đó gộp context lại.
VÍ DỤ
Q: "So sánh chính sách hoàn
tiền của Shopee và Tiki"
Q1: "Chính sách hoàn tiền
Shopee"
Q2: "Chính sách hoàn tiền
Tiki"
Gộp Context
Kỹ Thuật 3 - Step-Back Prompting
• Khi câu hỏi đi quá sâu vào tiểu tiết, model dễ bị "lạc" và không tìm thấy tài liệu chính xác (do
quá cụ thể).
• LLM tự động sinh ra một câu hỏi "lùi lại một bước" (abstract/high-level) để lấy được ngữ cảnh
quy tắc chung trước khi giải quyết ca cụ thể.
VÍ DỤ
User: "Lỗi 404 khi gọi API thanh toán
Momo của user ID 8910"
Step-back Q:
"Kiến trúc tích hợp cổng thanh toán Momo
hoạt động như thế nào?"
Kỹ Thuật 4 - HyDE (Hypothetical Document Embeddings)
● Khái niệm: Dùng LLM "bịa" ra một câu trả lời giả định dựa trên câu hỏi của người dùng.
● Tại sao? Vì một đoạn văn bản trả lời (dù sai sự thật) sẽ có cấu trúc ngữ pháp, từ vựng và "hình
dáng toán học" cực kỳ giống với tài liệu thật đang nằm trong DB. Ta đem vector của "câu trả lời
giả" đi tìm "câu trả lời thật".
SƠ ĐỒ KHÁI NIỆM
Question (Câu hỏi)
LLM Hallucinates
Sinh ra câu trả lời giả định (3
câu)
Embed Hallucination
Mã hóa vector
Search DB
Tìm "câu trả lời thật"
Trực Quan Hóa Không Gian Vector Của HyDE
• Vector "Câu hỏi" và "Câu trả lời" thường nằm cách xa nhau (do định dạng ngữ pháp hoàn toàn khác
biệt).
• HyDE đóng vai trò như một "phép nội suy", kéo Query Vector về đúng cụm (cluster) không gian chứa
Document Vectors.
Code - Query Transformation (LangChain)
• Khởi tạo MultiQueryRetriever để tự động sinh nhiều câu hỏi từ 1 prompt gốc.
Python
from langchain.retrievers.multi_query import MultiQueryRetriever
prompt_template = "You are an AI assistant. Generate 3 alternative search queries for: {question}"
retriever = MultiQueryRetriever.from_llm(
retriever=vectorstore.as_retriever(),
llm=chat_model,
prompt=prompt_template
)
Đánh Đổi Hiệu Năng (The Trade-offs)
Được (Benefits)
● Cải thiện cực lớn độ chính xác và Recall.
● Xử lý được các ca người dùng "hỏi ngốc".
Mất (Costs)
● Tăng độ trễ (Latency) vì phải gọi API LLM
1 lần trước khi đụng vào Database.
● Tốn thêm chi phí (Token cost).
Checklist Cho Production

Đừng lạm dụng! Chỉ bật Query Transformation khi hệ thống gặp nhiều user queries
phức tạp/mơ hồ.

Dùng model rẻ nhất có thể (GPT-4o-mini / Haiku) cho bước này để giữ Latency <
1s.
 Kết hợp với Semantic Cache để không phải transform lại các câu hỏi phổ biến.
2.2 Dense vs. Sparse Retrieval
Meaning vs. Keywords: Comparing the semantic understanding
of dense vector embeddings against the exact-match precision
of sparse retrieval algorithms like BM25.
Hai Trường Phái Tìm Kiếm Cốt Lõi
Dense Retrieval (Tân binh AI)
Tìm theo "Ý Nghĩa" (Semantic).
Mã hóa văn bản thành mảng vector dày
đặc (ví dụ 1536 chiều).
Sparse Retrieval (Lão làng)
Tìm theo "Từ Khóa".
Dựa trên tần suất xuất hiện của từ
(BM25, TF-IDF, Inverted Index).
Mổ Xẻ Sparse Retrieval (Thuật Toán BM25)
● Trái tim của Elasticsearch và các hệ thống
search truyền thống.
● Sparse = Vector rất dài (bằng toàn bộ số
từ trong từ điển) nhưng chứa toàn số 0.
● Nguyên lý: Đánh trọng số cực cao cho các
từ hiếm (VD: "Kubernetes") và phớt lờ
các từ phổ biến (VD: "và", "là", "thì").
Sparse Vector Representation
0 0 1.2 0 0 0 5.8 0
Hầu hết các chiều là 0 (sparse). Chỉ các từ khoá
xuất hiện mới có trọng số khác 0.
Inverted Index Mechanism
Kubernetes Doc 1 Doc 42
Docker Kubernetes
Khi Nào Sparse Search Xưng Vương?
Vô địch Exact Match
● Khớp chính xác: Mã số thuế, ID nhân
viên, mã lỗi hệ thống (ERR-x09), từ viết
tắt chuyên ngành.
● Vượt qua giới hạn tập train của LLM.
● Vector nhúng thường bị "mù" trước các
chuỗi ký tự vô nghĩa hoặc chuyên biệt
này.
CASE STUDY: SEARCH QUERY "ERR-X09"
BM25 (Sparse)
Bắn trúng ngay tài liệu chứa mã lỗi chính xác.
Vector Search (Dense)
Loay hoay tìm "ý nghĩa" của x09 và đưa ra kết
quả noise.
Tử Huyệt Của Sparse Search
● Cực kỳ nhạy cảm với lỗi chính tả
(Typo). Sai một chữ cái là "Not
Found".
● Hoàn toàn không hiểu từ đồng nghĩa
(Synonyms) hoặc diễn đạt lại
(Paraphrase).
VISUAL EXAMPLE: SEMANTIC GAP
BM25 Result: 0 Results
User searches: "Tôi muốn đòi lại tiền"
Document: "Chính sách hoàn tiền"
Nhắc Lại Dense Search (Vector)
● Bù đắp mọi điểm yếu của BM25.
Không quan tâm bạn gõ "hoàn tiền",
"trả tiền", hay sai chính tả "hoang
tien". Nó hiểu "ý niệm" đằng sau
chuỗi ký tự.
● Khả năng Cross-lingual: User hỏi
bằng tiếng Việt, vector search vẫn
map đúng vào tài liệu tiếng Anh.
VISUAL EXAMPLE: DENSE SEARCH POWER
Vector Search: Success
User searches: "hoang tien" (Typo)
Document Found: "Refund Policy"
Điểm Mù (Blind Spots)
• Vector Search: Tìm ý nghĩa tốt nhưng
hụt keyword.
• BM25: Tìm keyword tốt nhưng hụt ý
nghĩa.
BLIND SPOT ANALYSIS
Scenario 1: Dense Retrieval (Vector)
Query: "Mã lỗi ERR-x09"
Result: Returns general error handling docs
(Misses exact ID).
Scenario 2: Sparse Retrieval (BM25)
Query: "Muốn lấy lại tiền"
Doc: "Chính sách hoàn trả"
Result: 0 Results (No keyword match).
Kết Luận
Tiêu chí Sparse Retrieval (Truy xuất thưa thớt) Dense Retrieval (Truy xuất dày đặc)
Cơ chế cốt lõi So khớp từ khóa chính xác (Lexical/Keyword matching). Dựa
trên tần suất xuất hiện của từ.
Tìm kiếm theo ngữ nghĩa và ngữ cảnh (Semantic search). Dựa
trên khoảng cách giữa các vector.
Biểu diễn
Vector
Vector có số chiều rất lớn (bằng kích thước toàn bộ từ vựng),
chứa chủ yếu là các giá trị 0 (sparse).
Vector có số chiều thấp và cố định (VD: 384, 768, 1536 chiều),
chứa các số thực (dense).
Thuật toán/Mô
hình TF-IDF, BM25. Các mô hình nhúng (Embedding Models) như BERT, OpenAI Embeddings, Cohere.
Điểm mạnh
- Tốc độ tính toán nhanh, chi phí phần cứng thấp.- Hiệu quả
tuyệt đối với các từ khóa hiếm, tên riêng, mã định danh (ID),
hoặc các thuật ngữ chuyên ngành đặc thù.
- Hiểu được từ đồng nghĩa, khái niệm tương đương và cấu trúc
câu.- Truy xuất tốt ngay cả khi câu hỏi của người dùng và tài liệu
gốc không dùng chung hệ thống từ vựng.
Điểm yếu
- Không hiểu được ý nghĩa của câu (sẽ thất bại nếu người
dùng sử dụng từ đồng nghĩa hoặc cách diễn đạt khác).- Dễ bị
nhiễu bởi các từ phổ biến nếu không lọc kỹ (stop words).
- Đòi hỏi tài nguyên tính toán cao hơn (thường cần GPU để tạo
embedding ở quy mô lớn).- Yêu cầu hạ tầng chuyên dụng như
Vector Database và các thuật toán tìm kiếm xấp xỉ (ANN) để
đảm bảo tốc độ.
Ứng dụng thực
tiễn
Tìm kiếm chính xác các mã lỗi, tên khách hàng cụ thể, hoặc
các tham số kỹ thuật trong tài liệu.
Nhận diện ý định và trả lời các câu hỏi tự nhiên phức tạp của
người dùng trong các hệ thống hỏi đáp (Q&A).
Nghịch Lý Enterprise RAG
● Các tutorial YouTube chỉ dạy bạn
Vector Search vì nó "nghe có
vẻ AI".
● Ở môi trường Doanh nghiệp (tra
cứu hợp đồng, log kỹ thuật, tài
liệu luật), BM25 thường quan
trọng hơn Vector.
● Nếu bỏ BM25, hệ thống sẽ
thất bại thảm hại.
2.3 Hybrid Search Deep Dive
The best of both worlds: A deep dive into Hybrid Search,
combining dense semantic vectors with sparse exact-match
keywords using Reciprocal Rank Fusion (RRF) and Alpha-tuning.
Hybrid Search: Lấy Tinh Hoa Của Cả Hai
● Khái niệm: Chạy song song cả
BM25 và Vector Search cho cùng
một câu hỏi.
● Đảm bảo hệ thống không bỏ lỡ mã
số (nhờ BM25) và cũng không lọt
ngữ nghĩa (nhờ Vector).
● Trở thành tiêu chuẩn bắt buộc cho
Production RAG hiện đại.
Bài Toán Khó: "Cam và Táo" (Score Normalization)
Vector Score
Cosine Similarity thường nằm trong khoảng
0.0 → 1.0
BM25 Score
Không có giới hạn trên, có thể từ 0 → 100+
Thách thức
Không thể cộng trực tiếp Score_Vector +
Score_BM25 để xếp hạng.
Thuật Toán Giải Quyết: RRF (Reciprocal Rank Fusion)
• Đừng gộp điểm số (Scores), hãy gộp Thứ hạng (Ranks).
RRF = 1/(k + Rank_Dense) + 1/(k + Rank_Sparse)
(Giá trị hằng số k thường được chọn mặc định là 60)
• Tài liệu nào nằm trong Top cao ở cả 2 bảng xếp hạng sẽ vươn lên vị trí số 1 tuyệt
đối.
Trọng Số Alpha (Alpha Tuning)
• Kiểm soát hệ thống nghiêng về bên nào thông qua trọng số α (0.0 đến 1.0).
• Nếu α = 1: Thuần Vector. Nếu α = 0: Thuần BM25.
Final_Score = (α × Dense_Score_norm) + ((1 - α) ×
Sparse_Score_norm)
α = 0 α = 1
Sparse (BM25) Dense (Vector)
α = 0.8
Chọn Alpha Cho Từng Domain Cụ Thể
• Hệ thống Chatbot FAQ: α = 0.7 - 0.9 (Ưu tiên hiểu ý định mơ hồ của người dùng).
• Tra cứu Code, Log, Luật pháp: α = 0.2 - 0.4 (Ưu tiên khớp chính xác tên biến,
điều khoản).
Chatbot FAQ
α = 0.8 (Semantic)
0 1
Code / Luật pháp
α = 0.3 (Keyword)
0 1
Kiến Trúc Hạ Tầng Hybrid
• Không phải Vector DB nào cũng hỗ trợ Hybrid chuẩn. Cần database hỗ trợ lưu cả Dense
vectors và Sparse/Inverted indexes cùng lúc.
Các hệ thống nổi bật hiện nay: Weaviate, Milvus, Qdrant, Elasticsearch (kết hợp plugin).
Hybrid Database Cluster
User Query
Vector Engine
Keyword Engine
RRF Module Top K
Code Python Tối Thiểu (Chạy Local)
• Khởi tạo Hybrid Retriever trong LangChain sử dụng thuật toán gộp.
from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever
# Khởi tạo 2 bộ máy độc lập
bm25_retriever = BM25Retriever.from_documents(docs)
vector_retriever = faiss_index.as_retriever()
# Gộp lại với trọng số Alpha (VD: 30% Keyword, 70% Vector)
hybrid_retriever = EnsembleRetriever(
retrievers=[bm25_retriever, vector_retriever],
weights=[0.3, 0.7]
)
Lưu Ý Về Tài Nguyên & Chi Phí
Lưu trữ (Storage)
Phải nhân đôi tài nguyên lưu trữ (Build 2
index khác nhau cho cùng 1 tập dữ liệu).
Hiệu năng (CPU Load)
Tăng tải CPU khi truy vấn do phải chạy 2
thuật toán song song.
Sự đánh đổi xứng đáng cho chất lượng Enterprise.
2.4 Re-ranking
Broad search is not enough. Discover how cross-encoders score
relevance with sniper precision, and how MMR eliminates
redundant context to optimize your LLM's token budget.
Top-k Không Phải Càng Nhiều Càng Tốt
k quá thấp
Ví dụ: top-1 hoặc top-2
Triệu chứng: thiếu chứng
cứ, recall kém
Sweet spot
Ví dụ: top-3 đến top-5
Triệu chứng: đủ chứng
cứ, ít nhiễu
k quá cao
Ví dụ: top-10 trở lên
Triệu chứng: context
nhiễu, token lãng phí
Lưu ý: Mục tiêu của retrieval không phải là lấy nhiều, mà là lấy đúng và đủ
cho generation.

<!-- page:16 -->
Vấn Đề Của Top-K (Nhìn Xa Mù Gần)
Đặc tính Retriever
● Retriever (Vector/Hybrid) được thiết
kế để quét qua hàng triệu tài liệu cực
nhanh. Nó đánh giá sự liên quan một
cách "thô và rộng".
● Hệ quả: Chứa rất nhiều ngữ cảnh
tương đồng nhưng không trực tiếp trả
lời câu hỏi. Tài liệu đúng nhất có thể
đang nằm ở Top 10, chứ không phải
Top 1.
Trực quan: Query & Results
Query: "Thủ tục xin visa"
Top 1: Giá làm visa
Top 2: Lịch sử visa
...
Top 8: Các bước làm thủ tục
Dữ liệu đúng bị "chìm" sâu
Kiến Trúc 2 Giai Đoạn (Retrieve-and-Rerank)
Quy trình xử lý
● Giai đoạn 1: Dùng Hybrid Search kéo nhanh
về Top 50-100 tài liệu. Nhanh nhưng nhiễu.
● Giai đoạn 2: Đưa Top 50 này qua một mô
hình AI khác (Re-ranker) để đọc kỹ và
chấm điểm lại sự liên quan. Lấy Top 3-5
đưa cho LLM.
Rerank Funnel Visual
Search Broad
Top-100
Rerank
Top-6
Select
Top-3
Input to LLM
Bi-Encoder vs. Cross-Encoder
Bi-Encoder (Vector DB)
● Query và Document đi qua hai luồng
nhúng riêng biệt.
● Chỉ tính khoảng cách lúc cuối. Rất nhanh.
Cross-Encoder (Reranker)
● Gắn Query và Document thành một đoạn
text duy nhất (Query + [SEP] +
Document).
● Cho qua Transformer cùng lúc. Nhờ cơ
chế Attention, model hiểu chính xác sự
tương tác giữa từng từ.
Hiệu Năng vs. Độ Chính Xác
Đặc điểm mô hình
● Cross-Encoder chấm điểm cực kỳ chính
xác (như một người đọc kiểm tra chéo).
● Nhưng nó quá chậm và tốn compute.
Không bao giờ được dùng Reranker để
quét toàn bộ database.
● Chỉ dùng cho list nhỏ đã lọt qua vòng 1.
Vấn Đề Redundancy (Trùng Lặp Thông Tin)
Hạn chế của Re-ranker
● Re-ranker có thể đưa Top 3 tài liệu tốt
nhất lên đầu. Nhưng nếu cả 3 tài liệu này
đều sao chép nội dung của nhau thì sao?
● LLM sẽ tốn token vô ích mà không có
thêm góc nhìn hay dữ kiện mới.
Minh họa Redundancy
Chunk 1
"Hoàn tiền mất 7 ngày."
Chunk 2
"Tiền sẽ về sau 7 ngày."
Chunk 3
"Thời gian xử lý hoàn tiền là 7 ngày."
Redundant Context Window!
Tối Ưu Hóa Sự Đa Dạng (MMR)
Cơ chế hoạt động của MMR
● MMR (Maximum Marginal Relevance): Thuật toán chọn lọc để tối đa hóa sự liên quan (Relevance)
nhưng phạt nặng sự trùng lặp (Redundancy).
● Bước 1: Chọn chunk liên quan nhất với Query.
● Bước 2: Chọn chunk tiếp theo vừa liên quan Query, vừa có khoảng cách vector xa nhất so với chunk số
1.
Công thức MMR
Maximize: [Similarity(Doc, Query)] - Penalty × [Similarity(Doc, Already_Selected_Docs)]
Khi Nào Dùng MMR vs. Cross-Encoder
Precision Focus
Cross-Encoder
Dùng cho các câu hỏi cần sự chính xác tuyệt đối
(Fact-checking, Legal).
Ví dụ:
"Các yêu cầu an toàn khi lắp đặt máy phát điện
là gì, và những lời khuyên về bảo trì là gì?"
Diversity Focus
MMR
Dùng cho các truy vấn mở, cần tổng hợp nhiều
góc nhìn.
Ví dụ:
"Hãy tóm tắt các điểm rủi ro của dự án A từ tất
cả các báo cáo"
Code Tích Hợp Reranker
Sử dụng Re-ranker as a Service (như Cohere) là cách tiết kiệm tài nguyên hệ thống nhất.
# Python
from langchain.retrievers import ContextualCompressionRetriever
from langchain_cohere import CohereRerank
# Gọi API Reranker (VD model multilingual cho tiếng Việt)
compressor = CohereRerank(top_n=3, model="rerank-multilingual-v3.0")
# Bọc retriever cũ bằng layer rerank
rerank_retriever = ContextualCompressionRetriever(
base_compressor=compressor,
base_retriever=hybrid_retriever
)
Bức Tranh Toàn Cảnh (The Complete Retrieval Pipeline)
Tổng hợp toàn bộ Module 2: Lộ trình từ Query đầu vào đến kết quả cuối cùng thông qua các kỹ thuật tối ưu
hóa retrieval đã học.
Query
Transformation
Hybrid Search
k = 50
Reranking
Cross-Enc/MMR
Context
Top 5 Chunks
LLM
Generation
Wrapped as an Agent Tool
Gợi ý Ta có thể gói gọn pipeline này thành công cụ cho Agentic System (LangGraph) gọi tự động.
Generation, Grounding & UX
The final mile of RAG: Mastering context injection,
enforcing strict LLM grounding to eliminate hallucinations,
and crafting an output UX that users actually trust.
3.1 Context Injection Patterns
The art of context injection: How to structure and format
retrieved data within the LLM's prompt window to maximize
retention and conquer the 'Lost in the Middle' effect.
Nếu Indexing là "xây kho", Retrieval là
"người thủ thư tìm sách", thì Generation
là "biên tập viên" tổng hợp thông tin.
Dù bạn tìm được tài liệu xuất sắc đến
đâu, nếu không biết cách "bơm" (inject)
nó vào Prompt, LLM vẫn sẽ bị ảo giác
hoặc trả lời sai định dạng.
Generation - Chặng Cuối Của Pipeline
Là nghệ thuật sắp xếp và định dạng các
chunk dữ liệu (đã retrieve) vào trong
Context Window của LLM để nó dễ đọc, dễ
hiểu nhất.
Không chỉ là nối chuỗi (text1 + text2).
Cách bạn định dạng quyết định việc LLM
có tôn trọng dữ liệu đó hay không.
[System Rules]
[Retrieved Documents]
[User Question]
THE PROMPT
Context Injection Là Gì?
Cách làm sơ khai nhất: Ghép tất cả các chunk
thành một khối văn bản dài và đặt lên đầu câu
hỏi.
● Ưu điểm: Dễ code (chỉ cần hàm .join()).
● Nhược điểm: Model không phân biệt được
ranh giới giữa các tài liệu, làm mất giá trị
Metadata.
Pattern 1 - Pre-pending (Chèn Thô)
Cách làm chuẩn Production: Sử dụng thẻ XML
hoặc định dạng JSON/Markdown để phân tách
rõ ràng từng nguồn dữ liệu.
Nhờ cấu trúc này, model dễ dàng nhận diện ID
của tài liệu để làm trích dẫn (Citation) sau
này.
<documents>
<doc id="1" source="policy.pdf">
... content document 1 ...
</doc>
<doc id="2">
... content document 2 ...
</doc>
</documents>
Pattern 2 - Structured Snippets & XML Tags
● Đừng nhồi tối đa Token chỉ vì model hỗ trợ. Càng nhiều context → Càng chậm → Càng
đắt → Càng dễ nhiễu.
● Phải chia ngân sách rõ ràng: 20% cho System Prompt/Rules, 60% cho Retrieved Context, 20% dự
phòng (Headroom) cho User Query và Output.
20%
System Prompt &
Rules
60%
Retrieved Context
20%
Headroom (Query &
Output)
Quản Lý Token Budget (Ngân Sách Ngữ Cảnh)
● Các nghiên cứu chỉ ra: LLM giống như con
người, nó nhớ rất tốt thông tin nằm ở ĐẦU
và CUỐI prompt, nhưng thường "bỏ quên"
thông tin nằm ở GIỮA nếu prompt quá dài.
● Nếu chunk chứa câu trả lời quan trọng nhất
vô tình bị xếp ở giữa danh sách, RAG có
thể thất bại.
Recall Performance
Position in Prompt
ĐẦU CUỐI
GIỮA (Lost)
Hiện Tượng "Lost in the Middle"
● Đừng ném nguyên Top K từ Reranker vào
prompt theo thứ tự 1, 2, 3, 4, 5.
● Thủ thuật Document Reordering: Sắp xếp
lại theo mẫu luân phiên. Đặt tài liệu tốt
nhất ở đầu, tốt thứ 2 ở cuối, các tài liệu
điểm thấp giấu vào giữa.
● Thứ tự đưa vào prompt: [1, 3, 5, 4, 2]
Document Reordering Strategy
Block 1 (Top 1)
Block 3
Block 5
Block 4
Block 2 (Top 2)
Re-rank
ĐẦU
CUỐI
GIỮA
Giải Pháp Cho "Lost in the Middle"
3.2 Prompt Engineering for Strict Grounding
Taming the LLM: Discover how to construct robust system
prompts that enforce strict citations, prevent hallucinations, and
gracefully handle knowledge gaps.
Grounding Là Gì?
● Grounding (Tiếp đất / Neo dữ kiện) là việc
bắt buộc LLM chỉ được phép sử dụng thông
tin từ context được cấp, nghiêm cấm dùng
"kiến thức học được từ Internet" để chém
gió.
● Mục tiêu: Nếu đổi context sai, model cũng
phải trả lời sai theo context đó. Trọng tài
duy nhất là dữ liệu nội bộ.
Anatomy Của Một Prompt RAG Chuẩn
Một System Prompt tốt cho RAG cần 4 phần cốt lõi:
1. Role
Định hình nhân vật
(VD: "Bạn là trợ lý
pháp chế nội bộ...").
2. Task
Trả lời câu hỏi người
dùng.
3. Context
Cung cấp tài liệu từ hệ
thống Retrieval.
4. Strict
Constraints
Quy tắc "bàn tay sắt"
(Cấm bịa, bắt buộc
trích dẫn).
Ép Buộc Trích Dẫn (Forcing Citations)
● RAG mất đi 50% giá trị nếu model không
chỉ ra được nó lấy câu trả lời từ dòng nào,
tài liệu nào.
● Trong Constraint, cần chỉ thị rõ: "Khi đưa
ra một tuyên bố, phải trích dẫn ID của
document trong ngoặc vuông, ví dụ
[doc_1]."
PROMPT SNIPPET
ALWAYS cite your sources using the
<doc_id> provided.
RESULTING OUTPUT
"Nhân viên được nghỉ 12 ngày phép
[doc_3]."
Nghệ Thuật Nói "Tôi Không Biết"
● Đây là tính năng quan trọng nhất của RAG:
Biết giới hạn của mình (Graceful
Degradation).
● Nếu Top K chunks mang về không chứa câu
trả lời, model phải từ chối thay vì cố gắng
đoán mò.
PROMPT LINE
If the context does not contain the
answer, reply EXACTLY with: "Dữ liệu
hiện tại không đủ để tôi trả lời câu hỏi
này." Do not attempt to guess.
Graceful Degradation
● Thay vì chỉ nói "Không biết" cụt lủn
gây ức chế cho người dùng.
● Hãy prompt để model gợi ý: "Tôi không
tìm thấy chính sách này trong kho tài
liệu HR năm 2026. Bạn có muốn tôi
tìm kiếm rộng hơn hoặc liên hệ bộ
phận nhân sự không?"
BAD CHATBOT
"Tôi không biết."
GOOD CHATBOT
"Tôi chưa tìm thấy [X],
nhưng bạn có thể thử
hỏi lại với từ khóa [Y]
hoặc tạo ticket cho IT."
Chain of Thought (CoT) Trong Generation
● Yêu cầu model "suy nghĩ ra nháp" trước khi in
ra câu trả lời cuối.
● Chỉ thị: "Đầu tiên, hãy lọc ra các câu liên
quan trong context. Phân tích chúng trong
thẻ <thought_process>. Sau đó mới tổng
hợp thành câu trả lời."
● Tăng độ chính xác lên đáng kể đối với các câu
hỏi so sánh hoặc suy luận logic từ tài liệu.
INTERNAL REASONING
<thought_process>
1. Comparing doc A and B...
2. Found conflict in dates...
3. Reconciling...</thought_process>
FINAL ANSWER
Dựa trên phân tích tài liệu, câu trả lời chính xác
nhất là phương án B vì các lý do sau đây: ...
Code Snippet: LangChain Prompt Template
● Cách lắp ghép linh động các thành phần Context và User Question vào trong Prompt.
PYTHON SNIPPET
rag_prompt_template = """
You are a strictly grounded assistant.
Answer the user's question using ONLY the context below.
If you cannot answer, say "I don't know".
Always cite the [source_id].
<context>
{formatted_context}
</context>
Question: {question}
Answer:
"""
3.3 Output Formatting & UX
Learn how to design an enterprise-grade Output UX, featuring
inline citations, transparent source blocks, and fluid streaming
states that build user trust.
UX Trong RAG Quyết Định Độ Tin Cậy
Người dùng doanh nghiệp không quan tâm bạn dùng thuật toán MMR hay HNSW. Họ chỉ nhìn vào giao diện cuối cùng.
Một khối text đặc chữ sẽ tạo cảm giác lười đọc và nghi ngờ. Cần thiết kế đầu ra có tính "scannable" (dễ quét mắt).
CÁCH CŨ: KHÓ THEO DÕI
Dựa trên báo cáo quý 3, doanh thu đạt 5.2
tỷ USD, tăng 12% so với cùng kỳ năm ngoái
nhờ vào việc tối ưu hóa chi phí vận hành tại
khu vực Đông Nam Á trong khi đó tỷ lệ giữ
chân khách hàng vẫn duy trì ở mức 85%
mặc dù có sự cạnh tranh gay gắt từ các đối
thủ mới nổi và kế hoạch cho quý 4 sẽ tập
trung vào việc mở rộng mảng dịch vụ đám
mây với mục tiêu tăng trưởng thêm 15%
thông qua các gói ưu đãi dành cho khách
hàng trung thành đã sử dụng dịch vụ trên 2
năm.
CÁCH MỚI: SCANNABLE UX
Kết quả kinh doanh Quý 3:
● Doanh thu: 5.2 tỷ USD (+12% YoY)
● Động lực chính: Tối ưu vận hành tại Đông
Nam Á.
● Khách hàng: Tỷ lệ giữ chân ổn định ở mức
85%.
Kế hoạch Quý 4:
● Mở rộng dịch vụ đám mây (Mục tiêu +15%).
● Ưu đãi cho khách hàng trung thành (>2
năm).
Inline Citations (Trích Dẫn Trong Dòng)
• Giống Wikipedia: Đặt các
reference ID ngay sát bên cạnh thông
tin kiện.
• Góc độ UI/UX: Các ID này (ví dụ
[1], [2]) nên là hyperlink. Khi
hover/click vào, nó sẽ popup ra đoạn
text gốc để user đối chiếu nhanh.
AI ASSISTANT MOCKUP
Hoàn tiền diễn ra trong 7 ngày [1]
Source: Refund_Policy.pdf
Section 3: All verified claims are
processed within 7 business days.
Source Blocks / Footnotes (Khối Nguồn Tham Khảo)
• Ở cuối mỗi câu trả lời, luôn tổng
hợp lại một danh sách các tài liệu đã
được sử dụng.
• Cung cấp URL hoặc nút "Mở tài liệu
gốc" để người dùng đi sâu vào nghiên
cứu nếu cần.
AI ASSISTANT MOCKUP
Theo tài liệu v4.0, thiết bị của bạn được bảo hành 12
tháng kể từ ngày kích hoạt.
Nguồn tham khảo:
1. Chính sách bảo hành v4.0 (Tỷ lệ khớp: 92%)
2. Ticket lỗi #8892 - Jira
➜ Mở tài liệu gốc
Hiển Thị Mức Độ Tự Tin (Confidence Score/Tags)
• Đưa thêm tín hiệu từ hệ thống
Retrieval ra thẳng UI.
• Nếu điểm số Re-ranker thấp: Gán
nhãn cảnh báo độ liên quan.
• Giúp quản lý kỳ vọng của người
dùng.
AI ASSISTANT MOCKUP
Dựa trên các tài liệu tìm thấy, quy trình hoàn tiền
mất khoảng 7 ngày làm việc.
⚠ CẢNH BÁO ĐỘ TIN CẬY THẤP
Dữ liệu tìm thấy có độ liên quan thấp, câu trả lời có
thể không chính xác.
Trải Nghiệm Streaming & "Working" State
• Hệ thống RAG chạy qua nhiều
bước thường mất 3-5 giây, dễ làm
user tưởng app bị treo.
• Giải pháp UX: Hiển thị các bước
đang chạy và dùng chế độ
Streaming khi có text.
AI ASSISTANT MOCKUP
Đang tìm kiếm trong kho HR...
Đang đọc 5 tài liệu...
Dựa trên chính sách nghỉ phép năm 2026...
Nhân viên có hơn 3 năm thâm niên được hưởng
15 ngày phép |
3.4 Generation Failures
Learn to diagnose and troubleshoot common generation failures,
from conflicting documents to dangerous LLM
over-extrapolation.
Khi Generation Đổ Vỡ Dù Retrieval Làm Tốt
• Không phải lúc nào lỗi cũng do DB. Có những lúc hệ thống tìm về
đúng tài liệu xuất sắc, nhưng LLM vẫn "vấp ngã" ở bước cuối.
• Đây là lúc phải Debug Prompt và Temperature của model.
"Good Context + Bad Prompt
= Bad Answer"
Lỗi 1 - Xung Đột Ngữ Cảnh (Conflicting Context)
Tình huống: Retriever mang về 2 tài liệu. Tài
liệu A (năm 2024) bảo nghỉ 12 ngày. Tài liệu B
(năm 2026) bảo nghỉ 14 ngày.
Hệ quả: LLM bị bối rối, có thể cộng gộp, báo
lỗi, hoặc chọn bừa.
Khắc phục: Dặn dò trong prompt: "Nếu có mâu
thuẫn, ưu tiên tài liệu có ngày cập nhật mới
nhất, hoặc liệt kê cả 2 và chỉ ra sự mâu thuẫn."
Lỗi 2 - Over-extrapolation (Suy Diễn Quá Đà)
Khắc phục: Strict Grounding: "Không tự ý suy
luận các điều kiện không được đề cập rõ ràng."
Tình huống: Tài liệu ghi "Miễn phí ship cho đơn
trên 500k ở Hà Nội". Người dùng hỏi "Thế ở HCM
thì sao?".
Hệ quả: Tài liệu không nói về HCM, nhưng LLM
tự suy diễn logic "Hà Nội được thì HCM chắc cũng
được" → Ảo giác (Hallucination).
Lỗi 3 - Bỏ Qua Rào Cản (Ignored Constraints)
Tình huống: Đã dặn model phải trích dẫn ID, nhưng khi sinh ra text, model quên bẵng mất tiêu.
Thường xảy ra với model nhỏ (ví dụ 8B tham số) hoặc khi context quá dài.
Khắc phục:
● Đặt các rule quan trọng nhất ở CUỐI prompt (gần chữ Answer: nhất).
● Giảm tham số temperature = 0 (làm cho output deterministic và bớt sáng tạo).
Troubleshooting Generation (Quy Trình Debug)
• Nếu app trả lời sai, hãy in log (print) biến formatted_context ra console trước tiên.
• Nếu context có chứa đáp án → Lỗi do Generation (Sửa prompt, thêm CoT, đổi model).
• Nếu context KHÔNG chứa đáp án → Lỗi do Retrieval (Quay lại Phần 2).
Is the answer in the
retrieved context?
Fix Retrieval/ No Yes
Chunking Fix Prompt
Evaluation, Production & Next Steps
Learn how to quantitatively evaluate your RAG pipeline
using the Evaluation Triad, and preview the transition into
complex, multi-agent workflows.
4.1 The RAG Evaluation Triad
Discover the RAG Evaluation Triad—Context Recall, Faithfulness,
and Answer Relevance—to quantitatively measure and debug
your system's true performance.
"Vibe check": Nhập thử 3-5 câu hỏi,
thấy mượt mà rồi kết luận Ready. Đây
là cái bẫy chết người!
Thay đổi nhỏ (ví dụ chunk 1000 ➔ 500)
có thể tốt cho 10 câu này, nhưng lại
làm hỏng 100 câu khác.
Phải có Framework định lượng
(Automated Metrics)
Hình minh họa: Rủi ro khi chỉ kiểm thử thủ công
Vibe Check Là Không Đủ (Why Evaluate?)
Khung Đánh Giá RAGAS (RAG Assessment)
● Không thể chấm điểm RAG bằng 1 con số
duy nhất. Phải tách bạch lỗi do
Retriever (tìm sai) hay lỗi do
Generator (nói bậy).
● Khung RAGAS chia thành 3 trục cốt lõi
(The Triad): Context Recall,
Faithfulness, và Answer Relevance.
Answer
Relevance
Context
Recall Faithfulness
RAGAS
Context Recall (Độ Phủ Ngữ Cảnh)
Định nghĩa
Retriever có mang về đủ thông tin cần thiết để trả lời trọn vẹn câu hỏi không?
Bài toán
Nếu câu hỏi cần 3 chứng cứ (A, B, C), nhưng hệ thống chỉ tìm được A và B → Recall
thấp.
Cách khắc phục
● Tối ưu hóa Vector DB
● Dùng Hybrid Search
● Tăng Top-K
Faithfulness (Độ Trung Thực)
Định nghĩa
Câu trả lời có bám sát 100% vào tài liệu
không, hay đang tự bịa thêm (Hallucinate)?
Nguyên lý
Nếu Context là "A", mà LLM trả lời "A + B",
độ trung thực sẽ bị trừ điểm nặng nề.
Cách khắc phục
● Tinh chỉnh System Prompt
● Ép buộc trích dẫn (Citations)
● Giảm Temperature về 0
Ví dụ
Context:
"Sản phẩm A màu đỏ."
LLM Answer:
"Sản phẩm A màu đỏ và được bảo
hành 1 năm."
⚠ Lỗi Hallucination (Bịa thông tin)
Answer Relevance (Độ Trọng Tâm)
Định nghĩa
Câu trả lời có đi thẳng vào vấn đề người
dùng hỏi không, hay đang trả lời vòng vo,
dông dài?
Vấn đề
Đôi khi LLM trung thực với Context,
nhưng Context lại không liên quan đến
câu hỏi, dẫn đến một câu trả lời "đúng sự
thật nhưng vô dụng".
Ví dụ
User Question:
"Thời gian bảo hành của sản phẩm
A?"
LLM Answer:
"Sản phẩm A này rất tốt và có màu
xanh, ..."
⚠ Trả lời không đúng trọng tâm (Low
Relevance)
Mô Hình LLM-as-a-Judge (Dùng AI Chấm Điểm AI)
Vấn đề & Giải pháp
● Làm sao để tính được 3 điểm số trên
tự động cho hàng nghìn câu hỏi?
Con người không thể ngồi đọc
tay.
● Sử dụng một LLM "Thầy Giáo" (phải
là model rất mạnh như GPT-4o
hoặc Claude 3.5 Sonnet) để đọc
và chấm điểm LLM "Học Sinh" (hệ
thống RAG của bạn).
LLM-as-a-Judge
Golden Dataset (Xây Dựng Bộ Câu Hỏi Vàng)
Chuẩn bị dữ liệu
Để chạy RAGAS, bạn cần chuẩn bị một File Excel/CSV chứa khoảng 50-100 mẫu thử cực
tốt.
Các cột bắt buộc
● Question: Câu hỏi
● Ground Truth: Câu trả lời đúng mà
con người kỳ vọng
● Contexts: Tài liệu gốc chứa đáp án
Yêu cầu nội dung
Phải bao gồm đa dạng các loại câu hỏi để
đánh giá toàn diện hệ thống:
● Câu hỏi đánh đố
● Câu hỏi mơ hồ
● Câu hỏi không có trong tài liệu
Code Tối Thiểu - Chạy Vòng Lặp Eval (Ragas)
Ví dụ Python cách nạp dữ liệu và xuất bảng điểm báo cáo tự động.
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevance, context_recall
# dataset chứa câu hỏi, câu trả lời sinh ra, và context
result = evaluate(
dataset,
metrics=[context_recall,faithfulness,answer_relevance],
llm=gpt4_judge)
print(result.to_pandas())
4.2 A/B Testing & Scorecards
Learn how to isolate variables through rigorous A/B testing and
interpret evaluation scorecards to drive data-backed
improvements in your RAG pipeline.
Kỷ Luật Tuning (Cô Lập Biến Số)
Nguyên tắc sống còn
Chỉ thay đổi MỘT biến số trong mỗi lần thử nghiệm (A/B Test).
Nếu bạn vừa đổi kích thước chunk, vừa đổi thuật toán Hybrid, vừa đổi System Prompt →
Không biết chính xác yếu tố nào mang lại thành công.
Trình bày & So sánh
● Trình bày kết quả trực quan cho các Stakeholder (Sếp/PM) xem.
● So sánh điểm số trung bình của toàn bộ 100 câu test trước và sau khi thay đổi thuật
toán.
Case Study: Đưa Hybrid Search Lên Bàn Cân
Ví dụ thực tế
Chuyển từ Thuần Vector (Dense) sang
Hybrid (BM25 + Vector).
Kết quả trên bảng điểm
● Context Recall tăng vọt từ 60%
lên 90% (vì bắt được các mã lỗi
chính xác).
● Kéo theo Faithfulness tăng.
So Sánh Hiệu Suất Context Recall
60%
90%
V1: Dense Only V2: Hybrid
100%
50%
0%
Đọc Vị Lỗi Qua Bảng Điểm (Diagnostics)
Nhìn vào điểm số để bắt bệnh
● Recall Cao + Faithfulness Thấp:
Tìm đúng tài liệu, nhưng model bị ảo
giác hoặc bị lú vì prompt viết quá dở.
→ Sửa Generation.
● Recall Thấp + Faithfulness Cao: Hệ
thống đang ngoan ngoãn nói "Tôi
không biết" vì không tìm thấy tài liệu.
→ Sửa Indexing/Retrieval.
Context Recall (Thấp → Cao)
Faithfulness
(Thấp
→
Cao)
Fix Search
Recall thấp
Fix Prompt
Faithfulness thấp
Optimal
Production Ready
System Failure
Fix Both
ROI Của RAG (Chi Phí vs. Chất Lượng)
Phân tích kỹ thuật & kinh tế
● Kỹ thuật Cross-encoder Reranker giúp
tăng Answer Relevance thêm 5%.
● Nhưng nó làm thời gian phản hồi
(Latency) tăng từ 1s lên 4s, và chi
phí Server tăng gấp đôi.
● Bài toán của Kỹ sư trưởng: 5% độ
chính xác đó có đáng giá với trải
nghiệm chậm chạp của người dùng
không?
5% Quality
Boost
$500/month
extra
+ 3s latency delay
Tự Động Hóa CI/CD Cho Dữ Liệu
Kiểm soát hành vi AI trong
Pipeline
● Code RAG không giống code
Web. Khi đẩy code RAG lên
Production, bạn không test
hàm/logic, bạn test "Hành vi
của AI".
● Hãy tích hợp vòng lặp RAGAS
vào GitHub Actions. Nếu điểm số
Faithfulness < 80%, hệ thống
tự động block lệnh Deploy.
Push Build LLM Judge
Evaluation Deploy
Block if Fail
4.3 Preview: The Agentic Future
Prepare for the agentic future where the LLM evolves into a
reasoning engine, and your complex retrieval pipeline becomes
just one tool in a multi-agent workflow.
Giới Hạn Của Single-Pass RAG (Tại sao phải tiến hóa?)
RAG truyền thống là luồng một
chiều: Nhận câu hỏi → Tìm 1 lần →
Trả lời.
"Dựa vào báo cáo tài chính quý 1, hãy
lấy doanh thu trừ đi chi phí nhân sự
và so sánh tỷ lệ đó với đối thủ Apple"
Hạn chế: RAG không biết làm toán
phức tạp và không thể tự động tìm
kiếm thông tin bên ngoài.
Chuyển Đổi Mô Hình: Từ RAG Sang Agent
RAG
LLM là "Cái miệng"
Tổng hợp thông tin đã được mớm sẵn từ hệ
thống truy xuất.
AGENT
LLM là "Bộ não"
Reasoning Engine: Tự lập kế hoạch, quyết
định công cụ và thực hiện vòng lặp (Loop)
xử lý.
Retriever Giờ Chỉ Là Một "Công Cụ"
● Trong thế giới Agent, toàn bộ module
Retrieval khổng lồ ta vừa học hôm nay
sẽ được đóng gói lại thành một hàm
Python đơn giản:
search_internal_docs(query: str).
● LLM sẽ tự quyết định: "À, câu hỏi này
cần luật nội bộ, mình sẽ gọi Tool này.
Câu hỏi kia hỏi về thời tiết, mình sẽ
không gọi Tool này."
Multi-Agent Systems
● Khi hệ thống lớn lên, một Agent không
thể ôm đồm mọi việc (quá tải System
Prompt).
● Cần chia nhỏ thành các Worker (Nhân
sự): 1 RAG Agent chuyên đọc tài liệu, 1
SQL Agent chuyên đọc số liệu, 1
Supervisor Agent làm sếp chỉ việc.
● Ngày 09: Chúng ta sẽ dùng LangGraph
để vẽ sơ đồ giao tiếp cho các Agent này.
LANGGRAPH
Supervisor
HR_Doc
RAG Agent
Finance_SQL
SQL Agent
Web_Search
Search Agent
Hands-on 8
Biến artifact Day 07 thành full RAG pipeline có retrieval,
prompt grounding, test set.
Lab 8: Full RAG Pipeline
Nâng cấp hệ thống Day 07 để trả lời grounded hơn, đo được hơn, và dễ
giải thích hơn với stakeholder kỹ thuật lẫn sản phẩm.
1. Index bộ tài liệu domain nhỏ với metadata rõ ràng
2. Build baseline retrieval + answer function
3. Thử hybrid hoặc rerank ở mức tối thiểu nếu phù hợp
4. Tạo 10 test questions với expected evidence
5. Chấm kết quả theo scorecard trước và sau tuning

<!-- page:29 -->
Deliverable Cần Nộp
Code + data
■ script indexing
■ retrieval / answer
function
■ bộ docs nhỏ đã index
Eval artifact
■ 10 test questions
■ expected answer / evidence
■ scorecard trước và sau
tuning
Lưu ý: Không cần build hệ thống phức tạp. Điều quan trọng là chứng minh
được vì sao bản tuning tốt hơn baseline.

<!-- page:30 -->
Khung Nghĩ Để Tuning RAG Sau Buổi Học
1. Index sạch chưa? text, metadata, freshness ổn chưa?
2. Retrieve đúng chưa? dense-only có đang miss keyword hay alias không?
3. Có cần rerank không? top-k hiện tại có trùng lặp nhiều không?
4. Prompt có grounded không? model có biết từ chối khi thiếu chứng cứ
không?
5. Eval có nói thật không? testset đã đủ các câu khó và câu mơ hồ chưa?

<!-- page:30 -->
Tổng kết — Key Takeaways
Những ý chính cần nhớ trước khi sang bài tiếp theo
RAG là sự phối hợp giữa indexing, retrieval, và generation; thiếu bước nào cũng
dễ làm hệ thống trả lời sai.
Retrieval quality > generation polish trong nhiều bài toán thực tế. Search sai thì
prompt đẹp đến đâu cũng khó cứu.
Hybrid retrieval và rerank là hai đòn bẩy rất thực dụng khi dense-only bắt đầu bộc
lộ giới hạn.
RAG muốn tốt lên phải có test set + scorecard + A/B tuning, không thể dựa vào
cảm giác.

<!-- page:31 -->
Tài Liệu Tham Khảo
1. Lewis et al. (2020), Retrieval-Augmented Generation for Knowledge-Intensive NLP
Tasks.
2. OpenAI Docs, Retrieval Guide và File Search Guide.
3. LangChain, RAG from Scratch notebooks.
4. LlamaIndex Docs, Starter Example.
5. RAGAS Docs, Evaluation metrics for RAG systems.
6. Cohere Docs, Rerank overview.

<!-- page:33 -->
Hỏi & Đáp
Bạn đang thiếu model mạnh hơn, hay đang
thiếu một pipeline retrieval và evaluation đủ
kỷ luật?
