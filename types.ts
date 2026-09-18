
export interface Message {
  id: string;
  role: 'user' | 'jarvis';
  text: string;
  timestamp: number;
}

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

export interface LiveState {
  status: ConnectionStatus;
  isListening: boolean;
  error?: string;
}
