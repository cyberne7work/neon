export interface GameFile {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified?: string;
}

export interface FileListResponse {
  files: GameFile[];
}

// File WebSocket Message Types
export interface FileCreatedEvent {
  type: 'file_created';
  data: GameFile;
}

export interface FileUpdatedEvent {
  type: 'file_updated';
  data: GameFile;
}

export interface FileDeletedEvent {
  type: 'file_deleted';
  data: {
    filePath: string;
  };
}

export type FileEvent = 
  | FileCreatedEvent
  | FileUpdatedEvent
  | FileDeletedEvent;
