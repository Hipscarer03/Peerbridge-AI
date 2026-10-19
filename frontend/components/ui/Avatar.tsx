"use client";
<<<<<<< HEAD
import { API_URL } from "@/lib/api";

const icons = ["🤖", "🐻", "🐱", "🦊", "🐼", "🐸", "🐧", "🦉"];
const colors = ["#e1edff", "#fff0c2", "#ffe1ed", "#e9e0ff", "#d9f4e6"];
export default function Avatar({ seed, size = 48, src }: { seed: string | number; size?: number; src?: string }) {
 const hash = Array.from(String(seed)).reduce((n,c) => (n * 31 + c.charCodeAt(0)) >>> 0, 0);
 if (src) return <img src={src.startsWith("/") ? `${API_URL}${src}` : src} alt="Ảnh đại diện" width={size} height={size} style={{width:size,height:size,minWidth:size,borderRadius:"50%",objectFit:"cover"}}/>;
=======
const icons = ["🤖", "🐻", "🐱", "🦊", "🐼", "🐸", "🐧", "🦉"];
const colors = ["#e1edff", "#fff0c2", "#ffe1ed", "#e9e0ff", "#d9f4e6"];
export default function Avatar({ seed, size = 48 }: { seed: string | number; size?: number }) {
 const hash = Array.from(String(seed)).reduce((n,c) => (n * 31 + c.charCodeAt(0)) >>> 0, 0);
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
 return <span className="buddy-avatar" role="img" aria-label="Avatar mặc định" style={{ width:size, height:size, minWidth:size, display:"inline-flex", alignItems:"center", justifyContent:"center", borderRadius:"50%", background:colors[hash % colors.length], fontSize:size * .55, lineHeight:1 }}>{icons[hash % icons.length]}</span>;
}
