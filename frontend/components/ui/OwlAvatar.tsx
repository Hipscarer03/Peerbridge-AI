import type { CSSProperties } from "react";

export default function OwlAvatar({size = 38, className = ""}: {size?: number; className?: string}) {
  return <svg className={className} width={size} height={size} viewBox="0 0 80 82" aria-hidden="true" focusable="false" style={{flex: "none"} as CSSProperties}>
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
