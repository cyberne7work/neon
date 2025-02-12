// Game Types
export interface Game {
  id: string;
  name: string;
  user_id: string;
  folder_path: string;
  lastModified: string;
  preview_url?: string;
  repository_url?: string;
}

export interface CreateGameRequest {
  name: string;
  user_id: string;
  folder_path: string;
}

export interface UpdateGameRequest extends CreateGameRequest {
  id: string;
}

// Game WebSocket Message Types
export interface GameCreatedEvent {
  type: 'game_created';
  data: Game;
}

export interface GameUpdatedEvent {
  type: 'game_updated';
  data: Game;
}

export interface GameDeletedEvent {
  type: 'game_deleted';
  data: {
    gameId: string;
  };
}

export type GameEvent = 
  | GameCreatedEvent
  | GameUpdatedEvent
  | GameDeletedEvent;
