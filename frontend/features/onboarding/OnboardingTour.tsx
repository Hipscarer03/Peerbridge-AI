"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import styles from "./OnboardingTour.module.css";

type Scene = "profile" | "matching" | "plan" | "room";
type TourStep = {
  scene: Scene;
  target?: string;
  title: string;
  description: string;
  ai: string;
};

const steps: TourStep[] = [
  { scene: "profile", title: "Chào bạn, mình là Cú Bridge!", description: "Mình sẽ dẫn bạn đi hết một vòng: điền hồ sơ, tìm bạn, lập kế hoạch rồi học cùng. Bạn chỉ cần bấm “Tiếp”, không phải nhập gì cả.", ai: "Mình sẽ chỉ rõ AI hỗ trợ bạn ở từng chặng." },
  { scene: "profile", target: "goal", title: "Bước 1 · Nói mục tiêu của bạn", description: "Bạn viết theo mẫu “Muốn học [chủ đề] trong [thời gian]”. Hồ sơ ở đây đã điền sẵn để bạn xem thử.", ai: "AI tách chủ đề “Product” và thời hạn “5 tháng” làm căn cứ ghép cặp." },
  { scene: "profile", target: "support", title: "Bước 2 · Chia sẻ cách bạn học", description: "Mục tiêu ở trên cho biết phần bạn cần học. Bên dưới, hãy ghi điều bạn có thể hỗ trợ và chọn một cách học ở mỗi trong 5 nhóm.", ai: "AI kết hợp chủ đề cần học, thế mạnh và cả 5 lựa chọn phong cách để tìm người hợp cách học." },
  { scene: "matching", target: "score", title: "Bước 3 · Xem độ phù hợp", description: "Nhãn cho biết kiểu ghép cặp. Điểm giúp bạn so sánh các hồ sơ trong cùng kiểu; điểm thấp vẫn có thể là gợi ý đáng thử.", ai: "AI xếp hạng từ mục tiêu, chủ đề hỗ trợ, lịch rảnh và phong cách học." },
  { scene: "matching", target: "types", title: "Bước 4 · Hiểu ba kiểu ghép cặp", description: "Dấu ? cạnh tiêu đề Tìm bạn học mở phần giải thích. Bù trừ ưu tiên hỗ trợ qua lại; Cùng tiến dành cho mục tiêu chung; Kỷ luật giúp hai bạn giữ nhịp và theo thời hạn.", ai: "AI phân loại trước, rồi xếp điểm trong từng loại; bạn vẫn tự chọn người muốn kết nối." },
  { scene: "matching", target: "invite", title: "Bước 5 · Mời bạn học cùng", description: "Khi thấy phù hợp, bấm “Cùng học nhé”. Người kia sẽ nhận lời mời và tự quyết định có kết nối không.", ai: "AI chỉ gợi ý; quyết định kết nối luôn thuộc về hai bạn." },
  { scene: "plan", target: "plan-form", title: "Bước 6 · Bắt đầu kế hoạch", description: "Sau khi kết nối, chọn mục tiêu và quỹ thời gian. Ví dụ này theo mục tiêu học Product trong 5 tháng.", ai: "AI dựa vào mục tiêu để đề xuất lộ trình vừa sức." },
  { scene: "plan", target: "lessons", title: "Bước 7 · Xem các buổi học nhỏ", description: "Kế hoạch được chia thành những buổi có việc cụ thể, dễ bắt đầu và dễ theo dõi tiến độ.", ai: "AI chia mục tiêu lớn thành hoạt động theo từng chặng; bạn có thể điều chỉnh." },
  { scene: "plan", target: "calendar", title: "Bước 8 · Chọn lịch chung", description: "Ô xanh lá là ngày hai bạn cùng rảnh. Hãy chốt thời gian để buổi học hiện trong lịch của cả hai.", ai: "AI gợi ý lịch dựa trên quỹ thời gian và nhịp học của hai bạn." },
  { scene: "room", target: "progress", title: "Bước 9 · Đi theo các chặng", description: "Trong phòng học, thanh tiến độ cho biết đang ở hoạt động nào và còn bao lâu.", ai: "AI điều phối nhịp buổi học, nhắc chuyển chặng đúng lúc." },
  { scene: "room", target: "coach", title: "Bước 10 · Trao đổi với Cú Bridge", description: "AI hỏi bạn đã làm đến đâu, đang vướng gì và cảm thấy thế nào. Khi kế hoạch quá nặng, AI có thể đề xuất bước nhỏ hoặc đổi hoạt động.", ai: "AI xét tiến độ, cảm xúc và hoàn cảnh; hai bạn xác nhận trước khi đổi kế hoạch." },
  { scene: "room", title: "Bạn đã sẵn sàng học cùng!", description: "Đây là phần xem trước. Bây giờ hãy điền hồ sơ thật để tìm người đồng hành. Bạn có thể mở lại hướng dẫn bất cứ lúc nào ở góc dưới màn hình.", ai: "Cú Bridge sẽ tiếp tục đồng hành từ ghép cặp đến theo dõi tiến độ." },
];

const styleChoices = [
  { label: "Vai trò khi học", options: ["Thích giải thích", "Thích nghe", "Cân bằng"], selected: "Thích nghe" },
  { label: "Nhịp học", options: ["Học dồn theo đợt", "Học đều mỗi ngày"], selected: "Học đều mỗi ngày" },
  { label: "Phong cách phản hồi", options: ["Thích được hỏi lại, tranh luận", "Thích tự làm rồi mới hỏi", "Linh hoạt"], selected: "Thích tự làm rồi mới hỏi" },
  { label: "Môi trường học", options: ["Im lặng, tập trung", "Nói chuyện, trao đổi nhiều"], selected: "Im lặng, tập trung" },
  { label: "Khi gặp khó", options: ["Tự research trước", "Hỏi ngay", "Tùy tình huống"], selected: "Tự research trước" },
];

type Box = { left: number; top: number; width: number; height: number };

function Owl() {
  return <svg className={styles.owl} viewBox="0 0 80 82" aria-hidden="true" focusable="false">
    <path d="M18 21 22 3 35 14h10L58 3l4 18" fill="#694536"/>
    <ellipse cx="40" cy="43" rx="29" ry="36" fill="#f5a46d"/>
    <path d="M13 46c-8 2-9 18 3 22M67 46c8 2 9 18-3 22" fill="#ea8d61"/>
    <ellipse cx="40" cy="51" rx="20" ry="27" fill="#ffe2be"/>
    <path d="M14 24c7-14 20-10 26-1 6-9 19-13 26 1-3 18-13 23-26 15-13 8-23 3-26-15Z" fill="#fff9ed"/>
    <circle cx="29" cy="27" r="9" fill="#273c67"/><circle cx="51" cy="27" r="9" fill="#273c67"/>
    <circle cx="31" cy="24" r="3" fill="white"/><circle cx="53" cy="24" r="3" fill="white"/>
    <path d="m35 39 5 8 5-8Z" fill="#e88439"/>
    <path d="M30 77v4m20-4v4" stroke="#9c6244" strokeWidth="3" strokeLinecap="round"/>
  </svg>;
}

function ProfileScene() {
  return <div className={styles.sceneContent}>
    <div className={styles.sceneHeading}><span>Hồ sơ của tôi</span><h2>Mục tiêu học tập</h2><p>Mục tiêu và cách học giúp tìm người đồng hành phù hợp.</p></div>
    <section className={`${styles.demoPanel} ${styles.profilePanel}`}>
      <div data-tour-target="goal" className={styles.focusGroup}><b>Mục tiêu học tập của tôi</b><div className={styles.demoInput}>Muốn học Product trong 5 tháng</div><small>Mẫu: Muốn học [chủ đề cần hỗ trợ] trong [thời gian].</small></div>
      <div data-tour-target="support" className={styles.focusGroup}>
        <div className={styles.demoField}><b>Tôi có thể hỗ trợ</b><span>Phân tích nghiệp vụ</span></div>
        <div className={styles.demoField}><b>Giới thiệu</b><span>Cần một người tư duy cởi mở để chia sẻ với mình.</span></div>
        <div data-tour-focus-mobile className={styles.stylePanel}><b>Phong cách học</b><small>Chọn một phương án mỗi dòng để tìm bạn hợp cách học.</small>
          <div className={styles.styleGrid}>{styleChoices.map(group => <div key={group.label}><b>{group.label}</b><div className={styles.styleOptions}>{group.options.map(option => <span key={option} className={option === group.selected ? styles.styleSelected : ""}>{option}</span>)}</div></div>)}</div>
        </div>
      </div>
    </section>
  </div>;
}

function MatchingScene({ openTypes }: { openTypes: boolean }) {
  return <div className={styles.sceneContent}>
    <div className={`${styles.sceneHeading} ${styles.matchHeading}`}><div className={styles.matchTitle}><h2>Tìm bạn học</h2><div data-tour-target="types" className={styles.helpArea}><span className={styles.helpCircle}>?</span>{openTypes && <div data-tour-popup className={`${styles.typesPopup} ${styles.typesOpen}`}><b>Ba loại ghép cặp</b><p>🌟 <strong>Bù trừ:</strong> Bạn biết phần người kia cần và ngược lại. Hai bạn có thể hỗ trợ nhau theo cả hai hướng.</p><p>🤝 <strong>Cùng tiến:</strong> Cùng học một chủ đề, luyện tập và trao đổi trên cùng mục tiêu.</p><p>⚡ <strong>Kỷ luật:</strong> Hợp nhịp học và thời hạn để nhắc lịch, theo dõi tiến độ.</p><small>Ưu tiên Bù trừ → Cùng tiến → Kỷ luật; điểm cao hơn được xếp trước trong mỗi loại.</small></div>}</div></div><div className={styles.searchMock}><span>Tìm bằng email...</span><b>Tìm</b></div></div>
    <p className={styles.matchCount}>Đang xem 1–3 trên 8 gợi ý</p>
    <article className={styles.matchCard}>
      <div className={styles.person}><div className={styles.personAvatar}>K</div><div><h3>Khôi</h3><p>Hệ thống thông tin quản lý · ĐH Kinh tế</p></div></div>
      <div data-tour-target="score" className={styles.matchScore}><span>🌟 Bù trừ</span><strong>Phù hợp nhất · 88/100 điểm</strong><i>?</i></div>
      <div className={styles.goalBox}><small>MỤC TIÊU HỌC</small><b>Muốn học Product trong 5 tháng</b></div>
      <div className={styles.demoTwo}><div className={styles.demoField}><b>Cần hỗ trợ</b><span>Product</span></div><div className={styles.demoField}><b>Có thể hỗ trợ</b><span>Phân tích nghiệp vụ</span></div></div>
      <div data-tour-target="invite" className={styles.demoInvite}>Cùng học nhé →</div>
    </article>
  </div>;
}

function PlanScene() {
  return <div className={styles.sceneContent}>
    <div className={styles.sceneHeading}><span>Kế hoạch</span><h2>Từ mục tiêu đến từng buổi học</h2><p>Hai bạn cùng nhìn thấy kế hoạch và lịch chung.</p></div>
    <div className={styles.planGrid}>
      <section data-tour-target="plan-form" className={styles.demoPanel}><h3>Tạo kế hoạch</h3><div className={styles.demoField}><b>Mục tiêu</b><span>Học Product trong 5 tháng</span></div><div className={styles.demoTwo}><div className={styles.demoField}><b>Thời lượng</b><span>5 tháng</span></div><div className={styles.demoField}><b>Nhịp học</b><span>2 buổi / tuần</span></div></div><div className={styles.demoAction}>Tạo kế hoạch với AI</div></section>
      <section data-tour-target="lessons" className={styles.demoPanel}><h3>Các buổi học AI chia nhỏ</h3><ol className={styles.lessons}><li><b>1</b><span>Tìm hiểu vai trò Product</span><small>30 phút</small></li><li><b>2</b><span>Phỏng vấn người dùng</span><small>45 phút</small></li><li><b>3</b><span>Viết vấn đề cần giải quyết</span><small>40 phút</small></li></ol></section>
      <section data-tour-target="calendar" className={`${styles.demoPanel} ${styles.calendarPanel}`}><h3>Lịch chung của Minh Anh và Khôi</h3><div className={styles.calendarWeek}>{["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(day => <b key={day}>{day}</b>)}{["21", "22", "23", "24", "25", "26", "27"].map((day, index) => <span className={index === 1 || index === 4 ? styles.freeDay : ""} key={day}>{day}</span>)}</div><small>Ô xanh lá: hai bạn cùng rảnh</small></section>
    </div>
  </div>;
}

function RoomScene() {
  return <div className={styles.sceneContent}>
    <div className={styles.sceneHeading}><span>Phòng học cùng</span><h2>Buổi học Product · Minh Anh & Khôi</h2><p>Hoạt động, tiến độ và lời nhắc ở cùng một nơi.</p></div>
    <section className={styles.roomPanel}>
      <div data-tour-target="progress" className={styles.progressPanel}><div><b>Chặng 2/4 · Phỏng vấn người dùng</b><span>20 phút còn lại</span></div><div className={styles.progressTrack}><i/></div><div className={styles.progressSteps}><span>Khởi động ✓</span><strong>Thảo luận</strong><span>Thực hành</span><span>Tổng kết</span></div></div>
      <div className={styles.chatLine}><b>Minh Anh</b><p>Mình đã ghi được ba vấn đề người dùng hay gặp.</p></div>
      <div data-tour-target="coach" className={styles.coachPanel}><div className={styles.coachAvatar}><Owl/></div><div><b>Cú Bridge · AI điều phối</b><p>Hai bạn đã đi được nửa chặng. Có phần nào đang khó hoặc khiến bạn thấy quá tải không? Mình có thể đề xuất chia nhỏ bài thực hành, rồi hai bạn quyết định có đổi hoạt động nhé.</p><small>Đề xuất: thử một ví dụ ngắn trước khi viết tiếp.</small></div></div>
    </section>
  </div>;
}

export default function OnboardingTour({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const [cardSize, setCardSize] = useState({ width: 520, height: 250 });
  const root = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const step = steps[index];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const background = [...document.querySelectorAll<HTMLElement>(".app > .appbar, .app > main, .app > .tabbar")];
    const previousInert = background.map(element => element.inert);
    background.forEach(element => { element.inert = true; });
    return () => { document.body.style.overflow = previousOverflow; background.forEach((element, index) => { element.inert = previousInert[index]; }); };
  }, []);

  useEffect(() => {
    const measure = () => {
      const element = step.target ? root.current?.querySelector<HTMLElement>(`[data-tour-target="${step.target}"]`) : null;
      if (!element) { setBox(null); return; }
      const focusElement = window.innerWidth <= 680 ? element.querySelector<HTMLElement>("[data-tour-focus-mobile]") ?? element : element;
      const rect = focusElement.getBoundingClientRect();
      const popup = element.querySelector<HTMLElement>("[data-tour-popup]")?.getBoundingClientRect();
      const left = Math.min(rect.left, popup?.left ?? rect.left);
      const top = Math.min(rect.top, popup?.top ?? rect.top);
      const right = Math.max(rect.right, popup?.right ?? rect.right);
      const bottom = Math.max(rect.bottom, popup?.bottom ?? rect.bottom);
      setBox({ left, top, width: right - left, height: bottom - top });
    };
    const frame = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", measure); };
  }, [index, step.target]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const measure = () => setCardSize({ width: card.offsetWidth, height: card.offsetHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(card);
    return () => observer.disconnect();
  }, [index]);

  useEffect(() => {
    nextButton.current?.focus();
  }, [index]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") { event.preventDefault(); if (index === steps.length - 1) onClose(); else setIndex(index + 1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); setIndex(Math.max(0, index - 1)); }
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [index, onClose]);

  const viewportWidth = typeof window === "undefined" ? 1024 : window.innerWidth;
  const viewportHeight = typeof window === "undefined" ? 768 : window.innerHeight;
  const cardWidth = Math.min(cardSize.width, viewportWidth - 32);
  const cardHeight = Math.min(cardSize.height, viewportHeight - 90);
  let cardStyle: CSSProperties = { left: Math.max(16, (viewportWidth - cardWidth) / 2), top: Math.max(90, (viewportHeight - cardHeight) / 2) };
  if (box) {
    const gap = 28;
    const owlSpace = viewportWidth <= 680 ? 53 : 70;
    const sideTop = Math.max(owlSpace + 16, Math.min(box.top, viewportHeight - cardHeight - 16));
    const right = box.left + box.width + gap;
    const left = box.left - cardWidth - gap;
    const below = box.top + box.height + owlSpace + 18;
    const above = box.top - cardHeight - gap;
    if (right + cardWidth <= viewportWidth - 16) cardStyle = { left: right, top: sideTop };
    else if (left >= 16) cardStyle = { left, top: sideTop };
    else if (below + cardHeight <= viewportHeight - 16) cardStyle = { left: Math.max(16, Math.min(box.left, viewportWidth - cardWidth - 16)), top: below };
    else if (above - owlSpace >= 16) cardStyle = { left: Math.max(16, Math.min(box.left, viewportWidth - cardWidth - 16)), top: above };
    else cardStyle = box.top > viewportHeight / 2 ? { left: 16, top: owlSpace + 16 } : { left: 16, top: Math.max(owlSpace + 16, viewportHeight - cardHeight - 16) };
  }

  return <div className={styles.tour} ref={root} role="dialog" aria-modal="true" aria-label="Hướng dẫn sử dụng PeerBridge">
    <div className={styles.demoApp} aria-hidden="true"><div className={styles.demoNav}><strong>◈ PeerBridge</strong><span>Hồ sơ</span><span>Tìm bạn</span><span>Kế hoạch</span><span>Học cùng</span></div><div className={styles.demoMain} key={step.scene}>{step.scene === "profile" ? <ProfileScene/> : step.scene === "matching" ? <MatchingScene openTypes={index === 4}/> : step.scene === "plan" ? <PlanScene/> : <RoomScene/>}</div></div>
    {box ? <><div className={styles.dim} style={{ left: 0, top: 0, width: "100%", height: Math.max(0, box.top - 7) }}/><div className={styles.dim} style={{ left: 0, top: box.top - 7, width: Math.max(0, box.left - 7), height: box.height + 14 }}/><div className={styles.dim} style={{ left: box.left + box.width + 7, top: box.top - 7, right: 0, height: box.height + 14 }}/><div className={styles.dim} style={{ left: 0, top: box.top + box.height + 7, width: "100%", bottom: 0 }}/><div className={styles.spotlight} style={{ left: box.left - 7, top: box.top - 7, width: box.width + 14, height: box.height + 14 }}/></> : <div className={styles.fullDim}/>}
    <div ref={cardRef} className={styles.tourCard} style={cardStyle}><Owl/><div className={styles.cardBody}><h2>{step.title}</h2><p>{step.description}</p><div className={styles.aiNote}><strong>AI ở đây:</strong> {step.ai}</div><div className={styles.cardFooter}><span aria-live="polite">{index + 1} / {steps.length}</span><div><button type="button" className={styles.skip} onClick={onClose}>Bỏ qua</button>{index > 0 && <button type="button" className={styles.back} onClick={() => setIndex(index - 1)}>Quay lại</button>}<button ref={nextButton} type="button" className={styles.next} onClick={() => index === steps.length - 1 ? onClose() : setIndex(index + 1)}>{index === steps.length - 1 ? "Bắt đầu" : "Tiếp"}</button></div></div></div></div>
  </div>;
}
