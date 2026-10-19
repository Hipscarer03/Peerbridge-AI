# PeerBridge — Phân tích giải pháp AI và bàn giao triển khai

<<<<<<< HEAD
> **Tư liệu lịch sử:** phân tích này dựa trên snapshot nhánh product trước khi tích hợp AICB Phase 1.
> Các nhận định bên dưới về việc catalog chỉ hỗ trợ SQL/Python hoặc module còn thiếu không mô tả code `main`
> hiện tại. Phạm vi demo hiện nay là 15 bài học AICB Phase 1; xem [README](../README.md),
> [kiến trúc](architecture.md) và [đánh giá](evaluation.md) để biết trạng thái nộp bài.

=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
Ngày phân tích: **11/10/2026**, múi giờ Asia/Saigon. Phạm vi: phân tích và thiết kế; **chưa triển khai các thay đổi được đề xuất trong tài liệu**.

Nguồn chính: **origin/product tại 1ea705110c84ab8efc19420f1a8b42bd0d534adf**. Checkout ban đầu là main tại 065fa3983ac25b57a6cb7b6376e73cfc567989f6; main chưa có các module onboarding/matching/plan_coach/metrics/loop mà yêu cầu đề cập. Vì vậy mọi mô tả “hiện có” bên dưới chỉ bản product nói trên, không phải main hoặc môi trường đã deploy.

Nhánh phân tích: **feat/ai-solution-analysis**, tách từ origin/product. Ban đầu tài liệu được giữ local theo yêu cầu; sau đó người dùng yêu cầu commit và đưa các file lên GitHub. Tài liệu này mô tả nhiệm vụ phân tích; các sửa lỗi sản phẩm thực hiện sau đó được ghi riêng trong [báo cáo sửa lỗi ngày 11/10/2026](change-report-2026-10-11.md).

Quy ước:

- **[YÊU CẦU]**: nội dung từ spec; chưa mặc định đã được code đáp ứng.
- **[HIỆN CÓ]**: đọc được trong code của commit nguồn; kiểm tra chạy được ghi riêng tại mục 11.
- **[ĐỀ XUẤT]**: hướng để PO/team review, endpoint/schema chưa tồn tại.
- **[CHỜ CHỐT]**: thiếu policy hoặc tài liệu mâu thuẫn; không được coding agent tự coi là quyết định đã duyệt.
- JSON dưới đây là ví dụ thiết kế/shape, không phải bản capture từ server thật. Những ví dụ rút gọn được ghi rõ.

## 1. Hướng lựa chọn và việc cần làm trước FE

| Phần | Hướng chọn | Tái sử dụng | Thay đổi chính |
|---|---|---|---|
| (1) Ghép cặp | LLM trích self-style/wanted-style khi sửa hồ sơ; code lọc, phân bậc, tính điểm, xếp hạng, tạo lý do | Canonical concepts, fact validation, template explanation, mutual consent | Waterfall Golden/Peer/Body Double; bỏ lịch/giờ khỏi matching; tối đa 2 cặp; thống nhất pair identity |
| (3) Tạo plan | Catalog được duyệt + rules prerequisite/capacity + LLM tùy chọn viết nội dung có cấu trúc + code xếp lịch/validate + owner xác nhận | Scheduler, prerequisite closure, idempotency, version, completion identity, proposal | Phân loại goal/tier/deadline; milestone/Queue/ngày chưa giờ; Standard/Survival; personal ownership |
| (4) Nhịp học | Code tính chỉ số và điều kiện nhắc; LLM tùy chọn diễn giải, template fallback | Measurement engine, snapshot repository, coach allowlist/quota | Version/lifecycle nhất quán, một nguồn công thức, cập nhật theo event, job độc lập người dùng mở app |

Gợi ý đọc: mục 1 để xem hướng chọn; mục 10.1 để chốt policy; mục 8–9 để bàn giao BE/FE; mục 11 để xem giới hạn bằng chứng; mục 13 là prompt giao việc FE sau review.

**Không chọn kiến trúc nhiều AI agent cho ba phần này ở MVP.** Ba coding agent A/B/C được dùng để chia việc phân tích; đây không phải bằng chứng cần ba agent chạy trong sản phẩm. Các module hiện tại phù hợp hơn với workflow hữu hạn, có schema và điều kiện dừng rõ ràng.

**Ưu tiên trước khi wire FE mới:** (a) chốt các policy tại mục 10; (b) thống nhất pair/goal/plan/item identity và ownership; (c) sửa manual schedule validator và metrics version/lifecycle; (d) công bố contract/capability mới. FE có thể dựng layout và state adapter trước, nhưng không giả định endpoint v2 đã hoạt động.

Concept (2): **giữ implementation local hiện tại cho phạm vi SQL/Python, có bước người dùng xác nhận**; đã có kết quả fixture 30/30, chưa chứng minh hiểu mục tiêu tự do ở mọi môn. Điều phối học chung (5): tạm giữ phần của Chính, nối qua pair/session adapter; không mở rộng moderator trong đợt này.

## 2. Context đã đọc và thứ tự ưu tiên nguồn

Không tìm thấy AGENTS.md trong repo, cây product hoặc các thư mục cha D:/, D:/Vin/, D:/Vin/fix/. Đã đọc README, ARCHITECTURE, CONTRIBUTING, TEAM_WORKFLOW, spec sản phẩm, spec chuyên biệt, code BE/AI/FE và test/eval liên quan.

| Nguồn | Vai trò, giới hạn |
|---|---|
| [Matching v2.1, 11/10](../Product/AI%20feature%20spec/FEATURE_SPEC_MATCHING.md) | Tiêu chí mới, còn đánh dấu chưa chốt |
| [Planning v1.0, 11/10](../Product/AI%20feature%20spec/FEATURE_SPEC_PLANNING.md) | Hybrid Queue, tier, Standard/Survival; sẵn sàng tech review không có nghĩa đã implement |
| [Product spec](../Product/PEERBRIDGE_PRODUCT_SPEC.md) | Draft tổng thể, nguồn các rule nhịp học/consent/rematch; có mâu thuẫn với spec chuyên biệt |
| [ARCHITECTURE](../ARCHITECTURE.md), [README](../README.md), [backend README](../backend/README.md) | Context lịch sử; ARCHITECTURE mô tả PostgreSQL/Qdrant định hướng, runtime nghiệp vụ vẫn có sqlite3. Một số README/link bàn giao cũ không còn đúng cây product |
| [TEAM_WORKFLOW](../TEAM_WORKFLOW.md), [CONTRIBUTING](../CONTRIBUTING.md) | Nhánh công việc feat/<ten-viec>, nhánh chung integration/peerbridge; Conventional Commits; không push trực tiếp nhánh chung |
| [main.py](../backend/app/main.py), [db.py](../backend/app/db.py), [database.py](../backend/app/database.py) | Nguồn xác định router mount, storage và dependency override thực tế |
| [FE page](../frontend/app/page.tsx), [api.ts](../frontend/lib/api.ts), [types.ts](../frontend/lib/types.ts) | Nguồn xác định màn hình đang render và contract client |

<<<<<<< HEAD
Tài liệu measurement lịch sử có ở **origin/feature/data1@2af508f67a97fc71cb33254c7799bc36cf4ea00b:docs/DATA1_CONTRACT.md**, không có trong product. Có thể đọc bằng git show; chỉ dùng giải thích policy cũ, không coi là spec nhịp học mới đã chốt. Hướng dẫn kiểm thử Plan/Coach và rubric hiện nằm trong repo. Các tài liệu lịch sử `docs/contracts/plan-coach-se-po.md` và `docs/mvp-submission` được README/eval cũ nhắc đến nhưng không có trong cây product đã kiểm tra; cần team cung cấp nếu có bản bên ngoài.
=======
Tài liệu measurement lịch sử có ở **origin/feature/data1@2af508f67a97fc71cb33254c7799bc36cf4ea00b:docs/DATA1_CONTRACT.md**, không có trong product. Có thể đọc bằng git show; chỉ dùng giải thích policy cũ, không coi là spec nhịp học mới đã chốt. Các link docs/plan-coach-testing.md, docs/plan-eval-rubric.md, docs/contracts/plan-coach-se-po.md và docs/mvp-submission được README/eval cũ nhắc đến nhưng không có trong cây product đã kiểm tra. Cần team cung cấp nếu có bản bên ngoài.
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

**Đề xuất ưu tiên spec chuyên biệt 11/10 cho matching và plan**, giữ rule an toàn/consent của spec tổng khi không xung đột. Đây là quyết định thiết kế tạm để review, không tự sửa các spec nguồn.

## 3. Concept: đủ dùng ở đâu, còn thiếu gì

### 3.1 Implementation hiện tại

[onboarding/contracts.py](../backend/app/onboarding/contracts.py), [catalog.py](../backend/app/onboarding/catalog.py), [retrieval.py](../backend/app/onboarding/retrieval.py), [normalization.py](../backend/app/onboarding/normalization.py), [service.py](../backend/app/onboarding/service.py), [repository.py](../backend/app/onboarding/repository.py) có:

- Catalog version 2026-10-06.1: 60 concept, 30 SQL + 30 Python; ID canonical, prerequisite cùng domain, kiểm cycle/ID trùng.
- Local lexical/alias retrieval top 5. Score là heuristic, không phải xác suất embedding.
- Local selector chỉ map khi score >=0.75 và cách ứng viên kế >=0.12; ngoài domain/mơ hồ thì null.
- Structured selector/extractor là port tùy chọn, phải inject client; service mặc định vẫn local, không tự gọi model.
- Extractor local giữ form structured; goal-only thành một topic, không tự chia đầy đủ nhiều kỹ năng.
- Draft → người dùng sửa/xác nhận từng mapping → confirmed. Revision guard trả 409 khi stale; không cho ID ngoài catalog/cross-domain.
- Theta khởi tạo unknown=-1, learning=0, strong=1; khi reconfirm giữ theta đã có attempts. Đây chưa phải bằng chứng năng lực được đo thật.

**Kết luận:** giữ local mapping + review cho SQL/Python, không cần vector DB/model mới ngay. Kiểm tra 30 fixture đúng 30 được chạy lại tại mục 11; test/API confirmation chưa được chạy thành công do dependency môi trường. Không gọi phần này là “LLM Concept đã ổn”.

### 3.2 Ảnh hưởng đến các phần khác

| Vấn đề hiện có | Ảnh hưởng | Hướng xử lý |
|---|---|---|
| FE hồ sơ gọi /profiles/me; Concept dùng /profile và /profile/confirm riêng | Sửa profile FE không tự tạo concept profile confirmed; matching FE cũ không sử dụng Data 1 concepts | Thêm bước review canonical mapping; BE cung cấp projection chung, tránh hai form tự mâu thuẫn |
| Onboarding bắt committed_weekly_hours>0, dù matching spec mới bỏ giờ/lịch khỏi onboarding ghép | Không thể chỉ xóa input FE mà vẫn gọi schema cũ | Tách goal/style/concept input khỏi plan capacity ở v2; không gửi giờ giả để qua validation |
| Môn ngoài SQL/Python giữ unmapped; IELTS chưa có canonical catalog | Matching không có concept evidence, metrics engine hiện validate mọi ID qua catalog | Hiện unsupported/needs review; body double chỉ khi có evidence style/deadline, không gán môn lạ thành SQL |
| Plan default có demo catalog; team catalog phải cấu hình riêng | Plan có thể tạo ID không được measurement chấp nhận | Chốt catalog_version cho toàn luồng; dùng team catalog được kiểm định, chặn unknown ID trước accept |
| [build_plan_catalog.py](../backend/scripts/build_plan_catalog.py) thêm action/output/minutes dạng template, nguồn resources rỗng | Nội dung/thời lượng chưa qua curriculum review; không có RAG grounding mặc định | Người phụ trách học liệu duyệt template, prerequisite, priority và nguồn; không hứa cá nhân hóa mọi môn |
| Offer/self-level do user khai; completion/ảnh không chứng minh mastery | Có thể hứa quá mức “bạn này dạy được”, skip prerequisite sai | Badge “tự khai có thể hỗ trợ”; mastery chỉ từ diagnostic riêng nếu triển khai |
| Draft profile mới tạm làm /profile/confirmed trả 409 | Search mới cần trạng thái chờ xác nhận; không dùng draft như dữ liệu đã duyệt | Giữ profile revision đã xác nhận cho snapshot hiện hành hoặc yêu cầu confirm; policy chọn một cách rõ ràng |

MVP dùng canonical ID để so concept, không dùng prompt LLM để tính semantic similarity giữa từng cặp. Khi mở domain, mở catalog/alias trước; chỉ thêm embedding khi golden set độc lập cho thấy lexical không đủ.

## 4. Ghép cặp

### 4.1 Bài toán và tiêu chí thành công

Input: một goal active, concept need/offer đã xác nhận, bio/wanted-peer text hoặc style chips, deadline, trạng thái consent/capacity/block/report/dismiss. Output: danh sách gợi ý có tier, lý do có bằng chứng, chất lượng/thiếu dữ liệu, hoặc waiting/invite fallback. Kết quả tìm kiếm **không tạo cặp**.

[YÊU CẦU] Matching spec mục 4–9: bỏ lịch/giờ cam kết khỏi matching V1; user chọn; tối đa 2 cặp; ba tier; <=5s; gợi ý ít nhất 5 khi pool cho phép; fallback sau 24h. Acceptance/retention là outcome cần pilot, không suy từ score hay synthetic Precision@3.

### 4.2 Hiện trạng và khoảng cách

| Luồng | Hiện có | Cần đổi |
|---|---|---|
| FE active → /api/v1/matches/search → /connections | [Matching.tsx](../frontend/features/peer-connections/components/Matching.tsx), [services/matches.py](../backend/app/services/matches.py) trả top15, score 0–100, mutual consent | Thay ranking/schema, giữ consent và shell FE |
| [services/matching_engine.py](../backend/app/services/matching_engine.py):64–121 | Lọc self + hỗ trợ một chiều/shared need/goal lexical; weights skill45/topic20/schedule25/preference10 | Loại schedule khỏi matching; body double khác môn có thể bị filter cũ loại sớm |
| [services/match_ai.py](../backend/app/services/match_ai.py):10–24 | Optional LLM rerank nhận major/bio/goals/needs/offers; thay total_score nhưng giữ component_scores | Tắt cho hướng mới: không gửi major; tổng điểm/lý do phải cùng snapshot và công thức |
| [matching/filters.py](../backend/app/matching/filters.py):17–45 | Confirmed concept profile, >=2 common slots, deadline cách <=28 ngày, hours ratio<=2 | Bỏ hard gate lịch/giờ và khoảng cách deadline28ngày; deadline chuyển sang urgency/goal scoring theo spec mới |
| [matching/scoring.py](../backend/app/matching/scoring.py):18–88 | Theta offer>=0.5; reciprocal35/overlap25/slot20/commitment20; bốn level cũ | Reuse canonical/facts, đổi Waterfall và style |
| [matching/service.py](../backend/app/matching/service.py):54–99 | /pairs/match enqueue, có thể tự ghép hai người waiting | Không dùng auto-pair cho UI mới; queue chỉ chờ gợi ý, accept phải rõ ràng |
| [matching/schema.py](../backend/app/matching/schema.py):20–23 | pair_memberships user_id PRIMARY KEY, chỉ 1 pair | Composite membership và kiểm cap2 trong transaction |
| [matching/reranking.py](../backend/app/matching/reranking.py) | Whitelist/facts/score guard tốt, fallback provider/timeout | Reuse guard nếu thử rerank về sau, giới hạn trong tier; MVP không cần rerank |

GET /matches/{request_id} hiện đọc lại profile mới nhưng score đã lưu; matching_mode có thể về local. Không coi reasons/profile trên GET là cùng snapshot sinh score. Response mới cần snapshot_revision/scoring_version và public profile snapshot hoặc timestamp rõ.

### 4.3 Luồng được đề xuất

1. BE kiểm student, goal active và confirmed concept/profile revision.
2. Hard filters: self, block hai chiều, report được admin phê duyệt, active_count>=2, không opt-in tìm thêm khi đã có 1 cặp, directional “Không hợp”, cùng pair đang active. Friend invite cũng phải qua safety/capacity.
3. Lấy self/wanted-style đã cache theo profile_revision + prompt_version; không gọi model trong search.
4. Tính tier/score bằng code, partition QUALIFIED trước EXPLORATORY; trong từng nhóm mới xếp tier ưu tiên, score giảm dần và ID ổn định. Golden dưới ngưỡng không được che Peer đạt ngưỡng.
5. Chọn topK thật có trong pool; render reasons từ fact/reason_code.
6. User gửi lời mời, đối phương accept; BE kiểm lại capacity/safety/revision trong transaction rồi activate pair.

| Tier | Điều kiện từ spec | Concept/style/goal weight | Diễn giải |
|---|---|---|---|
| GOLDEN | Need A↔offer B và need B↔offer A | .35/.45/.20 | Hai bên có concept hỗ trợ nhau; không bảo đảm kết quả học |
| PEER | Shared need concept + style đủ evidence/tương thích | .25/.50/.25 | Cùng học một nội dung |
| BODY_DOUBLE | Khác môn + cùng urgency + style rất hợp | 0/.60/.40 | Đồng hành giữ nhịp, không hứa hỗ trợ kiến thức |
| Không qualified | Không đạt điều kiện/score ngưỡng .50 | — | Waiting; có thể có exploratory theo policy PO duyệt |

ConceptScore reciprocal=1; shared canonical concept dùng nền .8 theo spec; khác môn=0. One-way .7 có trong spec nhưng **chưa có tier tương ứng**: đề xuất biến thể PEER, chờ PO, tuyệt đối không gắn GOLDEN.

Style cần hai phía self/self và wanted/self. Đề xuất weighted mean trên các chiều có evidence, không lấy trung bình tích confidence rồi coi thiếu dữ liệu là bất tương thích:

~~~text
dimension_weight = min(confidence_self_A, confidence_self_B)
self_compatibility = sum(rule_i * dimension_weight_i) / sum(dimension_weight_i)
wanted_compatibility = weighted_mean(A_wants↔B_self, B_wants↔A_self)
style_score = 0.6*self_compatibility + 0.4*wanted_compatibility
~~~

Confidence enum chưa có mapping numeric được duyệt. Tất cả unknown → style_score=null, evidence_coverage thấp; không dùng null=0 hoặc tự khẳng định “rất hợp”. Ngưỡng HIGH/VERY_HIGH và số chiều tối thiểu phải được PO duyệt trước mở PEER/BODY_DOUBLE. Nếu một thành phần thiếu, chuẩn hóa lại trọng số phần có dữ liệu và gắn uncertainty; không coi score thiếu evidence tương đương score đầy đủ evidence.

Goal urgency tạm theo Planning mới: GAP<14 ngày, VUA=14..60, DAI>60; thiếu deadline=UNSPECIFIED, đã hết hạn yêu cầu sửa goal. Goal similarity MVP từ canonical topic/domain; không cần model mỗi search. Bonus duy trì tối đa .05, clamp tổng <=1; chưa đủ history → bonus0, không phạt drop.

**K và no-match:** K=min(pool_an_toan, max(5,min(20,floor(pool_an_toan*.2)))). Pool0/1/4 chỉ trả0/1/4; không nới hard filters để đủ5. Đề xuất fill qualified ở tier thấp hơn khi tier cao chưa đủ K; exploratory chỉ fill phần còn thiếu nếu policy cho phép. Dưới .50 không giả là qualified; thiếu bằng chứng gán tier thì match_type=null và lời trung tính hoặc không trả ứng viên, tuyệt đối không gán PEER/BODY_DOUBLE giả. Rematch lần2 không backfill exploratory theo spec tổng. Queue giữ waiting_since qua refresh; job sau24h kiểm lại vẫn waiting, goal/capacity hợp lệ và không có qualified trong **toàn pool eligible**, không chỉ topK, rồi mới tạo một lời mời thử bạn quen/concierge. Accept hoặc đã tìm được qualified phải đóng queue, không nhắc muộn; không cần user mở lại màn hình mới kích hoạt.

School toggle chỉ reorder **trong topK đã chọn**, giữ score/algorithm_rank; không gửi trường/ngành vào model hoặc tăng điểm.

### 4.4 Cases và fallback

| Case | Kết quả/UX |
|---|---|
| Profile thiếu/wanted text ngắn | Chips “chưa rõ”, chỉ rõ field cần xác nhận; giảm evidence, không gán tính cách |
| Không Golden | Xét PEER rồi BODY_DOUBLE; không cần cả hai dạy nhau mới được gợi ý |
| Khác môn, deadline/style thiếu | Không khẳng định body double hợp; waiting/exploratory nếu policy cho phép |
| Pool ít/không ai | Danh sách thực có + lý do chờ + mời bạn quen; không tạo profile giả |
| Hai accept đồng thời vào slot cuối | Một transaction thành công; request còn lại CAPACITY_REACHED; không vượt2 |
| Candidate sửa goal/profile hoặc bị block sau search | Revalidate khi mời/accept; CANDIDATE_UNAVAILABLE hoặc conflict |
| LLM extract timeout/sai schema/prompt injection | Unknown/degraded + chips; không chặn search vô hạn, không đổi policy |
| Đổi goal | Invalidate snapshot/dismissal scope theo goal; goal cũ completed/cancelled trước goal mới |
| Kết thúc cặp | Thu hồi share theo policy, giữ plan cá nhân; active capacity giảm, không carry streak lifecycle cũ |

### 4.5 So sánh lựa chọn

| Phương án | Độ chính xác/kiểm soát | Độ trễ/chi phí | Công triển khai/giải thích |
|---|---|---|---|
| Rules + user chips | Tốt với structured data; hạn chế hiểu text | Không model cost, nhanh | Dễ nhất, baseline/fallback |
| **Cached LLM extraction + code** | Hiểu text, ranking/policy audit được | Call chỉ lúc sửa profile; search không model | Vừa nguồn lực, giải thích rõ AI làm gì |
| LLM rerank/score mỗi search | Semantic linh hoạt, score dễ lệch facts và bias | Nhiều call, khó giữ <=5s | Cần dataset độc lập/live eval; chưa chọn |
| Nhiều agents tranh luận ghép | Chưa có bằng chứng lợi ích | Nhiều call/context/điểm lỗi | Không phù hợp pilot nhỏ |

Chỉ thử rerank khi human labels cho thấy lỗi semantic đáng kể sau chuẩn hóa; khóa hard filters/tier, đo acceptance/p95/cost. Không chọn thêm agent chỉ để demo nhiều “AI”.

## 5. Tạo plan

### 5.1 Bài toán và hiện trạng

Input: goal/type/deadline, tier, concept/known prerequisite được xác nhận, capacity và ngày/giờ rảnh. Output: lộ trình có milestone/criteria, nội dung Standard/Survival, lịch tuần khả thi + Queue + phần chưa đủ thời gian, draft để owner quyết định.

[YÊU CẦU] [Planning spec](../Product/AI%20feature%20spec/FEATURE_SPEC_PLANNING.md):43–145: NEWBIE/TRANSFER/REFRESHER; Must/Should/Cut khi gấp; giờ optional; Standard30–60p/Survival15p; ngày đệm; Today/Week/Month; comment từng buổi. Outcome85% tạo plan phiên đầu,70% quay lại48h là **mục tiêu pilot**, chưa có evidence đạt.

[HIỆN CÓ]:

- [contract.py](../backend/app/agents/plan_coach/contract.py):64–175 bắt đúng2 members, pair_id; task30–90p; SCHEDULED/DEFERRED/COMPLETED; không tier/milestone/two-mode/day-only.
- [llm.py](../backend/app/agents/plan_coach/llm.py):18–25,171–239: prompt v2-minimal; model chỉ nhận goal/required tasks/resource IDs, không nhận tier/deadline. Một lần sinh + tối đa2 repair, mỗi call timeout mặc định20s. Không có batch hợp lệ thì fail; **live fail không tự fallback template**.
- [scheduler.py](../backend/app/agents/plan_coach/scheduler.py):15–145 tính prerequisite closure/coverage, validate task/schema/resource;172–323 xếp UTC/timezone, deadline, busy study sessions, <=80% weekly commitment, một activity trên một occurrence slot, thiếu chỗ thì deferred/partial;326–445 validate plan.
- [services/plans.py](../backend/app/services/plans.py):212–344 có idempotency/lock/race check, một active plan/người toàn hệ thống, ghi đè request availability bằng profile nếu đã có; generate lưu cả2 plan ACTIVE ngay.
- Completion theo stable item ID và timestamp; replan là code-only, draft cho owner, giảm20% phần budget còn lại; accept kiểm version/progress hash/busy intervals. Không auto accept.
- [commitments.py](../backend/app/services/commitments.py) lưu acknowledgment riêng theo hai version; **ACTIVE không có nghĩa hai người đã cam kết**.
- [plan_notes.py](../backend/app/services/plan_notes.py) là note cấp pair, chưa comment từng item/notification.

### 5.2 Vấn đề cần sửa trước dùng FE mới

| Ưu tiên | Bằng chứng | Ảnh hưởng/hướng sửa |
|---|---|---|
| P0 | [plans.py:143–196](../backend/app/services/plans.py#L143) manual schedule cho tới365 ngày, không validate_plan/deadline/horizon/budget/availability | Dùng chung policy validator cho generate/schedule/replan/accept; không sửa FE để che lỗi BE |
| P0 | Manual edit gán slot_id=null, context version chưa cập nhật cùng own version | Có thể không tương thích validator/replan về sau; cần regression tái hiện, kết luận ảnh hưởng runtime còn chưa xác minh |
| P1 | Actor nhập thông tin cả2, generate ACTIVE ngay | Chưa có owner draft approval; không cho một người tự cam kết/đổi prerequisite của partner |
| P1 | Một active plan/người nhưng ràng pair; ended pair cần giữ plan, spec cho tối đa2 cặp | Tách personal plan theo goal, share với pair; tránh tạo2 plan/budget trùng cho một người |
| P1 | Test [test_plans_api.py:98](../backend/tests/test_plans_api.py#L98) cấm partner.items; service:117 và FE active hiển thị items | Test/behavior drift; PO chốt sharing scope rồi sửa test meaningful, chưa được nói privacy suite pass |
| P1 | Greedy một task/slot dù slot dài | Có thể partial dù tổng phút còn đủ; chia slot thành chunk/buffer hoặc ghi giới hạn, chưa cần optimizer |
| P1 | [scheduler.py:15–29](../backend/app/agents/plan_coach/scheduler.py#L15) bỏ target nếu cũng nằm trong known; TaskBatch cho phép rỗng | Probe kernel đã tái hiện0task,2plan rỗng/partial=false/không warning và validator pass. Service có thể lưu ACTIVE rỗng, bước DB/API chưa tái hiện. Tách known prerequisite khỏi target cần ôn; không trả thành công rỗng |
| P1 | Horizon tối đa28 ngày, FE gửi7; không rolling week | Mục tiêu dài cần milestone dài hạn + tuần đang thực hiện, không sinh lịch vụn cả quý |
| P1 | Demo catalog/English concept khác Data1 | Chặn trước accept nếu canonical catalog không hỗ trợ; không dùng generic SQL task cho môn lạ |

### 5.3 Phân loại case để triển khai

| Trục/case | Code quyết định | LLM/nội dung và lựa chọn cho user |
|---|---|---|
| NEWBIE | Expand prerequisite chưa biết, topological order | Nền → ví dụ → thực hành nhỏ |
| TRANSFER | Chỉ skip known concepts đã xác nhận/diagnostic; không suy từ “biết C++” là biết Python | Giảm giải thích nền chung, tập trung khác biệt domain |
| REFRESHER | Chọn lỗ hổng qua self-report/diagnostic optional; target muốn ôn vẫn phải được tạo task dù user từng biết | Cheat sheet, dạng bài, luyện đề; nếu thật sự không còn scope thì NOTHING_TO_PLAN/NEEDS_REVIEW, không ACTIVE rỗng |
| EXAM, GAP<14 ngày | Must/Should/Cut từ curriculum được duyệt; kiểm capacity core trước | Nêu coverage, không hứa chắc qua môn |
| 14..60 ngày | Milestone + lịch7 ngày, review tuần | Tải vừa, nội dung bám mục tiêu |
| >60 ngày | Roadmap dài, rolling week; không schedule toàn bộ | Giữ khả năng thay nhịp |
| Thiếu deadline | UNSPECIFIED urgency, queue/open-ended | Cho tạo draft, hỏi thêm khi cần cam kết mốc |
| Deadline quá hạn | NEEDS_DECISION/DEADLINE_PAST | Đổi mốc hoặc giảm scope; không tự gia hạn. Pause chờ policy/capability riêng |
| Prerequisite thiếu/cycle/ID lạ | Validation error trước model | Chỉ rõ dữ liệu cần sửa |
| Capacity0/không ngày rảnh | Queue hợp lệ, không fabricated schedule | Chọn ngày/phút hoặc giữ roadmap |
| Có ngày, chưa giờ | Schedule precision DAY, due_at cuối study day | Không ép HH:mm; card20h hỏi giờ ngày mai, “tự do” hợp lệ |
| Có giờ cụ thể | Validate windows/timezone/no-overlap/session/budget | Cho đổi giờ, dùng cùng invariant |
| Không đủ toàn scope | PARTIAL nếu core vẫn khả thi, optional để Queue/Cut | Hiện required/available/coverage, chọn tăng thời gian/giảm scope/đổi deadline |
| Không đủ core | NEEDS_DECISION, chưa ACTIVE giả thành công | Trình bày3 lựa chọn, giữ draft |
| Solo | Plan của owner, không cần pair | Plan/coach cá nhân dùng trong lúc chờ ghép |
| Pair cùng môn | Hai plan cá nhân, shared session optional | Cùng ôn concept khi cả2 đồng ý/lịch giao nhau |
| Pair khác môn | Không ép chung curriculum | Cùng accountability/body double; nội dung riêng |
| Replan sau evidence | Giữ item_id/completion, version/progress hash | Diff trước/sau, owner accept |
| Partner đổi lịch | Re-evaluate shared session suggestion | Không tự đổi lịch/goal của owner |
| LLM lỗi | Bounded repair rồi error; template fallback mới phải explicit | Retry giữ key, hoặc dùng bản mẫu có nhãn |
| Môn ngoài catalog | UNSUPPORTED_SCOPE/NEEDS_CLARIFICATION | Chưa hứa template TOEIC/Giải tích đã có chỉ vì spec nêu ví dụ |

Quy tắc “TRANSFER bỏ100% bài nền” trong spec mới cần điều chỉnh: nhãn tier không chứng minh biết prerequisite cụ thể. Tương tự Survival15p chỉ giữ nhịp, không tự tương đương hoàn tất45p Standard hay mastery.

### 5.4 Workflow và so sánh

Chọn: xác nhận goal/concept → prerequisite/scope/capacity bằng code → lấy template học liệu → optional LLM viết milestone/task/two-mode → validate → code xếp tuần đầu → draft + feasibility → owner accept.

| Phương án | Độ chính xác/kiểm soát | Độ trễ/chi phí | Khó triển khai/demo |
|---|---|---|---|
| Rules/template | Invariant tốt; curriculum cần duyệt, personalization hạn chế | Nhanh, không token | Baseline bắt buộc, giải thích dễ |
| **Một LLM workflow + code** | Code bảo vệ prerequisite/lịch; model tùy biến nội dung trong scope | Một call + repair giới hạn, cache theo catalog/tier | Tái sử dụng repo tốt nhất |
| Nhiều planner/scheduler/reviewer agents | Thêm reasoning nhưng dễ bất nhất/loop, chưa có evidence hơn hybrid | Nhiều call, latency/cost tăng | Chỉ xét khi curriculum mở/nhiều nguồn và eval chứng minh lợi ích |

Mục tiêu <=5s của spec chưa tương thích timeout20s×3 hiện tại. Đề xuất trả template draft trong luồng nhanh; enrichment LLM async có trạng thái và người dùng quyết định, hoặc chọn generation async202. Không hứa model thật sinh xong <=5s khi chưa benchmark. Không âm thầm thay draft user đang xem bằng kết quả model.

## 6. Theo dõi nhịp học

### 6.1 Bài toán, nguồn và chỉ số hiện tại

Nguồn: plan ACTIVE + estimated minutes/schedule/completed_at từ Data2; finalized check-in từ Vision/text; pair lifecycle; optional reminder response/diagnostic observations. Chat moderator không phải nguồn xác định tiến độ.

[metrics/engine.py](../backend/app/metrics/engine.py):14–146 hiện:

~~~text
completed_minutes = sum(estimated_minutes của unique completed item chưa cancelled)
due_minutes = sum(estimated_minutes của item đáng lẽ xong đến ngày đo)
pacing_raw = completed_minutes / due_minutes
pair_score = min(pacing_A, pacing_B)
gap = abs(pacing_A - pacing_B)
~~~

Pacing không cap1; khi due=0, nội bộ trả1 kèm has_due_workload=false. Đây **không phải “đã hoàn thành100%”**. Pair score này khác matching score; hai tên không dùng lẫn trên UI.

- Duplicate ID giống nhau collapse; mâu thuẫn reject; nhiều check-in một item chỉ credit1 lần.
- Chỉ done có finalized_at hợp lệ được tính; processing/needs_confirm/not_study/failed chưa tính.
- Done không link item có presence nhưng0 phút; không lấy số ảnh làm workload.
- Completed future work được credit, pacing có thể>1. Untimestamped COMPLETED không đủ dựng lịch sử.
- [metrics/time.py](../backend/app/metrics/time.py): study day Asia/Ho_Chi_Minh cutoff03:00;02:59 thuộc hôm trước.
- Streak hiện là ngày cả2 cùng check-in done. Lifecycle lọc từ pair.started_at.
- Risk là trọng số thủ công absence/frequency/pacing/partner/reminder/theta, có null/observed_weight/upper_bound; không phải ML probability, không hiển thị như xác suất bỏ học.

[YÊU CẦU] Product spec:115–140 đặt pilot thresholds pacing<.7, gap>.3, vắng2ngày, tối đa1tin/người/ngày, quiet22–07; thêm Monday reset/unread3/ghost3-5-7 ở các mục sau. **Spec nhịp học mới riêng chưa có trong product**.

### 6.2 Những điểm nối đang không nhất quán

| Ưu tiên | Bằng chứng | Ảnh hưởng/cần sửa |
|---|---|---|
| P0 | [loop/coach_bridge.py:26–50](../backend/app/loop/coach_bridge.py#L26) ghép version plan hiện tại vào metric cũ | Có thể vượt stale-version gate sau replan; snapshot phải lưu chính revisions đã dùng |
| P0 | [loop/measurement.py:22–77](../backend/app/loop/measurement.py#L22) chỉ ACTIVE, source revision=versions+count checkin | Recompute lịch sử bằng lịch mới; status/link đổi không đổi revision; chưa bảo đảm coherent snapshot |
| P0 | [checkin/service.py:240–290](../backend/app/checkin/service.py#L240) streak/presence không scope pair lifecycle, progress fallback công thức riêng | Feed/home/metrics có thể khác nhau hoặc carry cặp cũ; chỉ dùng một projection công thức |
| P1 | [metrics/service.py:66](../backend/app/metrics/service.py#L66) có late-finalization hook; [checkin/actions.py:244](../backend/app/checkin/actions.py#L244) chỉ gọi after_activity | Service/test có sửa ngày gốc, luồng tích hợp hiện chỉ recompute hôm nay |
| P1 | Không hook sau generate/replan accept/schedule edit; home chỉ kiểm “đã có snapshot hôm nay” | Snapshot cùng ngày vẫn stale khi plan đổi |
| P1 | Metrics raw uncapped; home cap2, coach cap1 nhưng gap từ raw | Cùng tên khác nghĩa, ahead vẫn có thể bị gợi ý “chậm hơn”; phải tách raw/projection/signals |
| P1 | Engine chống float>.3, coach dùng >.3 trực tiếp | 1-.7=.30000000000000004 có thể trigger khác nhau |
| P1 | [metrics/engine.py:48–49](../backend/app/metrics/engine.py#L48) absence theo chênh study_date; [coach.py:56–62](../backend/app/agents/plan_coach/coach.py#L56) theo48h, trước check-in đầu lấy first due | Hai phép tính hiện khác nhau; chốt policy rồi dùng chung helper/signal, không chỉ đổi wording |
| P1 | [main.py:42](../backend/app/main.py#L42) periodic default0; /jobs/daily-metrics chỉ tính metrics | Không bảo đảm nhắc người không mở app |
| P1 | [loop/trigger.py](../backend/app/loop/trigger.py), [home/overview.py:153](../backend/app/home/overview.py#L153): check-in gọi đồng bộ, GET home có thể compute/evaluate/send | LLM kéo dài request đọc/check-in; chuyển side effect sang job/outbox |
| P2 | Quota reservation giữ cả khi delivery fail/suppressed | Có thể mất tin cả ngày; retry cùng intervention/key, không tạo tin mới |

Các vấn đề trên là **kết luận kiểm tra code**; standalone eval rules không bao phủ hết integration race/version/lifecycle này. Cần regression/e2e riêng trước release.

### 6.3 Semantics đề xuất để dùng chung BE/FE

1. Tách **goal progress** (khối lượng Standard đã hoàn tất / tổng scope đang active, gồm phần Queue còn giữ trong goal nhưng loại Cut), **pacing_raw** (khối lượng Standard đã hoàn tất / khối lượng đã đến hạn), và **consistency** (presence/Survival/personal streak). Không gọi ba chỉ số là một “tiến độ”.
2. Queue/Cut/cancelled không vào due denominator; scheduled DAY có due_at cuối study day, TIME có due_at=scheduled_end. Không lấy ngày bắt đầu thay giờ kết thúc để nhắc sớm.
3. Pilot giữ timezone Asia/Ho_Chi_Minh/cutoff03:00 cho mọi module. DAY ngày12/10 đến hạn03:00 ngày13/10. Khi mở nhiều timezone, lưu timezone/cutoff vào snapshot thay vì mỗi module tự mặc định.
4. No due → pacing_raw=null, measurement_status=NO_DUE_WORK, không nhắc chậm. Backend lưu raw; FE chỉ cap chiều rộng progress bar, không sửa dữ liệu.
5. Đề xuất Survival có presence/streak credit; **0 Standard workload credit đến khi hoàn tất Standard criteria**. Lưu survival_completed_at riêng; actual_minutes là tự báo, không thay estimated workload hoặc mastery. Policy này cần PO duyệt.
6. Giữ personal_streak độc lập với partner; mutual_streak là thông tin hoạt động chung riêng. Partner vắng không xóa personal consistency. Ngày nghỉ/buffer có bảo toàn streak hay không còn chờ PO.
7. Nội bộ tính support_gap trên min(pacing_raw,1), chỉ khi cả2 có due; raw gap vẫn audit. Coach dùng boolean signals chung có tolerance .3, không tự tính lại. Cả2 ahead không gợi ý “bạn chậm hơn”.
8. Mỗi snapshot lưu plan_id/revision của từng owner, pair lifecycle_id, evidence_revision, rules_version, computed_at/source_revision. Không thay revisions của snapshot cũ bằng revision mới.
9. Lịch sử là snapshot facts/as-of có version; plan revision không được biến thành “learning gain”. Sửa evidence trễ cần recompute từ ngày evidence đến hôm nay trong vòng retention cho phép; lưu audit correction.
10. Thiếu source/stale/incoherent → no_action, giữ snapshot cũ với freshness=STALE; không biến thành0% hoặc dữ liệu đã đủ.

**Ranh giới lifecycle:** own workload/progress theo goal/plan lifecycle, giữ cả completion trước khi đổi partner; pair presence/mutual streak theo pair lifecycle. Pair view lấy own workload snapshot đã tính, không lọc lại completion cá nhân theo pair.started_at. Engine hiện [engine.py:93–106](../backend/app/metrics/engine.py#L93) lọc completion từ pair start; phải tách adapter/phạm vi trước reuse cho personal plan, nếu không cặp mới làm mất credit cũ.

Presence_at đề xuất là thời điểm người dùng thực hiện/submit hợp lệ, server giới hạn backdate; finalized_at là lúc xác nhận. AI xử lý chậm không dời ngày học. Nếu chưa có occurred_at thì dùng created_at như hiện tại và ghi provenance. Việc dùng “2 study days” hay48h để nhắc phải chốt; tạm giữ metric absence2study days và hiển thị policy rõ, không dùng2 công thức ở coach.

### 6.4 Nhắc nhở, AI và fallback

Rules quyết định đủ điều kiện, quota/quiet/pause, action allowlist; AI chỉ viết lời. Đề xuất ưu tiên trigger: cần chọn giờ cho ngày mai → phục hồi việc lỡ → replan khi deficit → support có consent → absence reminder; nhiều trigger gộp một can thiệp/người/ngày. Ưu tiên này **chờ PO**, không thay priority hiện tại âm thầm.

Pause chưa có state/command trong contract MVP đề xuất. Cho tới khi D11 chốt phạm vi pause/resume, capability pause=false; FE không tự chế PAUSED hoặc gửi CANCELLED thay cho tạm nghỉ. Quiet hours và source/no-due gates vẫn dùng độc lập.

Hiện [coach.py](../backend/app/agents/plan_coach/coach.py):16–69 ưu tiên pair_replan/replan rồi offer_support/reminder, luôn có no_action; snapshot>24h/version lệch/no due bị chặn. [services/coach.py](../backend/app/services/coach.py) giới hạn action, reserve quota, recheck quiet, tạo proposal và phân biệt delivery states.

[ĐỀ XUẤT] Job định kỳ độc lập browser xử lý check-in/plan changes và mốc20h/absence/24h-no-match. Có lease một worker, event dedup, retry cùng key; không dựa background task in-memory trên từng API instance. Local pilot có thể một process nhưng vẫn lưu job cursor/quota vào DB.

SENT hiện tại ở [InAppNotification](../backend/app/loop/coach_bridge.py) chỉ có nghĩa ghi được thông báo vào chuông, chưa chứng minh push/email hoặc người học đã đọc. [notifications.py](../backend/app/home/notifications.py) đã có read_at/mark_read và POST /notifications/read; còn thiếu liên kết notification_id↔intervention và semantics đọc từng reminder để rule3tin dùng chính xác. V2 reuse read_at, bổ sung notification_id/channel=IN_APP/delivery_status=STORED; không gọi STORED là “user đã đọc”. LLM lỗi/quota hết → template cùng action; metrics/check-in vẫn hoạt động. Không gửi raw chat, ảnh, PII hoặc risk của partner vào coach.

### 6.5 Cases và so sánh

| Case | Hành vi được đề xuất |
|---|---|
| Một người chưa plan | Own metrics vẫn có thể READY; pair signals WAITING_FOR_PLAN, không giả0% partner |
| Vừa tạo plan/chưa due | NO_DUE_WORK, không nhắc ngay |
| Processing/needs_confirm/failed | Chưa credit; UI xử lý/xác nhận/thử lại |
| Unlinked done | Presence có, workload0; CTA link item của owner |
| Replay/nhiều ảnh cùng item | Một workload credit, một ngày presence |
| Duplicate ID khác nội dung | Conflict có audit; không chọn bản có progress cao hơn |
| Late confirm qua03:00/replan | Credit đúng item/ngày/lifecycle; backfill và invalidate version |
| Đổi plan/dời/defer/cancel | Version bump, giữ completion identity; due recompute với policy mới |
| Pair ended/reactivated | Chặn reminder/refresh active cũ, history theo quyền; lifecycle mới riêng |
| Cả2 ahead | Không nudge so sánh từ raw gap |
| LLM/template unavailable | No AI copy hoặc template an toàn; không bịa metrics |
| Notification fail | sent=false/retry cùng key; không tính là đã đọc |

| Phương án | Chính xác/kiểm soát | Độ trễ/chi phí | Lựa chọn |
|---|---|---|---|
| Rules/template | Số học tái lập, nội dung ít đa dạng | Thấp, không token | Baseline bắt buộc |
| **Rules + optional LLM wording** | Chỉ số/action code giữ quyền, AI cải thiện cách diễn đạt | Tối đa1 call có timeout/budget | Chọn sau khi sửa data integration |
| Nhiều agents/ML risk | Không sửa được sai version/dedup; cần labels riêng | Chi phí/điều phối cao hơn | Hoãn tới khi pilot chỉ ra nhu cầu và có eval độc lập |

## 7. Kiến trúc tích hợp và trách nhiệm

### 7.1 Identity, ownership và lifecycle

**[HIỆN CÓ]** Plan authorize qua peer_matches; metrics qua pairs + memberships. /connections accept chỉ tạo peer_matches, [loop/pairing.py](../backend/app/loop/pairing.py):33–80 mới bổ sung pairs khi học, chọn kết nối gần nhất. Check-in cũng có fallback latest pair. Cơ chế này không đủ cho hai cặp active.

**[ĐỀ XUẤT]**

- Pair ID numeric canonical cho mọi API mới. Accept mutual consent atomically activate cả projections; memberships composite(pair_id,user_id), recheck cap2 cho cả2 thành viên. Migration lưu mapping từ canonical ID tới peer_matches.id/pairs.id cũ; chỉ tái sử dụng cùng số khi xác minh đúng hai thành viên/lifecycle, không mặc định mọi ID cũ bằng nhau.
- Lifecycle ID mới cho mỗi lần activate/reactivate; không dùng mỗi pair_id để phân biệt lịch sử hai đợt.
- Goal ID UUID, owner lấy từ auth; một goal ACTIVE/người. Goal có concept/profile revisions, không đồng nhất với pair.
- Personal plan ID UUID thuộc goal/owner; một plan ACTIVE/goal; share_pair_ids tối đa2 theo consent. Một người có2 partner vẫn dùng **một** plan/budget/completion, không copy2 lần.
- Item ID UUID ổn định qua schedule/replan; content_revision riêng nếu nội dung/criteria đổi. Plan revision tăng khi lịch/scope đổi. Không dùng array index làm ID.
- study_sessions.id hiện là ID phòng/buổi học chung của Chính; plan_item_id là việc cá nhân. Không đặt “session_id” mơ hồ cho cả2.
- Mọi màn chọn pair cụ thể; check-in solo dùng pair_context=null, pair view fan-out từ plan đã share. Kết thúc pair thu hồi quyền chia sẻ theo policy nhưng giữ plan/evidence của owner.
- V1 pair-only giữ adapter trong rollout; không tuyên bố solo/2pair sẵn sàng trước migration và contract v2.

### 7.2 Sơ đồ luồng

~~~mermaid
flowchart TD
    FE[FE hồ sơ và goal] --> PROFILE[BE validate và Concept draft]
    PROFILE --> REVIEW[User xác nhận canonical concepts]
    FE --> STYLE[Workflow trích style optional]
    STYLE --> CACHE[Style cache theo revision]
    REVIEW --> MATCH[Code hard filters / Waterfall / score / reasons]
    CACHE --> MATCH
    MATCH --> SUGGEST[FE gợi ý hoặc Waiting / Invite]
    SUGGEST --> CONSENT[Hai người gửi và chấp nhận]
    CONSENT --> PAIR[BE pair canonical và lifecycle / cap2]
    REVIEW --> PLAN[Personal plan workflow]
    PAIR --> SHARE[Consent chia sẻ plan]
    PLAN --> CONTENT[Catalog + optional LLM nội dung]
    CONTENT --> VALIDATE[Code prerequisite / capacity / scheduler]
    VALIDATE --> DRAFT[Draft + feasibility / Queue / calendar]
    DRAFT --> ACCEPT[Owner xác nhận]
    ACCEPT --> ACTIVE[Plan active có revision]
    ACTIVE --> SHARE
    ACTIVE --> CHECKIN[Text hoặc ảnh check-in]
    CHECKIN --> CONFIRM[User confirm / correction]
    CONFIRM --> OUTBOX[Committed evidence + outbox]
    ACTIVE --> OUTBOX
    PAIR --> OUTBOX
    OUTBOX --> METRICS[Code metrics version / lifecycle / dedup]
    METRICS --> GATE[Rules trigger / quota / quiet / freshness]
    GATE --> COPY[Template hoặc LLM wording]
    COPY --> NOTICE[Notification lưu có delivery state]
    GATE --> PROPOSAL[Replan proposal chưa áp dụng]
    PROPOSAL --> ACCEPT
    METRICS --> VIEW[Projection Home / Feed / own progress]
    VIEW --> FE
    NOTICE --> FE
    SHARE --> ROOM[Study session / moderator hiện tại của Chính]
~~~

### 7.3 Bảng trách nhiệm

| Nghiệp vụ | AI/LLM | BE/code | FE |
|---|---|---|---|
| Concept | Optional map trong candidate allowlist | Catalog/ID/domain/prerequisite/version, confirm atomic | Review/chọn/sửa/null, không tự invent ID |
| Matching | Extract5chiều self/wanted, confidence/evidence | Safety/capacity/tier/score/rank/facts/snapshot/consent | Badge/lý do/chưa chắc, mời/không hợp/chọn pair |
| Plan | Nội dung task/milestone/two-mode trong scope đã duyệt | Prerequisite/capacity/lịch/validator/ownership/version/persist | Goal/tier/day input, draft review, Queue/Today/Week/replan |
| Check-in | Vision gợi ý concept/item nếu dùng | Evidence ownership/state/dedup/completion sync | Text/ảnh/confirm/correction, hiện processing/sync |
| Nhịp | Diễn giải/động viên tùy chọn | Minutes/pacing/progress/streak/signals/jobs/quota/freshness | Own progress/status, CTA hành động; không tính lại số |
| Học chung | Giữ moderator hiện tại | Membership/session/WebSocket/guardrail | Vào phòng theo pair/session đúng quyền |
| Delivery | Không tự gửi | Channel adapter/outbox/idempotency/delivery/read state | Chuông/read action; không coi response tạo tin là user đã thấy |

### 7.4 Nếu team dùng tên “AI agent”

| Workflow runtime | Context nhận | Tool/quyền | Output | Điều phối và dừng |
|---|---|---|---|---|
| Style extractor | Bio + wanted text, ngôn ngữ; không tên/trường/ngành/chat | Không tool tự trị, không write DB | self/wanted5chiều, confidence, evidence span, prompt_version | BE cache/validate; tối đa1repair rồi unknown/template chips |
| Plan content architect | Goal type/tier/urgency, canonical required/known, curriculum priorities/resources | BE retrieve catalog trước; MVP không cần tool model | Typed milestones/tasks/Standard/Survival, không lịch/URL mới | BE schema/content checks/schedule; tối đa2repair trong total deadline rồi explicit fallback/error |
| Coach wording | Authorized action/reason/concept và own summarized facts | Không quyền sửa plan/metrics/gửi tin | action trong allowlist + text ngắn | Một call có timeout; invalid→template; BE quota/delivery/proposal; dừng |

Không workflow nào được tự tạo cặp, sửa deadline, accept proposal hoặc đổi số đo. Giới hạn token/time/budget và prompt/model version phải trace; tốc độ/chi phí cụ thể phải đo, không suy từ tên model.

## 8. Contract bàn giao

### 8.1 API đang có trên product — không đổi tên/scale âm thầm

REST student dùng Authorization Bearer. Request user_id nếu có vẫn phải được BE kiểm quyền; FE không giữ server-to-server secret.

| Endpoint hiện có | Request/response, trạng thái | Giới hạn FE cần biết |
|---|---|---|
| GET/PUT /api/v1/profiles/me | Bundle profile/needs_help_with/can_help_with/availability | Hồ sơ legacy FE, không tự đồng bộ Concept confirmed |
| GET /api/v1/concepts; POST /concepts/candidates | Catalog SQL/Python; topic/domain/top_k<=5 → candidates | Score lexical heuristic |
| POST /api/v1/profile; POST /profile/confirm | OnboardingInput → draft; revision/selections → confirmed | Khác /profiles/me; giờ cam kết hiện vẫn bắt buộc |
| GET /api/v1/profile/confirmed | Confirmed LearnerProfile; draft trả409 | Không dùng draft như confirmed |
| POST /api/v1/matches/search | Body rỗng;201 MatchSearchResponse, total_score0–100, max15 | Luồng FE active; không có Waterfall mới |
| GET /api/v1/matches/{request_id} | Kết quả của requester | request_id không phải pair_id; enrichment chưa snapshot-consistent |
| POST /api/v1/connections; POST /connections/{id}/accept hoặc /reject | recipient_id; PENDING→MATCHED/REJECTED, peer_match_id sau accept | Chưa activate Data1 pairs ngay trong transaction |
| POST /api/v1/pairs/match; DELETE /pairs/match | waiting/paired/invite_suggested; score0–1, max5 | Data1 auto-pair cũ, không được trộn scale/state với FE search |
| POST /api/v1/pairs/invite; POST /pairs/join/{code}; POST /pairs/{id}/leave | Invite code và lifecycle | Link code expiry hiện7 ngày khác connection invitation48h trong spec |
| GET /api/v1/plans/{pair_id}/setup | Catalog +2members + windows + provider_mode | Catalog có thể demo; profile windows override generate request |
| POST /api/v1/plans/generate | Idempotency-Key;201 metadata | Sinh cả2 plan ACTIVE; phải GET để lấy items |
| GET /api/v1/plans/{pair_id} | own plan/partner items/proposal/resources | ACTIVE không phải pair commitment |
| PATCH /api/v1/plans/{pair_id}/items/{item_id}/schedule | expected_version, scheduled_start có offset, minutes30–90 | Có validator gaps mục5.2 |
| POST /api/v1/plans/{pair_id}/replan | expected_version/reduce_load/reason;201 proposal | Chỉ draft của owner |
| POST /api/v1/plans/{pair_id}/proposals/{id}/accept hoặc /reject | expected_version | Conflict thì reload; không tự accept version mới |
| GET/POST /api/v1/plans/{pair_id}/notes | items/text | Pair-level note, chưa item comment/notification |
| GET /api/v1/plans/{pair_id}/commitments; POST /commit | mine/partner/both | Theo version của cả2; một plan đổi lịch sẽ cần xác nhận lại |
| POST /api/v1/checkins | multipart id/image/note;202 CheckinOut | ID UUID; processing→needs_confirm/done/not_study/failed |
| POST /api/v1/checkins/text | id/note/plan_item_id optional;202 | Nếu link item hợp lệ có thể đã done dù HTTP202 |
| GET /api/v1/checkins/{id}; POST /{id}/confirm | CheckinOut; confirm plan_item_id hoặc null | Confirm null=presence không credit plan |
| GET /api/v1/pairs/me/feed | FeedOut, một pair được server suy ra | Không đủ cho chọn2pair rõ ràng |
| GET /api/v1/pairs/{id}/metrics; GET /metrics/history | MetricView/history đã lưu | 404 khi chưa snapshot; history tối đa90 |
| POST /api/v1/pairs/{id}/metrics/refresh | Body rỗng → MetricView | 503 khi source thiếu,409 inactive/ineligible |
| GET /api/v1/coach/{pair_id}; POST /{pair_id}/evaluate | interventions/decision | Evaluate có side effects; không gọi mỗi lần render |
| GET /api/v1/home; GET /notifications; POST /notifications/read | Dashboard/chuông | Home hiện có thể kích hoạt compute/coach |
| POST /jobs/daily-metrics | X-Job-Secret; study_date/after_pair_id/limit | Root route, không /api/v1; chỉ BE job, không chạy coach |
| POST /api/v1/plans/events/completion | X-Vision-Key + CompletionEvent | Chỉ server-to-server; FE không gọi/không giữ key |
| GET/POST /api/v1/sessions; WS /ws/sessions/{id} | StudySession + chat/moderation events | Giữ điều phối học chung hiện có; không dùng plan_item_id làm room ID |

Nguồn: [onboarding/router.py](../backend/app/onboarding/router.py), [matching/router.py](../backend/app/matching/router.py), [routers/plans.py](../backend/app/routers/plans.py), [metrics/router.py](../backend/app/metrics/router.py), [checkin/router.py](../backend/app/checkin/router.py), [routers/coach.py](../backend/app/routers/coach.py).

#### Ví dụ hiện có: Concept submit và confirm

POST /api/v1/profile:

~~~json
{
  "learning_goal": "Làm được SQL JOIN trước kỳ thi",
  "deadline": "2026-10-25",
  "committed_weekly_hours": 3,
  "timezone": "Asia/Ho_Chi_Minh",
  "topics": [
    {"text": "JOIN", "domain": "sql", "role": "need", "self_level": "learning"}
  ],
  "availability": []
}
~~~

Response là LearnerProfile đầy đủ; những field cần review gồm revision/status/mappings/unmapped/user_concepts. Confirm gửi revision vừa nhận, review đủ topic đúng1lần:

~~~json
{
  "revision": 1,
  "selections": [{"topic_index": 0, "concept_id": "sql.join", "self_level": "learning"}],
  "additional_concepts": []
}
~~~

#### Ví dụ hiện có: matching FE

POST /api/v1/matches/search không body, response201:

~~~json
{
  "matching_mode": "local",
  "request_id": 123,
  "candidates": [{
    "request_id": 123,
    "candidate_id": 102,
    "display_name": "Bạn B",
    "school": "",
    "major": "",
    "total_score": 74,
    "component_scores": {
      "skill_complementarity": 1,
      "topic_compatibility": 0,
      "availability_overlap": 1,
      "preference_compatibility": 0.4
    },
    "rank": 1,
    "learning_goals": ["Ôn Python"],
    "bio": "",
    "needs": ["Python"],
    "strengths": ["SQL"],
    "availability": [{"day_of_week": 0, "start_time": "19:00", "end_time": "20:30", "timezone": "Asia/Ho_Chi_Minh"}],
    "reasons": ["Bạn ấy tự khai có thể hỗ trợ nội dung bạn cần."]
  }]
}
~~~

POST /api/v1/connections gửi {"recipient_id":102}; response có id/status=PENDING. Recipient accept trả status=MATCHED/peer_match_id. Không lấy request_id=123 làm pair ID.

#### Ví dụ hiện có: tạo plan

POST /api/v1/plans/generate, header Idempotency-Key giữ nguyên khi retry cùng payload:

~~~json
{
  "pair_id": 12,
  "horizon_days": 7,
  "members": [
    {
      "user_id": 101,
      "goal": "Làm được truy vấn JOIN",
      "concept_ids": ["sql.join"],
      "known_concept_ids": ["sql.select_basic"],
      "can_help_concept_ids": [],
      "committed_minutes_per_week": 180,
      "availability": [{"id": "a1", "day_of_week": 0, "start_time": "19:00", "end_time": "20:30"}],
      "timezone": "Asia/Ho_Chi_Minh",
      "deadline": "2026-10-25T23:59:59+07:00",
      "location": "Góc học tập"
    },
    {
      "user_id": 102,
      "goal": "Làm được GROUP BY",
      "concept_ids": ["sql.group_by"],
      "known_concept_ids": [],
      "can_help_concept_ids": [],
      "committed_minutes_per_week": 240,
      "availability": [{"id": "b1", "day_of_week": 2, "start_time": "20:00", "end_time": "21:30"}],
      "timezone": "Asia/Ho_Chi_Minh",
      "deadline": null,
      "location": "Thư viện"
    }
  ]
}
~~~

Response metadata; tiếp theo GET /plans/12:

~~~json
{
  "plan_ids": {"101": 88, "102": 89},
  "version": 1,
  "trace_id": "trace-example",
  "partial": true,
  "provider_mode": "template",
  "catalog_source": "team"
}
~~~

PlanItem hiện có id/user_id/pair_id/plan_version/concept_id/action/expected_output/est_minutes/status/scheduled_start/scheduled_end/slot_id/if_then_text/defer_reason/completed_at/resource_ids. Không có DAY/Survival field; không gửi schema v2 vào v1.

Replan request hiện có:

~~~json
{"expected_version": 1, "reduce_load": true, "reason": "Tuần này có bài thi"}
~~~

Response proposal có id/status/expected_version/reason/cutoff/budget/before/after; accept hoặc reject gửi {"expected_version":1}.

#### Ví dụ hiện có: check-in và completion nội bộ

POST /api/v1/checkins/text:

~~~json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "note": "Đã chạy thử 3 truy vấn JOIN",
  "plan_item_id": "item-example"
}
~~~

CheckinOut trả status/kind/owner_id/headline/options/reactions và thông tin hiển thị. FE poll GET khi processing, cho chọn item/confirm khi needs_confirm. Không suy status từ riêng HTTP202.

CompletionEvent hiện tại chỉ BE gọi:

~~~json
{
  "event_id": "checkin:11111111-1111-4111-8111-111111111111",
  "plan_item_id": "item-example",
  "pair_id": 12,
  "user_id": 101,
  "plan_version": 1,
  "confirmed_at": "2026-10-12T20:15:00+07:00",
  "confirmed": true
}
~~~

#### Ví dụ hiện có: số đo và coach (trích response)

Trích field từ MetricView, không phải full DTO:

~~~json
{
  "metric_version": "data1.metrics.v1",
  "pair_id": 12,
  "study_date": "2026-10-12",
  "computed_at": "2026-10-12T14:00:00Z",
  "source_revision": "team.v1:p1-1:c2",
  "pacing_a": 0.5,
  "pacing_b": 1,
  "pair_score": 0.5,
  "gap": 0.5,
  "needs_attention": true,
  "streak": 2
}
~~~

Full DTO tại [metrics/contracts.py](../backend/app/metrics/contracts.py) còn learner_a/b, pair_started_at, flags, risk summaries; member view bỏ risk components/reasons nhưng vẫn có score. Không đưa score đó lên UI như probability.

Trích coach decision:

~~~json
{
  "action": "replan",
  "reason": "ELIGIBLE",
  "allowed_actions": ["replan", "no_action"],
  "plan_version": 1,
  "proposal_id": 17,
  "message_source": "template",
  "text": "Bạn có thể xem phương án giảm tải và quyết định có áp dụng không.",
  "sent": true,
  "delivery_status": "SENT"
}
~~~

No_action có thể không có text/proposal/id; SENT ở adapter product là lưu chuông, không phải read.

### 8.2 Contract v2 đề xuất — chưa tồn tại

Tách route/version vì thay ownership/scale/state. BE cần công bố OpenAPI/fixture/capabilities trước FE wiring. V1 adapter giữ nguyên scale0–100 của /matches/search và từng enum hiện hành: Data1 queue/check-in dùng lowercase, Plan/Connection dùng uppercase. V2 dùng score0–1 và enum uppercase dưới đây.

| Endpoint đề xuất | Kết quả |
|---|---|
| GET /api/v2/capabilities | Flags matching_waterfall/personal_plan/day_schedule/survival/item_comments/explicit_pair_context + contract/rules versions |
| POST /api/v2/goals; PATCH /api/v2/goals/{id} | Owner goal DRAFT/ACTIVE/COMPLETED/CANCELLED, expected_revision; chỉ1ACTIVE |
| POST /api/v2/profiles/concepts/drafts; POST /profiles/concepts/confirm | Concept review không bắt capacity; reuse canonical normalizer |
| PUT /api/v2/profiles/style | Bio/wanted text hoặc chips + expected_revision; extraction status, cache revision |
| POST /api/v2/matches/search | READY/WAITING, snapshot, qualified/exploratory, queue/fallback |
| POST /api/v2/matches/{request_id}/dismissals | Candidate+goal-scoped dismissal, không reputation penalty |
| POST /api/v2/connections; POST /connections/{id}/accept hoặc /reject | Mutual consent, idempotency, safety/capacity recheck; pair identity sau accept |
| POST /api/v2/pair-invitations; GET /api/v2/pair-invitations/{code}; POST /api/v2/pair-invitations/{code}/join | Link mời bạn quen, expiry explicit, join sau user review; dùng chung safety/capacity/lifecycle command |
| GET /api/v2/pairs; PATCH /pairs/find-more; POST /pairs/{id}/leave | Chọn0–2pair; reason riêng tư; lifecycle explicit |
| POST /api/v2/plans/drafts | Owner-only goal plan;201 template draft hoặc202 generation job |
| GET /api/v2/plan-generations/{generation_id} | PENDING/RUNNING/SUCCEEDED/FAILED + result plan_id hoặc error |
| GET /api/v2/plans/current?goal_id=...; GET /plans/{id} | Own plan/feasibility/milestones/items/Queue/source |
| POST /api/v2/plans/{id}/accept | expected_revision; owner draft→ACTIVE; transaction recheck goal/profile/catalog dependencies, không accept partner |
| PATCH /api/v2/plans/{id}/items/{item_id}/schedule | expected_revision + precision/date/time; cùng validator |
| POST /api/v2/plans/{id}/replan-proposals; POST /api/v2/plans/{id}/proposals/{proposal_id}/accept hoặc /reject | Diff, stable item, optimistic revision/progress guard |
| PUT /api/v2/plans/{id}/sharing | Pair IDs + consent, không copy plan/budget |
| GET /api/v2/pairs/{pair_id}/plans | Own + partner projection theo sharing; partner read/comment |
| GET/POST /api/v2/plans/{id}/items/{item_id}/comments | Per-item comment, author/membership/visibility; notification outbox |
| POST /api/v2/checkins/text hoặc /photo; POST /checkins/{id}/confirm | Owner context plan/item/mode, pair_context explicit/null; sync_state |
| GET /api/v2/pairs/{id}/feed | Lifecycle-scoped pair view, không latest-pair inference |
| GET /api/v2/plans/{id}/metrics; GET /api/v2/pairs/{id}/metrics | Own metrics hoặc privacy-safe pair projection; freshness/source versions |
| GET /api/v2/plans/{id}/metrics/history | Snapshot history có revision/correction markers |

Job/event không phải public browser API. Các route v1 cũng phải gọi shared safety/capacity commands trong rollout, hoặc bị disable bằng flag khi đã chuyển v2; không để auto-match v1 bypass consent/cap2.

#### Matching v2 request/response

POST /api/v2/matches/search:

~~~json
{
  "goal_id": "22222222-2222-4222-8222-222222222222",
  "expected_goal_revision": 2,
  "expected_profile_revision": 4
}
~~~

Response ví dụ READY; score=.35*1+.45*.6+.20*.8=.78:

~~~json
{
  "contract_version": "peerbridge.match.v2",
  "request_id": 124,
  "profile_revision": 4,
  "goal_id": "22222222-2222-4222-8222-222222222222",
  "goal_revision": 2,
  "computed_at": "2026-10-11T14:00:00Z",
  "scoring_version": "waterfall.v1",
  "status": "READY",
  "extraction_status": "READY",
  "pool_size": 12,
  "qualified_pool_count": 1,
  "qualified_count": 1,
  "candidates": [{
    "candidate_id": 102,
    "candidate_profile_revision": 3,
    "candidate_goal_id": "66666666-6666-4666-8666-666666666666",
    "candidate_goal_revision": 1,
    "algorithm_rank": 1,
    "match_type": "GOLDEN",
    "quality": "QUALIFIED",
    "score": 0.78,
    "components": {"concept": 1, "style": 0.6, "goal": 0.8, "retention_bonus": 0},
    "evidence_coverage": 0.8,
    "public_profile": {"display_name": "Bạn B", "school": "", "goal_summary": "Ôn Python"},
    "reason_codes": ["RECIPROCAL_CONCEPTS"],
    "reasons": ["Bạn tự khai có thể hỗ trợ Python; bạn ấy tự khai có thể hỗ trợ SQL JOIN."],
    "missing_data": []
  }],
  "queue": null,
  "fallback_actions": ["INVITE_FRIEND"]
}
~~~

Ví dụ chỉ1candidate để minh họa schema; response thực fill K theo policy và số pool hợp lệ. qualified_count là số qualified trong candidates; qualified_pool_count đếm toàn pool eligible. K có thể thiếu khi chưa có đủ tier evidence hoặc không được backfill exploratory; không fabricate bằng chứng.

Connection từ gợi ý gửi recipient_id + request_id; server bind candidate/profile/goal revisions từ snapshot, lưu vào invitation và kiểm lại khi accept. Đổi dữ liệu cần trả CANDIDATE_UNAVAILABLE/PROFILE_REVISION_CONFLICT hoặc yêu cầu xem gợi ý mới, không dùng score cũ cho goal mới. Lời mời chủ động từ link không bắt buộc qualified score, nhưng luôn kiểm safety/capacity và có hai phía đồng ý.

Friend link tạo bằng POST /api/v2/pair-invitations với goal_id và target_user_id optional; response trả invitation_id/status=PENDING/code/expires_at/share_path=/invite/{code}. FE copy URL frontend theo share_path, sau đăng nhập GET preview rồi user chủ động POST join; trả pair_id/lifecycle_id/status=ACTIVE. Không copy join_path của v1 làm URL trang web: [matching/service.py:115–116](../backend/app/matching/service.py#L115) trả POST API path. Join hết hạn trả410 INVITATION_EXPIRED, đã dùng bởi người khác trả409 INVITATION_USED; retry cùng người trả cùng pair khi còn active. Expiry chờ D6; FE đọc expires_at, không hardcode7ngày/48h.

Response WAITING (rút gọn field chung):

~~~json
{
  "contract_version": "peerbridge.match.v2",
  "request_id": 125,
  "status": "WAITING",
  "extraction_status": "DEGRADED",
  "qualified_count": 0,
  "candidates": [],
  "queue": {
    "queue_id": "queue-example",
    "waiting_since": "2026-10-11T14:00:00Z",
    "fallback_due_at": "2026-10-12T14:00:00Z"
  },
  "fallback_actions": ["INVITE_FRIEND", "EDIT_PROFILE"]
}
~~~

Waiting có thể kèm exploratory nếu PO cho phép. Capacity/profile thiếu dùng error409 có code rõ; không coi là “AI đang tìm”.

#### Plan v2 request và draft

POST /api/v2/plans/drafts + Idempotency-Key. Owner/server IDs lấy từ auth/goal; user không nhập dữ liệu thay partner:

~~~json
{
  "goal_id": "22222222-2222-4222-8222-222222222222",
  "expected_goal_revision": 2,
  "source_profile_revision": 4,
  "goal_type": "EXAM",
  "learner_tier": "REFRESHER",
  "target_date": "2026-10-25",
  "confirmed_known_concept_ids": ["sql.select_basic"],
  "capacity": {
    "preferred_days": [0, 2, 4],
    "committed_minutes_per_week": 180,
    "windows": [],
    "timezone": "Asia/Ho_Chi_Minh"
  },
  "sharing_pair_ids": [12],
  "horizon_days": 7,
  "generation_mode": "TEMPLATE"
}
~~~

Capacity phút optional trong UX mới; nếu chưa khai, BE trả assumption về default session/day để user xác nhận trước ACTIVE, không tự gán240p. Buffer_minutes policy tách với buffer_days; ví dụ dưới dùng80% cap hiện hành làm giả định tạm.

Goal type/target_date trong request là snapshot của goal revision đã lưu, không phải kênh âm thầm sửa goal; mismatch trả409 và yêu cầu PATCH goal trước. Draft lưu source_goal/profile/catalog/rules revisions. Accept phải đọc lại dependencies trong transaction, ngoài expected plan revision; khác known concepts/deadline/catalog thì STALE_DEPENDENCY/NEEDS_REVIEW và tạo draft mới. Async invalidation event không thay được guard này.

Response201 template draft (item IDs ổn định; đây là example subset1milestone):

~~~json
{
  "contract_version": "peerbridge.plan.v2",
  "plan_id": "33333333-3333-4333-8333-333333333333",
  "revision": 1,
  "status": "DRAFT",
  "owner_id": 101,
  "goal_id": "22222222-2222-4222-8222-222222222222",
  "sharing_pair_ids": [12],
  "catalog_version": "2026-10-06.1",
  "timeframe_category": "VUA",
  "learner_tier": "REFRESHER",
  "generation": {"source": "TEMPLATE", "degraded": false, "reason": null, "trace_id": "trace-example"},
  "feasibility": {
    "status": "PARTIAL",
    "committed_minutes": 180,
    "available_minutes_after_buffer": 144,
    "required_minutes": 240,
    "scheduled_minutes": 135,
    "queued_minutes": 105,
    "warnings": [{"code": "PARTIAL_SCOPE", "message": "Chưa đủ thời gian cho toàn bộ mục tiêu."}]
  },
  "milestones": [{"id": "m1", "title": "JOIN cơ bản", "criteria_done": "Viết đúng 3 truy vấn trên dữ liệu mẫu"}],
  "items": [{
    "id": "44444444-4444-4444-8444-444444444444",
    "content_revision": 1,
    "milestone_id": "m1",
    "concept_id": "sql.join",
    "priority": "MUST",
    "suggested_order": 1,
    "state": "SCHEDULED",
    "schedule": {
      "precision": "DAY",
      "date": "2026-10-12",
      "start_at": null,
      "end_at": null,
      "due_at": "2026-10-13T03:00:00+07:00",
      "timezone": "Asia/Ho_Chi_Minh"
    },
    "standard_mode": {"duration_min": 45, "description": "Viết 3 truy vấn JOIN", "criteria_done": "3 truy vấn chạy đúng", "evidence_prompt": "Paste truy vấn hoặc ảnh kết quả"},
    "survival_mode": {"duration_min": 15, "description": "Đọc sơ đồ và viết 1 truy vấn", "criteria_done": "1 truy vấn chạy đúng", "evidence_prompt": "Paste 1 truy vấn"},
    "completion": {"standard_completed_at": null, "survival_completed_at": null, "mastery_verified": false}
  }],
  "queue": [],
  "cut_items": []
}
~~~

Example items/queue ở trên chỉ trích1item; các tổng feasibility minh họa whole plan, không được client tự recompute từ excerpt. API thật phải trả đầy đủ collection hoặc pagination có total rõ.

Nếu generation_mode=AUTO và cần LLM:202 {"generation_id":"generation-example","status":"PENDING","poll_after_ms":1500}; GET job trả progress/result/error, duplicate request dùng cùng key trả cùng job. Không khóa UI chờ60s. Kết quả enrichment chỉ tạo draft revision mới, không ghi đè ACTIVE/user edits.

Lifecycle v2:

- Goal: DRAFT→ACTIVE→COMPLETED/CANCELLED. Chỉ goal ACTIVE có plan ACTIVE; đóng goal phải archive plan, ngừng coach và cập nhật matching eligibility trong cùng command/outbox.
- Plan: DRAFT→ACTIVE→SUPERSEDED/ARCHIVED; draft không nhận thì REJECTED. ARCHIVED khi goal đóng, giữ lịch sử/evidence nhưng không còn due/reminder mới. Generation thất bại là job FAILED, không tạo ACTIVE giả.
- Feasibility: FEASIBLE/PARTIAL/NEEDS_DECISION. Core chưa khả thi thì không accept trước khi user thay scope/capacity/deadline.
- timeframe_category: GAP/VUA/DAI/UNSPECIFIED, suy từ target_date và clock theo timezone chung, không nhận nhãn client làm nguồn quyết định.
- Item: QUEUED/SCHEDULED/COMPLETED/SKIPPED. COMPLETED là Standard criteria; Survival chỉ ghi badge/completion.survival_completed_at. QUEUED có schedule=null, không due. SKIPPED cần reason và review prerequisite hậu duệ.
- Schedule precision DAY hoặc TIME; null khi QUEUED. TIME phải đủ start/end offset; due_at=end; DAY dùng cutoff chung03:00.
- Proposal: DRAFT→ACCEPTED/REJECTED/EXPIRED; accept expected_revision và progress hash. Nếu hết hạn/đã có evidence mới, tạo proposal mới, không auto đổi version rồi accept.
- Shared commitment riêng theo revisions/consent; không dùng nó làm status plan owner.

#### Metrics v2 public projection

GET /api/v2/pairs/12/metrics: own progress, partner presence; không đưa gap/risk/lagging rank công khai. Trích một snapshot READY:

~~~json
{
  "contract_version": "peerbridge.metrics.v2",
  "pair_id": 12,
  "lifecycle_id": "pair-12-activation-1",
  "study_date": "2026-10-12",
  "computed_at": "2026-10-12T14:00:00Z",
  "source_revision": "opaque-committed-revision",
  "source_versions": {
    "plans": {
      "101": {"plan_id": "33333333-3333-4333-8333-333333333333", "revision": 4},
      "102": {"plan_id": "55555555-5555-4555-8555-555555555555", "revision": 3}
    },
    "evidence_revision": 9,
    "rules_version": "workload_ratio.v2"
  },
  "measurement_status": "READY",
  "freshness": "FRESH",
  "me": {
    "user_id": 101,
    "standard_completed_minutes": 60,
    "due_minutes": 120,
    "active_scope_minutes": 240,
    "goal_progress": 0.25,
    "pacing_raw": 0.5,
    "has_due_workload": true,
    "survival_sessions": 1,
    "personal_streak": 2
  },
  "partner": {"user_id": 102, "checked_in_today": true},
  "signals": ["LOW_PACING"],
  "coach": {
    "action": "REPLAN",
    "proposal_id": 17,
    "message_source": "TEMPLATE",
    "channel": "IN_APP",
    "delivery_status": "STORED",
    "notification_id": 91,
    "read_at": null
  }
}
~~~

measurement_status: READY/NO_DUE_WORK/WAITING_FOR_PLAN/INCOMPLETE_EVIDENCE/UNAVAILABLE. freshness: FRESH/STALE/RECOMPUTING. No due→pacing_raw=null/has_due_workload=false; unavailable không trả0 giả. Solo route trả own metrics, không đòi partner plan.

#### Event nội bộ và cập nhật sau mutation

Không tự coi event đề xuất là WebSocket hiện có. MVP có thể outbox SQLite + worker + FE polling; SSE/WS invalidation thêm sau, chỉ gửi entity ID/revision có quyền, không raw private facts.

~~~json
{
  "event_id": "checkin:11111111-1111-4111-8111-111111111111:finalized:2",
  "type": "checkin.finalized.v2",
  "schema_version": 2,
  "occurred_at": "2026-10-12T20:15:00+07:00",
  "aggregate_id": "11111111-1111-4111-8111-111111111111",
  "aggregate_revision": 2,
  "payload": {
    "owner_id": 101,
    "plan_id": "33333333-3333-4333-8333-333333333333",
    "plan_revision": 4,
    "plan_item_id": "44444444-4444-4444-8444-444444444444",
    "content_revision": 1,
    "pair_context": {"pair_id": 12, "lifecycle_id": "pair-12-activation-1"},
    "mode": "SURVIVAL",
    "source": "USER_CONFIRMED_TEXT",
    "presence_at": "2026-10-12T20:00:00+07:00",
    "finalized_at": "2026-10-12T20:15:00+07:00",
    "actual_minutes": 15
  }
}
~~~

| Event | Consumer và tác dụng |
|---|---|
| profile.confirmed.v2 / goal.revised.v2 | Invalidate matching snapshot/style/plan draft dependencies |
| matching.waiting_started.v2 / matching.fallback_due.v2 | Lưu queue timer, một fallback notification sau24h |
| pair.activated.v2 / pair.ended.v2 | Membership/share/lifecycle, invalidate mọi pair view; ended ngừng coach |
| plan.activated.v2 / plan.revised.v2 | Recompute own metrics và các pair được share; invalidate proposal/commitments liên quan |
| checkin.finalized.v2 / checkin.corrected.v2 | Presence, xử lý kết quả theo mode/criteria, backfill ngày cần sửa; không cộng phút trực tiếp từ event |
| plan.item_completed.v2 | Completion đã persist → workload metrics; stable ID chống double-credit |
| plan.comment_added.v2 | Notification outbox tới đúng owner, không lộ comment sang pair khác |
| metrics.updated.v2 | Coach rules/freshness gate và client invalidation |

**Consistency:** evidence finalize + outbox ghi cùng transaction. Worker xử lý idempotent qua stable event/item ID: STANDARD đủ criteria mới chuyển item COMPLETED và publish plan.item_completed; SURVIVAL chỉ cập nhật presence/survival_completed_at. Check-in có sync_state=PENDING/APPLIED/FAILED; APPLIED chỉ có nghĩa kết quả của mode đã đồng bộ, không đồng nghĩa item COMPLETED. FE chỉ đánh dấu hoàn tất Standard khi authoritative item state=COMPLETED. Không reuse nguyên completion command v1 cho Survival vì hiện command chỉ có một loại hoàn tất. Hai connection SQLite hiện tại không tự thành atomic chỉ vì cùng file; cần command/transaction chung hoặc outbox+sửa lỗi đối soát. Consumer đọc authoritative committed facts theo cutoff/revisions; event không được cung cấp số phút để “cộng thêm” tùy ý.

Late event từ plan revision cũ chỉ map nếu item/content identity còn tương thích; criteria đổi thì CONTENT_REVISION_CONFLICT để user review. Retry cùng event không nhắc lại/credit lại. Job lỗi vẫn giữ evidence, có retry/repair và UI sync status.

### 8.3 Lỗi, fallback và breaking changes

V1 hiện đa số {"detail":"..."}; planner fail422 riêng có trace_id/errors/unplanned_concepts. V2 đề xuất envelope chung:

~~~json
{
  "error": {
    "code": "STALE_PLAN",
    "message": "Kế hoạch đã thay đổi. Tải lại để tiếp tục.",
    "retryable": true,
    "details": {"current_revision": 5},
    "trace_id": null
  }
}
~~~

| HTTP/code đề xuất | FE xử lý | Fallback BE |
|---|---|---|
| 401 AUTH_REQUIRED | Flow đăng nhập hiện có; giữ draft không nhạy cảm | Không retry bằng user khác |
| 403 FORBIDDEN | Không quyền, quay về own/pair selector | Không tiết lộ partner private data |
| 404 NOT_FOUND | Reload list/entity, phân biệt chưa plan/chưa snapshot | Không giả entity mới |
| 409 STALE_PLAN/PROFILE_REVISION_CONFLICT | Refetch, giữ input để review; không auto accept revision mới | Recompute/revalidate |
| 409 STALE_DEPENDENCY | Goal/profile/catalog đã đổi; review draft mới | Accept transaction chặn draft dùng prerequisite/deadline cũ |
| 409 CAPACITY_REACHED/CANDIDATE_UNAVAILABLE | Refresh candidates/connections | Không vượt hard filters |
| 409 KEY_REUSED/IN_PROGRESS | Key mới chỉ khi payload mới; đang chạy thì đọc job | Idempotent job/result |
| 422 INVALID_INPUT/DEADLINE_PAST/UNSUPPORTED_SCOPE | Field-specific CTA, không “retry” vô nghĩa | Không model bịa catalog/lịch |
| 429 RATE_LIMITED/BUDGET_LIMITED | Chờ retry-after hoặc chọn template | Coach wording→template; không bỏ check-in đã lưu |
| 503 SOURCE_UNAVAILABLE/CATALOG_UNAVAILABLE | Giữ stale snapshot có nhãn, retry | No-action; không0% giả |
| LLM timeout/invalid output | Draft/template/error theo generation status rõ | Bounded repair; TEMPLATE+degraded+reason nếu fallback |
| Delivery/sync failed | Hiện chưa gửi/chưa đồng bộ, cho refresh/retry phù hợp | Retry cùng key, không fabricate SENT/APPLIED |

Breaking changes cần FE adapter/flag: score0–100→0–1; bốn match level của Data1→3tier; pair suy ra→explicit; plan pair-only→owner/goal; plan_version→revision; DEFERRED→QUEUED/SKIPPED semantics; thêm DAY/Survival/ARCHIVED; no-due1→null; risk/gap partner numeric→privacy-safe projection; source template/fake/live chuẩn hóa. **Không replace type v1 bằng v2 rồi ép cast.**

## 9. Bàn giao FE

### 9.1 Đường code thực sự đang render

[frontend/app/page.tsx:5–11](../frontend/app/page.tsx#L5) import features/peer-connections, features/study-plan, features/checkin, **features/overview/components/ProductOverview.tsx**. Repo có bản cũ/trùng trong frontend/components và features/overview/components/Overview.tsx; không sửa nhầm.

- [api.ts](../frontend/lib/api.ts) chưa có Concept review/metrics history client; vẫn search v1/mutual consent.
- [StudyPlan.tsx](../frontend/features/study-plan/components/StudyPlan.tsx):88–112 suy concept bằng regex goal, default240phút/deadline=null, form cả2members, horizon7; chưa có tier/deadline input/day-only/two-mode.
- [ProductOverview.tsx](../frontend/features/overview/components/ProductOverview.tsx):17 poll30s, hiện task count/minutes/streak, **chưa render data.progress/data.coach**. Số task hôm nay không thay thế workload pacing.
- [StudyCheckin.tsx](../frontend/features/checkin/components/StudyCheckin.tsx) có polling processing/confirm và hiện pacing cả2; cần chuyển own progress/partner presence theo policy.
- Overview.tsx cũ có copy “Bạn đang chậm hơn bạn cặp”; không reuse copy so sánh đó.

### 9.2 Màn hình và trạng thái cần xây

| Màn hình/thao tác | Dữ liệu cần hiện | Loading/empty/error | Khi cập nhật |
|---|---|---|---|
| Goal/Profile/Concept review | Goal/deadline/tier, need/offer canonical, unmapped, self/wanted chips+unknown | Extraction pending/degraded;409 revision reload; unsupported môn có CTA | Sau save/confirm, goal revision đổi |
| Matching | Tier badge/reasons/quality/thiếu evidence; active count; school display preference | Skeleton; pool0/ít/no qualified/capacity khác nhau; per-card pending invite | Profile/goal đổi, dismiss, invitation decision, leave/find-more |
| Connections/pair selector | PENDING/MATCHED/REJECTED/EXPIRED hiện hành;0–2active và pair_id rõ | Empty chưa pair; accept capacity conflict | Sau mutation/tab focus/poll chờ lời mời |
| Plan setup/draft review |3câu tier/deadline/preferred days; capacity assumptions; feasibility/Must/Should/Cut | Job pending/failed, catalog error, NEEDS_DECISION; giữ input | Generate201/202 completion; accept; capability đổi |
| Today | Task đúng ngày, Standard/Survival, evidence prompt, status | Chưa task khác chưa plan; processing/needs_confirm/sync_pending riêng | Check-in confirm/APPLIED, dời lịch |
| Week + Queue |7ngày, DAY chưa giờ, TIME, buffer days, Queue không overdue | Không ngày rảnh CTA chọn ngày; conflict hiển thị tại item | Schedule/replan accept, reconnect/focus |
| Milestones/Month | Criteria và coverage dài hạn, không lịch vụn cả quý | Chưa roadmap/scope thiếu minh bạch | Plan scope/revision đổi |
| Partner shared plan/comments | Goal/items được share, comment theo item, presence | Chưa share khác chưa plan; forbidden không show private data | Comment/reaction/pair ended/share revoked |
| Own rhythm/Home | Goal progress/pacing/phút/as-of/freshness, coach CTA riêng tư | NO_DUE_WORK “Chưa đến hạn”; STALE giữ số cũ có nhãn; không null→0 | Metrics event/poll30s khi visible hoặc explicit refresh |
| Replan proposal | Before/after, completed giữ, moved/queued/cut, expected revision | Stale/expired/progress changed→review draft mới | Accept/reject→refetch plan/metrics/commitments |
| Notification | Action link, channel/delivery/read state | Chưa tin/failed, không ghi “đã đọc” từ STORED | Sau outbox delivery/read action |

Refetch/invalidate sau generate/accept/schedule/check-in confirm/completion/comment/replan/pair change: plan, metrics, home, feed, commitments, notifications đúng scope. Generation/processing/recomputing poll ngắn có giới hạn và backoff; dừng khi terminal/unmount/tab hidden. Không POST evaluateCoach trong render hoặc poll GET home để cố gửi nhắc.

FE không suy concept từ regex, không tự tính due/pacing/risk/quota, không cho sửa partner. Giữ local draft input khi error; disable duplicate mutation; Idempotency-Key ổn định cùng payload; cancel/ignore response cặp cũ khi đổi selector. Với2partner, cache key phải có user/goal/plan/pair/lifecycle thích hợp; không global “current pair”.

MVP mobile dùng nút “Gán ngày/Đổi giờ” thay bắt drag/drop. Provider label phân biệt TEMPLATE/FAKE/LLM; user cần biết gợi ý theo mẫu hay AI, không cần thấy secret/tool internals. Feature chưa có BE thì ẩn bằng capability hoặc hiển thị dependency trong báo cáo dev, không nút giả báo thành công.

## 10. Những quyết định còn chờ, thứ tự triển khai và nghiệm thu

### 10.1 Decision register

| ID | Mâu thuẫn/thiếu | Khuyến nghị tạm để review | Ai chốt |
|---|---|---|---|
| D1 | Product spec cũ vẫn matching bằng commitment; feature11/10 bỏ | Ưu tiên feature mới cho matching; capacity vẫn thuộc plan | PO |
| D2 | Queue<.50 nhưng backfill đủ5; pool<5; rematch lần2 strict | Qualified/exploratory riêng; không nới safety, trả số thực; lần2 không exploratory | PO |
| D3 | Waterfall có1Golden có fill tier thấp? One-way.7 chưa tier | Fill theo tier đếnK; one-way PEER variant, chưa GOLDEN | PO+AI |
| D4 | Style matrix/confidence/“cao,rất hợp” thiếu, mean phạt unknown | Weighted mean/evidence coverage; chốt complete matrix/threshold trước release | PO+AI |
| D5 | Tối đa2 nhưng “đủ2 bật Tìm thêm”;1goal active chưa schema | Cap2 tuyệt đối; find-more khi có1; goal lifecycle explicit | PO+BE |
| D6 | Drop30% vs trial7ngày, bonus chưa dữ liệu; invite48h vs code7ngày | Không penalty; bonus0 đến khi data đủ; tách link expiry và connection expiry | PO |
| D7 |3mode/30–90p/buffer20–30% cũ vs2mode/30–60p/ngày đệm mới |2mode task mới; vẫn đọc legacy30–90; phút đệm khác ngày nghỉ | PO+Plan |
| D8 | Transfer “bỏ100%nền” | Chỉ bỏ prerequisite đã xác nhận; tier không chứng minh mastery | PO+Curriculum |
| D9 | Survival/streak/goal progress | Survival presence+personal streak,0Standard credit đến đủ criteria; mutual streak riêng | PO+Metrics |
| D10 | Solo/2pair nhưng plan pair-only; ai được sửa draft ai | Personal plan/goal, share tới2pair; owner-only accept/edit | PO+BE |
| D11 | Nhịp spec mới thiếu;2ngày vs48h/ngày nghỉ/backdate | Pilot cutoff03; chốt presence/absence/pause/streak và timezone | PO+Metrics |
| D12 | Nhiều trigger/20h/unread3/Monday/ghost3-5-7 | Một priority table, một quota/người/ngày; nối read_at đúng intervention, chốt semantics đọc | PO+Coach |
| D13 | <=5s vs model timeout20s×3 | Template fast path + async LLM draft; đo p95 tách source | PO+BE |
| D14 | Quyền partner.items test cũ vs UI mới; private rhythm | Share consent rõ; partner read/comment, không private risk/rank | PO+BE+FE |
| D15 | Domain ngoài SQL/Python và tài liệu nhịp học mới | Cung cấp/duyệt curriculum+catalog và doc tracking trước mở rộng | Team owner |

Không cần chờ tất cả D để sửa integration invariants: pair/version/lifecycle/dedup/validator/freshness là việc BE có thể làm trước trong phạm vi hiện có. Những threshold/tier/survival semantics tạm phải được ghi config/ADR, không đóng cứng trong FE.

### 10.2 Thứ tự thực hiện

| Bước | Công việc | Phụ thuộc | Done khi |
|---|---|---|---|
| 0 | PO review D1–D15, xác nhận spec precedence và MVP capabilities | Tài liệu này, spec tracking bổ sung | Có decision log rõ pending/approved |
| 1 | Canonical goal/plan/item/pair/lifecycle + schema/version migration/compat | D5,D10,D14 | Không latest-pair inference;2pair không duplicate plan budget |
| 2 | Fix manual schedule validator, source revisions/coherent read/late event hooks, projection chung | Identity/event contracts | Regression invariants xanh, không stale metric qua coach gate |
| 3 | Matching rules mới+style cache+consent/capacity | D1–D6, Concept review | Search không call model; tier/reasons/fallback tested |
| 4 | Plan curriculum/tier/feasibility/Queue/DAY/two-mode/owner approval | D7–D10,D13, catalog chuẩn | Draft khả thi trung thực, no invented schedule/mastery |
| 5 | Outbox/job/metrics v2/coach templates/notification read state | D9,D11,D12, completion sync | Người không mở app vẫn được xử lý, retry không spam |
| 6 | FE active features + adapters/capabilities, Today/Week/rhythm/consent | OpenAPI + fixtures v1/v2 | Luồng UI tương thích đúng backend đã có |
| 7 | Live model/human eval, benchmark và pilot | Config/budget được duyệt, golden set độc lập | Báo source/prompt/model/time/cost/failures; outcome pilot tách test |

Team có thể làm UI layout với fixture v2 được đánh dấu development từ bước0, nhưng chỉ wire production khi BE capability tương ứng có thật.

### 10.3 Nghiệm thu có thể kiểm chứng

- **Matching:** self/block/report approved/capacity luôn bị loại, kể cả friend invite; dismissal chỉ loại khỏi gợi ý theo goal, không đồng nghĩa block lời mời chủ động; pool0/1/4/5/30/101 trả đúng K; Golden→Peer→Body Double đúng evidence; unknown không bị phạt/bịa; score/reasons cùng snapshot; school/major không đổi algorithm score; concurrent accept không vượt2;24h fallback đúng1tin khi vẫn đủ điều kiện waiting. Đo p50/p95 search với cache nóng/lạnh, mục tiêu<=5s chưa coi đã đạt.
- **Concept:** confirmed revision/ID/domain/prerequisite atomic; null ngoài domain giữ nguyên; sửa level không tự chứng minh mastery; catalog Plan/Measurement cùng version.
- **Plan:** NEWBIE không thiếu prerequisite; TRANSFER không skip concept chưa biết; REFRESHER chọn known target vẫn có bài ôn hoặc NOTHING_TO_PLAN rõ, không ACTIVE rỗng; boundary13/14/60/61 ngày; no deadline/expired/capacity0/no days/day-only; core thiếu→NEEDS_DECISION; manual edit không vượt deadline/window/budget hoặc overlap; replan sau edit/completion giữ IDs; user không sửa partner; long-term không bị giới hạn giả bởi tuần đầu.
- **Nhịp:** phút thay task count; duplicate/late/processing/unlinked/survival đúng semantics; no due không nhắc; boundary.7/.3 và binary float thống nhất;03:00/22:00/07:00; đổi plan cùng ngày invalidate; reactivated pair không carry streak; history có revision; cả2ahead không nudge chậm; source thiếu→no_action.
- **Delivery/consistency:** crash giữa finalize và completion được recover; replay outbox không credit/nhắc đôi; job concurrent có lease/quota; fail không claim sent/read; user mởapp hay không không làm đổi eligibility.
- **FE:** loading/empty/error/stale/partial/sync states đúng; stale accept không tự retry bằng version mới; đổi pair không nhận response cũ; template/fake/live nhãn đúng; secret nội bộ không nằm bundle;2user browser test flow consent→plan→checkin→metrics→proposal.

## 11. Bằng chứng kiểm tra của nhiệm vụ này

### 11.1 Đã chạy trên snapshot product

| Kiểm tra | Kết quả thực tế | Chứng minh được / không chứng minh được |
|---|---|---|
| eval/concept/run_phase1.py | **30/30 đúng**, mapped/null accuracy1.0, max latency8.127ms | Local lexical+rules trên fixture agent-authored; không live LLM/embedding hoặc generalization mọi môn |
| eval/matching/run_phase2a.py, không --review-artifact | **30persona, Precision@3=1.0,90factual checks,0fail** | Deterministic policy cũ;20human reviews PENDING; không Waterfall mới/pilot/live rerank |
| eval.measurement.run_phase2b.evaluate(), chỉ in summary | **20/20 PASS, failures=[]** | Internal synthetic rules; không integration coherent snapshot/job/live outcome |
| Probe template scheduler, target=known=sql.join, team catalog,2members | **0task;2plan đều items/deferred rỗng,partial=false,warnings=0;validate_tasks/validate_plan PASS** | Tái hiện kernel bỏ known target; import trực tiếp contract/scheduler để tránh package dependency. Không chạy PlanService/DB/HTTP/model, không coi là plan đúng |
| ruff check . --no-cache | **FAIL,50 lỗi có sẵn** | Import ordering/unused/multiple statements, gồm BE/eval/scripts; không auto-fix ngoài scope |
| python -m pytest tests -q --tb=short từ backend | **Không chạy được suite:22collection errors** | Thiếu SQLAlchemy, Alembic không import được; qdrant-client cũng chưa cài. Không có số PASS backend hợp lệ trong lượt này |
| node --test *.test.cjs từ frontend/tests/person1 | **4test files fail trước thực thi assertions** | MODULE_NOT_FOUND typescript/react; không coi là4behavior regressions đã tái hiện |
| Kiểm tra tài liệu bằng Python/Pydantic | **18 JSON parse được;6 shape v1 hợp schema;80 link local tồn tại;phép tính score/metrics đúng;fence/UTF-8/whitespace hợp lệ** | Chỉ kiểm tài liệu/schema thuần; không thay thế HTTP integration, render Mermaid hoặc browser E2E |

Concept eval dùng bundled Python3.12.14. Lần chạy trong sandbox không hoàn tất và đã hủy; chạy lại ngoài sandbox thành công, nguyên nhân treo cụ thể chưa xác minh. Script chỉ local fixture, không đọc credential/gọi model. Matching và measurement eval chạy cùng bundled runtime, không ghi đè eval artifacts. Python hệ thống3.13 có một số package nhưng thiếu dependency backend; không thay requirements/lockfile để che lỗi.

Lệnh tái lập (thay python bằng môi trường đã cài dependency đầy đủ):

~~~powershell
python eval/concept/run_phase1.py
python eval/matching/run_phase2a.py
python -c 'import json; from eval.measurement.run_phase2b import evaluate; r=evaluate(); print(json.dumps({k:v for k,v in r.items() if k != "outcomes"})); print([x for x in r["outcomes"] if not x["passed"]])'
ruff check . --no-cache
cd backend
python -m pytest tests -q --tb=short
cd ../frontend/tests/person1
node --test *.test.cjs
~~~

Không chạy trực tiếp entrypoint run_phase2b.py khi chỉ muốn read-only, vì entrypoint đó ghi results.json. Không chạy script live smoke có thể dùng key môi trường chỉ để có nhãn PASS.

### 11.2 Evidence có sẵn, tách khỏi lần kiểm tra này

- [test_data1_concepts.py](../backend/tests/test_data1_concepts.py), [test_data1_api.py](../backend/tests/test_data1_api.py): source có confirm atomic/revision/ACL/fake selector/fallback; tồn tại test không có nghĩa đã chạy pass trong lượt này.
- [test_data1_matching.py](../backend/tests/test_data1_matching.py), [test_data1_pairs_api.py](../backend/tests/test_data1_pairs_api.py): test rules/fake/HTTP TestClient cho policy cũ một pair/tự ghép. Không chứng minh tiêu chí mới.
- [eval/plan/report.md](../eval/plan/report.md): ngày06/10, prompt v1; template và fake mỗi mode nhận9/10cặp,18personal hard-pass,6/18partial. Fake cố tình lỗi lần đầu rồi repair. Human_count=0/judge_count=0. Code prompt hiện v2-minimal; không dùng report này xác nhận quality prompt hiện tại.
- [test_plan_live_smoke.py](../backend/tests/test_plan_live_smoke.py) dùng FakeLLM/MockTransport; chữ “live” trong tên test **không phải đã gọi model thật**.
- [eval/measurement/results.json](../eval/measurement/results.json) có20synthetic cases; dashboard_smoke3synthetic checks. Không phải dữ liệu học thật.
- [eval/nudge/report.md](../eval/nudge/report.md): localhost demo0successful real delivery; fixture SENT giả, SIMULATED; chưa có pilot/human rubric/production24h observation.
- [backend/tests/conftest.py](../backend/tests/conftest.py) ép fake keys/provider và chặn transport thật. Test PASS nếu chạy sau này vẫn không phải evidence model thật.
- Moderator có archived live reports trong eval/moderator; chúng thuộc (5), **không dùng thay bằng chứng Concept/Matching/Plan/Tracking**.

Static test drift cần tái hiện khi môi trường đủ: test_matches_api còn kỳ vọng top5 trong khi product trả top15; test_matching_engine có expectation topic khác code mới; test_plans_api cấm partner.items trong khi service trả. Chưa chạy đến assertions nên ghi là **nguy cơ được chỉ ra từ code**, không báo số test fail nghiệp vụ.

Chưa xác minh: model thật của ba phần, chất lượng nội dung/tier/style với người chấm độc lập, cost/p95live, notification production, outcomes85%/70%/retention, browser E2E, migrations2pair/solo, race/recovery đề xuất. Không có tuyên bố “toàn bộ AI đã chạy ổn”.

## 12. Kịch bản demo và câu hỏi phản biện

Phải tách **demo hiện trạng** (template/rules trên code đã có, sau khi cài dependency) với **demo thiết kế mới** (fixture/prototype ghi rõ chưa implement).

| Kịch bản | Các bước | Điều cần chứng minh |
|---|---|---|
| Matching3tier | Persona swap, cùng SQL, khác môn cùng deadline/style; thêm userunknown/poolrỗng | Reasons có facts; fallback trung thực; user chọn/accept, không auto-match |
| Deadline gấp/capacity thiếu | REFRESHER SQL10ngày,3ngày rảnh, required>capacity | Must/Should/Cut, PARTIAL/NEEDS_DECISION; không hứa toàn scope |
| Transfer | Người biết C++ học Python nhưng dict chưa confirmed | Không skip toàn bộ nền chỉ vì tier; prerequisite giữ |
| DAY/Survival | Chọn ngày chưa giờ→card20h; user mệt chọn15p→text confirm | Streak giữ, Standard progress chưa thành45p/mastery |
| Nhịp và replan |60/120=.5→private replan proposal→owner accept→snapshotrevision mới | Pacing do code, before/after minh bạch, không auto apply |
| Retry/late/lifecycle | Replay check-in; late confirm qua03; đổi plan rồi accept stale; có2pair | Không double-credit/sai cặp/snapshot cũ lọt gate |
| Model tắt/delivery lỗi | Extraction unknown, template plan/coach, notificationfail | Nền tảng vẫn dùng được, nhãn fallback/read/sync đúng |

Dùng injected clock cho mốc20h/03:00/24h, fixture có nhãn. Không chỉnh giờ hệ thống hoặc nói đã quan sát24h thật khi chỉ mô phỏng.

| Câu hỏi | Lý do thiết kế/câu trả lời |
|---|---|
| AI làm gì nếu score/lịch/pacing do code? | Hiểu text hồ sơ và viết nội dung/diễn giải; invariant nghiệp vụ cần tái lập/audit |
| Sao không nhiều agent? | Bài toán có workflow rõ; thêm call không giải quyết sai identity/version; chưa có evidence chất lượng tăng |
| Không ai bù trừ thì sao? | Hạ tier có evidence, waiting/invite khi thiếu; không giả profile/quality |
| Score.78 có nghĩa78%ghép thành công? | Không; heuristic phiên bản cụ thể, chưa calibrated outcome |
| Phong cách unknown có bị phạt? | Không coi unknown là conflict; giảm evidence/uncertainty, user sửa được |
| Vì sao bỏ lịch khỏi matching mà plan lại hỏi? | Matching giảm ma sát tìm người; scheduling cần thời gian sau consent, không lẫn mục đích field |
| Một ảnh chứng minh hiểu bài? | Không; evidence/presence và task completion khác mastery |
| Survival xong có qua milestone? | Chỉ khi đáp ứng criteria Standard/milestone riêng;15p giữ nhịp không tự hoàn tất45p |
| Replan tăng pacing là học tốt hơn? | Có thể do denominator/revision đổi; history phải ghi version, không gọi learning gain |
| Tại sao plan phải của cá nhân? | Một goal/người, giữ khi đổi partner;2cặp không nhân đôi workload/budget |
| Chậm hơn bạn có bị phạt? | Own consistency độc lập; gap chỉ BE dùng gợi ý hỗ trợ riêng theo consent |
| SENT là người học đã đọc? | Hiện chỉ lưu chuông; đã có read_at nhưng cần nối đúng intervention và chốt read semantics, không suy read từ delivery |
| Đã gọi model thật chưa? | Lượt này chưa; Concept/matching/measurement results là local/synthetic; Plan archived fake/template |
| Các con số.7/.3/20%/70% có evidence? | Ngưỡng policy hoặc mục tiêu giả định pilot; cần dữ liệu thật, không claim đã được chứng minh |
| FE làm ngay phần nào? | Layout/state/capability adapters; full wiring theo OpenAPI được BE/PO duyệt, không tự invent endpoint |

## 13. Prompt triển khai FE sau khi PO đọc và chốt hướng

~~~text
Bạn triển khai FE PeerBridge từ workspace product. Trước khi sửa, đọc AGENTS.md nếu có,
docs/ai-solution-analysis.md, hai feature specs trong Product/AI feature spec/,
decision log PO đã duyệt, OpenAPI/capabilities thực tế của BE, frontend/app/page.tsx,
frontend/lib/{api,types,plan-types,home-types,checkin-types,time}.ts và feature modules active.

Chỉ sửa frontend/ theo nhiệm vụ FE; nếu cần sửa backend hoặc file ngoài phạm vi,
ghi chính xác dependency/lý do và hỏi người dùng. Không commit/push trừ khi người dùng yêu cầu lại.
Giai đoạn trước chỉ là phân tích: mọi route/schema v2 trong tài liệu là proposal.
Kiểm tra BE có thật trước wiring. Nếu thiếu, dựng UI với fixture development được gắn nhãn
và báo dependency; không đưa nút giả/success giả vào luồng production.

Giữ phong cách UI hiện hành, sửa features/ đang được app/page.tsx import;
tránh sửa bản trùng không render trong components/. Giữ StudyRoom/StudySessions của Chính,
dùng adapter pair/session hiện có và không đồng nhất plan item với room ID.

1. Tạo typed adapters/capabilities v1/v2, giữ score/state/ownership khác nhau rõ.
   Hỗ trợ ApiError v1 detail và v2 error envelope, AbortController/response sequence,
   cache scope user/goal/plan/pair/lifecycle; 401 theo auth flow hiện có.
2. Goal/Profile: một goal active, tier/deadline, review canonical need/offer/unmapped,
   self/wanted style chips có unknown/correction. Không suy concept bằng regex hoặc bịa capacity240p.
3. Matching: badge Golden/Peer/Body Double, facts/reasons/quality, waiting/invite,
   dismiss, school display reorder, active capacity2 khi BE hỗ trợ. User chọn và recipient accept.
4. Plan: owner-only setup/draft feasibility review; Today/Week/Queue/milestones,
   DAY chưa giờ/TIME theo timezone, buffer day; Standard/Survival đúng policy PO duyệt.
   Partner read/comment theo share consent; không cho sửa thông tin/cam kết của partner.
5. Check-in: text/ảnh hiện có, processing/needs_confirm/correction, mode/item context,
   sync_state; APPLIED không đồng nghĩa Standard hoàn tất. Chỉ hiện task Standard hoàn tất
   khi authoritative item state=COMPLETED; Survival có badge riêng.
   Không gọi /plans/events/completion hoặc /jobs và không đưa secret adapter vào FE.
6. Rhythm/Home: own goal progress/pacing/phút/as-of/freshness, no due không thành100% hoặc0%;
   partner presence và private coach CTA, không risk probability/rank “ai kém hơn”.
7. Replan: before/after, stable item identity, expected_revision/version,
   owner accept/reject. Conflict phải refetch/review, không auto accept theo revision mới.
8. Mọi mutation có busy lock/idempotency phù hợp; giữ key khi retry cùng payload.
   Sau mutation invalidate/refetch authoritative plan/metrics/home/feed/commitments/notifications.
   Poll generation/processing/recomputing có giới hạn/backoff, dừng khi unmount/terminal.
   Không gọi evaluateCoach trong render chỉ để lấy nội dung.
9. Loading/empty/error/stale/partial/unsupported/config/provider/sync states có CTA riêng.
   Mobile dùng nút gán ngày/đổi giờ, không bắt drag/drop.
   Nhãn TEMPLATE/FAKE/LLM trung thực, không claim mastery hay model thật từ mock test.

Nghiệm thu theo mục10.3 tài liệu, thêm tests meaningful cho adapter/permission/status/races
liên quan thay đổi; không snapshot máy móc mọi chi tiết UI. Chạy frontend test, typecheck,
production build và browser flow với BE thật khi môi trường cho phép.
Báo các file đã sửa, route/capability thật đã dùng, fixture/mock còn lại, kết quả kiểm tra
và blocking dependencies. Không sửa BE/schema/spec âm thầm để làm FE có vẻ hoạt động.
~~~
