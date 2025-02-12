import { components } from './api';
import { Game, GameCreatedEvent, GameUpdatedEvent, GameDeletedEvent } from './game';
import { FileCreatedEvent, FileUpdatedEvent, FileDeletedEvent } from './file';

// WebSocket Message Types
export type WebSocketMessageType =
  | 'chat_message'
  | 'chat_response'
  | 'generate_image'
  | 'image_generated'
  | 'generate_sound'
  | 'sound_generated'
  | 'check_errors'
  | 'error_check'
  | 'asset_uploaded'
  | 'game_created'
  | 'game_updated'
  | 'game_deleted'
  | 'file_created'
  | 'file_updated'
  | 'file_deleted'
  | 'enhance_prompt'
  | 'task_started'
  | 'progress_update'
  | 'ping'
  | 'pong';

// Base WebSocket Message
interface BaseWebSocketMessage<T extends WebSocketMessageType, D = unknown> {
  type: T;
  data: D;
}

// Ping/Pong Messages
export interface PingMessage extends BaseWebSocketMessage<'ping'> {
  data: Record<string, never>;
}

export interface PongMessage extends BaseWebSocketMessage<'pong'> {
  data: Record<string, never>;
}

// Chat Messages
export interface ChatMessage extends BaseWebSocketMessage<'chat_message'> {
  data: {
    game: {
      id: string;
    };
    content: string;
    files?: Array<{
      name: string;
      path?: string;
    }>;
  };
}

export interface EnhancePromptMessage extends BaseWebSocketMessage<'enhance_prompt'> {
  data: {
    gameId: string;
    message: string;
    code?: string;
    aspects?: string[];
  };
}

export interface ChatResponse extends BaseWebSocketMessage<'chat_response'> {
  data: {
    message: string;
    error?: string;
  };
}

// Asset Generation Messages
export interface AssetGenerationRequest {
  prompt: string;
  type?: 'single' | 'game';
  gameType?: string;
  size?: '256x256' | '512x512' | '1024x1024';
}

export interface GenerateImageMessage extends BaseWebSocketMessage<'generate_image'> {
  data: AssetGenerationRequest;
}

export interface ImageGeneratedMessage extends BaseWebSocketMessage<'image_generated'> {
  data: {
    url: string;
    name: string;
    size: string;
    error?: string;
  };
}

export interface GenerateSoundMessage extends BaseWebSocketMessage<'generate_sound'> {
  data: AssetGenerationRequest;
}

export interface SoundGeneratedMessage extends BaseWebSocketMessage<'sound_generated'> {
  data: {
    url: string;
    name: string;
    error?: string;
  };
}

// Error Checking Messages
export interface CheckErrorsMessage extends BaseWebSocketMessage<'check_errors'> {
  data: {
    game: {
      id: string;
    };
    files: Array<{
      name: string;
      path?: string;
    }>;
  };
}

export interface ErrorCheckMessage extends BaseWebSocketMessage<'error_check'> {
  data: {
    errors: string[];
  };
}

// Asset Upload Message
export interface AssetUploadedMessage extends BaseWebSocketMessage<'asset_uploaded'> {
  data: {
    type: 'image' | 'sound';
    filename: string;
  };
}

// Task Progress Messages
export interface TaskStartedMessage extends BaseWebSocketMessage<'task_started'> {
  data: {
    task_id: string;
    message: string;
  };
}

export interface ProgressUpdateMessage extends BaseWebSocketMessage<'progress_update'> {
  data: {
    game_id: string;
    status: string;
    progress: number;
    message: string;
  };
}

// Union type of all WebSocket messages
export type WebSocketMessage =
  | ChatMessage
  | EnhancePromptMessage
  | ChatResponse
  | GenerateImageMessage
  | ImageGeneratedMessage
  | GenerateSoundMessage
  | SoundGeneratedMessage
  | CheckErrorsMessage
  | ErrorCheckMessage
  | AssetUploadedMessage
  | TaskStartedMessage
  | ProgressUpdateMessage
  | GameCreatedEvent
  | GameUpdatedEvent
  | GameDeletedEvent
  | FileCreatedEvent
  | FileUpdatedEvent
  | FileDeletedEvent
  | PingMessage
  | PongMessage;

// Type guard to check if a message is a valid WebSocket message
export function isWebSocketMessage(message: unknown): message is WebSocketMessage {
  if (typeof message !== 'object' || message === null) return false;
  
  const msg = message as Partial<WebSocketMessage>;
  return typeof msg.type === 'string' && 'data' in msg;
}
