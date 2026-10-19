# Nền tảng dữ liệu - Embedding, Chunking, Vector Store

<!-- page:1 -->
Data Foundations
AICB-P1 · Ngày 7 · Embedding, Chunking & Vector Store
TênGiảng Viên
VinUniversity · Phase 1 · Tuần1· 2026

<!-- page:2 -->
?
HÃYSUY NGHĨ...
“Agent trả lời sai vì model yếu, hay vì
nó không có đúng dữ liệu để suy luận?”
Giữcâu hỏi này trong đầukhi học bài hôm nay

<!-- page:3 -->
NộiDung Bài Học
1. Datastrategy & agent memory
2. Lịchsử: từ TF-IDFđến embedding
3. Embeddings— bản chất
4. Embeddingmodel landscape 2026
5. Documentextraction (PDF,Excel,
HTML…)
6. Chunking& chuẩn bị tài liệu
7. Vectorstore internals (ANN)
8. FAISS,ChromaDB & landscape
9. Metadatafilter & hybrid search
10. Frontier2025–26
11. Đolường, chi phí & failuremodes
12. Bảomật & quyền riêng tư
13. Lab7 + Key takeaways

<!-- page:4 -->
MụcTiêuNgày 7
■ Phânbiệt đượcknowledgedata, operational data, contextual data
■ Hiểuembeddinglàlớp biểu diễn nghĩa —cơ chế, cách huấn luyện, vàgiới hạn
■ Bócđược text ra khỏi filethật—PDF,Excel, HTML — và biếtcái gì bị mất im lặng
■ Chọnđược chunkingstrategy vàgiải thích được đánh đổicủa nó
■ Giảithích đượcANNindex (IVF,PQ, HNSW) đủ để chỉnh thamsố, không chỉ gọi API
■ Nhậndiện được cácfailuremode im lặng—lỗi không ném exception nhưngphá recall
■ Buildđược mộtminiretrieval integrationnốiagent với dữ liệu riêng

<!-- page:5 -->
DeliverableCuối Ngày
Artifactpack cần nộp
Datainventory+chunking/embeddingscript+vectorstoreindex+semanticsearch
demo+ retrieval-enabled answer function
■ 1bộ dữ liệu mẫu đã đượcchunk và index
■ 1script truy vấn semantic search cótrả kết quả liên quan
■ 1hàm trả lời sử dụng contextretrieve được thay vì hỏi LLM“chay”
■ 1bảng đorecall@5trêntối thiểu 10 câu hỏi tựsinh

<!-- page:6 -->
Data Strategy Cho Sản Phẩm AI
Khi ai cũng gọi được model mạnh qua API, câu hỏi đã đổi từ
“dùng model nào? sang “agent được phép biết gì, và có đúng
dữ liệu để suy luận không?

<!-- page:7 -->
GarbageIn, Garbage Out — DataQuyết Định Output
Dữliệu bẩn / thiếu
■ PDFscan lỗi OCR
■ Policycũ, chưa cập nhật
■ Chunkcắt giữa câu
■ Khôngcó metadata
Kếtquả: agenthallucinate,trảlờisai,
usermất niềm tin.
Dữliệu sạch / đầy đủ
■ Textđã chuẩn hóa, metadata đầy
đủ
■ Nguồnrõ ràng, có version
■ Chunktheo section hợp lý
■ Filterđược theo category +
freshness
Kết quả: retrieve đúng, answer
grounded,có trích nguồn.

<!-- page:8 -->
3Loại Data Agent Cần
Loạidata Đặcđiểm Vídụ Retrievalfit
Knowledge Ítthayđổi,dạngtextdài,
cầnchunk + embed
FAQ,SOP,chínhsách,hợp
đồng,tài liệu kỹ thuật
Rất cao — lý tưởng
chovector store
Operational Thay đổi liên tục, dạng
structured (SQL / JSON
/logs)
Trạngtháiđơnhàng,CRM,
ticket,tồn kho
Thấp — dùng func-
tion calling / SQL,
khôngembed
Contextual Gắn với session / user
hiệntại, ngắn gọn
User profile, lịch sử hội
thoạigần nhất, giỏ hàng
Trung bình — inject
trực tiếp, ít khi cần
semanticsearch
Knowledge data phù hợp retrieval; operational data cần query có kiểm soát; contextual data nên inject ngắn và đúng lúc

<!-- page:9 -->
DataGovernance & PII Masking TrướcKhi Embed
Governancetrước khi index:aisở hữu & cập nhậtdữ liệu·aiđược truy cập (ACL vspublic nội bộ)·baolâu re-index ·
PIIcó cần mask không —□ không“cứ nạp hết vào vectorDB đã”.
LoạiPII Vídụ Kỹthuật mask Rủi ro nếu bỏ
qua
Têncá nhân “NguyễnVăn A” Thaybằng [PERSON] Trungbình
Sốđiện thoại “0912-xxx-xxx” Regexreplace Cao
Email “user@email.com” Hashhoặc remove Cao
CMND/ CCCD “012345678901” Xóahoàn toàn Rấtcao
Địachỉ “123Lê Lợi, Q.1” Generalize thành “Q.1,
HCM”
Trungbình
Masktrước khi embed—không bao giờ lưu rawPII trong vector store.Vector không phải dữ liệu đã ẩn danh —
embedding có thể bị đảo ngược gần đúng nguyên văn (Morris et al., EMNLP 2023; ALGEN 2025). Đầy đủ ở §11 — Bảo
mật & Compliance.

<!-- page:10 -->
MemoryLifecycle & Cái Gì KHÔNGPhải Memory
Capture Filter Store Retrieve
Sự kiện nào
đáng lưu?
PII? quality?
relevance?
vector / DB
/ profile
truy khi có
ích cho câu
hỏi hiện tại KHÔNGtự động là
memory: promptdài hơn ·filePDF upload một lần khôngtruy lại có chủ đích·toànbộ chat history·“lưucho chắc” —
nhữngthứ này thường tạo nhiễuhơn là hữu ích.
Khungnghĩ đúng — và đừngnhầm với retrieval
Memorylà data+policy+retrieval ;thiếumộttrongbathìhệthốngkhóổnđịnh. Retrievaltìmcontextchocâuhỏi
hiện tại (relevance, grounding);memory giữ trạng thái người dùng qua thời gian (continuity). Nhầm hai khái niệm
làlý do agent “quên” contextvừa retrieve ở lượt sau. Vocabchuẩn:working/ episodic / semantic /procedural.

<!-- page:11 -->
Document →Chunk →Embed →Store →Query →Inject
Document Chunk Embed Store Query Inject
PDF, docs, HTML chia theo
section / token vector hóa index + metadata semantic search prompt grounded
Đâylà trục xương sống củacả Ngày 7
Mọi phần tiếp theo hôm nay chỉ đào sâumột mắt xíchtrong pipeline này:Chunk
→phầnChunking, Embed →phầnEmbeddings, Store →phầnVectorStore(Chro-
maDB/FAISS)vàANNinternals, Query →phầnRetrieval&HybridSearch, Inject →
phầnKết nối Agent với Data vàEval.

<!-- page:12 -->
Lịch Sử: Từ TF-IDF Đến Embed-
ding
Embedding + cosine similarity là ý tưởng từ 1975 — cái thay đổi
là vector đến từ đâu, không phải hình học

<!-- page:13 -->
VấnĐề Gốc: VocabularyMismatch
■ Lexicalsearch (TF-IDF,BM25) chỉ
khớpkhi đúngtừ xuấthiện ở cả
querylẫn document.
■ IDF(SpärckJones, 1972): từhiếm
đượctính trọng số cao hơn từphổ
biến— nền tảng của TF-IDF.
■ BM25(Robertson& Spärck Jones,
giớithiệu tại TREC-3,1994)— vẫn là
baselinelexical chuẩn mực đến 2026.
Vídụ thất bại
Query: “chính sách hoàn tiền” . Doc-
ument chỉ viết: “quy định đổi trả sản
phẩm”. Không từ nào trùng khớp⇒
BM25/TF-IDF không tìm ra, dù nghĩa
gầnnhư giống hệt.
Lưuý: BM25không“lỗithời”: BEIR(2021,18dataset)chothấyđâyvẫnlàbaseline
mạnh—mộtdensemodelfine-tunetrênMSMARCOcóthể thuaBM25khirangoài
domainhuấn luyện.

<!-- page:14 -->
MộtBảng, 50 Năm: Lexical→Latent →Dense
Năm Cộtmốc Ýnghĩa
1972 SpärckJones — IDF Từhiếm đáng giá hơn từphổ biến
1975 Salton— VectorSpace Model Vănbản/query = vector,sobằng hình học
1990 Deerwester— LSA/LSI SVDnéncòn ∼100chiều“kháiniệm”—tổtiên
củadense embedding
1994 Robertson— BM25 (TREC-3) Baselinelexical chuẩn mực đến hômnay
2013 Mikolov— word2vec Denseword vector đầu tiên ởquy mô web
2016 Malkov& Yashunin— HNSW GraphANN—defaultindexcủahầuhếtvector
storehôm nay
2018/19 Devlin— BERT Contextualencoder,giới hạn 512token
2019 Reimers& Gurevych — SBERT Sửa hình học similarity mà BERT thô không
làmđược
2020 Karpukhin— DPR DenseretrievalvượtBM25(+9đến+19%top-
20accuracy)
2025–26 Decoder-LLMembedder + MRL + quantization “Table stakes”: Qwen3-Embedding, Gemini
Embedding2, Voyage4
Bỏ bớt các mốc phụ để giữ một trang; chi tiết từng mốc nằm ở các frame sau và trong RESEARCH companion

<!-- page:15 -->
VìSao Raw BERT Tệ ChoSimilarity Search?
Cross-encoder: BERT gốc
So hai câu ⇒ BERT (2018/19) — 512-
tokencap — cần joint attention.
■ Muốnsohaicâu ⇒phảiđưa cảcặp
quaBERTcùng lúc.
■ Sokhớp giữa 10.000 câu⇒ ∼50
triệuphép suy luận.
■ ∼65giờ trênGPU để tìm cặp giống
nhaunhất.
Train cho masked-LM, không cho pooled
similarity — không báo lỗi, chỉ cho vector
không so sánh được.
Bi-encoder: SBERT (2019)
Reimers & Gurevych (EMNLP 2019):
siamese network, contrastive fine-tune
trênNLI.
■ Encodemỗi câumộtlần,độc lập ⇒
vectorcố định, precompute trước.
■ Sosánh bằng cosine similarity,
khôngcần chạy lại BERT.
■ Cùngbài toán: ∼5giây —độ chính
xáctương đương trên STS.
Đây là lý do vector store precompute em-
bedding tài liệu một lần rồi query nhanh.

<!-- page:16 -->
Embeddings — Bản Chất
Embedding không phải phép màu; nó là một hàm học được, và
hình học của nó là sản phẩm phụ của mục tiêu huấn luyện

<!-- page:17 -->
EmbeddingLà Gì — Cơ ChếThật, Không Phải Phép Màu
Embedding — Hàm học được biến dữ liệu thô (text, ảnh, audio) thànhvector số
cùngchiều,sao cho “gần nghĩa”→“gầnhình học”.
Mộtpipeline cụ thể, chạy trên GPU/CPUcủa ai đó:
1. Tokenize: cắt câu thànhsubword token
2. Encoder: token qua nhiềulớp Transformerself-attention→vector theo ngữ cảnh
3. Pooling: gộp vector tokenthànhmộtvectorcâu — mean, last-token, hoặc[CLS]
Poolingkhông trung lập
jina-embeddings-v5: meanpooling(v4) →last-token—mấtLateChunking,vốncần
vectortheo token. Đổipooling là đổi cả model.

<!-- page:18 -->
CôngThức: Đừng Sợ,Chỉ Có 2 Dòng
CosineSimilarity
cos(⃗A, ⃗B) =
⃗A · ⃗B
∥⃗A∥ ∥⃗B∥
■ Tử: tích vô hướng(dot product)
■ Mẫu: tích hai độdài đã chuẩn hoá
■ 1=cùng hướng, 0=vuông góc, −1=
ngượchướng
EuclideanDistance
d(⃗A, ⃗B) =
vuut
nX
i=1
(Ai − Bi)2
■ Khoảngcách “đường chim bay”n
chiều
■ 0=trùng nhau, càng lớn = càngxa
Khôngcần tự code
Hầuhếtvectorstoremặcđịnhdùngcosine—hiểuscore 0.87sovới 0.31nghĩalàgì
(framesau).

<!-- page:19 -->
BàiTập Nhanh: TínhCosine Similarity Bằng Tay
Cặp1
⃗A = [1, 2, 3]
⃗B = [2, 4, 6]
cos(⃗A, ⃗B) = ?
Gợiý: ⃗A · ⃗B = 1×2 + 2×4 + 3×6
Cặp2
⃗C = [1, 0, 0]
⃗D = [0, 1, 0]
cos(⃗C, ⃗D) = ?
Gợiý: hai vectornày có điểm chung nào
không?
Tính trên giấy hoặc máy tính (3 phút), so đáp án với người bên cạnh.
Lưuý: Cặp1cócosine = 1.0dù ⃗B = 2⃗A. Vìsao? Điềunàynóigìvềcosinesimilarity
sovới Euclidean distance?

<!-- page:20 -->
Myth: “Cosine Similarity =Độ Liên Quan Thật”
Lưuý: Steck,Ekanadham&Kallus(Netflix+Cornell), Is Cosine-Similarity of Embed-
dings Really About Similarity?,WWW2024: cosinesimilaritycủaembeddingđãhọc
“canyieldarbitraryandmeaninglesssimilarities” —vớilinearmodelregularized,
cosinekhôngxác định duy nhất.
Nguồn: arXiv:2403.05440, WWW’24.
■ Regularizationdeep learning tác động “implicit vàunintended” lên cosine.
■ Mộtsố trường hợp, cosine tệ hơndot product chưa chuẩn hoá.
Cáchdạy đúng
Cosinelà conventionhiệuquả,khôngphải sựthật vềýnghĩa. “Metricmặcđịnh”là
lựachọn kỹ thuật, không phải luậttự nhiên.

<!-- page:21 -->
Asymmetricvs Symmetric Search: Cái Bẫy Prefix
Symmetric
■ Queryvà documentcùngloại (câu ↔
câu)
■ Vídụ: tìm câutrùng lặp, STS
Asymmetric
■ Câuhỏi ngắntìmđoạn văndài
■ Đâychính là RAG
Modelđược huấn luyện khác nhau chohai phía — nên exposeprefixhoặcinstruction
riêng: E5 dùngquery: / passage:;Nomic v2 dùngsearch_query: / search_document:.
Lưu ý:Bỏ prefixkhông báo lỗi— nó âm thầm tạo ra embedding lệch calibration,
xếp hạng sai. Model card Qwen3-Embedding-8B: dùng instruction cải thiện1% đến
5%sovới không dùng.

<!-- page:22 -->
Code: Encode + CosineSimilarity (sentence-transformers)
# pin the version -- 5.6.1 shipped one week before this lecture
from sentence_transformers import SentenceTransformer
from sentence_transformers.util import cos_sim
model = SentenceTransformer( "BAAI/bge-m3")
texts = [ "Chinh sach hoan tien", "Quy dinh doi tra"]
embeddings = model.encode(texts, normalize_embeddings=True)
score = cos_sim(embeddings[0], embeddings[1])
print(score.item())
normalize_embeddings=True đãchuẩnhoáL2ngaytrong .encode()—nên cos_simởđâytương
đươngcosine, không lệch bởi magnitude.

<!-- page:23 -->
Bức Tranh Embedding Model
Không có model “tốt nhất”; chỉ có model đúng cho trục quali-
ty/speed/size/cost mà bạn cần

<!-- page:24 -->
Open-WeightModels — Vài Đại Diện
Model Params Outputdims Maxinput License
Qwen3-Embedding
(0.6B/4B/8B)
0.6–8B tới 4096, MRL
→32
32K (cả 3
size)
Apache-2.0
EmbeddingGemma 308M 768, MRL →
2K Gemmaterms
BGE-M3 ∼568M dense+sparse
+multi-vec
8192 MIT
NomicEmbedTextv2
(MoE)
475M/305M
active
768, MRL →
512 Apache-2.0
JinaEmbeddings v4 3.8B 2048 (hoặc
multi-vector)
long-context —
Số liệu verbatim từ HF model card / arXiv của từng model, chốt 2026-07-30. BGE-M3 tạo cả ba biểu diễn
dense+sparse+multi-vector cùng lúc — hybrid retrieval SOTA là một model, không phải ba hệ thống ghép lại. Nomic v2
max input chỉ 512 token, ngắn hơn nhiều embedder cũ dù là model 2025.

<!-- page:25 -->
CommercialAPIs
Model Dims Maxinput Giá /1Mtoken input
OpenAI
text-embedding-3-large
tới3072 8191 $0.13
OpenAI
text-embedding-3-small
tới1536 8191 $0.02
Google
gemini-embedding-2
MRLnative 8192 $0.20($0.10 batch)
Voyage voyage-3.5 2048/1024/512/256 — $0.06
Cohere embed-v4 256/512/1024/1536 128K giá chưa xác minh
được
Giá xác minh trên trang chính thức từng vendor, 2026-07-30. Không có tier giá batch chính thức — chỉ “khoảng nửa giá”
qua Batch API, không có số cụ thể.
Lưu ý:Lầm tưởng: “OpenAI embeddings là mặc định tốt nhất.”-3-large/-small phát hành 25/1/2024, chưa
cập nhật ∼2.5 năm trong khi Google/Voyage/Jina ra nhiều thế hệ mới.-3-large: $0.13/M so với voyage-3.5:
$0.06/M— không có bằng chứngvượt trội.gemini-embedding-001 (giớihạn 2K token) đã bịthay bởi-2.

<!-- page:26 -->
MTEB:Một Model, Ba Board, BaCon Số
MTEBđã tách thành nhiều boardkhôngso sánh được với nhau: MTEB(Eng, v2), MTEB(Multilingual)/MMTEB,
MTEB(Code)... Điểm v2 khôngso được với v1.
Vídụ thật,cùngmột model(GeminiEmbedding), ba con số:
■ MTEB(Multilingual)Mean(Task): 68.32—con số được quảng bálàm headline
■ MTEB(Eng,v2) Mean(Task):73.28
■ Task-TypeMean: 59.64
Lưuý: Lầmtưởng: “68.32làđiểmMTEBtiếngAnh.” Sai—đólàđiểm MULTILINGUAL.ĐiểmEnglishv2thậtlà
73.28. Lỗinày lanqua nhiềutrang tổnghợp, tạora sosánh tựmâuthuẫn (vd.đặt jina-v5-small71.7 “vượt”Gemini
68.32,trong khi English thật củaGemini là 73.28).
Quytắc cho lớp
Một con số MTEBvô nghĩanếu thiếu board + version + aggregation + ngày. (Cập nhật: từ 2025–26 MTEB đã
chuyểnsang kết quảverified,không còn thuần self-reported.)

<!-- page:27 -->
ĐaNgôn Ngữ Và TiếngViệt
■ VN-MTEB(EACL 2026 Findings): benchmark embedding tiếngViệtchuẩn hóa đầu
tiên— 41 dataset, 6 loại task(retrieval, reranking, classification, clustering, pair
classification,STS).
■ Pháthiện đáng chú ý: model dùngRoPEvượttrội hơn model dùng absolute
positionalembedding trên task tiếng Việt,ở nhóm model cùng quy mô.
■ TrướcVN-MTEB, nhóm phát triển thườngchọn model tiếng Việttheo điểmMTEB
tiếngAnh vàhy vọng transfer tốt — khôngđảm bảo.
Modelchuyên biệt tiếng Việt
AITeamVN/Vietnamese_Embedding v2: fine-tune từ BGE-M3 trên ∼1.1 triệu triplet
(query, positive, negative) tiếng Việt; 2048 max sequence, 1024 dims, Apache-2.0.
Đườngđithựcdụng: khôngdùngthẳngmodelđangônngữ,cũngkhôngtraintừđầu
—fine-tunemodel đa ngôn ngữ mạnh trêndomain triplet.

<!-- page:28 -->
ChọnEmbedding Model Trong20Phút
5trục quyết định, không phải1 thứ hạng leaderboard:deployment,max input, dimension/precision, ngôn ngữ,query
shape,license.
Quytrình 20 phút:
1. Viếtđộdàichunktốiđa vàdạngquery (cóexactcode/SKU/IDkhông?) —loạibớtứngviêntrướckhibenchmark.
2. Lậpshortlist 2–3 model theolicense+deployment(on-device/air-gappedhay API được phép?).
3. Xâybộ eval 50–100 query từchính corpus của bạn —khôngchỉdựa MTEB.
4. Đorecall@k trên bộ eval, dùngđúng prefix/instruction cho từng model.
5. Chỉsau đó mới tinh chỉnhdimension và quantization (MRL, int8/binary).
2lưu ý nhanh sau khichọn
(1) SKU/code trong query: dense embedding thuần blur token chính xác — cần sparse (BGE-M3 có sẵn)
hoặc hybrid BM25 (§9). (2) Đa phương thức: Cohere embed-v4 / Google gemini-embedding-2 nhúng
text+image(+audio/video) vào cùng một vector space — vẫn áp dụng đủ 4 trục + license; Lab 7 vẫn dùng em-
beddingtext thuần.

<!-- page:29 -->
Document Extraction: Từ File
Thật Đến Text
Trước khi có chunk, có embedding, có vector store — bạn phải
lấy được text ra khỏi file. Đây là khâu quyết định trần chất lượng
của cả pipeline

<!-- page:30 -->
BảnĐồ Dữ Liệu: Ba Nhóm, Ba Con Đường
Nhóm Vídụ Cáchxử lý đúng
Unstructured PDF scan, ảnh, chữ viết
tay,audio transcript
OCR / VLM parsing→ text
+ layout, rồi chunk theo cấu
trúc
Semi-
structured
HTML, DOCX, PPTX,
Markdown,email
Bóc boilerplate, giữ cây
heading → chunk theo
heading
Structured Excel, CSV, SQL table,
JSON,log
Thường KHÔNG nên em-
bedthô —text-to-SQLhoặc
serialize theo hàng (§5, cuối
section)
Ba nhóm cần ba đường xử lý khác nhau — đừng ép tất cả qua cùng một parser

<!-- page:31 -->
PDF:Vì Sao Khó Hơn BạnNghĩ
PDFlà định dạng mô tảCÁCH VẼ trang, không mô tảNỘI DUNG.Nólưu “đặt glyph này tại
toạđộ (x,y)” — không lưu“đây là ô thứ 3 củahàng thứ 2 trong bảng”.
■ Born-digitalvsscanned: filesinhtừWordcósẵntextlayer;filescanchỉlàảnh ⇒bắtbuộc
OCR.
■ Readingorder: 2cột, sidebar,chú thích— pdftotext đọctheo thứ tự vẽ, cóthể trộn cột
tráivới cột phải thành câuvô nghĩa.
■ Header/footerlặp: têncông ty + số trangchèn vào giữa mọi chunk, làmnhiễu embedding.
■ Bảng: mấtquan hệ hàng–cột là lỗitốn kém nhất (frame riêng ởsau).
■ Côngthức, biểu đồ, hình:thôngtin nằm trong pixel, khôngcó trong text layer.
Lưu ý:“PDF là text, chỉ cầnpdftotext” — đúng với đúng một loại tài liệu: born-digital, một
cột,không bảng. Vớicorpus thật, đây là giả địnhsai đắt nhất trong cả pipeline.

<!-- page:32 -->
CôngCụ Parse Tài Liệu 2026
Côngcụ Loại Ghichú thực dụng
Docling(IBM) Pipeline,MIT license DocLayNet layout + TableFormer; mạnh
vềbảng phức tạp; ra Markdown/JSON
MinerU Pipelinehoặc VLM Bản 2.5-Pro đứng đầu OmniDocBench
v1.6 theo báo cáo của chính nhóm tác
giả
Marker(Datalab) Pipeline Nhanh; benchmark v2 do chính Datalab
chạy
Unstructured Pipeline,hosted 30+ định dạng (kể cả email, HTML); có
sẵnchunking
LlamaParse Hosted Trả phí theo trang; tiện khi không muốn
tựvận hành
olmOCR(AI2) VLM7B ChuyênlinearizePDFchodatapipeline;
82.4trên olmOCR-Bench
MarkItDown(MS) Chuyển đổi nhẹ Office-heavy, không GPU; hợp proto-
type,yếu với PDF scan
Nguồn: Docling arXiv:2501.17887 · olmOCR github.com/allenai/olmocr · dots.mocr arXiv:2512.02498 · DeepSeek-OCR
arXiv:2510.18234

<!-- page:33 -->
OmniDocBench: Benchmark Đã GầnBão Hoà
OmniDocBench(CVPR 2025, 1.355 trang, 9loại tài liệu) chấm 4 trục:text(editdistance), công
thức(CDM),bảng(TEDS),readingorder.
■ Trênv1.5: GLM-OCR94,6% (SOTA),PaddleOCR-VL-1.5 >94%,Gemini3 Pro 90,3%.
■ MinerU2.5-Probáo cáo95,69trênv1.6, TableTEDS 93,42—con số từ chính papercủa
nhómtác giả.
Lưu ý:Khi nhiều hệ vượt 94%, phần tăng thêm chủ yếu là “vá edge case”, không còn phản
ánh chất lượng thực tế trên corpus củabạn. Tệ hơn: các bảng xếp hạngmâu thuẫn nhau
— cùng bộ công cụ, đổi bộ tài liệu là đổi thứ hạng. Và phần lớn benchmark được chạy bởi
chínhnhà cung cấp công cụ.
Việccần làm thay vì tinbảng xếp hạng
Lấy20trangkhónhất trongcorpuscủabạn(scanmờ,bảnglồng,2cột),chạyqua2–3công
cụ,và đọcbằng mắt. Đó là benchmarkduy nhất có giá trị quyếtđịnh.

<!-- page:34 -->
HTML:80% TrangWebKhôngPhải Nội Dung
Menu,banner,ad, footer,“bài liên quan” — nếu embedthẳng HTML thô, phần lớn vectormô tả
giaodiện,không phải nội dung.
■ Trafilatura—pipeline heuristic nhiều tầng,khôngML, không GPU,khoảng 14–22
ms/trang. Mặc định hợplý cho quy mô lớn.
■ ReaderLM-v2(Jina)—transformer 1,54BhuấnluyệnriêngchoHTML →Markdown: cấutrúc
trungthực hơn, nhưng cần GPUvà chậm hơn nhiều bậc.
■ justext—bóc boilerplate theo mật độstopword ở mức đoạn văn.
■ Trangđã convert đúng thường dùngíthơn khoảng 65% tokensovới HTML thô⇒giảm
thẳngchi phí embed.
Chiếnlược hai tầng thực dụng
Chạytrafilaturatrướcchotoànbộcorpus;chỉchuyểnsangparsernặng(ReaderLM/html-to-
markdown) cho những trang mà cấu trúc thực sự quan trọng. Đừng trả giá GPU cho 100%
corpusđể cứu 5% trang.

<!-- page:35 -->
Office& Email: CáiBạn Mất Khi Convert
■ DOCX—giữ được cây heading (rấtquý cho chunking);mấtcomment,tracked changes,
footnotenếu parser không xử lýriêng. Một hợp đồngmà phần thương lượng nằm ở
commentthì bản parse là bảnsai.
■ PPTX—text trong shape thường rờirạc, thứ tự đọc theo thứtự tạo shape chứ không theo
thịgiác; speakernotes thườnglà phần có giá trịnhất và thường bị bỏ quên.
■ Email—chữ ký, disclaimer pháp lývà thread reply lồng nhau khiếncùng một đoạn văn bị
indexhàngchục lần ⇒near-duplicatelàm hỏng top-k.
Quytắc
Với mỗi định dạng, hỏi hai câu:(1) cấu trúc nào đáng giữ để chunk theo?(2) nội dung nào
bịmấtimlặngkhiconvert? Câuhaiquantrọnghơn—vìkhôngcóexceptionnàođượcném
ra.

<!-- page:36 -->
Excel& CSV:Sheet KhôngPhải Là Table
Sailầm phổ biến: coi mỗi sheet là một bảngsạch và đẩy thẳng vàopandas.read_excel.
■ Ômerge ⇒ NaNrảirác; phảifill-downđểkhôi phục quan hệ hàng.
■ Headernhiều tầng(2–3dòng) ⇒têncột thật làghépcủacác tầng: “Q22026 ·Doanhthu ·
VND”.
■ Mộtsheet có thể chứanhiềubảng rời+ô ghi chú tự do;ranh giới bảng phải tự dò.
■ Formulavs value: lưu công thứchay kết quả? Vớiretrieval, gần như luôn làkếtquả.
■ Số,ngày tháng, đơn vị: định dạng hiển thị khácgiá trị thật (1.234,56 vs 1234.56).
Lưuý: Địnhdạngserializequyếtđịnhrecall. Mộthàngnêntrởthànhmộtđơnvị tựđủnghĩa :
"Q2 2026 | Doanh thu | 4,2 t￿ VND" —không phải một ô “4.2”trôi nổi không có header.

<!-- page:37 -->
BảngLà Điểm Hỏng Im LặngSố Một
Khichunker cắt một bảng theoký tự, quan hệ hàng–cột biếnmất: header“Doanh thu Q2 2026”
rơivào chunk này,giátrị “4,2 tỷ” rơivào chunk khác. Không kỹ thuật retrieval nào ghéplại được.
Bằngchứng định lượng—Structure-aware TabularChunking (STC) so với
RecursiveCharacterTextSplitter,trên MAUD (39.231 bản ghihợp đồng M&A từ SEC EDGAR),
ngânsách 512 token:
Chỉsố Recursive STC
MRR(hybrid) 0,358 0,595
Recall@1(hybrid) 0,347 0,539
Recall@1(BM25) 0,366 0,754
Sốchunk sinh ra — íthơn ∼40%
Nguồn: Guttal et al., “Structure-Aware Chunking for Tabular Data in RAG”, arXiv:2605.00318 (5/2026).

<!-- page:38 -->
DữLiệu Có Cấu Trúc: Khi Nào KHÔNG NênEmbed
Vớidữ liệu đã nằm trongbảng SQL, vector search thường làcông cụsai:
■ “Tổngdoanh thu quý 2 theovùng” — cầnaggregation,không phải similarity. Không
embeddingnào cộng được số.
■ “Đơnhàng mới nhất của kháchX” — cầnsort+ filter chính xác,đúng thế mạnh của SQL.
■ “Chínhsách hoàn tiền nói gì?” —đâymớilà việc của vector search.
Kiếntrúc thực dụng: định tuyến, không chọn một
Một router quyết định: câu hỏi số liệu→ text-to-SQL; câu hỏi khái niệm→ vector search;
câu hỏi quan hệ→graph. Nhiều hệ production 2026 chạy cả ba song song rồi hợp nhất kết
quả.
Lưuý: Embedtoànbộbảnggiaodịchthànhvectorlàanti-patterntốnkémvàkémchínhxác.
Trướckhi embed bất cứ thứgì, hỏi:câuhỏi này có phải câuhỏi ngữ nghĩa không?

<!-- page:39 -->
TàiLiệu TiếngViệt: Những Gì Hỏng Riêng
■ Dấuthanh và dấu phụmangnghĩa: OCR nhầmmột dấu là đổi hẳn từ(ma / mà / má / mã /
mạ). Tesseractmặc định yếuở đúng điểm này.
■ Độphân giải scan tối thiểu300 DPI—dưới ngưỡng đó,o/ô/ơvà a/ă/âbắtđầu lẫn.
■ Chuẩnhoá Unicode bắt buộc: cùng một chữ“ế” có thể mã hoá dựngsẵn (NFC) hoặc tổ
hợp(NFD). Hai dạngkhôngkhớp nhaukhiso chuỗi và tạo rachunk trùng lặp mà mắt
thườngkhông phân biệt được. Chuẩn hoá NFC toàn corpusngay sau khi parse.
■ Côngcụ chuyên biệt tồn tại(VietOCR,PaddleOCR fine-tune cho tiếng Việt);các VLM đa
ngônngữ mới cũng đã kháhơn đáng kể.
Nguồn: “A Survey on Vietnamese Document Analysis and Recognition”, arXiv:2506.05061 · Sino-Vietnamese PaddleOCRv5, arXiv:2510.04003.

<!-- page:40 -->
ChuẩnHoá Sau Parse — BướcAi Cũng Quên
Parsexong chưaphảilà xong. Trướckhi chunk:
■ UnicodeNFC chotoàn bộ text (đặc biệtquan trọng với tiếng Việt).
■ Bỏheader/footer lặp—dò chuỗi xuất hiện ởcùng vị trí trên hầu hếttrang.
■ Nốitừ bị gạch nối cuốidòng(de-hyphenation)và gộp dòng thành đoạn.
■ Xoátrang trắng, mục lục, trangbìanếukhông mang thông tin truyvấn được.
■ Khửtrùng lặp—cùng một tài liệu thườngtồn tại nhiều bản (v1, v2,final, final-2).
Provenance: giữ từ đây,không thể thêm sau
Mỗiđoạntextnênmangtheo tênfile,sốtrang,đườngdẫnheading ngaytừlúcparse. Đây
làthứchophépcâutrảlờitríchnguồn“theotrang14củahợpđồngA”.Nếukhônggiữởkhâu
này,không khâu nào sauđó tạo lại được.

<!-- page:41 -->
Chunking & Chuẩn Bị Tài Liệu
Chunk sai thì mọi retrieval xây trên top-k đều sai theo — không
mô hình embedding nào cứu được một chunk tồi

<!-- page:42 -->
Chunking: Quá ToHay Quá Nhỏ Đều TrảGiá
Chunking — Chiatàiliệudàithànhđoạn(chunk)nhỏhơn,embed/index riêng lẻ—
tránhvượt giới hạn token, giúp retrievaltrúng đúngđoạnthayvì cả file.
Chunkquá to Chunkhợp lý Chunkquá nhỏ
Kíchthước >1000tokens 200–500tokens <50tokens
Vấnđề Dính nhiều chủ đề vào
cùngmột vector
Một ý / một section trọn
vẹn, overlap với chunk
liềnkề
Mất ngữ cảnh, retrieve
nhiềumảnh rời rạc
Hệquả khi retrieve Retrieve trúng nhưng in-
jectrất nhiễu
Cânbằngprecision/com-
pleteness
Khó tổng hợp thành câu
trảlời đầy đủ
Rule of thumb: bắt đầu đơn giản với chunk theo section/heading, tối ưu sau bằng eval — không đoán cảm tính

<!-- page:43 -->
“TạiSao Lại Là 512 Token?”
BERT(2018) có bảng positional embeddinggiới hạn cứng ở512token —đây là giới hạnkiến
trúccủamột model cụ thể năm2018, không phải một quy luậtretrieval.
■ Consố này sống sót quavô số tutorial RAG như một“default” bất di bất dịch —lâu hơn hẳn
lýdo kỹ thuật ban đầu.
■ Embedder2026 đã bỏ xa nó: BGE-M3 / Jina v2–v3tới 8K token; Qwen3-Embedding tới
32K;Cohere Embed v4 tới 128K.
Lưu ý:Không có ngưỡng “512 token” phổ quát. Bhat, Rudat, Spiekermann & Flores-Herr
(arXiv:2505.21700, 2025): chunk64–128 tokentối ưu cho câu hỏi factoid ngắn;512–1024
tokentốthơnkhicầnhiểungữcảnhrộng—vàtốiưucònphụthuộc embedding model(Stella
lợivới chunk lớn, Snowflake lợivới chunk nhỏ, tập trung entity).
Hệquả
Đổiembeddingmodel ⇒phảiđolạichunksize. Đừngcopyconsốcủadeckkhácsangmodel
khác.

<!-- page:44 -->
ThangChiến Lược Chunking
Chiếnlược Cáchhoạt động Chiphí Khinào dùng
Fixed-sizesplit Cắt theo số ký tự/token cố
định, không quan tâm ranh
giới
~Free Baselinekhởi điểm
+Overlap Chồng lấn N câu/token giữa
cácchunk liền kề
~Free Giảm mất ngữ cảnh tại
điểmcắt
Recursive character
splitting
Thử tách theo\n\n → \n →
space → ký tự, đệ quy khi
vẫnquá dài
~Free Gần như luôn thắng
fixed-size, chuẩn mặc
định
Structure-aware Cắt theo heading, section,
bảng,code block
~Free–cheap Tài liệu có cấu trúc rõ
(docs,FAQ,policy)
Semantic (break-
point)
Embedtừngcâu,cắttạiđiểm
cosinesimilarity giảm mạnh
1 lượt em-
bed/câu
Chỉ khi đã đo thấy gap
thật(xem myth kế tiếp)
Càng lên cao chi phí càng tăng — chỉ leo khi đã đo được một gap retrieval thật

<!-- page:45 -->
Myth: Semantic Chunking LuônTốt Hơn
Nhiềututorial RAG coi semantic (embedding-breakpoint)chunking là upgradetự động sovới
fixed-size.
Lưuý: Qu,Tu&Bao(Vectara/UW-Madison/Penn), Is Semantic Chunking Worth the Com-
putational Cost?,arXiv:2410.13070, NAACL2025Findings : chiphítínhtoán“ notjustified
by consistent performance gains” — trên document retrieval, evidence retrieval, retrieval-
basedQA.
■ Consố “semantic chunking 87% vsfixed-token 50%” (một “clinical study”)khôngtồn tại
trongnguồn nào—đừng dùng.
■ Consố “chậm hơn∼14×”là benchmark throughput củaChonkie,không phải từ paper —
ghiđúng nguồn.
Nguồn
Qu et al., NAACL 2025 Findings (2025.findings-naacl.114) — nhãn “Vectara 2024” và “Qu
2025”là cùng một paper bịđếm hai lần.

<!-- page:46 -->
Frontier: Hai Cách NghĩLại Về Chunking
LateChunking (Jina, 2024)
Đảongượcthứtự: embed toànvănbản bằng
long-context model trước, chunkngay trước
meanpooling.
■ Chunkvector vẫn giữ ngữ cảnhtoàn tài
liệu(vd. resolve pronounxuyên ranh
giớichunk).
■ Khôngcần fine-tune riêng, chạy vớibất
kỳlong-context embedder nào.
arXiv:2409.04701 (Günther et al.)
Phụ thuộc mean pooling — Jina v5 đổi sang last-
token pooling nên mất khả năng này.
Contextual Retrieval (Anthropic,
2024)
Prepend 50–100 token ngữ cảnh do LLM sinh
vào mỗi chunk, trước khi embed và index
BM25.
■ Top-20failure rate: 5.7% (baseline)→
3.7%( −35%,+contextual embed) →
2.9%( −49%,+BM25) →1.9%( −67%,
+rerank).
■ Chiphí: $1.02/triệu tokentài liệu
(promptcaching).
Lưu ý: eval riêng của Anthropic (vendor). Reproduc-
tion độc lập (Merola & Singh, ECIR 2025): NDCG@5
0.317 vs 0.312 — thật nhưng nhỏ hơn nhiều so với
49%.

<!-- page:47 -->
SilentTruncation— Gotcha NguyHiểm Nhất
Model Maxinput
NomicEmbed Textv2 MoE 512
mxbai-embed-large ∼512
EmbeddingGemma 2,048
gemini-embedding-001 2,048
BGE-M3 / Arctic-Embed 2.0 / nomic-embed-text-
v1.5/ Jina v2–v3
8,192
Qwen3-Embedding(0.6B / 4B / 8B) 32,768(cả 3 size)
jina-embeddings-v5-text 32K
CohereEmbed v4 128K
Lưu ý:Text vượtmax_seq_len bị cắtâm thầmbởi hầu hết client library — không raise lỗi. Không có bản Qwen3-
Embedding40K; model card ghi rõ32K cho cả ba size.

<!-- page:48 -->
FailureDemo: Chunk Xấuvs Chunk Tốt
Chunkxấu (raw,không section)
Query: “Chính sách đổi trả áp dụng trong bao
lâu?”
Retrieved(cosine0.61): “…giaohàngmiễnphí
đơn trên 500k. Đổi trả trong 30 ngày. Liên hệ
hotline1900…”
LLManswer: “Bạncóthểđổitrảvàliênhệhot-
line1900…” — nhiễu, thiếu chi tiết
Chunktốt(theosection+metadata)
Query: “Chính sách đổi trả áp dụng trong bao
lâu?”
Retrieved (cosine 0.89): “Chính sách đổi trả:
khách hàng có 30 ngày kể từ ngày nhận hàng
đểyêucầuđổitrả. Sảnphẩmphảicònnguyên
tem.”
LLM answer: “30 ngày kể từ ngày nhận, sản
phẩm còn nguyên tem.” — chính xác, có
nguồn

<!-- page:49 -->
Bên Trong Vector Store: Thuật
Toán ANN
Vector store không “tìm kiếm ma thuật” — nó đánh đổi recall, la-
tency và memory theo những cách rất cụ thể

<!-- page:50 -->
VìSao Exact Nearest Neighbour KhôngScale?
Mỗirecordlưu id+ vector+ document+ metadata—phầncònlạicủasectionnàychỉthayđổiCỘT vector.
Exactk-NN: O(N · d)mỗiquery — vớiN=10triệu, d=1536: ~15tỷ phépnhân–cộng cho
MỘTquery.
Recall
Tìm đúng láng giềng
thật hay không
Latency
Trả lời trong bao lâu
Memory
Index chiếm bao
nhiêu RAM/disk
Nguyênlý xuyên suốt section
Mọi kỹ thuật ANN chỉ là một cáchkhông nhìn hết corpus. Mỗi index tiêu một trong
bađồng tiền trên để mua đồngtiền còn lại — không indexnào thắng cả ba.

<!-- page:51 -->
Flat(Brute Force) — Baseline BắtBuộc Phải Đo
■ Cơchế: lưumọi vector nguyên bản (uncompressed);tính khoảng cách tới TẤT CẢ;sắp
xếp. FAISS:IndexFlatL2 / IndexFlatIP.
■ Recall: 100% theo địnhnghĩa—đây làgroundtruth đểđo recall của mọi indexkhác.
■ Memory: N × d × 4bytes(float32). N=10M, d=1536 ⇒~61.4GB.
■ Khinàodùngthẳng: corpusnhỏ(khoảngvàinghìndocumenttrởxuống)—FlattrongRAM
đãđủ nhanh, một vector DBlúc này là over-engineering.
Lưu ý:Luôn build Flat trước tiên trong lab. Không có ground truth thì “recall” là một từ vô
nghĩa.

<!-- page:52 -->
IVF— Inverted File / CoarseQuantization
■ Cơchế: k-meanschia corpus thànhnlistcell(Voronoipartition). Query: tìm nprobe
centroidgần nhất, chỉ scan vectortrong các cell đó.
■ Analogy: sơđồtầngthưviện—tìmđúngkhukệtrước,rồimớiđọcsáchtrênkhuđó. Flat=
đọchết cả thư viện.
■ nprobelànúm vặn recall:nprobe ↑ ⇒ scannhiều cell hơn⇒recall ↑,latency ↑. Một cấu
hìnhcụ thể (Pinecone,IVF256,PQ32x8): nprobe=1→30%recall @ 136µs; nprobe=8→
74%recall @ 729µs.
■ Bắtbuộc train: IVFcần một passtrain()trênsample đại diện để họccentroid —
Chroma/pgvectorgiấu bước này,FAISSthô thì không.
Lưu ý: “Dùng nprobe = 8–16 cho 1–10M vector” không có trong docs FAISS hay bài
Pinecone. Bài học thật:tăng nprobe đến khi recall bão hoàso với Flat ground truth —
khôngcó công thức.

<!-- page:53 -->
PQ— Product Quantization: Phép ToánBộ Nhớ
Cơchế: chiamỗi vector thànhMsub-vector;k-means riêng từng subspace thànhcodebook
riêng;chỉ lưuchỉsố centroidmỗisubspace. Khoảng cáchước lượng qua bảng tra sẵn(ADC).
Bước Kíchthước
128-dimfloat32 (gốc) 512bytes
8subspace ×16-dim,mã 8-bit (256 centroid) 8bytes
Tỷlệ nén 64×
Trade-offthật (không đơn điệu)— và OPQ
M lớn hơn giữ độ chính xác tốt hơn nhưng ăn mòn CẢ tỷ lệ nén LẪN tốc độ cộng khoảng cách — “M càng lớn
càngtốt”làsai. OPQ(OptimizedPQ): họcmộtmatrậnxoaytrựcgiao,ápdụngTRƯỚCkhichiasubspace,đểcân
bằng phương sai giữa subspace (trục chia PQ vốn tuỳ ý — sai với chiều tương quan). Chi phí: một phép nhân ma
trận/vector, rẻ so với recall thu được. FAISS: tiền tốOPQ<M>_<d> trước chuỗi PQ/IVFPQ. Không có con số cải thiện
đángtin cậy — chỉ “thườngtốt hơn ở cùng kích thướcmã”.

<!-- page:54 -->
HNSW— Graph Nhiều Lớp ĐằngSau Hầu Hết VectorDB
■ Cơchế: multi-layerproximity graph. Lớptrên thưa (bước nhảy xa), lớpdưới dày (chi tiết);
lớpđáy chứa toàn bộ điểm. Tìm kiếm greedy đitừ đỉnh xuống đáy.
■ Analogy: hệthống cao tốc — vàođường cao tốc (lớp thưa trênđỉnh), ra nhánh nhỏ dần
(lớpdày) khi tới gần đích.
■ Aidùng: FAISS IndexHNSWFlat,hnswlib(chính là index nền củaChromaDB),Qdrant,
Weaviate,Milvus, pgvector hnsw.
Thamsố Ảnhhưởng khi tăng Giá trị thường
gặp
M memory ↑, kết nối đồ thị↑, recall
↑
efConstruction thời gian build↑, chất lượng đồ
thị ↑
efSearch latency ↑,recall ↑ tuỳSLA

<!-- page:55 -->
Recallvs Latency vs Memory —So Sánh Các Họ Index
Index Recall Latency Memory/vector
(d=1536)
Bestcho
Flat 100%(ground truth) O(N·d) — chậm
nhất
6,144B <10k doc; đo recall của
mọiindex khác
IVF-Flat tune qua nprobe (vd.
30%→74%)
µs–ms 6,144B + list overhead mid-scale,RAM đủ
IVF-PQ lossy,phụ thuộc config nhanhnhất/vector vàichụcbyte(nén64 ×) tỷ vector,RAM hạn chế
HNSW-Flat ~95–99%(M/efSearchhợp
lý)
ms đơn vị ở scale
1M
6,144B + 256 B graph recall/latencytốtnhấtkhi
RAMđủ,khôngcầntrain
DiskANN/Vamana 95%+ recall@1 <3ms, >5000
QPS
PQ trong RAM + full
vectortrên SSD
tỷvector trên 1 máy
ScaNN tốt hơn PQ thường, cùng
codesize
— cỡPQ MIPS,Google stack
Quantize
(int8/binary)
+rescore
~lossless/ ~96% giữ lại int MAC /
XOR+popcount
4×hoặc32 ×nhỏhơn production tối ưu chi phí
Số liệu lấy từ các nguồn được trích tại mỗi cấu hình cụ thể — so sánh giữa các hàng mang tính minh hoạ, không phải
benchmark có kiểm soát

<!-- page:56 -->
Cheatsheet: Chỉnh Tham SốANN (Lưu Lại Slide Này)
1. BuildFlat trước. Khôngcó ground truth thì khôngthể nói từ “recall”.
2. Chọnhọ index theo ràng buộcchính:RAMdư, ≤10Mvector →HNSW.RAM là điểm nghẽn,
≥100Mvector →IVF-PQhoặcDiskANN. <10kvector →Flat,bỏ luôn vector DB.
3. HNSW:bắtđầu M=16, efConstruction= 200. Chỉ tuneefSearch lúcquery — núm vặn duynhất
khôngcần rebuild.
4. IVF: nlist ≈ 4
√
Nlàmđiểmkhởiđầu;sauđó tăngnprobeđếnkhirecallbãohoà sovớiFlat. Không
cócông thức.
5. PQ: Mphảichia hết d. Bắt đầu vớimã 8-bit. Nhớ điểmngọt —Mlớnhơn không luôn tốt hơn.
6. Quantizesau cùng, luôn kèm rescoring.int8là mặc định an toàn;binary chỉ khid ≥ 1024.
7. Đođúng thứ bạn quan tâm:recall@kso với Flat, ởkthật,với filter thật đang dùng.

<!-- page:57 -->
FAISS, ChromaDB & Landscape
FAISS là engine tốc độ, Chroma là developer experience —
nhưng landscape 2026 rộng hơn nhiều hai cái tên quen thuộc
đó

<!-- page:58 -->
FAISSLà Một Library,Không Phải Database
□✓ Làindex+ search kerneltốiưu tốc độ và memory —không hơn.
□ Khôngcó persistence ngoàiwrite_index/read_index rafile.
□ Khôngcó metadata schema, không cówherefiltertích hợp sẵn.
□ Khôngcó CRUD/transaction, không multi-tenancy,không access control.
□ IndexHNSWFlat không hỗ trợremove_ids() — raise lỗi, kể cả khi wrap thành
IDMap2,HNSW32,Flat.
□✓ Ngượclại, họ IVF(IVFFlat, IVFPQ)cóhỗtrợ remove_ids trựctiếp.
Nguồn: FAISS wiki “Guidelines to choose an index”; GitHub issue #3339.

<!-- page:59 -->
Bug#1 Của FAISS:CosineSimilarity
Lưu ý: FAISS không có METRIC_COSINE. Chỉ có METRIC_L2 và
METRIC_INNER_PRODUCT. Cosine phải được giả lập bằng cách normalize vector
trướckhi dùng inner product.
faiss.normalize_L2(vectors) # in-place, before index.add -- half 1 of 2
index = faiss.IndexFlatIP(d)
index = faiss.IndexIDMap(index) # map back to chunk ids
index.add_with_ids(vectors, ids)
faiss.normalize_L2(query) # ALSO before search -- the forgotten half
D, I = index.search(query, k)
Quênnormalize khôngraise lỗi. Nó lặng lẽsuy biến thành xếp hạng theodot-product thô — ưu
tiênvector dài hơn.

<!-- page:60 -->
ChromaDB:Kiến TrúcHiện Tại
Embedded(local)
■ PersistentClient chạytrong
processcủa bạn, ghi thẳng ra
đĩa.
■ Rustcore từv1.0 (1/3/2025) —
“4×”nhanh hơn cho write/query
phổbiến.
■ Indexdùng hnswlib(HNSW)
bêndưới.
■ Metadatalưu trongSQLite(từ
v0.4.0,7/2023).
ChromaCloud
■ Táchstoragekhỏiquery
execution.
■ Write-aheadlog + indexed state
→đọcstrongly consistent.
■ Dùngchung Rust core 1.0 làm
nềntảng local và cloud.
Bản hiện hành: chromadb 1.5.9 (5/5/2026).

<!-- page:61 -->
“DefaultLà Một Cái Bẫy”
Default embedding function của Chroma — sentence-transformers
all-MiniLM-L6-v2,384 chiều, chạy local qua ONNX,không cần API key.
■ Truncateở 256 word-piece, nhỏ, nhanh,thiên về tiếng Anh — xamức frontier.
■ Vìchạyngay không cần config,team thường ship thẳng lên productionmà không
nhậnra.
■ Kếtquả: recall kém,và không ai giải thích đượctại sao.
Lưu ý:Bug thường gặp nhất trong Chroma: tạo collection vớiembedding_function
riêng,sauđógọi get_collection()màkhôngtruyềnlạinó—default384chiềuâm
thầmthế chỗ. Luôntruyền cùngembedding_function mỗilần.

<!-- page:62 -->
Chroma: Flow Đầy Đủ2026 — Add + Query +Inject
import chromadb
from chromadb.utils import embedding_functions
client = chromadb.PersistentClient(path= "./chroma_db") # durable immediately
ef = embedding_functions.SentenceTransformerEmbeddingFunction(
model_name= "BAAI/bge-m3") # EXPLICIT, never the default
col = client.get_or_create_collection( "tickets", embedding_function=ef)
col.add(ids=[...], documents=[...], metadatas=[...])
res = col.query(
query_texts=[ "package never showed up"], n_results=5,
where={ "team": { "$eq": "support"}},
where_document={ "$contains": "E-4471"},
)
context = "\n".join(res["documents"][0]) # inject into the prompt

<!-- page:63 -->
ChọnVectorStore Nào?
1. Dưới10k vector,single process,không có ops budget→FAISSFlat in RAMhoặcChroma PersistentClient.
Sub-ms. Bỏ qua vectorDB.
2. ĐãdùngPostgres,dướikhoảng10Mvector,indexfitRAM →pgvector. Mộthệthống,metadatatransactionalmiễn
phí.
3. Postgres,từ 10M đến hàng trămtriệu→pgvectorscale(StreamingDiskANN),disk-resident, label-aware filtering.
4. Cầnfilter phức tạp mà khôngđược mất recall, hoặc ColBERT/ColPalimulti-vector,hoặc per-tenant isolation là
first-class →QdranthoặcWeaviate.
5. Corpusđã nằm trong lakehouse (Iceberg/Lance/Parquet),không muốn ETL ra ngoài→Milvus3.0 External
Collection—nhưng vẫn Public Preview,chưa GA.
6. Workloadbursty/idle nhiều, cost là ưutiên số 1, chấp nhận cold-start→turbopufferhoặcAWSS3 Vectors.
7. Dạyhọc / prototype / labcủa khoá này→ChromaDB(embedded,zero-config, có hybrid BM25+SPLADE) +FAISS
(đểthấy index internals mà Chromagiấu đi).
Lưu ý: Hai cạm bẫy của đường Postgres:MVCC bloat(mỗi UPDATE là delete+insert — nặng khi re-embed) và
không có filter pushdownvào graph traversal (§9). Ngưỡng rời Postgres không phải số vector, mà làlúc index
khôngcòn fit RAM.

<!-- page:64 -->
Metadata Filtering & Hybrid
Search
Similarity thôi chưa đủ: filter đặt sai chỗ làm sập recall trong im
lặng, và một số truy vấn chỉ BM25 mới giải được

<!-- page:65 -->
FilterLàm Sập Recall — TrongIm Lặng
Bachiến lược áp filter,ba cơ chế thất bại khácnhau — và cái sai chỉlộ ra khi filter thật (per-tenant,per-permission) lên
production,khôngphải trong demo:
Chiếnlược Cơchế Thấtbại
Post-filter ANNtrêntoàncorpus,rồiloạibỏ
chunkkhông khớp
Mất recall âm thầm: có thể trả về
<k hoặc 0 kết quả nếu filter chọn
lọc
Pre-filter Thu hẹp tập con khớp filter,
searchtrong đó
Đúng, nhưng suy biến về brute-
force; đồ thị HNSW xây cho toàn
corpusphụcvụkémtrênsubgraph
nhỏ
In-algorithm Traversalcủaindextựnhậnbiết
filter
Tốt nhất, nhưng cần engine hỗ trợ
(Qdrant payload-aware HNSW,
Weaviate ACORN, Pinecone
mergedindex)
Lưuý: Trênpgvector0.8.0-pg17: truyvấn15nearestneighbourmàu greenchỉtrảvề 11dòng —khôngexception,
khônglog. Cơ chếvá hnsw.iterative_scan đãtồn tại từ 0.8.0 nhưngmặcđịnh TẮT.
Nguồn: Franck Pachot (dev.to, pgvector 0.8.0-pg17) · ACORN, Patel et al., SIGMOD 2024, arXiv:2403.04871.

<!-- page:66 -->
Chroma— Cú Pháp Filter (Verbatim,Không Bịa)
collection.query(
query_texts=[ "shipment did not arrive"],
n_results=5,
where={ "$and": [
{"source": { "$eq": "tickets"}},
{"page": { "$gt": 5}},
]},
where_document={ "$contains": "E-4471"},
)
■ where(metadata): sosánh $eq $ne $gt $gte $lt $lte ·logic $and $or ·tậphợp $in $nin .
{"page": 10} là sugarcho $eq.
■ where_document (full-text): $contains $not_contains $regex $not_regex —
case-sensitive.
■ Dễnhầm: $contains/$not_contains cũngtồn tại bên trongwherenhưtoán tử array(kiểm
tra1 giá trị có nằmtrong metadata dạng list) — kháchoàn toàn với$contains full-textcủa
where_document.

<!-- page:67 -->
5TruyVấn, Một CorpusSupport Ticket
Truyvấn Thắng Vìsao
“mypackage never showed up” Dense doc ghi “shipment did not arrive” —
khôngtrùng từ nào
“canI get my money back” Dense doc ghi “refund policy for returned
merchandise”
“the app crashes when I open set-
tings”
Dense docghi“applicationterminatesunex-
pectedlyin the preferences pane”
“errorcode E-4471” BM25 densetrảvềmãtươngtựnhưng SAI
“SKUVN-2291-XL” BM25 token ngoài từ vựng huấn luyện —
chỉinverted index tìm ra
Điểmchốt
Truy vấn 1–3: xây dense index. Truy vấn 4–5: giữ BM25 — đó là lý do hybrid search tồn tại, và vì sao RRF (fuse
theorank,không phải score) là cáchkết hợp đúng.
BEIR: “BM25 is a robust baseline” — Thakur et al., arXiv:2104.08663

<!-- page:68 -->
HybridSearch: BM25 +Dense, SPLADE, và BGE-M3
■ Densethắng vocabulary mismatch: “package never showedup”↔“shipmentdid not arrive”.
■ Lexical(BM25) thắng token chính xác: mã lỗi, SKU,tên riêng — embedding học cách“làm mờ” đúng những thứ
này.
■ SPLADE(learnedsparse): sparse vectortrên vocabulary BERT(∼30,522token) — nhưng cần forwardpass
transformerở cảindex-timelẫn query-time (thêm∼100–300mslatency), và vẫn không phủđược token ngoài tập
huấnluyện — vì vậy BM25vẫn giữ chỗ năm 2026.
■ BGE-M3(BAAI,arXiv:2402.03216): một modelxuất cùnglúc dense+ sparse + multi-vector,huấn luyện bằng
self-knowledgedistillation—scorecủa3modelàmtínhiệuteacherchonhau. 100+ngônngữ,inputtới8,192token.
■ Vậy“hybrid chỉ là 3 hệthống ghép lại” còn đúng không? Ở SOTA(BGE-M3),không còn đúng nữa.

<!-- page:69 -->
RRF— Reciprocal Rank Fusion
RRF(d) =
X
r∈R
k +rankr(d) , k = 60 (mặcđịnh)
■ Fusetheo vịtrí rank,không theo score thô — nébài toán chuẩn hóa score chéohệ
(BM25và cosine không cùng thang đo).
■ Hỗtrợ native: Elasticsearch (rrfretriever) ·OpenSearch(hybrid pipeline) ·
Weaviate(mặc định) ·Qdrant( Fusion.RRF) ·ChromaDB.
■ k = 60: mặc định papergốc (Cormack et al.), cũng làmặc định Elastic/OpenSearch.
Lưu ý:“Hybrid tăng accuracy 26–31% so với dense-only” — số này chỉ xuất hiện
trong blog vendor,không kèm benchmark hay dataset nào. Bỏ số này. Dùng kết
luận BEIR: BM25 là baseline mạnh ngoài miền huấn luyện; kết hợp các họ retrieval
muađược robustness,không phải một % cố định.

<!-- page:70 -->
Frontier 2025–2026
Reranking, long-context vs RAG — và vì sao retrieval chỉ là một
tool trong context engineering

<!-- page:71 -->
Reranking— Nâng Cấp ROI CaoNhất
■ Bi-encoder(hoặc BM25) lấy top-50/100 rẻ;cross-encodermãhóa đồng thời
query+passage,rerank xuống top-5/10 thực sự đưavào prompt.
■ Chiphí: O(k)forwardpass trên shortlist,khôngphụ thuộckíchthước corpus N—
indextăng lên hàng triệu tài liệumà không đổi hoá đơn reranker.
■ Bấtđối xứng: embeddinglà chi phímộtlần mỗitài liệu; reranking là chi phílặplại
mỗitruy vấn.
■ Modelđáng chú ý: BGE-reranker-v2-m3 (open, multilingual, tự host nhẹ)·Cohere
Rerankv3.5(hosted) ·jina-reranker-v3—listwise,chỉ0.6Bthamsốtrênbackbone
Qwen3-0.6B,xử lý tới 64 tài liệutrong context 131K token, 61.94 nDCG@10trên
BEIR(arXiv:2509.25085).
■ Điểmdạy: một modellistwise vỏn vẹn 0.6B tham sốcạnh tranh được làm câu
chuyện“listwise thắng pointwise” thuyết phục hơnhẳn một con số nDCG đơnlẻ.

<!-- page:72 -->
HuyềnThoại: “Long ContextĐã Giết Chết RAG”
Lưu ý:Nhiều bài viết 2025–26 tựa đề thẳng “RAG is dead.” Bằng chứng kiểm soát
khôngủnghộ.
Bằngchứng Pháthiện
ContextRot(Chroma,
7/2025)
Hiệunănggiảmphituyếnkhiinputdàira,kểcảtácvụđơn
giản.
arXiv:2501.01880 Long contextthắngRAG hầu hết QA (đặc biệt Wikipedia);
RAG thắng hội thoại. Summarization-retrieval tiệm cận
long-context;chunk thô thua.
Lost in the Middle
(2307.03172)
Chính xác hình chữ U — tệ nhất ở giữa. Tăngk không
rerankcó thểtệhơn.
CAG (2412.15605,
WWW’25)
Nạp toàn corpus, KV-cachemột lần— nhưng phảivừa
contextwindow.
Tổnghợp 2026
Vector retrieval thu hẹp corpus lớn, giao tập con cho long-context model suy luận (đồng thuận thực hành, không
phảikết luận 2501.01880).

<!-- page:73 -->
Capstone: Retrieval Là MộtTool— Và Day 8Đi TiếpTừ Đây
Contextengineering — Anthropic, 29/
“Chiếnlược chọn lọc và duytrìbộtoken tối ưutrongcontext khi LLM inference.”
■ Just-in-timecontext loading: agent giữ địnhdanh nhẹ (đường dẫn, query đãlưu) và nạp
dữliệu lúcchạy quatool. Retrieval làmộtđòn bẩy,không phải toàn bộ kiếntrúc.
■ Day8 (RAG)nhậntiếp từ ranh giới “top-kchunkđã chọn”: lateinteraction
(ColBERTv2/PLAID),query rewriting & agentic retrieval(Self-RAG, CRAG), GraphRAG,
promptassembly & citation UX.
■ Day9 (MCP):server expose corpus như mộttool chuẩn hoá — agent tựquyết định khi nào
gọiretrieval.
Ranhgiới
Day7= đưadữliệuvàođúnghìnhdạng . Day8= dùngnóđểtrảlời . Tầngdữliệusaithì
khôngkỹ thuật nào ở Day8 cứu được.

<!-- page:74 -->
Đo Lường, Chi Phí & Failure
Modes
Nếu không đo được recall thì không biết đang tối ưu cái gì — và
không lỗi không có nghĩa là đúng

<!-- page:75 -->
ĐoRetrieval Quality: Recall@k& BEIR Baseline
■ Recall@k: bao nhiêu docrelevant nằm trong top-k —upper-boundcho chất lượng câu
trảlời cuối cùng.
■ Precision@k: trong top-k, baonhiêu thực sự relevant — kiểmsoát nhiễu, context budget.
■ nDCG@k: thứ hạng tốtkhông (log-discount theo vị trí) —phạt đúng passage ở rank 8thay
vìrank 1.
■ MRR:vị trí nghịch đảo kếtquả relevant đầu tiên — hợptruy vấn kiểu single-answer.
■ Luônthêm BM25 làm sàn: dense model fine-tunetrên MS MARCO có thểthuaBM25 thô
ngoàimiền huấn luyện (BEIR: 18dataset, 9 tác vụ).
Nuancehay bị bỏ qua
Recall@kcần nhưng chưa đủ. Đúng passage ở rank 18/20 vẫn có thể ra câu trả lời sai —
lost-in-the-middle. Recall giới hạn cáicó thể xảy ra; precision/nDCG/reranker quyết định cái
thực sự xảy ra.
Nguồn: Thakur et al., arXiv:2104.08663 (BEIR).

<!-- page:76 -->
CôngThức Làm Eval Set KHÔNGCần Nhãn
Mụctiêu: đorecall@k trên corpus của chính mình,trong một buổi,khôngcần ai gán
nhãntay.
1. Samplechunktheo tỉ lệ giữa các loạitài liệu (N≥100để ước lượng có ý nghĩa).
2. Sinhcâu hỏibằngLLM, chỉ dựa trên đúng chunkđó, kèmpersona(“kháchso gói
cước”,“kiểm toán viên nội bộ”).
3. Nhãn: chunknguồn chính là positive — đâylà mẹocitation-as-weak-label.
4. Chạyretrieval,tính recall@k và MRR so vớicác pseudo-label này.
5. Ngườikiểm tra tay∼10%để loại câu hỏi vô nghĩahoặc quá dễ.
Lưuý: Haithiênlệchphảinóirõ,khôngthìsinhviêntựtinquámứcvàoconsốcủa
mình: (1)câuhỏiLLM-sinhlặplạiđúngtừngữcủachunk—thổiphồngrecall@kso
vớingườidùngthật(diễngiảilại,hỏimulti-hop);(2)cáchnàychỉđođược“cótìmlại
đúng chunk đã sinh câu hỏi không” — thiên về trùng từ khoá.Đây là floor check,
khôngthay thế nhãn thật.

<!-- page:77 -->
ChiPhí Embedding: RẻHơn Sinh ViênTưởng
$2
Corpus 100M token,-3-small ($0.02/1M), một lần duy nhất
$13
Cùng corpus, -3-large ($0.13/1M token)
100Mtoken ≈75Mtừ — cỡ document storedoanh nghiệp vừa. Rẻhơn generation2–3bậc độ
lớn.
Hệquả chiến lược
Vìrẻ vậy,re-embed toàncorpus khi đổi model làkhảthi —không phải lý do nénâng cấp.
Nguồn: developers.openai.com/api/docs/pricing.

<!-- page:78 -->
Failure-ModeTable— Retrieval &Embed (1/2)
# Triệuchứng Nguyênnhân Cáchsửa Giaiđoạn
1 Query “xe hơi” bỏ sót doc
ghi“ô tô”
Lệch từ vựng — retrieval lexical
thuần
Hybrid BM25+dense với
RRF,hoặc query expansion
Retrieval
2 Query mãE-4471 trả về mã
khácnhưnggiống nghĩa
Dense embedding làm nhoè to-
kenchính xác
ThêmnhánhBM25(xửlýtốt
tokenOOV)
Retrieval
3 Recall thấp hơn kỳ vọng 5–
15%,không lỗi
Thiếuprefix query:/passage: của
E5/BGE — train-in, không phải
cosmetic
Áp đúng prefix cả hai phía;
chạyprefix-ablation test
Embed
4 Chunk dài retrieve kém,
đuôi chunk không bao giờ
khớp
Silent truncation tại max se-
quencelength—clientlibraryâm
thầmcắt bỏ phần dư
Kiểm tra token count trước
khi embed; biết giới hạn
model
Chunk/Embed
5 Ranking nhìn hợp lý nhưng
sailệch trên toàn index
Đổi embedding model màkhông
re-embed — cosine giữa hai
khônggianvẫntínhđược,nhưng
vônghĩa
Re-embed + rebuild index
toànbộ; version hoá index
Ops
6 FAISSưutiêndocumentdài
hơn
Quên normalize_L2 — suy biến
vềdot product thô
Normalize cả lúc add và lúc
queryvới IndexFlatIP
Store
7 Filtered search trả về ít hơn
k,hoặc 0
Post-filteringvới predicate chọn
lọc — neighbour đúng chưa từng
làcandidate
Pre-filter, hoặc in-algorithm
filtering
Store
Mỗi dòng có đặc điểm chung: không crash, không exception

<!-- page:79 -->
Failure-ModeTable— Chunk, Store& Ops (2/2)
# Triệuchứng Nguyênnhân Cáchsửa Giaiđoạn
8 Chất lượng câu trả lờigiảm
khităng k
Over-retrieval+lost-in-the-middle
— đúng nội dung nhưng bị chôn
giữacontext
Rerank để đẩy bằng chứng
lênđầu; giảm k
Retrieve→Gen
9 Recall dao động mạnh giữa
cácloại tài liệu
Saichunksizecholoạitruyvấn—
64–128tokencâuhỏingắn,512–
1024 ngữ cảnh rộng, tuỳ embed-
dingmodel
Tinh chỉnh chunk size mỗi
khiđổi embedding model
Chunk
10 Recall trung bình dai dẳng,
“chưađổi gì cả”
Chroma default
all-MiniLM-L6-v2 âm thầm
được dùng (384-dim, cắt 256
word-piece)
Truyền
embedding_function tường
minh;assert chiều vector
Embed
11 Query trả về rỗng sau khi
restart
Lệch embedding function —
collectiontạovớifntuỳchỉnh,mở
lạibằng default
Luôn truyền cùng
embedding_function cho
get_or_create_collection
Store
12 Latency tăng dần giữa các
lầncompaction
HNSW tombstone— vector đã
xoámềmvẫnchiếmbộnhớvàbị
duyệtqua rồi lọc
Lênlịchcompaction/rebuild
định kỳ; dùng IVF nếu xoá
thườngxuyên
Ops
13 Cachetrảlờisaimộtcách tự
tin
Cache key không version theo
embedding model, hoặc thiếu
TTL
Version cache key; TTL
theođộ biến động của fact
Ops
14 Demo tốt, production tệ Eval tổng hợp overfit cách diễn
đạtcủanguồn—ngườidùngthật
diễngiải lại, hỏi multi-hop
Sinh câu hỏi có persona +
refreshbằng query log thật
Eval
Mỗi dòng có đặc điểm chung: không crash, không exception

<!-- page:80 -->
“KhôngLỗi” Không Có Nghĩa Là“Đúng”
failure mode ở bảng trên hoàn toànkhông raise exception nào
Mộtpipeline retrieval có thể trảHTTP200,không log lỗi, không stacktrace — và vẫn hoàn toàn
sai. Đây là mythphổ biến nhất và cũng làluậnđiểm cốt lõicủatoàn bộ phần này:“nếu nó
không báo lỗi thì nó chạy đúng” làsai.
Lưu ý:Antidote duy nhất là những gì vừa học ở đầu section: đo recall@k trên ground truth
và benchmark BM25 làm sàn —đừng suy luận từ việc hệ thống không crash.(Quy lỗi
retrieval-vs-generationbằng RAGAS là nội dungDay 8.)

<!-- page:81 -->
Bảo Mật & Quyền Riêng Tư
Vector store trông vô hại vì toàn số thực — nhưng số thực đó có
thể bị đảo ngược lại thành văn bản gốc

<!-- page:82 -->
VectorKHÔNG Phải Dữ LiệuĐã Ẩn Danh
Babước leo thang trong nghiêncứu inversion:
■ 2020— Song & Raghunathan: khôi phụcmộtphần bag-of-wordstừembedding.
■ EMNLP2023 (Morris et al., arXiv:2310.06816),“Text Embeddings Reveal (Almost) As Much As Text” —khôi phục
câugần nhưnguyênvăn.
■ 2025— ALGEN (arXiv:2502.11308): không gian embedding của cácencoderkhácnhau gầnnhư isomorphic ở
mứccâu ⇒mộtphép linearalignment,học từchỉ~1.000 mẫuròrỉ, đảo ngược được embeddingblack-box,
transferxuyên domain và ngôn ngữ.
Rủirothứhai,táchbiệt—MembershipInference — Khôngcầnkhôiphụcnộidung,chỉcầnbiết mộtpassage
có tồn tạitrong retrieval DB hay không (Anderson et al., arXiv:2405.20446). Riêng sự hiện diện đã nhạy cảm:“hệ
thống RAG của bệnh viện này có hồ sơ nhắc đến bệnh hiếm X” .
Headlinecho slide
Không thể coi vector-only index là dữ liệu đã de-identify.Inversion rò rỉnội dung; membership inferencerò rỉsự
hiện diện. Nếu văn bảngốc nhạy cảm, vector của nócũng nhạy cảm.
Nguồn: Song & Raghunathan (2020) · Morris et al., EMNLP 2023, arXiv:2310.06816 · ALGEN, arXiv:2502.11308 · Anderson et al., arXiv:2405.20446.

<!-- page:83 -->
TấnCông Qua Kênh Retrieval: Poisoning & Indirect Injection
1. Corpus poisoning (PoisonedRAG)—Zou et al., arXiv:2402.07867, USENIXSecurity 2025:
■ 90%attack success ratekhivăn bản độc được tốiưu đồng thời đểđược retrieve vàđể lái
câu trả lời.
■ Điềukiện: 5văn bản độc cho MỖIcâu hỏi mục tiêu—không phải “90% với 5tài liệu” nói
chung.
■ Phòngthủ rẻ: perplexityfiltering (vănbản bị tối ưu thườngcó PPL cao).
2. Indirect prompt injection—chỉ dẫn độc nằm trongtài liệu được retrieve:
■ Vôhình vớibộ lọc chỉ kiểm trainput của user — payload đếnqua kênh retrieval.
■ Nộidung retrieve đượcngầmtin cậyvìđến từ pipeline của chínhhệ thống.
■ Blastradius nhân bản: một tài liệuđộc ảnh hưởng mọi user tươnglai; kẻ tấn công chỉ cần
đưatài liệu vào bất kỳnguồn nào corpus có index.
Lưuý: Cơchếphòngthủ(spotlighting,instructionhierarchy,CaMeL,lethaltrifecta)thuộcvề
Day11— Guardrails. Day 7 chỉcần thấykênhretrieval là một đường tấncông.

<!-- page:84 -->
Access-control-awareRetrieval: Filter TRƯỚCANN
Yêucầu kiến trúc, không phải tínhnăng thêm:filtertheo quyền của usertrướchoặc
tronglúcchạy ANN search — không baogiờ chỉ filtersau.
■ Post-filterdướimộtpredicatechọnlọccóthể âmthầmtrảvềíthơnhoặc0kếtquả
(nhắclại frame filtered-ANN ở §9).
■ VectorDB không kế thừa permissioncủa data store gốc⇒vectorindex là mục tiêu
táiđịnh danh tập trung, theo đúngrủi ro inversion ở đầu sectionnày.
Patterncụ thể
pgvector+Postgres row-levelsecurity ·Pineconenamespace-per-tenant ·pgvec-
torscalelabel-aware in-index filtering.
Capstonecủa Section 11
Đây là nơi §8 (filtered ANN), isolation opt-in và inversion gặp nhau: filter quyền hạn
PHẢInằm trong đường đi ANN, khôngphải bước dọn dẹp sau cùng.

<!-- page:85 -->
QuyĐịnh: VectorCó Phải Dữ Liệu Cá Nhân?
Khungpháp lý Nội dung chính Câuhỏi mở với embedding
PDPL
(VN)
Hiệu lực 1/1/2026; “tailored safe-
guards”choAI/bigdata/cloud;bảo
vệ riêng biometric data; báo vi
phạmtrong 72h
Embeddingcủadữliệucánhâncó
invertible (đầu section này) — có
thuộcphạmviPDPLdù“trôngchỉ
làsố”? Chưacó hướng dẫn.
GDPR(EU) Recital 26: test là re-identification
có “reasonably likely” hay không;
pseudonymized vẫn là personal
data(Art. 4(5))
Literaturevềinversiontừ2025trả
lời có ⇒ coi embedding đã lưu
là pseudonymized, không phải
anonymized
Khungnghĩ đúng cho sản phẩm
Lưu embedding của dữ liệu cá nhân thì hãy thiết kế như đang lưu chính dữ liệu đó — về mặt kỹ thuật, gần như là
vậy. (EU AIAct: xem Day11.)
Nguồn: PDPL Luật 91/2025/QH15 (Tilleke & Gibbins) · GDPR Art. 4(5) & Recital 26 — lập luận kỹ thuật-pháp lý, không
phải tư vấn pháp lý; chưa có phán quyết ràng buộc riêng cho embedding

<!-- page:86 -->
Kết Nối Agent Với Data
Retrieval pipeline là chiếc cầu nối giữa dữ liệu riêng và hành vi
của agent

<!-- page:87 -->
Day7 vs Day 8 vsDay 19: Ai DạyCái Gì?
Day7 (hôm nay)
Data structure bên dưới re-
trieval: text → vector, lưu
& search thế nào, mọi cách
pipelinelỗi thầmlặng.
Day8 — RAG
Xây ứng dụng RAG hoàn
chỉnh: query rewriting,
prompt assembly, answer
synthesis,citation UX.
Day19—VectorStore
Vận hànhvector store trong
production: deploy, scale,
feature-store song song,
Docker.
Câucarve một dòng
“Day 7 là cấu trúc dữ liệu bên dưới retrieval: text thành vector thế nào, vector được
lưuvàsearchrasao,vàpipelineđófailthầmlặngởđâu. XâyứngdụngRAGlàDay
8. Vận hành vectorstore trong production là Day 19.”

<!-- page:88 -->
Lab#7
LAB#7
Mụctiêu: Nốimộtbộdữliệuriêng(FAQ/SOP/policy)vàopipelinechunk →embed
→store →retrieve →injecttốithiểunhưngđúngbảnchất,rồitựđorecall@5bằng
no-labelsrecipe — không đoán mà đo.
Deliverable: Script chunk + embed + index chạy được, demo semantic search với
≥3 câu hỏi test, một mini answer function dùng retrieved context, và một con số
recall@5kèm 1–2 failure case tự tìmra.
Thờigian: Buổilab, làm cá nhân trước rồiso sánh strategy theo nhóm.

<!-- page:89 -->
LabStep 1: ChunkDữ Liệu
from langchain_text_splitters import RecursiveCharacterTextSplitter
# 2026 import path; langchain.text_splitter la shim da deprecated
splitter = RecursiveCharacterTextSplitter(
chunk_size=400, # tune theo embedding model, xem Sec
chunk_overlap=50, # 10-20% overlap giu ngu canh o bien chunk
separators=[ "\n\n", "\n", ". ", " ", ""]
)
chunks = []
for doc in load_documents("./data/"): # loader tu viet
parts = splitter.split_text(doc[ "text"])
for i, part in enumerate(parts):
chunks.append({
"id": f "{doc['source']}_chunk_{i}",
"text": part,
"metadata": { "source": doc[ "source"], "category": doc[ "category"]},
})

<!-- page:90 -->
LabStep 2: Embed& Store — Đúng API 2026
import chromadb
from chromadb.utils import embedding_functions
client = chromadb.PersistentClient(path= "./lab7_db") # ghi durable ngay lap tuc
ef = embedding_functions.SentenceTransformerEmbeddingFunction(
model_name= "BAAI/bge-m3") # EXPLICIT - khong bao gio de mac dinh
col = client.get_or_create_collection( "lab7_kb", embedding_function=ef)
for c in chunks:
col.add(ids=[c[ "id"]], documents=[c[ "text"]], metadatas=[c[ "metadata"]])
# embeddings= khong can truyen - ef tu tinh
Lưuý: Lỗi#1củaChroma: tạocollectionvới embedding_function tườngminh,sau
đó mở lại bằngget_collection() khôngtruyền lạief— defaultall-MiniLM-L6-v2
(384-dim)âm thầm thế chỗ, query khônglỗi nhưng recall tụt.

<!-- page:91 -->
LabStep 3: SemanticSearch + Answer WithContext
def answer_with_context(query, collection, k=3):
res = collection.query(
query_texts=[query], n_results=k,
where={ "category": { "$eq": "support"}}, # metadata filter TRUOC ANN
)
context = "\n---\n".join(res["documents"][0])
prompt = f """Dua tren nguon sau, tra loi ngan gon.
Neu khong tim thay, noi 'Khong co thong tin'.
Nguon:
{context}
Cau hoi: {query}"""
return call_llm(prompt) # client LLM tu chon

<!-- page:92 -->
LabStep 4: ĐoRecall@5 — Không Đoán, Đo
# No-labels recall@5: chunk nguon = positive label
# (citation-as-weak-label, xem Sec 9)
def recall_at_k(collection, pseudo_queries, k=5):
hits = 0
for query, source_chunk_id in pseudo_queries:
res = collection.query(query_texts=[query], n_results=k)
if source_chunk_id in res["ids"][0]:
hits += 1
return hits / len(pseudo_queries)
# pseudo_queries: nho LLM sinh 1-3 cau hoi CHO TUNG chunk,
# chi dua tren noi dung chunk do -> chunk do la positive
Lưu ý:Đây là floor check, không thay thế nhãn thật: câu hỏi do LLM sinh bám sát
vănphongcủachunkgốc,nênrecallđođượcthường caohơn recallthựctếkhiuser
diễnđạt lại.

<!-- page:93 -->
Tổngkết — Key Takeaways
Nhữngý chính cần nhớtrướckhi sang bài tiếp theo
1 “Không lỗi” không có nghĩa là “đúng.”6/14 failure mode học hôm nay không hề raise
exception— luận đề thật sựcủa Day 07.
2 Data qualitythường quan trọng hơn đổi sang model đắt hơn — pipeline tốt giải quyết phần
lớnvấn đề trước.
Embeddingdịchngônngữsangkhônggiansosánhđượcnghĩa—cosinelàquyước,không
phảichân lý.
4 Retrieval pipelinelà cầu nối từ dữ liệu riêng tới câu trả lời grounded — luônđorecall trước
khiđổ lỗi cho model.

<!-- page:94 -->
TàiLiệu Tham Khảo
1. Malkov& Yashunin, Efficient and Robust Approximate Nearest Neighbor Using HNSW Graphs —
arXiv:1603.09320,IEEE TPAMI2018/2020.
2. Steck,Ekanadham & Kallus,Is Cosine-Similarity of Embeddings Really About Similarity? —
arXiv:2403.05440,WWW ’24.
3. Qu,Tu& Bao, Is Semantic Chunking Worth the Computational Cost? —arXiv:2410.13070, NAACL
2025Findings.
4. AnthropicEngineering, Contextual Retrieval —anthropic.com/engineering/contextual-retrieval (2024).
5. Kusupatiet al., Matryoshka Representation Learning —arXiv:2205.13147, NeurIPS 2022.
6. Thakuret al., BEIR: A Heterogeneous Benchmark for Zero-shot Retrieval —arXiv:2104.08663.
7. Zou,Geng, Wang& Jia, PoisonedRAG—arXiv:2402.07867, USENIX Security 2025.
8. Wu,Wang,Zhang, Zhang, Niu,Wu& Zhang, Semantic Cache Poisoning and Its Countermeasures —
NDSS2026.
9. ChromaDocumentation, Collections / Query / Embedding Functions —docs.trychroma.com.
10. VietnamPDPL, Law No. 91/2025/QH15,hiệu lực 2026-01-01.

<!-- page:95 -->
Tiếptheo & Bài tập
Bàitiếp theo
BàiTiếpTheo: RAG
“Hôm nay dừng ở “top-k chunk đã sẵn
sàng.” Ngày 8 đi tiếp thành một ứng
dụng RAG hoàn chỉnh: query rewrit-
ing, prompt assembly, answer synthe-
sis, citation UX, đánh giá end-to-end.
”
Bàitập về nhà
■ Ràlại knowledge base của
nhóm,bỏ 20% nội dung nhiễu
nhất
■ Chạyno-labels recall@5 trên
chínhcorpus của nhóm, ghi lại 2
failurecase
■ Thửđổi chunk_size và
chunk_overlap,so sánh recall
trước/sau

<!-- page:97 -->
Cảmơn!
Cảm ơn!
