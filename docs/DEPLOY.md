# Đưa PeerBridge lên mạng

Backend (FastAPI trong `backend/`) chạy trên **Render**, giao diện (Next.js trong `frontend/`) chạy trên **Vercel**.
<<<<<<< HEAD
Hai dịch vụ lấy code từ repo riêng `tubepvhat1604-bot/peerbridge-deploy`, nhánh `feat/ai-vision`.
Workflow `Deploy web` của P-005 đồng bộ nhánh `integration/peerbridge` sang `main` và `feat/ai-vision`
của repo deploy. Gộp PR vào `main` của P-005 không tự cập nhật web đang chạy.
Đây là đường triển khai web demo qua Git; đường triển khai Render bằng GHCR image là quy trình riêng trong
[hướng dẫn Render image](deployment/render-actions.md). Hai workflow không tự thay thế hoặc kích hoạt lẫn nhau.

Repo P-005 còn có workflow **Render integration**: xuất image API và web lên GHCR rồi triển khai
hai dịch vụ Render dạng Existing Image. Đây là một đường triển khai **riêng**; nó không cập nhật
web demo Render + Vercel ở trên. Xem [hướng dẫn Render image](deployment/render-actions.md) nếu vận hành đường này.
=======
Cả hai lấy code từ nhánh `feat/ai-vision` (có đủ Data 1, Data 2, AI Vision). Khi nhánh này được gộp lên main thì đổi nhánh deploy sang main.
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

## 1. Backend trên Render (làm trước)

1. Vào https://render.com, bấm **Sign in** → **GitHub**.
<<<<<<< HEAD
2. Bấm **New** → **Blueprint**. Chọn **Connect GitHub**, cho Render quyền đọc repo `tubepvhat1604-bot/peerbridge-deploy`.
3. Chọn repo **peerbridge-deploy**, nhánh **feat/ai-vision**. Render đọc file `render.yaml` và hiện dịch vụ `peerbridge-api`.
4. Điền các biến cần dùng:
   - `OPENAI_API_KEY`: key OpenAI của nhóm.
   - `CORS_ORIGINS`: tạm điền `http://localhost:3000`, sửa lại ở bước 3.
   - Các biến `LITESTREAM_*`: xem phần sao lưu bên dưới; chỉ cấu hình khi đã tạo kho sao lưu.
=======
2. Bấm **New** → **Blueprint**. Chọn **Connect GitHub**, cho Render quyền đọc repo `AI20K-Build-Phase-Cohort-4/P-005`.
   - Nếu không thấy repo: repo thuộc tổ chức, cần chủ tổ chức (owner) bấm duyệt cho ứng dụng Render.
3. Chọn repo **P-005**, nhánh **feat/ai-vision**. Render đọc file `render.yaml` và hiện dịch vụ `peerbridge-api`.
4. Điền 2 biến được hỏi:
   - `OPENAI_API_KEY`: key OpenAI của nhóm.
   - `CORS_ORIGINS`: tạm điền `http://localhost:3000`, sửa lại ở bước 3.
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
5. Bấm **Apply** (đang dùng gói **Free**, không cần thẻ).
6. Chờ build xong (khoảng 5 phút). Mở `https://<tên dịch vụ>.onrender.com/health`, thấy `"status":"ok"` là chạy.

**Gói Free không giữ dữ liệu:** mỗi lần server ngủ (15 phút không ai dùng) hay deploy lại là mất hết tài khoản, plan,
check-in. Lần đầu mở sau khi ngủ phải chờ 30–60 giây. Trước khi demo, mở link `/health` một lần cho server thức.
<<<<<<< HEAD
Muốn giữ dữ liệu (pilot người dùng thật): trong `render.yaml` đổi `plan: free` thành gói hỗ trợ persistent disk, thêm khối
`disk` (`mountPath: /var/data`) và đặt `DATABASE_PATH=/var/data/peerbridge.db`, `UPLOAD_DIRECTORY=/var/data/uploads`.
Nếu muốn lưu ảnh check-in thành file trên disk, đặt thêm `VISION_STORAGE_BACKEND=disk` và
`VISION_STORAGE_DIR=/var/data/checkin_images`.
=======
Muốn giữ dữ liệu (pilot người dùng thật): trong `render.yaml` đổi `plan: free` thành `plan: starter`, thêm khối
`disk` (`mountPath: /var/data`) và đặt `DATABASE_PATH=/var/data/peerbridge.db`, `UPLOAD_DIRECTORY=/var/data/uploads`,
`VISION_STORAGE_DIR=/var/data/checkin_images` (khoảng 7,25 USD/tháng).
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

## 2. Giao diện trên Vercel

1. Vào https://vercel.com, đăng nhập bằng **GitHub**.
<<<<<<< HEAD
2. **Add New** → **Project** → **Import** repo `peerbridge-deploy`.
=======
2. **Add New** → **Project** → **Import** repo `P-005`.
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
3. **Root Directory**: chọn `frontend`. Framework tự nhận là Next.js.
4. **Environment Variables**: thêm `NEXT_PUBLIC_API_URL` = link Render ở bước 1 (ví dụ `https://peerbridge-api.onrender.com`, không có `/` cuối).
5. Bấm **Deploy**. Xong vào **Settings** → **Git** → **Production Branch** đổi thành `feat/ai-vision`, rồi **Redeploy**.
6. Vercel cho link dạng `https://p-005-xxx.vercel.app`.

## 3. Nối hai bên

<<<<<<< HEAD
### Email quên mật khẩu

Trong Render → `peerbridge-api` → **Environment**, đặt `PUBLIC_WEB_URL` bằng URL Vercel chính thức (HTTPS, không có dấu `/` cuối). Điền `SMTP_HOST`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL` theo nhà cung cấp email; dùng `SMTP_PORT=2525` với dịch vụ SMTP hỗ trợ STARTTLS trên cổng này. Địa chỉ `SMTP_FROM_EMAIL` cần được xác minh với nhà cung cấp. Không lưu mật khẩu SMTP trong Git. Nếu chưa cấu hình đủ, nút quên mật khẩu sẽ báo dịch vụ email chưa sẵn sàng.

Liên kết đặt lại có hiệu lực 30 phút và chỉ dùng một lần. Dữ liệu tài khoản và mã đặt lại nằm trong SQLite; để không mất khi Render Free khởi động lại, bật sao lưu Litestream ở phần dưới.

=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
Trên Render: dịch vụ `peerbridge-api` → **Environment** → sửa `CORS_ORIGINS` thành link Vercel
(ví dụ `https://p-005-xxx.vercel.app`, không có `/` cuối) → **Save** (Render tự khởi động lại).

Mở link Vercel, đăng ký tài khoản, thử ghép cặp, lập plan, check-in.

## Biến môi trường backend (đã đặt sẵn trong `render.yaml`)

| Biến | Giá trị | Ý nghĩa |
| --- | --- | --- |
| `APP_ENV` | `production` | Tắt trang demo `/checkin-demo` |
| `JWT_SECRET` | Render tự tạo | Khóa ký token đăng nhập |
| `VISION_LLM_PROVIDER` | `openai` | AI Vision đọc ảnh thật |
<<<<<<< HEAD
| `LLM_PROVIDER`, `RETRIEVER_PROVIDER` | `openai`, `local` | Moderator dùng OpenAI và BM25 local trên slide AICB |
| `PLAN_LLM_PROVIDER` | `openai_compatible` | Plan có thể gọi provider AI; kiểm tra khóa, ngân sách và log trước khi dùng thật |
=======
| `LLM_PROVIDER`, `RETRIEVER_PROVIDER` | `openai`, `fake` | Moderator dùng OpenAI, chưa có Qdrant trên server |
| `PLAN_LLM_PROVIDER` | `template` | Plan dùng mẫu có sẵn, không tốn token |
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

Server cài `backend/requirements-deploy.txt` (bỏ `sentence-transformers`/torch vì quá nặng và chỉ cần khi chạy Qdrant).

## Giữ dữ liệu trên gói Free: sao lưu liên tục lên Supabase

<<<<<<< HEAD
Server (`backend/start.sh`) dùng Litestream để sao lưu database SQLite lên Supabase Storage
mỗi giây, và tự lấy lại khi server khởi động lại. Mặc định ảnh check-in nằm trong database
(`VISION_STORAGE_BACKEND=db`) nên được sao lưu cùng database. Avatar và ảnh check-in khi dùng
`VISION_STORAGE_BACKEND=disk` là file riêng, cần persistent disk hoặc cơ chế sao lưu file riêng. Bật sao lưu database như sau:
=======
Server (`backend/start.sh`) dùng Litestream để sao lưu database SQLite (gồm cả ảnh check-in) lên Supabase Storage
mỗi giây, và tự lấy lại khi server khởi động lại. Bật như sau:
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

1. Supabase: tạo project (Region Singapore) → **Storage** → bucket `peerbridge-backup` (không Public).
2. **Project Settings → Storage → S3 Connection**: bật, tạo **access key**.
3. Render → `peerbridge-api` → **Environment**, điền:
   - `LITESTREAM_BUCKET` = `peerbridge-backup`
   - `LITESTREAM_ENDPOINT` = Endpoint S3 của Supabase (dạng `https://<mã>.supabase.co/storage/v1/s3`)
   - `LITESTREAM_REGION` = Region trong trang S3 Connection
   - `LITESTREAM_ACCESS_KEY_ID`, `LITESTREAM_SECRET_ACCESS_KEY` = key vừa tạo
4. **Save, rebuild, and deploy**. Log khởi động có dòng `[start] Đang sao lưu liên tục lên peerbridge-backup.` là đã bật.

Chưa điền các biến này thì app vẫn chạy, nhưng dữ liệu mất khi server ngủ hoặc deploy lại.

## Tự cập nhật web bằng GitHub Actions

Tổ chức GitHub của BTC không cho cài app Render/Vercel vào P-005, nên Render và Vercel đọc code từ repo riêng
`tubepvhat1604-bot/peerbridge-deploy`. File `.github/workflows/deploy.yml` tự làm việc đồng bộ: mỗi khi có code mới
<<<<<<< HEAD
trên `integration/peerbridge`, robot kiểm tra backend và build frontend, qua thì đẩy sang repo riêng và web tự cập nhật sau vài phút.
Có thể bấm chạy tay ở tab **Actions → Deploy web → Run workflow**, chọn nhánh `integration/peerbridge`.
Workflow sẽ bỏ qua lượt chạy tay từ nhánh khác để tránh ghi đè bản deploy bằng code ngoài nhánh tích hợp.
=======
trên `integration/peerbridge`, robot chạy test backend, qua thì đẩy sang repo riêng và web tự cập nhật sau vài phút.
Có thể bấm chạy tay ở tab **Actions → Deploy web → Run workflow**.
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

Cài một lần (chủ repo deploy làm):
1. GitHub → ảnh đại diện → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
   Repository access: **Only select repositories → peerbridge-deploy**. Permissions → Repository → **Contents: Read and write**.
<<<<<<< HEAD
   Vì workflow đẩy toàn bộ repository, nếu commit có thay đổi `.github/workflows/` thì token cũng cần quyền **Workflows: Read and write** trên repo deploy.
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
   Chọn hạn dùng (ví dụ 90 ngày), bấm Generate và copy token (không gửi vào chat).
2. Repo P-005 → **Settings → Secrets and variables → Actions → New repository secret**: Name `DEPLOY_TOKEN`, Value là token vừa copy.
   Không có quyền Settings thì nhờ trưởng nhóm thêm.

Test hỏng thì web không bị cập nhật. Mỗi lần cập nhật, server khởi động lại: chưa bật sao lưu Supabase thì mất dữ liệu người dùng.

## Tên miền riêng (tùy chọn)

Mua tên miền (ví dụ ở tenten.vn, Namecheap), rồi trong Vercel → **Settings** → **Domains** thêm tên miền và làm theo
hướng dẫn trỏ DNS. Nhớ thêm tên miền đó vào `CORS_ORIGINS` trên Render.
