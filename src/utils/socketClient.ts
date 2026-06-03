type SocketStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error';

type SocketHandler<T = unknown> = (payload: T) => void;
type StatusHandler = (status: SocketStatus) => void;

interface SocketMessage<T = unknown> {
  event?: string;
  type?: string;
  payload?: T;
  data?: T;
}

const DEFAULT_SOCKET_URL = 'ws://localhost:8000/ws';

class SocketClient {
  private socket: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private reconnectAttempts = 0;
  private manuallyClosed = false;
  private readonly handlers = new Map<string, Set<SocketHandler>>();
  private readonly statusHandlers = new Set<StatusHandler>();
  private status: SocketStatus = 'idle';
  private readonly url =
    import.meta.env.VITE_SOCKET_URL ||
    import.meta.env.VITE_WS_URL ||
    DEFAULT_SOCKET_URL;

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN || this.socket?.readyState === WebSocket.CONNECTING) {
      return;
    }

    this.manuallyClosed = false;
    this.setStatus('connecting');
    this.socket = new WebSocket(this.url);

    this.socket.addEventListener('open', () => {
      this.reconnectAttempts = 0;
      this.setStatus('open');
    });

    this.socket.addEventListener('message', (event) => {
      this.handleMessage(event.data);
    });

    this.socket.addEventListener('error', () => {
      this.setStatus('error');
    });

    this.socket.addEventListener('close', () => {
      this.socket = null;
      this.setStatus('closed');

      if (!this.manuallyClosed) {
        this.scheduleReconnect();
      }
    });
  }

  disconnect() {
    this.manuallyClosed = true;

    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.socket?.close();
    this.socket = null;
    this.setStatus('closed');
  }

  send<T>(event: string, payload?: T) {
    this.connect();

    const message = JSON.stringify({ event, payload });

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(message);
      return;
    }

    const sendWhenOpen = () => {
      this.socket?.send(message);
      this.socket?.removeEventListener('open', sendWhenOpen);
    };

    this.socket?.addEventListener('open', sendWhenOpen);
  }

  subscribe<T = unknown>(event: string, handler: SocketHandler<T>) {
    const existingHandlers = this.handlers.get(event) ?? new Set<SocketHandler>();
    existingHandlers.add(handler as SocketHandler);
    this.handlers.set(event, existingHandlers);
    this.connect();

    return () => {
      const currentHandlers = this.handlers.get(event);
      currentHandlers?.delete(handler as SocketHandler);

      if (currentHandlers?.size === 0) {
        this.handlers.delete(event);
      }
    };
  }

  onStatus(handler: StatusHandler) {
    this.statusHandlers.add(handler);
    handler(this.status);
    this.connect();

    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  private handleMessage(rawMessage: string) {
    try {
      const message = JSON.parse(rawMessage) as SocketMessage;
      const eventName = message.event || message.type;

      if (!eventName) return;

      const payload = message.payload ?? message.data ?? message;
      this.handlers.get(eventName)?.forEach((handler) => handler(payload));
      this.handlers.get('*')?.forEach((handler) => handler(message));
    } catch {
      this.handlers.get('message')?.forEach((handler) => handler(rawMessage));
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer !== null) return;

    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 10000);
    this.reconnectAttempts += 1;

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private setStatus(nextStatus: SocketStatus) {
    this.status = nextStatus;
    this.statusHandlers.forEach((handler) => handler(nextStatus));
  }
}

export const socketClient = new SocketClient();
export type { SocketStatus };
