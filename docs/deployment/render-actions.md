# Deploy integration/peerbridge bằng GitHub Actions

Không cần cài Render GitHub App vào organization. Workflow `Render integration` chạy
trên runner Linux `team-5`, kiểm thử backend/frontend trong container rồi xuất Docker image Linux amd64
lên GHCR. Package mới mặc định private; giữ nguyên private. Runner `team-5-Bancainh`
cần online và chạy được Docker. GitHub-hosted runner hiện bị organization chặn vì billing.
Nếu BTC chặn tạo package, BTC cần cho phép package private cho repository.

## Lần triển khai đầu

1. Push workflow lên `integration/peerbridge`, đợi job xuất API image thành công.
2. Render → New → Web Service → Existing Image. Image:
   `ghcr.io/ai20k-build-phase-cohort-4/p-005-integration-api:integration`.
3. Tạo GitHub PAT **classic**, chỉ scope `read:packages`, hạn ngắn phù hợp.
   Nếu organization dùng SSO, authorize token cho organization. Nhập token trực tiếp
   vào Render Registry Credential, username là tài khoản có quyền đọc package.
   Không gửi token qua chat hoặc commit vào Git.
4. Tạo API service, region Singapore, chọn Free nếu chỉ chạy demo; health check `/health`.
   Environment: `APP_ENV=production`, `JWT_SECRET` là chuỗi ngẫu nhiên riêng cho ứng dụng,
   `DATABASE_PATH=./data/peerbridge.db`, `UPLOAD_DIRECTORY=./data/uploads`.
   Cấu hình `OPENAI_API_KEY` nếu dùng AI thật; không đưa khóa vào image.
   Ban đầu `LOOP_INTERVAL_MINUTES=0` để tránh chạy AI định kỳ khi chưa cấu hình xong.
5. GitHub repository → Settings → Secrets and variables → Actions → Variables:
   `RENDER_API_URL` = HTTPS URL API, không dấu `/` cuối.
6. Chạy lại workflow **trên integration/peerbridge** để xuất web image.
   Render tạo Existing Image service thứ hai:
   `ghcr.io/ai20k-build-phase-cohort-4/p-005-integration-web:integration`.
   Dùng credential đọc package phía trên, health check `/deployment.json`.
7. Đặt API `CORS_ORIGINS` = HTTPS URL frontend, không dấu `/` cuối.
   Đặt GitHub variable `RENDER_WEB_URL` = URL frontend.
8. Mỗi Render service → Settings → Deploy Hook. Lưu vào GitHub repository **secrets**:
   `RENDER_API_DEPLOY_HOOK`, `RENDER_WEB_DEPLOY_HOOK` tương ứng.
   Hook là secret: không chụp giá trị, không đưa vào báo cáo hoặc Git.
9. Push mới lên integration sẽ tự build/publish rồi gọi hook với image digest chính xác.
   Workflow chỉ báo deploy thành công khi endpoint trả revision bằng commit SHA mới.

GitHub Actions success ở bước bootstrap chỉ chứng minh image đã xuất, chưa chứng minh
website live. Khi cần chạy lại workflow không thấy nút Run workflow (file không ở main),
mở run vừa chạy và dùng Re-run all jobs; hoặc push commit integration mới.

## Dữ liệu và kiểm tra

Free Render không có persistent disk; SQLite và upload sẽ mất khi container thay thế.
Cấu hình các biến `LITESTREAM_*` trong `backend/litestream.yml` để sao lưu/khôi phục DB,
hoặc dùng persistent disk trả phí sau khi chủ tài khoản chọn gói. Mặc định ảnh check-in nằm
trong database nên được Litestream sao lưu; avatar và ảnh check-in nếu dùng
`VISION_STORAGE_BACKEND=disk` là file riêng, không được Litestream sao lưu.
Không coi bản Free chưa cấu hình lưu trữ là production bền vững.

Kiểm tra API `/health`, web `/deployment.json` cùng revision; mở frontend, đăng ký tài khoản
thử, đăng nhập, xem hồ sơ/matching. Xem Render Events/Logs nếu GitHub chờ quá 15 phút.
Không dùng deploy hook của Git-backed service để vượt hạn chế đọc private repository:
hai service trong hướng dẫn phải là **Existing Image**.

Tài liệu: [Render image services](https://render.com/docs/deploying-an-image),
[Render deploy hooks](https://render.com/docs/deploy-hooks),
[GHCR authentication](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry).
