"use client";

import {useEffect, useRef, useState} from "react";
import {API_URL, COOKIE_SESSION_TOKEN} from "@/lib/api";
import type {PeerStudyMessage} from "@/lib/study-meetings";

export default function usePeerStudyRealtime(token: string, onMessage: () => void) {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<PeerStudyMessage | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!token) return;
    let stopped = false;
    let socket: WebSocket | null = null;
    let reconnect: number | null = null;
    let heartbeat: number | null = null;
    let retryMs = 1000;

    const connect = () => {
      const url = new URL("/api/v1/study-meetings/ws", API_URL);
      url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
      if (token !== COOKIE_SESSION_TOKEN) url.searchParams.set("token", token);
      const ws = new WebSocket(url.toString());
      socket = ws;
      ws.onopen = () => {
        retryMs = 1000;
        setConnected(true);
        onMessageRef.current();
        heartbeat = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send("ping");
        }, 25000);
      };
      ws.onmessage = event => {
        try {
          const data: unknown = JSON.parse(event.data);
          if (!data || typeof data !== "object") return;
          const payload = data as {type?: unknown; message?: Partial<PeerStudyMessage>};
          const message = payload.message;
          if (payload.type === "peer_study_read") { onMessageRef.current(); return; }
          if (payload.type !== "peer_study_message" || !message || typeof message.id !== "number" ||
              typeof message.peer_match_id !== "number" || typeof message.sender_id !== "number" ||
              typeof message.content !== "string" || typeof message.created_at !== "string") return;
          setLastMessage(message as PeerStudyMessage);
          onMessageRef.current();
        } catch { /* Bỏ qua sự kiện không hợp lệ. */ }
      };
      ws.onerror = () => ws.close();
      ws.onclose = event => {
        if (!stopped) setConnected(false);
        if (heartbeat) window.clearInterval(heartbeat);
        heartbeat = null;
        if (!stopped && event.code !== 4401 && event.code !== 4403) {
          reconnect = window.setTimeout(connect, retryMs);
          retryMs = Math.min(retryMs * 2, 30000);
        }
      };
    };
    connect();
    return () => {
      stopped = true;
      if (reconnect) window.clearTimeout(reconnect);
      if (heartbeat) window.clearInterval(heartbeat);
      socket?.close();
    };
  }, [token]);

  return {connected, lastMessage};
}
