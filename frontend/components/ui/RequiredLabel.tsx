import type { ReactNode } from "react";
import styles from "./RequiredLabel.module.css";

export default function RequiredLabel({ children }: { children: ReactNode }) {
  return <span className={styles.label}>{children}<span className={styles.mark} aria-hidden="true">*</span><span className={styles.accessible}> (bắt buộc)</span></span>;
}
