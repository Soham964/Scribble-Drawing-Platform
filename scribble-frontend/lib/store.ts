import { create } from "zustand";
import { Player, ChatMessage, RoomStateDTO } from "./types";

interface GameStore {
  // Identity
  playerName: string;
  roomId: string;
  setIdentity: (name: string, room: string) => void;

  // Room state
  players: Player[];
  drawerName: string;
  maskedWord: string;
  currentWord: string;
  timeLeft: number;
  isInGame: boolean;
  maxPlayers: number;

  // Chat
  messages: (ChatMessage & { isSystem?: boolean; isCorrect?: boolean })[];

  // Actions
  setRoomState: (dto: RoomStateDTO) => void;
  setTimeLeft: (t: number) => void;
  addMessage: (msg: ChatMessage & { isSystem?: boolean; isCorrect?: boolean }) => void;
  setInGame: (v: boolean) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  playerName: "",
  roomId: "",
  setIdentity: (name, room) => set({ playerName: name, roomId: room }),

  players: [],
  drawerName: "",
  maskedWord: "",
  currentWord: "",
  timeLeft: 60,
  isInGame: false,
  maxPlayers: 8,

  messages: [],

  setRoomState: (dto) =>
    set({
      players: dto.players,
      drawerName: dto.drawerName,
      maskedWord: dto.maskedWord,
      currentWord: dto.currentWord,
      maxPlayers: dto.maxPlayers ?? 8,
    }),

  setTimeLeft: (t) => set({ timeLeft: t }),

  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages.slice(-99), msg],
    })),

  setInGame: (v) => set({ isInGame: v }),

  reset: () =>
    set({
      players: [],
      drawerName: "",
      maskedWord: "",
      currentWord: "",
      timeLeft: 60,
      isInGame: false,
      maxPlayers: 8,
      messages: [],
    }),
}));
