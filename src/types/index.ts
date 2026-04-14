import type { ChatMessage, Sender } from './chat-message.types';

//! Este es el objeto que se almacena por cada cliente
export interface WebSocketData {
  clientId: string;
  userId: string;
  name: string;
  email: string;
}

// Server Messages
export type ServerMessage =
  | {
      type: 'WELCOME';
      payload: {
        userId: string;
        clientId: string;
        name: string;
        email: string;
      };
    }
  | {
      type: 'ERROR';
      payload: { error: string };
    }
  | {
      type: 'SEND_GROUP_MESSAGES_RESPONSE';
      payload: { groupId: string; messages: ChatMessage[] };
    }
  | {
      type: 'SEND_DIRECT_MESSAGES_RESPONSE';
      payload: { receiverId: string; messages: ChatMessage[] };
    }
  | {
      type: 'SEND_CONNECTED_USERS_RESPONSE';
      payload: { users: Sender[] };
    };

// Client Messages
export type ClientMessage =
  | {
      type: 'SEND_GROUP_MESSAGE';
      payload: { content: string; groupId: string };
    }
  | {
      type: 'SEND_DIRECT_MESSAGE';
      payload: { content: string; receiverId: string };
    }
  | {
      type: 'GET_GROUP_MESSAGES';
      payload: { groupId: string };
    }
  | {
      type: 'GET_DIRECT_MESSAGES';
      payload: { receiverId: string };
    };

export interface HandleResult {
  personal: ServerMessage[];
  broadcast: ServerMessage[];
  broadcastTo: string;
}
