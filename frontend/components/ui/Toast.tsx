"use client";

import {useEffect, useRef} from "react";
import styles from "./Toast.module.css";

export default function Toast({message, error = false, onClose, action}: {
  message: string;
  error?: boolean;
  onClose: () => void;
  action?: {label: string; onClick: () => void};
}) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => onCloseRef.current(), error ? 8000 : 4500);
    return () => window.clearTimeout(timer);
  }, [message, error]);
  if (!message) return null;
  return <aside className={`${styles.toast} ${error ? styles.error : ""}`} role={error ? "alert" : "status"}>
    <span className={styles.symbol} aria-hidden="true">{error ? "!" : "✓"}</span>
    <p>{message}</p>
    {action && <button type="button" className={styles.action} onClick={action.onClick}>{action.label}</button>}
    <button type="button" className={styles.close} aria-label="Đóng thông báo" onClick={onClose}>×</button>
  </aside>;
}
