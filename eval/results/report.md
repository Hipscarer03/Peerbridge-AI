<<<<<<< HEAD
# Evaluation Report — PeerBridge (P-005, EDU-07)

Đây là file báo cáo tại **đường dẫn gốc của template BTC**. [Báo cáo đầy đủ](../../docs/evaluation.md) mô tả nhiệm vụ, tập dữ liệu, lệnh chạy, kết quả và giới hạn. Các số dưới đây lấy từ báo cáo đã commit; phần chưa đo được ghi rõ, không thay bằng số giả.

Phạm vi nội dung demo hiện tại là **AICB Phase 1**. Một số kết quả lịch sử dùng fixture SQL/Python hoặc corpus
Qdrant/E5 khác bản demo; không dùng chúng để khẳng định chất lượng trên 15 bài học AICB Phase 1.

## 1. Metrics

| Metric | Mục tiêu hoặc ngưỡng | Kết quả có bằng chứng | Trạng thái |
|---|---|---|---|
| Moderator: chọn hành động | Không có lỗi nghiêm trọng trên tập thử | Live/test 01/10: 87,9% action đúng, 0 lỗi nghiêm trọng trên 33 tin; live/holdout: 100% trên 12 tin | Đạt trên tập thử nhỏ, phần lớn dữ liệu do nhóm/AI viết |
| Moderator: độ trễ | Chưa chốt ngưỡng theo trải nghiệm người dùng | Live/test p50 1344 ms (1,344 s), p95 3869 ms (3,869 s) | Cần đo lại trên bản deploy |
| Matching deterministic | precision@3 ≥ 0,7 | 1,0 trên bộ dữ liệu tổng hợp; 90 kiểm tra lời giải thích không sai sự thật | Đạt trên synthetic |
| Plan validator | Kế hoạch được chấp nhận và không vi phạm ràng buộc | 9/10 cặp chấp nhận, 18/18 plan cá nhân qua validator trong chế độ template/fake | Đạt trên synthetic; chưa đánh giá chất lượng bởi người thật |
| AI Vision trên ảnh thật AICB Phase 1 | Cần bộ ảnh thật có nhãn | `labels.csv` có 4 dòng nhãn mẫu, nhưng `images/real/` chưa có ảnh; chưa có kết quả live | Chưa có dữ liệu ảnh thật |
| Phản hồi người dùng | Ít nhất 5 người dùng thật | Chưa có phản hồi được xác thực trong repo | Chưa hoàn thành |

Nguồn: [bảng tổng hợp](../../docs/evaluation.md), [moderator live/test](../moderator/report-2026-10-01-live-test.md), [holdout](../moderator/report-2026-10-01-live-holdout.md), [plan](../plan/report.md). Không dùng kết quả FakeLLM như phép đo chất lượng mô hình thật.

## 2. Test Results

### Unit và integration tests

Backend có bộ `pytest`, Ruff; frontend có TypeScript typecheck và build. Workflow [PeerBridge CI](../../.github/workflows/peerbridge-ci.yml) còn chạy Docker build và Playwright E2E. Trên head `635fd39` của [PR #40](https://github.com/AI20K-Build-Phase-Cohort-4/P-005/pull/40) ngày 16/10/2026, [PeerBridge CI](https://github.com/AI20K-Build-Phase-Cohort-4/P-005/actions/runs/38852172190) và [CI template](https://github.com/AI20K-Build-Phase-Cohort-4/P-005/actions/runs/38852172181) đều thành công; backend có **972 test qua, coverage 90,21%**. Số lượng test và coverage thay đổi theo commit; xem log run cụ thể, không coi số đo này là kết quả của bản live.

Chạy lại từ gốc repo (sau khi cài dependencies):

```powershell
cd backend
python -m pytest -q tests
cd ../frontend
npm ci
npx tsc --noEmit
npm run build
```

### Đánh giá AI

- [Báo cáo đầy đủ](../../docs/evaluation.md) có benchmark 4-tuple, golden dataset, kết quả live/offline và giới hạn.
- Bộ moderator rules 14/10: action 91,7% trên 72 tin, 0 lỗi nghiêm trọng; [báo cáo](../moderator/report-2026-10-14-rules-all.md).
- Bộ chấm phiên rules phát hiện lộ đáp án có recall 25%; đây là giới hạn cần khắc phục, không phải kết quả đạt mục tiêu.
- Bộ Vision fake dùng fixture SQL/Python cũ chỉ chứng minh pipeline chạy hết; **không** chứng minh độ chính xác
  AI Vision trên ảnh AICB Phase 1.

## 3. User Feedback

Chưa có 5 phản hồi từ người dùng thật được lưu trong repo. [Phiếu và bảng thu phản hồi](../../docs/user-feedback.md) đã chuẩn bị; nhóm cần điền bằng câu trả lời thực tế, ẩn danh và có ngày thử trước khi nộp.

## 4. Demo Results

- Web demo: https://peerbridge-deploy.vercel.app.
- Ngày demo chính thức, số người tham gia và đánh giá: **chưa có bằng chứng trong repo**.
- Kịch bản quay: [video demo](../../docs/video-demo.md). Chưa có link video được công bố.
- Giới hạn ảnh hưởng demo: Render Free dùng đĩa tạm; sao lưu Litestream/Supabase chưa bật. Xem [ADR-001](../../docs/ADR-001-sqlite-litestream.md).

## 5. Action Items

- [ ] Thu và ghi ít nhất 5 phản hồi người dùng thật.
- [ ] Quay/đăng video tối đa 5 phút, thêm link và kết quả buổi demo.
- [ ] Mở rộng tập ảnh thật có nhãn, đo AI Vision live; đo moderator/RAG trên cấu hình đang deploy.
- [ ] Bật và kiểm tra khôi phục sao lưu SQLite nếu dùng bản live để lưu dữ liệu lâu dài.
=======
# Evaluation Report

> Báo cáo đánh giá chất lượng sản phẩm theo tiêu chí BTC.

---

## 1. Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Response accuracy | >80% | — | ⏳ |
| Response latency | <3s | — | ⏳ |
| User satisfaction | >4/5 | — | ⏳ |
| Test coverage | >60% | — | ⏳ |

## 2. Test Results

### Unit Tests
```
pytest tests/ -v
# Paste output here
```

### Integration Tests
```
# Mô tả test scenarios và kết quả
```

## 3. User Feedback

| User | Feedback | Rating |
|------|----------|--------|
| [User 1] | [feedback] | [1-5] |
| [User 2] | [feedback] | [1-5] |

## 4. Demo Results

- Ngày demo: [YYYY-MM-DD]
- Người tham gia: [số người]
- Feedback chung: [tóm tắt]
- Issues phát hiện: [danh sách]

## 5. Action Items

- [ ] [Cần cải thiện 1]
- [ ] [Cần cải thiện 2]
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
