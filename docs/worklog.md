# Worklog — PeerBridge (P-005, EDU-07)

> Bảng commit lịch sử cập nhật đến 18/10. [WORKLOG.md ở root](../WORKLOG.md) tổng hợp tiến độ theo ngày và đường dẫn BTC.

> Đối chiếu `git log --no-merges` trên `main` ngày 18/10/2026 (không liệt kê merge commit). Cột *Người* quy đổi tên tài khoản git sang tên thành viên: Pham Van Hoang Anh Tu / Phạm Tú / tubepvhat1604-bot → Tú; Bancainh / Nguyễn Bá Chính → Chính; Le Van Sang / Lê Văn Sang → Sang; hiep → Hiệp. "Claude (tác tử AI)" là commit do trợ lý lập trình AI tạo theo yêu cầu của thành viên.

> Thời gian làm việc từng việc **không** có trong git; nhóm bổ sung cột giờ nếu BTC yêu cầu.

## Tổng hợp

| Người | Số commit |
|---|---|
| Tú | 47 |
| Chính | 26 |
| Claude (tác tử AI) | 12 |
| Sang | 11 |
| Hiệp | 13 |
| BTC (bot) | 1 |

## 2026-10-18

| Commit | Người | Nội dung |
|---|---|---|
| `9fd1c1a` | Hiệp | Sửa ghép cặp để xếp hạng mọi hồ sơ đủ điều kiện và bổ sung hồ sơ mẫu |
| `bbe6318` | Hiệp | Hiển thị landing page trong lúc khôi phục phiên khách |

## 2026-10-17

| Commit | Người | Nội dung |
|---|---|---|
| `d83fda2` | Hiệp | Cập nhật README, nhấn mạnh AI điều phối phiên học và theo dõi tiến độ |
| `ac3113e` | Hiệp | Viết lại README và cập nhật ảnh landing page |
| `c0de0cd` | Hiệp | Cải thiện luồng phiên học, cam kết học, lịch và thông báo |
| `291c55e` | Hiệp | Tích hợp phiên học chung, chat, lời mời bạn học, kế hoạch cá nhân và đặc tả AI |

## 2026-10-16

| Commit | Người | Nội dung |
|---|---|---|
| `471046b` | Tú | Tích hợp matching A–F và kế hoạch học cá nhân |
| `d19d058` | Chính | Đồng bộ tài liệu nộp cuối với yêu cầu PeerBridge AICB Phase 1 |
| `8b327d8` | Chính | Rà soát mẫu BTC và hoàn thiện hồ sơ nộp |
| `c8385c0` | Chính | Chuẩn hóa tài liệu và cấu trúc hồ sơ theo mẫu nộp P-005 |
| `ee2a5ad` | Chính | Sửa giới hạn đăng nhập để nhận diện đúng địa chỉ IP người dùng |
| `f87f429` | Chính | Khép các lỗi kiểm tra cuối: check-in, ghép cặp, kết nối, kế hoạch và CI |

## 2026-10-15

| Commit | Người | Nội dung |
|---|---|---|
| `342bbca` | Chính | Sửa các vấn đề rà soát trong PR ngày 14–15/10 |
| `b86c3df` | Chính | Làm CI chạy ổn định trên runner team-5 |
| `7e4eb85` | Hiệp | Cập nhật luồng giao diện và kế hoạch học |

## 2026-10-12

| Commit | Người | Nội dung |
|---|---|---|
| `db3d037` | Tú | refactor(frontend): chuyển giao diện sang cấu trúc features/ của Hiệp, giữ bản mới nhất đang chạy |
| `0231767` | Tú | Đưa sửa lỗi của Sang (11/10) lên bản web: kiểm tra lịch học, tiến độ cập nhật đúng |

## 2026-10-10

| Commit | Người | Nội dung |
|---|---|---|
| `2417f23` | Tú | fix(admin): Admin chỉ xem tin bị AI cảnh báo, không xem tóm tắt phiên |
| `1559a58` | Tú | fix(ui): giờ rảnh chọn bằng nút, nhận xét ảnh ngắn gọn, Tìm bạn 3 người, bớt chữ các trang |
| `ed47e76` | Claude (tác tử AI) | fix(landing): nhãn chung, không nêu môn cụ thể |
| `06b9fe1` | Claude (tác tử AI) | fix(landing): đổi ví dụ SQL/Python sang nội dung bài slide AI |
| `7125891` | Claude (tác tử AI) | fix(demo): bạn học mẫu theo 15 bài slide AICB, kế hoạch có việc ngay hôm nay |

## 2026-10-09

| Commit | Người | Nội dung |
|---|---|---|
| `3e03c4c` | Claude (tác tử AI) | fix: đồng bộ integration/peerbridge với bản web đang chạy |
| `435ffc7` | Claude (tác tử AI) | test(rag): cập nhật kỳ vọng gợi ý có dòng trích nguồn slide |
| `f4141c5` | Claude (tác tử AI) | feat(rag): AI phòng học tra slide giảng viên AICB và trích nguồn theo tên bài |
| `e259c3b` | Claude (tác tử AI) | feat(phien-hoc): giao dien Admin va tom tat phien |
| `d592ef3` | Claude (tác tử AI) | feat(phien-hoc): Admin, loc truoc + tran chi phi AI, tom tat va cham phien |
| `1a52abf` | Claude (tác tử AI) | test(rag): cập nhật kỳ vọng gợi ý có dòng trích nguồn slide |
| `79bbfe0` | Claude (tác tử AI) | feat(rag): AI phòng học tra slide giảng viên AICB và trích nguồn theo tên bài |
| `cc57ec9` | Claude (tác tử AI) | feat(phien-hoc): giao dien Admin va tom tat phien |
| `7666587` | Claude (tác tử AI) | feat(phien-hoc): Admin, loc truoc + tran chi phi AI, tom tat va cham phien |

## 2026-10-07

| Commit | Người | Nội dung |
|---|---|---|
| `8602b24` | Tú | fix: đưa thẻ Nhịp học + Coach vào Tổng quan mới, tên tài khoản thử, ghi chi phí AI ghép cặp |
| `6666498` | Hiệp | update ui |
| `f12f6e3` | Sang | fix: initialize Docker credentials in runner step |
| `11d035e` | Sang | ci: use team-5 Docker runner for Render deployment |
| `42cb390` | Sang | ci: deploy integration images to Render via GitHub Actions |
| `b2b9368` | Tú | ci: GitHub Actions tự test và cập nhật web khi có code mới trên integration/peerbridge |
| `82a581d` | Chính | cai thien socratic |
| `c61a745` | Tú | docs: bối cảnh hiện tại và kịch bản demo cho team |
| `6cea49f` | Tú | feat(demo): 36 bạn học mẫu cho gợi ý ghép cặp + 2 tài khoản thử vào bằng một nút (DEMO_MODE) |
| `b3e66b4` | Tú | fix(loop): chỉ tính việc đã hết khung giờ là đến hạn, để vừa lập plan xong coach không nhắc ngay |
| `07a4551` | Tú | fix(deploy): start.sh tự đặt mặc định bật AI và danh mục Data 1 khi Render chưa đồng bộ biến môi trường |
| `cd6034b` | Tú | feat(loop): nối check-in → đo tiến độ Data 1 → coach Data 2 → thông báo; bật AI có trần chi phí |
| `c7dcfc6` | Tú | docs: team workflow and shared Claude rules |
| `6cdc7cf` | Tú | docs: how to enable Litestream backup to Supabase on Render |
| `3fa94c5` | Tú | feat(frontend): landing page, top/bottom navigation, real overview, notifications, PWA |
| `494cea2` | Tú | feat: real overview data, in-app notifications, AI stats/budget, SQLite backup |
| `9487cec` | Tú | style(frontend): calm, readable redesign with Be Vietnam Pro |
| `ac164c7` | Tú | feat(vision): Check-in screen in the web app and pairs from "Kết nối" |
| `a87dcfe` | Tú | chore(deploy): use Render free plan (no persistent disk) |
| `33f633a` | Tú | docs: step-by-step deploy guide for Render and Vercel |
| `58a2232` | Tú | chore(deploy): Render blueprint for the backend |

## 2026-10-06

| Commit | Người | Nội dung |
|---|---|---|
| `40cb2c0` | Tú | feat(vision): local check-in demo page and signed image links |
| `dd444a4` | Sang | fix(connections): commit mutations before sending success responses |
| `4371a1d` | Sang | test(eval): add plan and nudge evaluation runners and reports |
| `597697f` | Tú | feat(vision): photo check-in wired to Data 1 pairs and Data 2 plans |
| `29db4ac` | Tú | feat(data2): port plan coach from feat/ai-data2-plan-coach-sang |
| `2af508f` | Chính | feat(data1): implement onboarding matching and measurement |

## 2026-10-04

| Commit | Người | Nội dung |
|---|---|---|
| `3c23cbe` | Chính | feat: integrate PeerBridge MVP and Gate 2 documentation |

## 2026-10-03

| Commit | Người | Nội dung |
|---|---|---|
| `ff7a375` | Sang | feat: integrate Study Room sessions end to end |
| `2cf778e` | Sang | feat: update matching frontend and backend |
| `b28913e` | Chính | docs: complete G2 README and architecture documentation |
| `3a45d74` | Chính | feat: implement realtime Study Room frontend component |
| `d94add5` | Chính | feat: extend matching and connections APIs for frontend integration |
| `d789133` | Chính | feat: integrate frontend authentication and profile with backend |

## 2026-10-02

| Commit | Người | Nội dung |
|---|---|---|
| `a27e9c0` | Chính | merge: integrate AI moderator into backend |

## 2026-10-01

| Commit | Người | Nội dung |
|---|---|---|
| `304418d` | Tú | feat(agent): two-tier rules so LLM can override soft signals, final eval on test and holdout |
| `9cf6585` | Tú | feat(agent): moderator eval dataset, runner and RAG eval with rules baseline |
| `4202ab6` | Tú | feat(agent): HITL event record, review interface, in-memory queue and integration README |
| `7a17303` | Tú | feat(agent): output guard for answer, code, prompt leakage and non-Socratic hints |
| `70d6210` | Tú | feat(agent): Socratic guidance with RAG, isolate tests from network, embedder warmup |
| `fcf2f69` | Tú | feat(agent): OpenAI-compatible LLM client and moderator CLI |
| `1c196cc` | Tú | feat(agent): Qdrant RAG with E5 embeddings, ingest CLI and demo course docs |
| `099e7c8` | Chính | feat(backend): complete study room and moderation with final audit |
| `098259c` | Chính | feat(backend): add study room, agent interface and HITL moderation |
| `24e557e` | Sang | Delete frontend directory |
| `7b77c3e` | Sang | feat: add one frontend versions |
| `1568a26` | Chính | feat(backend): add matching, mutual consent, and study sessions |

## 2026-09-30

| Commit | Người | Nội dung |
|---|---|---|
| `00fb6ab` | Tú | feat(agent): LangGraph moderator with rules, risk assessment and policy table |
| `1ffc02a` | Tú | feat(agent): moderator contract, LLM/retriever interfaces and fakes |
| `62bc967` | Chính | feat(matching): implement deterministic peer matching engine |
| `c0fa6ae` | Chính | feat(profile): implement student profile service |
| `36bd3f8` | Chính | chore(backend): establish FastAPI backend foundation |
| `8176500` | Chính | chore: update project |
| `5356459` | Chính | Reapply "Kien truc v1" |
| `51fb61a` | Chính | Revert "Kien truc v1" |
| `282b3b5` | Chính | ci: use team self-hosted runner |

## 2026-09-29

| Commit | Người | Nội dung |
|---|---|---|
| `1343b47` | Chính | Kien truc v1 |
| `82381f7` | Sang | chore: restore shared hook config |
| `cf4147a` | Sang | feat: build frontend |

## 2026-09-15

| Commit | Người | Nội dung |
|---|---|---|
| `ab2ddbf` | Tú | cập nhật hooks.json |

## 2026-09-09

| Commit | Người | Nội dung |
|---|---|---|
| `a16838d` | BTC (bot) | Initial commit |
