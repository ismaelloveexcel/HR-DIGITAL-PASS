import { useEffect, useRef, useCallback, useState } from 'react';

type MessageType = 'slot_update' | 'settings_update' | 'notification' | 'admin_action';

interface WebSocketMessage {
  type: MessageType;
  data: any;
  linkId?: string;
  passCode?: string;
}

type MessageHandler = (message: WebSocketMessage) => void;

const WS_RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

export function useWebSocket(passCode?: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Map<MessageType, Set<MessageHandler>>>(new Map());
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws`;
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(getWebSocketUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        if (passCode) {
          ws.send(JSON.stringify({
            type: 'subscribe',
            passCode
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);

          const handlers = handlersRef.current.get(message.type);
          if (handlers) {
            handlers.forEach(handler => handler(message));
          }
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('[WebSocket] Disconnected', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          console.log(`[WebSocket] Reconnecting (attempt ${reconnectAttemptsRef.current})...`);
          reconnectTimeoutRef.current = setTimeout(connect, WS_RECONNECT_DELAY);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
      };

    } catch (error) {
      console.error('[WebSocket] Failed to connect:', error);
    }
  }, [getWebSocketUrl, passCode]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const subscribe = useCallback((type: MessageType, handler: MessageHandler) => {
    if (!handlersRef.current.has(type)) {
      handlersRef.current.set(type, new Set());
    }
    handlersRef.current.get(type)!.add(handler);

    return () => {
      handlersRef.current.get(type)?.delete(handler);
    };
  }, []);

  const subscribeToSlots = useCallback((linkId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe_slots',
        linkId
      }));
    }
  }, []);

  const unsubscribeFromSlots = useCallback((linkId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'unsubscribe_slots',
        linkId
      }));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  useEffect(() => {
    if (isConnected && passCode && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        passCode
      }));
    }
  }, [isConnected, passCode]);

  return {
    isConnected,
    lastMessage,
    subscribe,
    subscribeToSlots,
    unsubscribeFromSlots,
    connect,
    disconnect,
  };
}

export function useSlotSync(linkId: string, onSlotUpdate: (slot: any) => void) {
  const { isConnected, subscribe, subscribeToSlots, unsubscribeFromSlots } = useWebSocket();

  useEffect(() => {
    if (isConnected && linkId) {
      subscribeToSlots(linkId);
      
      const unsubscribe = subscribe('slot_update', (message) => {
        if (message.linkId === linkId) {
          onSlotUpdate(message.data);
        }
      });

      return () => {
        unsubscribeFromSlots(linkId);
        unsubscribe();
      };
    }
  }, [isConnected, linkId, subscribeToSlots, unsubscribeFromSlots, subscribe, onSlotUpdate]);

  return { isConnected };
}

export function useNotificationSync(passCode: string, onNotification: (notification: any) => void) {
  const { isConnected, subscribe } = useWebSocket(passCode);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (isConnected && passCode) {
      const unsubscribe = subscribe('notification', (message) => {
        if (message.passCode === passCode) {
          setNotifications(prev => [message.data, ...prev]);
          onNotification(message.data);
        }
      });

      return unsubscribe;
    }
  }, [isConnected, passCode, subscribe, onNotification]);

  return { isConnected, notifications };
}

export function useSettingsSync(passCode: string, onSettingsUpdate: (settings: any) => void) {
  const { isConnected, subscribe } = useWebSocket(passCode);

  useEffect(() => {
    if (isConnected && passCode) {
      const unsubscribe = subscribe('settings_update', (message) => {
        if (message.passCode === passCode) {
          onSettingsUpdate(message.data);
        }
      });

      return unsubscribe;
    }
  }, [isConnected, passCode, subscribe, onSettingsUpdate]);

  return { isConnected };
}
