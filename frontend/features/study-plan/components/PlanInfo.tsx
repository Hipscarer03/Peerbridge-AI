"use client";
import {useEffect, useRef, useState} from "react";
export default function PlanInfo({label, children}: {label: string; children: React.ReactNode}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {if (open) ref.current?.showModal();}, [open]);
  return <><button type="button" className="secondary" onClick={() => setOpen(true)}>ⓘ {label}</button>{open && <dialog ref={ref} className="plan-info-dialog" onCancel={() => setOpen(false)} onClick={event => {if (event.target === ref.current) setOpen(false);}}><div><header><h2>{label}</h2><button type="button" className="text-link" autoFocus onClick={() => setOpen(false)}>Đóng ×</button></header>{children}</div></dialog>}</>;
}
