# Eval AI Vision check-in

Đo AI check-in của nội dung **AICB Phase 1** bằng **ảnh chụp thật** có đáp án. Hiện `labels.csv` có 4 dòng mẫu nhưng thư mục
`images/real/` **chưa có ảnh** (chỉ có `.gitkeep`) — cần nhóm chụp khoảng 40 ảnh.

`fixtures.aicb-phase1.json` chứa 15 concept tương ứng với catalog và học liệu đang dùng trong app. Bộ ảnh tổng hợp
SQL/Python cùng `fixtures.json` là dữ liệu thử đường ống cũ, không đo chất lượng trên AICB Phase 1.

## 1. Chụp ảnh (~40 ảnh)

| Loại (`category`) | Số lượng gợi ý | Ví dụ |
|---|---|---|
| `photo_screen` | ~15 | Chụp màn hình đang học một trong 15 bài AICB Phase 1 |
| `notebook` | ~10 | Trang vở/giấy ghi chép bài học |
| `hard` | ~5 | Ảnh khó: mờ, nghiêng, tối, chụp xa, nhiều chủ đề cùng lúc |
| `not_study` | ~10 | Bữa ăn, phòng, bầu trời, trang trắng, ảnh selfie không có bài học |

- Chụp bằng điện thoại như người dùng thật. **Không** chụp mặt người, tên thật, email, số điện thoại, thẻ sinh viên.
- Đặt tên file không dấu, không khoảng trắng: `sv01_aicb_rag_01.jpg`. Bỏ vào `eval/vision/images/real/`.
- Ảnh > 10MB thì thu nhỏ trước (repo không nhận file > 10MB).

## 2. Ghi nhãn vào `labels.csv`

Giữ nguyên dòng tiêu đề:

```csv
file,category,is_study,expected_concepts,note
real/sv01_aicb_rag_01.jpg,photo_screen,true,ai.rag_pipeline,
real/sv02_aicb_react_01.jpg,notebook,true,ai.react_agent,
real/sv03_bua_trua.jpg,not_study,false,,
```

- `is_study`: `true` nếu ảnh cho thấy đang học, `false` nếu không.
- `expected_concepts`: id concept đúng, nhiều id cách nhau bằng `;`, để trống nếu `is_study=false`.
  Dùng ID `ai.*` trong `fixtures.aicb-phase1.json`; các ID này được đối chiếu từ
  `backend/data/concepts/catalog.json` và tương ứng 15 bài học AICB Phase 1.
- Hai người gán nhãn độc lập; lệch thì bàn lại rồi ghi lý do vào `note`.

## 3. Chạy

```powershell
# Thử đường ống, không tốn tiền (AI giả không nhìn ảnh — số liệu KHÔNG có ý nghĩa chất lượng)
python eval/vision/make_samples.py
python eval/vision/run_eval.py --labels eval/vision/labels.synthetic.csv --fixtures eval/vision/fixtures.json --provider fake

# Chạy thật với OpenAI (cần OPENAI_API_KEY trong backend/.env; ~40 ảnh tốn khoảng vài chục cent)
python eval/vision/run_eval.py --labels eval/vision/labels.csv --fixtures eval/vision/fixtures.aicb-phase1.json --models gpt-4.1-mini
# So sánh hai model
python eval/vision/run_eval.py --labels eval/vision/labels.csv --fixtures eval/vision/fixtures.aicb-phase1.json --models gpt-4.1-mini,gpt-5-mini
```

Kết quả ở `eval/vision/results/<thời gian>/` (`report.md`, `summary.json`, `predictions_<model>.csv`; thư mục này
không commit). Chép bảng chính vào `docs/evaluation.md` mục B5: độ đúng phát hiện ảnh học, concept top-1,
precision khi tự đánh dấu xong, tỉ lệ hỏi lại, recall ảnh không học, latency, USD/ảnh, bảng quét ngưỡng.
