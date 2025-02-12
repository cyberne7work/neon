import { WebSocketMessage, WebSocketMessageType, isWebSocketMessage } from '../types/websocket';
import { BaseWebSocketClient } from './baseWebSocket';

type MessageHandler<T extends WebSocketMessage> = (data: T['data']) => void;
type EventHandler = () => void;

class WebSocketClient extends BaseWebSocketClient {
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
    super(getWebSocketUrl());
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
            console.error('Invalid message format:', message);
          }
        } catch (error) {
          console.error('Error handling message:', error);
        }
      };

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.startPingInterval();
        this.eventHandlers.open.forEach(handler => handler());
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.stopPingInterval();
        this.eventHandlers.close.forEach(handler => handler());
        
        if (event.code !== 1000) {
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (this.ws?.readyState === WebSocket.CLOSED) {
          console.error('Connection failed - please check your authentication status');
        }
        this.eventHandlers.error.forEach(handler => handler());
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
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
      console.error('WebSocket is not connected');
    }
  }
}

// Get WebSocket URL based on environment
const getWebSocketUrl = () => {
  if (import.meta.env.DEV) {
    return 'wss://builder.nethos.xyz/ws';
  }
  return 'wss://builder.nethos.xyz/ws';
};

// Create singleton instance
const wsClient = new WebSocketClient();

export default wsClient;
