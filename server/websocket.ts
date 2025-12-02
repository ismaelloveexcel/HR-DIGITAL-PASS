import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { log } from './index';

interface WSClient {
  ws: WebSocket;
  passCode?: string;
  subscribedLinks: Set<string>;
}

interface WSMessage {
  type: string;
  payload: any;
}

const clients: Map<WebSocket, WSClient> = new Map();

export function setupWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    const client: WSClient = {
      ws,
      subscribedLinks: new Set(),
    };
    clients.set(ws, client);
    log('WebSocket client connected', 'ws');

    ws.on('message', (data: Buffer) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());
        handleMessage(client, message);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      log('WebSocket client disconnected', 'ws');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });

    ws.send(JSON.stringify({ type: 'connected', payload: { timestamp: Date.now() } }));
  });

  log('WebSocket server initialized on /ws', 'ws');
  return wss;
}

function handleMessage(client: WSClient, message: WSMessage) {
  switch (message.type) {
    case 'subscribe':
      if (message.payload.passCode) {
        client.passCode = message.payload.passCode;
      }
      if (message.payload.linkId) {
        client.subscribedLinks.add(message.payload.linkId);
      }
      log(`Client subscribed: passCode=${client.passCode}, links=${Array.from(client.subscribedLinks).join(',')}`, 'ws');
      break;

    case 'unsubscribe':
      if (message.payload.linkId) {
        client.subscribedLinks.delete(message.payload.linkId);
      }
      break;

    case 'ping':
      client.ws.send(JSON.stringify({ type: 'pong', payload: { timestamp: Date.now() } }));
      break;

    default:
      log(`Unknown WebSocket message type: ${message.type}`, 'ws');
  }
}

export function broadcastSlotUpdate(linkId: string, slot: any) {
  const message = JSON.stringify({
    type: 'slot_update',
    payload: { linkId, slot, timestamp: Date.now() },
  });

  clients.forEach((client) => {
    if (client.subscribedLinks.has(linkId) && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });

  log(`Broadcast slot update for linkId=${linkId} to ${clients.size} clients`, 'ws');
}

export function broadcastSettingsUpdate(passCode: string, settings: any) {
  const message = JSON.stringify({
    type: 'settings_update',
    payload: { passCode, settings, timestamp: Date.now() },
  });

  clients.forEach((client) => {
    if (client.passCode === passCode && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}

export function broadcastNotification(passCode: string, notification: any) {
  const message = JSON.stringify({
    type: 'notification',
    payload: { passCode, notification, timestamp: Date.now() },
  });

  clients.forEach((client) => {
    if (client.passCode === passCode && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}

export function broadcastAdminAction(action: any, affectedCodes: string[]) {
  const message = JSON.stringify({
    type: 'admin_action',
    payload: { action, timestamp: Date.now() },
  });

  clients.forEach((client) => {
    if (client.passCode && affectedCodes.includes(client.passCode) && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });

  log(`Broadcast admin action to ${affectedCodes.length} affected codes`, 'ws');
}

export function broadcastToAll(type: string, payload: any) {
  const message = JSON.stringify({ type, payload, timestamp: Date.now() });

  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}
