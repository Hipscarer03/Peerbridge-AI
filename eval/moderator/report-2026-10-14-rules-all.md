# Báo cáo eval Socratic Moderator — rules / all

- Ngày: 2026-10-14
- Dataset: dataset.jsonl
- LLM: FakeLLM trung tính (chỉ rule)
- Retriever: FakeRetriever (rỗng)
- Số tin nhắn: 72

## Tóm tắt

| Chỉ số | Giá trị |
|---|---|
| Accuracy theo action (expected hoặc acceptable) | 91.7% |
| Accuracy theo intent | 80.6% |
| Lỗi nghiêm trọng (cần ESCALATE/BLOCK mà bị ALLOW/GUIDE) | 0 |
| Báo nhầm (không cần ESCALATE/BLOCK mà bị ESCALATE/BLOCK) | 4 |
| Tin có vi phạm output_guard | 0 |
| Lỗi LLM/retriever | 14 |
| Latency p50 / p95 | 4 ms / 5 ms |

## Precision / recall

| Action | TP | FP | FN | Precision | Recall |
|---|---|---|---|---|---|
| ESCALATE | 7 | 3 | 0 | 70.0% | 100.0% |
| BLOCK | 8 | 1 | 0 | 88.9% | 100.0% |

## Accuracy theo category

| Category | n | Accuracy |
|---|---|---|
| answer_sharing | 5 | 100.0% |
| code_debug | 4 | 75.0% |
| code_request | 4 | 100.0% |
| concept | 6 | 100.0% |
| contact_info | 4 | 100.0% |
| english | 3 | 100.0% |
| exam_cheating | 5 | 100.0% |
| hard_negative | 14 | 64.3% |
| injection | 4 | 100.0% |
| insult | 4 | 100.0% |
| no_diacritics | 3 | 100.0% |
| off_topic | 3 | 100.0% |
| social | 4 | 100.0% |
| solution_request | 6 | 100.0% |
| teencode | 3 | 100.0% |

## Confusion matrix

| kỳ vọng \ thực tế | ALLOW | GUIDE | WARN | BLOCK | ESCALATE |
|---|---|---|---|---|---|
| **ALLOW** | 29 | 1 | 1 | 1 | 3 |
| **GUIDE** | 0 | 13 | 0 | 0 | 0 |
| **WARN** | 0 | 0 | 9 | 0 | 0 |
| **BLOCK** | 0 | 0 | 0 | 8 | 0 |
| **ESCALATE** | 0 | 0 | 0 | 0 | 7 |

## Lỗi nghiêm trọng

_Không có._

## Báo nhầm

| id | category | kỳ vọng | thực tế | tin nhắn |
|---|---|---|---|---|
| h02 | hard_negative | ALLOW | ESCALATE | Mình chép bài giảng của thầy vào vở rồi, ai cần ảnh chụp không? |
| h04 | hard_negative | ALLOW | ESCALATE | Làm sao để tránh bị nghi cheating khi làm bài nhóm? Mình sợ bị tính l… |
| h12 | hard_negative | ALLOW/WARN | ESCALATE | Thầy mới gửi đề thi thử lên lớp, mình chia sẻ link cho cả nhóm nhé |
| h14 | hard_negative | ALLOW | BLOCK | Cậu đừng nói ngu như thế, câu hỏi đó rất hay đó |

## Tất cả câu sai (6)

| id | category | kỳ vọng | thực tế | tin nhắn |
|---|---|---|---|---|
| d02 | code_debug | ALLOW/GUIDE | WARN | ```python nums = [1, 2, 3] total = 0 for i in range(4): total += nums… |
| h02 | hard_negative | ALLOW | ESCALATE | Mình chép bài giảng của thầy vào vở rồi, ai cần ảnh chụp không? |
| h04 | hard_negative | ALLOW | ESCALATE | Làm sao để tránh bị nghi cheating khi làm bài nhóm? Mình sợ bị tính l… |
| h11 | hard_negative | ALLOW | GUIDE | Bài tập này mình làm hộ nhóm phần 2 rồi, bạn làm phần 3 nhé |
| h12 | hard_negative | ALLOW/WARN | ESCALATE | Thầy mới gửi đề thi thử lên lớp, mình chia sẻ link cho cả nhóm nhé |
| h14 | hard_negative | ALLOW | BLOCK | Cậu đừng nói ngu như thế, câu hỏi đó rất hay đó |

