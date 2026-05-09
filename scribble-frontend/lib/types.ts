export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface RoomStateDTO {
  roomId: string;
  players: Player[];
  maskedWord: string;
  currentWord: string;
  drawerName: string;
  maxPlayers: number;
}

export interface ScoreUpdateDTO {
  roomId: string;
  players: Player[];
  word: string;
}

export interface ChatMessage {
  sender: string;
  content: string;
  roomId: string;
}

export interface DrawData {
  x: number;
  y: number;
  color: string;
  brushSize: number;
  drawing: boolean;
  sender: string;
  roomId: string;
}
