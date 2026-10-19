"use client";

import {useEffect, useRef, useState, type ReactNode} from "react";
import styles from "./Landing.module.css";

const steps = [
  {title:"Chọn người học cùng", highlight:"theo cách bạn muốn", description:"Xem gợi ý người hợp mục tiêu hoặc gửi link cho bạn đã quen. Hai người cùng đồng ý rồi mới kết nối."},
  {title:"Lập kế hoạch", highlight:"vừa sức mỗi tuần", description:"Mỗi người giữ mục tiêu riêng, chọn giờ học phù hợp và chốt những buổi muốn học chung."},
  {title:"AI giữ nhịp,", highlight:"hiểu từng kế hoạch", description:"AI nhìn tiến độ của hai bạn và gợi ý xem lại kế hoạch khi nhịp học thay đổi."},
  {title:"Check-in,", highlight:"chia sẻ quá trình", description:"Một tấm ảnh sau buổi học ghi lại nỗ lực của bạn và thêm một dấu mốc trong hành trình chung."},
  {title:"Không ai bị", highlight:"bỏ lại phía sau", description:"Khi lịch thay đổi, bạn có thể dời buổi sang ngày đệm hoặc điều chỉnh kế hoạch để tiếp tục học."},
];

function Highlight({children, tone = "blue"}: {children:ReactNode; tone?:"blue"|"yellow"}) {
  return <span className={tone === "yellow" ? `${styles.highlight} ${styles.yellow}` : styles.highlight}>{children}</span>;
}

function StepVisual({step}: {step:number}) {
  if (step === 0) return <div className={styles.flowFan} key="people" aria-hidden="true">
    <div className={styles.flowCard}><span className={styles.tagBlue}>Gợi ý phù hợp</span><b>Bạn cần luyện IELTS Speaking, An có thể hỗ trợ</b><small>Bạn cũng có thể giúp lại phần viết học thuật</small></div>
    <div className={styles.flowCard}><span className={styles.tagYellow}>Bạn đã quen</span><b>Học cùng Hùng, người bạn đã kết nối</b><span className={styles.miniButton}>Mở trò chuyện</span></div>
    <div className={styles.flowCard}><span className={styles.tagPink}>Mời bạn của bạn</span><span className={styles.linkPreview}>peerbridge.app/?invite=…</span><span className={styles.miniButton}>Chia sẻ link</span></div>
  </div>;
  if (step === 1) return <div className={styles.flowCard} key="plan"><span className={styles.tagBlue}>Kế hoạch tuần</span>
    <div className={styles.twoPlans}><div><b>Bạn</b><p>✓ Ôn 5 từ mới</p><p>○ Luyện nói 20 phút</p></div><div><b>Bạn học</b><p>✓ Làm bài SQL</p><p>○ Ôn nội dung mới</p></div></div>
    <span className={styles.sharedTime}>🤝 Thứ 4 · 21:00 · Học chung</span>
  </div>;
  if (step === 2) return <div className={`${styles.flowCard} ${styles.aiCard}`} key="ai" aria-hidden="true"><span className={styles.tagPurple}>✦ AI giữ nhịp</span>
    <div className={styles.chatLine}>Nhịp học tuần này hơi chậm. Bạn có thể xem phương án giảm tải để tiếp tục nhé.</div><div className={`${styles.chatLine} ${styles.chatMe}`}>Mình xem phương án nhé</div>
    <svg className={styles.trend} viewBox="0 0 300 78" aria-hidden="true"><path d="M5 60 C50 20 80 70 120 40 S190 55 230 25 270 30 295 18"/><path d="M5 66 C50 40 90 60 125 48 S185 40 232 32 270 36 295 24"/></svg><small>Hai nhịp học đang đi cùng nhau</small>
  </div>;
  if (step === 3) return <div className={styles.flowCard} key="checkin"><span className={styles.tagBlue}>Check-in sau buổi học</span>
    <div className={styles.checkinPhoto}><span>☀</span></div><b>Buổi học hôm nay đã được ghi lại</b><small>Kế hoạch và hành trình chung cùng có thêm một dấu mốc.</small>
  </div>;
  return <div className={`${styles.flowCard} ${styles.recoveryCard}`} key="recovery" aria-hidden="true"><span className={styles.tagYellow}>Hôm nay lịch hơi kín</span>
    <div className={styles.chatLine}>Bạn có thể dời buổi học sang ngày đệm hoặc xem lại kế hoạch tuần này.</div>
    <div className={styles.recoveryChoices}><span>Dùng ngày đệm</span><span>Chỉnh giờ học</span><span>Xem kế hoạch</span></div>
    <div className={styles.partnerLine}>Hùng: Mình đợi bạn ở buổi sau nha 🤝</div>
    <div className={styles.recoveryTrack}><i/></div><small>Từng buổi đã hoàn thành vẫn được ghi nhận</small>
  </div>;
}

export default function Landing({onStart, onLogin}: {onStart:()=>void; onLogin:()=>void}) {
  const [step, setStep] = useState(0);
  const flowTrack = useRef<HTMLElement>(null);
  const flowPanel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const track = flowTrack.current;
      const panel = flowPanel.current;
      if (!track || !panel) return;
      const headerHeight = window.innerWidth <= 600 ? 61 : 68;
      const travel = Math.max(1, track.offsetHeight - panel.offsetHeight);
      const progress = Math.min(1, Math.max(0, (headerHeight - track.getBoundingClientRect().top) / travel));
      setStep(Math.min(steps.length - 1, Math.floor(progress * steps.length)));
    };
    const schedule = () => {if (!frame) frame = window.requestAnimationFrame(update);};
    schedule();
    window.addEventListener("scroll", schedule, {passive:true});
    window.addEventListener("resize", schedule);
    return () => {window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); if (frame) window.cancelAnimationFrame(frame);};
  }, []);

  function selectStep(index: number) {
    setStep(index);
    const track = flowTrack.current;
    const panel = flowPanel.current;
    if (!track || !panel) return;
    const headerHeight = window.innerWidth <= 600 ? 61 : 68;
    const travel = Math.max(1, track.offsetHeight - panel.offsetHeight);
    const top = window.scrollY + track.getBoundingClientRect().top - headerHeight + travel * ((index + .15) / steps.length);
    window.scrollTo({top, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"});
  }
  return <div className={styles.page}>
    <header className={styles.nav}>
      <a href="#dau-trang" className={styles.logo} aria-label="PeerBridge, về đầu trang"><span className="brand-mark"><span>P</span><span>B</span></span>PeerBridge</a>
      <nav aria-label="Giới thiệu"><a href="#cach-hoat-dong">Cách hoạt động</a><a href="#gia-tri">Giá trị</a><a href="#bat-dau">Bắt đầu</a></nav>
      <div className={styles.navActions}><button type="button" className={styles.login} onClick={onLogin}>Đăng nhập</button><button type="button" className={styles.primary} onClick={onStart}>Bắt đầu</button></div>
    </header>
    <main id="dau-trang">
      <section className={styles.hero} aria-labelledby="landing-title">
        <div className={styles.heroCopy}>
          <span className={styles.pill}><i/>Cho sinh viên có mục tiêu học tập dài hạn, ôn thi và học kỹ năng mới</span>
          <h1 id="landing-title">Tự học bớt cô đơn khi có <em>một người</em> <Highlight tone="yellow">cùng nhịp</Highlight>.</h1>
          <p>Chọn bạn học phù hợp hoặc mời người quen, cùng lập kế hoạch và học theo lịch đã chốt. Mỗi lần check-in là thêm một bước trong hành trình của hai bạn.</p>
          <div className={styles.ctas}><button type="button" className={styles.primary} onClick={onStart}>Bắt đầu học cùng bạn →</button><a href="#cach-hoat-dong">Xem cách hoạt động</a></div>
        </div>
        <div className={styles.pair} aria-label="Minh họa hai người học cùng nhau">
          <div className={`${styles.personCard} ${styles.personA}`}><div className={styles.personHead}><span className={styles.fox}>🦊</span><div><b>An</b><small>Ôn thi IELTS</small></div></div><span className={styles.tagPink}>Mục tiêu học tập</span><p>Muốn luyện <Highlight>IELTS Speaking</Highlight> trong <Highlight tone="yellow">8 tuần</Highlight></p><div className={styles.personFoot}><span><b>Cần hỗ trợ</b>Luyện nói</span><span><b>Có thể hỗ trợ</b>Viết học thuật</span></div></div>
          <div className={`${styles.personCard} ${styles.personB}`}><div className={styles.personHead}><span className={styles.frog}>🐸</span><div><b>Bảo Trâm</b><small>Học kỹ năng mới</small></div></div><span className={styles.tagBlue}>Mục tiêu học tập</span><p>Muốn học <Highlight>Tiếng Tây Ban Nha</Highlight> trong <Highlight tone="yellow">8 tuần</Highlight></p><div className={styles.personFoot}><span><b>Cần hỗ trợ</b>Giao tiếp du lịch</span><span><b>Có thể hỗ trợ</b>Giữ nhịp học</span></div></div>
          <span className={styles.pairBadge}>🤝 Cùng bắt đầu hành trình</span><span className={`${styles.floatBadge} ${styles.streak}`}><b>5</b> ngày liên tiếp cùng học</span><span className={`${styles.floatBadge} ${styles.checkin}`}>📷 Bảo Trâm vừa check-in<small>Buổi học hôm nay</small></span>
        </div>
      </section>
      <section className={styles.flowTrack} id="cach-hoat-dong" aria-label="Cách hoạt động" ref={flowTrack}>
        <div className={styles.flow} ref={flowPanel}>
        <div className={styles.flowCopy}><span className={styles.eyebrow}>PEERBRIDGE · CÁCH HOẠT ĐỘNG</span><h2 id="flow-title" key={step}>{steps[step].title} <Highlight>{steps[step].highlight}</Highlight></h2><p>{steps[step].description}</p>
          <div className={styles.stepTabs} role="tablist" aria-label="Các bước học cùng">{steps.map((item,index) => <button key={item.title} type="button" role="tab" aria-selected={step===index} aria-controls="flow-visual" aria-label={`Bước ${index+1}: ${item.title} ${item.highlight}`} onClick={() => selectStep(index)}><span/></button>)}</div>
        </div>
        <div className={styles.flowVisual} id="flow-visual" role="tabpanel" aria-label={`Bước ${step+1}: ${steps[step].title} ${steps[step].highlight}`}><StepVisual step={step}/></div>
        </div>
      </section>
      <section className={styles.values} id="gia-tri" aria-labelledby="values-title"><span className={styles.eyebrow}>ĐỒNG HÀNH THEO CÁCH CỦA BẠN</span><h2 id="values-title">Điều PeerBridge <Highlight tone="yellow">trân trọng</Highlight></h2><div className={styles.valueGrid}><article><span className={styles.tagPink}>01</span><h3>Mỗi người một mục tiêu</h3><p>Có thể ôn thi, học ngoại ngữ hoặc học kỹ năng mới và vẫn dành giờ học bên nhau.</p></article><article><span className={styles.tagBlue}>02</span><h3>Lịch học rõ ràng</h3><p>Hai người cùng chọn buổi học chung; việc riêng vẫn nằm trong kế hoạch của mỗi người.</p></article><article><span className={styles.tagYellow}>03</span><h3>Giữ lại hành trình</h3><p>Buổi học và check-in tạo thành những dấu mốc để bạn nhìn lại nỗ lực đã qua.</p></article></div></section>
      <section className={styles.final} id="bat-dau"><div><span className={styles.eyebrow}>BẮT ĐẦU CÙNG PEERBRIDGE</span><h2>Chọn một mục tiêu, tìm một người cùng nhịp.</h2></div><button type="button" className={styles.primary} onClick={onStart}>Bắt đầu học cùng bạn →</button></section>
    </main>
    <footer className={styles.footer}>© PeerBridge · Học cùng nhau, tiến xa hơn</footer>
  </div>;
}
