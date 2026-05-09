import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { DrawData, ChatMessage } from "./types";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8081";

let client: Client | null = null;

export function getClient(): Client | null {
  return client;
}

export function createClient(
  playerName: string,
  roomId: string,
  onConnected: () => void,
  onDisconnected: () => void
): Client {
  if (client && client.active) {
    client.deactivate();
  }

  client = new Client({
    webSocketFactory: () => new SockJS(`${BACKEND}/ws`),
    connectHeaders: {
      playerName,
      roomId,
    },
    reconnectDelay: 3000,
    onConnect: () => {
      console.log("[STOMP] Connected");
      onConnected();
    },
    onDisconnect: () => {
      console.log("[STOMP] Disconnected");
      onDisconnected();
    },
    onStompError: (frame) => {
      console.error("[STOMP] Error", frame);
    },
  });

  return client;
}

export function subscribe(destination: string, callback: (msg: IMessage) => void) {
  if (!client) return;
  return client.subscribe(destination, callback);
}

export function sendJoin(playerName: string, roomId: string) {
  client?.publish({
    destination: "/app/join",
    body: JSON.stringify({ sender: playerName, roomId, content: "" }),
  });
}

export function sendDraw(data: DrawData) {
  client?.publish({
    destination: "/app/draw",
    body: JSON.stringify(data),
  });
}

export function sendChat(msg: ChatMessage) {
  client?.publish({
    destination: "/app/chat",
    body: JSON.stringify(msg),
  });
}

export function disconnect() {
  client?.deactivate();
  client = null;
}
