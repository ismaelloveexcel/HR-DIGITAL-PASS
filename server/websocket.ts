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
  payload?: any;
  passCode?: string;
  linkId?: string;
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

    ws.send(JSON.stringify({ type: 'connected', data: { timestamp: Date.now() } }));
  });

  log('WebSocket server initialized on /ws', 'ws');
  return wss;
}

function handleMessage(client: WSClient, message: WSMessage) {
  const passCode = message.passCode || message.payload?.passCode;
  const linkId = message.linkId || message.payload?.linkId;

  switch (message.type) {
    case 'subscribe':
      if (passCode) {
        client.passCode = passCode;
      }
      if (linkId) {
        client.subscribedLinks.add(linkId);
      }
      log(`Client subscribed: passCode=${client.passCode}, links=${Array.from(client.subscribedLinks).join(',')}`, 'ws');
      break;

    case 'subscribe_slots':
      if (linkId) {
        client.subscribedLinks.add(linkId);
        log(`Client subscribed to slots: linkId=${linkId}`, 'ws');
      }
      break;

    case 'unsubscribe':
    case 'unsubscribe_slots':
      if (linkId) {
        client.subscribedLinks.delete(linkId);
        log(`Client unsubscribed from: linkId=${linkId}`, 'ws');
      }
      break;

    case 'ping':
      client.ws.send(JSON.stringify({ type: 'pong', data: { timestamp: Date.now() } }));
      break;

    default:
      log(`Unknown WebSocket message type: ${message.type}`, 'ws');
  }
}

export function broadcastSlotUpdate(linkId: string, slot: any) {
  const message = JSON.stringify({
    type: 'slot_update',
    linkId,
    data: slot,
    timestamp: Date.now(),
  });

  let sentCount = 0;
  clients.forEach((client) => {
    if (client.subscribedLinks.has(linkId) && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
      sentCount++;
    }
  });

  log(`Broadcast slot update for linkId=${linkId} to ${sentCount} subscribers`, 'ws');
}

export function broadcastSettingsUpdate(passCode: string, settings: any) {
  const message = JSON.stringify({
    type: 'settings_update',
    passCode,
    data: settings,
    timestamp: Date.now(),
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
    passCode,
    data: notification,
    timestamp: Date.now(),
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
    data: action,
    timestamp: Date.now(),
  });

  clients.forEach((client) => {
    if (client.passCode && affectedCodes.includes(client.passCode) && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });

  log(`Broadcast admin action to ${affectedCodes.length} affected codes`, 'ws');
}

export function broadcastToAll(type: string, data: any) {
  const message = JSON.stringify({ type, data, timestamp: Date.now() });

  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}
