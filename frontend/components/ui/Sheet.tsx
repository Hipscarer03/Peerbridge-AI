"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {useRef, type ReactNode} from "react";
import styles from "./Sheet.module.css";

export default function Sheet({open, onOpenChange, title, children, initialFocusSelector, placement = "center"}: {open: boolean; onOpenChange: (open: boolean) => void; title: string; children: ReactNode; initialFocusSelector?: string; placement?: "center" | "bottom"}) {
  const previousFocus = useRef<HTMLElement | null>(null);
  return <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className={styles.overlay}/>
      <Dialog.Content className={`${styles.content} ${placement === "bottom" ? styles.bottom : ""}`} aria-describedby={undefined} onOpenAutoFocus={event => {previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; if (initialFocusSelector) {const target = (event.currentTarget as HTMLElement).querySelector<HTMLElement>(initialFocusSelector); if (target) {event.preventDefault(); target.focus();}}}} onCloseAutoFocus={event => {event.preventDefault(); previousFocus.current?.focus();}}>
        <header className={styles.header}><Dialog.Title className={styles.title}>{title}</Dialog.Title><Dialog.Close className={styles.close} aria-label="Đóng chi tiết">×</Dialog.Close></header>
        <div className={styles.body}>{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
