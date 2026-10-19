"use client";
import Toast from "@/components/ui/Toast";

export default function PlanToast({message, error = false, onClose}: {message: string; error?: boolean; onClose: () => void}) {
  return <Toast message={message} error={error} onClose={onClose}/>;
}
