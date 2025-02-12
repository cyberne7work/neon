import { WebSocketMessage, WebSocketMessageType, isWebSocketMessage } from '../types/websocket';
import { BaseWebSocketClient } from './baseWebSocket';
import useGamesStore from '../stores/useGamesStore';

type MessageHandler<T extends WebSocketMessage> = (data: T['data']) => void;
type EventHandler = () => void;

export class GameWebSocketClient extends BaseWebSocketClient {
  private messageHandlers = new Map<WebSocketMessageType, MessageHandler<any>>();
  private eventHandlers: {
    open: EventHandler[];
    close: EventHandler[];
    error: EventHandler[];
  } = {
    open: [],
    close: [],
    error: []
  };

  constructor() {
    super('wss://builder.nethos.xyz/ws');
  }

  protected override getAuthCredentials() {
    const credentials = super.getAuthCredentials();
    const gameId = useGamesStore.getState().activeGameId;

    if (!gameId) {
      throw new Error('No active game selected');
    }

    return {
      ...credentials,
      gameId
    };
  }

  override async connect() {
    try {
      await super.connect();
      
      if (!this.ws) {
        throw new Error('WebSocket not initialized');
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'pong') {
            if (this.pingTimeout) {
              clearTimeout(this.pingTimeout);
              this.pingTimeout = null;
            }
            return;
          }
          
          if (isWebSocketMessage(message)) {
            const handler = this.messageHandlers.get(message.type);
            if (handler) {
              handler(message.data);
            }
          } else {
            console.error('Game WebSocket: Invalid message format:', message);
          }
        } catch (error) {
          console.error('Game WebSocket: Error handling message:', error);
        }
      };

      this.ws.onopen = () => {
        console.log('Game WebSocket connected');
        this.reconnectAttempts = 0;
        this.startPingInterval();
        this.eventHandlers.open.forEach(handler => handler());
      };

      this.ws.onclose = (event) => {
        console.log('Game WebSocket disconnected:', event.code, event.reason);
        this.stopPingInterval();
        this.eventHandlers.close.forEach(handler => handler());
        
        if (event.code !== 1000) {
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('Game WebSocket error:', error);
        if (this.ws?.readyState === WebSocket.CLOSED) {
          console.error('Game WebSocket: Connection failed - checking credentials and attempting reconnect');
        }
        this.eventHandlers.error.forEach(handler => handler());
      };
    } catch (error) {
      console.error('Failed to establish Game WebSocket connection:', error);
      throw error;
    }
  }

  registerHandler<T extends WebSocketMessageType>(
    type: T,
    handler: (data: Extract<WebSocketMessage, { type: T }>['data']) => void
  ) {
    this.messageHandlers.set(type, handler as MessageHandler<any>);
  }

  unregisterHandler(type: WebSocketMessageType) {
    this.messageHandlers.delete(type);
  }

  addEventListener(event: 'open' | 'close' | 'error', handler: EventHandler) {
    this.eventHandlers[event].push(handler);
  }

  removeEventListener(event: 'open' | 'close' | 'error', handler: EventHandler) {
    this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
  }

  send<T extends WebSocketMessageType>(
    type: T,
    data: WebSocketMessage & { type: T } extends { data: infer D } ? D : never
  ) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    } else {
      console.error('Game WebSocket is not connected');
    }
  }
}

// Create singleton instance
const gameWsClient = new GameWebSocketClient();

export default gameWsClient;