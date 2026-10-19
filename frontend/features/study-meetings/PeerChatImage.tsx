"use client";

import {useEffect, useState} from "react";
import {API_URL, COOKIE_SESSION_TOKEN} from "@/lib/api";
import styles from "./StudyMeetings.module.css";

type Props = {messageId: number; token: string};

export default function PeerChatImage({messageId, token}: Props) {
  const [source, setSource] = useState("");
  const [failed, setFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = "";
    setFailed(false);
    setSource("");
    void fetch(`${API_URL}/api/v1/study-meetings/peers/media/${messageId}`, {
      credentials: "include",
      headers: token && token !== COOKIE_SESSION_TOKEN ? {Authorization: `Bearer ${token}`} : {},
      signal: controller.signal,
    }).then(response => {
      if (!response.ok) throw new Error("Không tải được ảnh");
      return response.blob();
    }).then(blob => {
      objectUrl = URL.createObjectURL(blob);
      setSource(objectUrl);
    }).catch(error => {
      if ((error as Error).name !== "AbortError") setFailed(true);
    });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [messageId, token]);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [expanded]);

  if (failed) return <span className={styles.imageError}>Không tải được ảnh</span>;
  if (!source) return <span className={styles.imageLoading}>Đang tải ảnh…</span>;
  return <>
    <button type="button" className={styles.chatImageButton} aria-label="Mở ảnh" aria-haspopup="dialog" onClick={() => setExpanded(true)}>
      <img className={styles.chatImage} src={source} alt="Ảnh trong cuộc trò chuyện"/>
    </button>
    {expanded && <div className={styles.imageViewer} role="dialog" aria-modal="true" aria-label="Xem ảnh" onClick={() => setExpanded(false)}>
      <button type="button" className={styles.imageViewerClose} aria-label="Đóng ảnh" autoFocus onClick={() => setExpanded(false)}>✕</button>
      <img src={source} alt="Ảnh trong cuộc trò chuyện được phóng lớn" onClick={event => event.stopPropagation()}/>
    </div>}
  </>;
}
