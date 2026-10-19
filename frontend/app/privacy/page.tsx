import type { Metadata } from "next";
import Link from "next/link";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Quyền riêng tư — PeerBridge",
  description: "PeerBridge thu thập dữ liệu gì, lưu ở đâu, giữ bao lâu và gửi gì cho OpenAI.",
};

// Chỉ mô tả cơ chế đang có trong code (backend/app). Việc chưa làm được ghi rõ ở mục "Chưa có".
export default function PrivacyPage() {
  return <main className={styles.page}>
    <nav className={styles.top}><Link href="/">← Về PeerBridge</Link></nav>
    <article className={styles.doc}>
      <h1>Quyền riêng tư</h1>
      <p className={styles.lead}>PeerBridge là dự án học tập của nhóm P-005 (AI20K). Trang này nói thật những gì hệ thống đang làm với dữ liệu của bạn. Cập nhật 14/10/2026.</p>

      <h2>1. Dữ liệu chúng tôi thu thập</h2>
      <table>
        <thead><tr><th>Loại</th><th>Cụ thể</th><th>Dùng để</th></tr></thead>
        <tbody>
          <tr><td>Tài khoản</td><td>Email, mật khẩu (chỉ lưu dạng băm PBKDF2), tên hiển thị, tuổi, thành phố, thời điểm bạn đồng ý với trang này</td><td>Đăng nhập, hiển thị cho bạn cặp</td></tr>
          <tr><td>Hồ sơ học</td><td>Trường, ngành, môn, mục tiêu, chủ đề cần hỗ trợ / có thể hỗ trợ, ảnh đại diện</td><td>Gợi ý bạn học</td></tr>
          <tr><td>Lịch và mục tiêu</td><td>Giờ rảnh, mục tiêu tuần, kế hoạch, cam kết, ghi chú kế hoạch</td><td>Lập và điều chỉnh kế hoạch</td></tr>
          <tr><td>Ảnh check-in</td><td>Ảnh bạn tải lên, ghi chú kèm ảnh, mô tả và concept AI nhận ra, cảm xúc/bình luận của bạn cặp</td><td>Ghi nhận buổi học, báo cho bạn cặp</td></tr>
          <tr><td>Phòng học và chat</td><td>Tin nhắn, kết quả kiểm duyệt (cho phép / cảnh báo / chặn / chuyển người xem), tóm tắt và điểm phiên</td><td>Kiểm duyệt, gợi ý gợi mở, Admin xem tin bị cảnh báo</td></tr>
          <tr><td>Tiến độ và thông báo</td><td>Số đo nhịp học, quyết định của coach, thông báo trong app</td><td>Nhắc nhở và tổng quan</td></tr>
          <tr><td>Chi phí AI</td><td>Tên tính năng, model, số token, chi phí (không lưu nội dung)</td><td>Giữ trần chi phí 2 USD/ngày</td></tr>
        </tbody>
      </table>
      <p>Trình duyệt lưu mã đăng nhập (JWT) trong <code>localStorage</code> của máy bạn; bấm Đăng xuất để xoá.</p>

      <h2>2. Dữ liệu lưu ở đâu</h2>
      <ul>
        <li>Mọi dữ liệu ở mục 1, kể cả ảnh check-in, nằm trong một cơ sở dữ liệu SQLite trên máy chủ Render (khu vực Singapore). Giao diện web chạy trên Vercel và không lưu dữ liệu của bạn.</li>
        <li>Ảnh check-in được xoay đúng chiều, <b>xoá toàn bộ metadata</b> (vị trí GPS, thiết bị…) và thu nhỏ trước khi lưu. Đường dẫn xem ảnh có chữ ký và hết hạn sau khoảng 1–2 giờ.</li>
        <li>Hệ thống có sẵn cơ chế sao lưu liên tục lên Supabase Storage (Litestream) nhưng <b>hiện chưa bật</b>.</li>
      </ul>

      <h2>3. Dữ liệu gửi cho OpenAI</h2>
      <p>Các tính năng AI gọi API của OpenAI (model mặc định <code>gpt-4.1-mini</code>). Chỉ phần dữ liệu cần cho từng tính năng được gửi:</p>
      <ul>
        <li><b>Check-in:</b> ảnh đã xoá metadata, ghi chú của bạn, tên hiển thị và danh sách concept trong kế hoạch của bạn.</li>
        <li><b>Kế hoạch và coach:</b> mục tiêu của hai bạn, danh sách việc/concept cần học (giờ rảnh không gửi đi, lịch do máy chủ tự xếp).</li>
        <li><b>Gợi ý bạn học:</b> mục tiêu, ngành, giới thiệu, chủ đề cần/có thể hỗ trợ của bạn và ứng viên (không gửi email, tuổi).</li>
        <li><b>Phòng học:</b> tin nhắn bạn gửi (tin xã giao ngắn có thể chỉ được kiểm bằng luật, không gửi đi) và đoạn slide bài học liên quan.</li>
        <li><b>Chấm phiên:</b> bản ghi các tin đã phát trong phiên.</li>
      </ul>
      <p>OpenAI xử lý dữ liệu theo <a href="https://openai.com/policies/" target="_blank" rel="noreferrer">chính sách cho API của OpenAI</a>. Khi hết trần chi phí ngày hoặc không có khoá API, hệ thống không gọi OpenAI mà dùng luật/mẫu có sẵn.</p>
      <p>Nếu nhóm bật công cụ theo dõi LangSmith cho phần kế hoạch (mặc định tắt khi không có khoá), dấu vết lập kế hoạch cũng được gửi tới LangSmith.</p>

      <h2>4. Ai xem được dữ liệu của bạn</h2>
      <ul>
        <li><b>Bạn cặp:</b> tên, hồ sơ học, kế hoạch, check-in (ảnh, mô tả) và tiến độ của bạn trong cặp.</li>
        <li><b>Admin/giảng viên:</b> các tin nhắn bị AI cảnh báo hoặc chuyển lên, số liệu tổng hợp. Admin là tài khoản có email trong danh sách cấu hình của máy chủ.</li>
        <li><b>Nhóm phát triển:</b> có quyền truy cập máy chủ và cơ sở dữ liệu để vận hành và sửa lỗi.</li>
      </ul>

      <h2>5. Giữ bao lâu và xoá thế nào</h2>
      <ul>
        <li>Hiện <b>không có thời hạn tự xoá</b>. Trên thực tế, máy chủ gói miễn phí mất toàn bộ dữ liệu mỗi lần khởi động lại cho tới khi sao lưu được bật.</li>
        <li>Nhóm vận hành có công cụ xoá nội dung chữ của tin nhắn phòng học cũ hơn một mốc thời gian (giữ lại quyết định kiểm duyệt, bỏ nội dung).</li>
        <li><b>Chưa có nút tự xoá tài khoản.</b> Muốn xoá tài khoản và toàn bộ dữ liệu (kể cả ảnh), hãy liên hệ nhóm P-005 qua kênh lớp AI20K; nhóm xoá thủ công trong cơ sở dữ liệu.</li>
      </ul>

      <h2>6. Chưa có (kế hoạch)</h2>
      <ul>
        <li>Nút tự xoá tài khoản và tự tải dữ liệu về.</li>
        <li>Thời hạn lưu tự động cho ảnh check-in và tin nhắn.</li>
        <li>Bật sao lưu có mã hoá và ghi rõ nơi lưu bản sao.</li>
        <li>Form đồng ý riêng khi tham gia thực nghiệm với người dùng thật.</li>
      </ul>

      <p className={styles.note}>Câu hỏi về quyền riêng tư: liên hệ nhóm P-005 trong chương trình AI20K.</p>
    </article>
  </main>;
}
