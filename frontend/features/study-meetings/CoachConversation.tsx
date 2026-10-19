"use client";

import {FormEvent, useEffect, useRef, useState} from "react";
import OwlAvatar from "@/components/ui/OwlAvatar";
import {api, type CoachChatMessage} from "@/lib/api";
import styles from "./StudyMeetings.module.css";

const prompts = [
  "Tiến độ hôm nay của mình thế nào?",
  "Mình đang vướng, nên làm gì?",
  "Mình đang mệt, cho mình bước nhỏ hơn.",
];

export default function CoachConversation({token, onShowSidebar, sidebarVisible}: {token: string; onShowSidebar: () => void; sidebarVisible: boolean}) {
  const [messages, setMessages] = useState<CoachChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void api.coachChat(token)
      .then(result => {if (active) setMessages(result.items);})
      .catch(() => {if (active) setError("Chưa tải được cuộc trò chuyện với Cú. Hãy thử lại.");})
      .finally(() => {if (active) setLoading(false);});
    return () => {active = false;};
  }, [token, reloadKey]);
  useEffect(() => {if (body.current) body.current.scrollTop = body.current.scrollHeight;}, [messages.length]);

  async function send(message: string) {
    if (!message.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      const result = await api.sendCoachMessage(token, message.trim());
      setMessages(result.items);
      setText("");
    } catch {
      setError("Cú chưa trả lời được. Hãy thử gửi lại.");
    } finally {
      setSending(false);
    }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(text);
  }

  return <>
    <header className={styles.conversationHeader}>
      {!sidebarVisible && <button type="button" className={styles.sidebarToggle} aria-label="Hiện danh sách chat" aria-expanded={false} aria-controls="study-chat-sidebar" onClick={onShowSidebar}>☰</button>}
      <OwlAvatar size={38}/><div><strong>Cú Bridge</strong><small className={styles.coachSubtitle}>Gợi ý theo kế hoạch và tiến độ của bạn</small></div>
    </header>
    <div className={`${styles.conversationBody} ${styles.coachBody}`} ref={body} aria-live="polite">
      {loading && <p className={styles.emptyChat}>Cú đang xem kế hoạch của bạn…</p>}
      {!loading && messages.map(item => <div key={item.id} className={`${styles.bubble} ${item.role === "user" ? styles.mine : styles.coachBubble}`}>
        {item.role === "assistant" && <small className={styles.coachAuthor}><OwlAvatar size={21}/>Cú Bridge</small>}
        <p>{item.content}</p>
      </div>)}
      {sending && <p className={styles.coachPending}>Cú đang trả lời…</p>}
    </div>
    <div className={styles.coachPrompts} aria-label="Gợi ý hỏi Cú">
      {prompts.map(prompt => <button type="button" key={prompt} disabled={loading || sending} onClick={() => void send(prompt)}>{prompt}</button>)}
    </div>
    {error && <p className={styles.coachError} role="alert">{error} <button type="button" onClick={() => setReloadKey(key => key + 1)}>Tải lại chat</button></p>}
    <form className={styles.coachComposer} onSubmit={submit}>
      <input value={text} onChange={event => setText(event.target.value)} maxLength={500} placeholder="Hỏi Cú về kế hoạch hoặc tiến độ…" aria-label="Nhắn cho Cú Bridge" disabled={loading || sending}/>
      <button className="primary" disabled={loading || sending || !text.trim()}>Gửi</button>
    </form>
  </>;
}
