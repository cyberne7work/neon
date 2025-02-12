import { getWebSocketCredentials } from './auth';

export class BaseWebSocketClient {
  protected ws: WebSocket | null = null;
  protected reconnectAttempts = 0;
  protected maxReconnectAttempts = 5;
  protected pingInterval: number | null = null;
  protected pingTimeout: number | null = null;
  protected readonly PING_INTERVAL = 30000;
  protected readonly PING_TIMEOUT = 5000;
  protected readonly CONNECTION_TIMEOUT = 10000;

  constructor(protected baseUrl: string) {}

  protected getAuthCredentials() {
    return getWebSocketCredentials();
  }

  protected startPingInterval() {
    this.stopPingInterval();
    
    this.pingInterval = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', data: {} }));
        
        this.pingTimeout = window.setTimeout(() => {
          console.error('WebSocket: Ping timeout - no pong received');
          if (this.ws) this.ws.close();
        }, this.PING_TIMEOUT);
      }
    }, this.PING_INTERVAL);
  }

  protected stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
      this.pingTimeout = null;
    }
  }

  async connect() {
    return new Promise<void>((resolve, reject) => {
      const { userId, token } = this.getAuthCredentials();
      
      if (!userId || !token) {
        reject(new Error('Missing authentication credentials'));
        return;
      }

      const wsUrlWithAuth = `${this.baseUrl}/${encodeURIComponent(userId)}?token=${encodeURIComponent(token)}`;
      
      try {
        console.log('Attempting WebSocket connection to:', this.baseUrl);
        const ws = new WebSocket(wsUrlWithAuth);
        this.ws = ws;

        // Set connection timeout
        const connectionTimeout = setTimeout(() => {
          console.error('WebSocket connection timeout');
          ws.close();
          reject(new Error('Connection timeout'));
        }, this.CONNECTION_TIMEOUT);
        
        const connectionPromise = new Promise<void>((resolveConn, rejectConn) => {
          const onOpen = () => {
            console.log('WebSocket connection established successfully');
            clearTimeout(connectionTimeout);
            ws.removeEventListener('open', onOpen);
            ws.removeEventListener('error', onError);
            resolveConn();
          };
          
          const onError = (error: Event) => {
            console.error('WebSocket connection error:', error);
            clearTimeout(connectionTimeout);
            ws.removeEventListener('open', onOpen);
            ws.removeEventListener('error', onError);
            ws.close();
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            rejectConn(new Error(`Failed to establish WebSocket connection: ${errorMessage}`));
          };
          
          ws.addEventListener('open', onOpen);
          ws.addEventListener('error', onError);
        });

        connectionPromise.then(resolve).catch(reject);
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  disconnect() {
    this.stopPingInterval();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  async attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
      
      const { userId, token } = this.getAuthCredentials();
      
      if (!userId || !token) {
        console.error('Missing authentication credentials - stopping reconnection attempts');
        return;
      }
      
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay/1000} seconds`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      try {
        await this.connect();
      } catch (error) {
        console.error('Reconnection attempt failed:', error);
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          await this.attemptReconnect();
        } else {
          console.error('Max reconnection attempts reached - please refresh the page');
        }
      }
    } else {
      console.error('Max reconnection attempts reached - please refresh the page');
    }
  }
}