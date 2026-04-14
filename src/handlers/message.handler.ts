import { SERVER_CONFIG } from '../config/server-config';
import { messageSchema } from '../schemas/websocket-message.schema';
import type { HandleResult, WebSocketData } from '../types';
import { handleDirectMessage, handleGetDirectMessages } from './direct-messages.handlers';
import { createErrorResponse } from './error.handlers';
import { handleGetGroupMessages, handleSendGroupMessage } from './group-message.handlers';

//! General Handler o controlador general
export const handleMessage = async (
  message: string,
  webSocketData: WebSocketData
): Promise<HandleResult> => {
  try {
    const jsonData = JSON.parse(message);
    const parsedResult = messageSchema.safeParse(jsonData);

    if (!parsedResult.success) {
      console.log(parsedResult.error);
      const errorMessage = parsedResult.error.issues
        .map((issue) => issue.message)
        .join(', ');

      return createErrorResponse(`Validation error ${errorMessage}`);
    }

    const { type, payload } = parsedResult.data;

    switch (type) {
      case 'SEND_GROUP_MESSAGE':
        const groupMessage = await handleSendGroupMessage({
          content: payload.content,
          senderId: webSocketData.userId,
          groupId: payload.groupId,
        });
        return {
          broadcast: [groupMessage],
          personal: [groupMessage],
          broadcastTo: payload.groupId || SERVER_CONFIG.defaultChannelName,
        };
      case 'GET_DIRECT_MESSAGES':
        const directMessages = await handleGetDirectMessages(
          payload.receiverId,
          webSocketData.userId
        );
        return {
          personal: [directMessages],
          broadcast: [],
          broadcastTo: webSocketData.userId,
        };
      case 'SEND_DIRECT_MESSAGE':
        const directMessage = await handleDirectMessage({
          content: payload.content,
          receiverId: payload.receiverId,
          senderId: webSocketData.userId,
        });
        return {
          personal: [directMessage],
          broadcast: [directMessage],
          broadcastTo: payload.receiverId,
        };
      case 'GET_GROUP_MESSAGES':
        const groupMessages = await handleGetGroupMessages(payload.groupId);
        return {
          personal: [groupMessages],
          broadcast: [],
          broadcastTo: webSocketData.userId,
        };
      default:
        return createErrorResponse(`Type message not implemented: ${type}`);
    }
  } catch (error) {
    console.log(error);
    return createErrorResponse(
      `Validation error - Message is not a JSON Object`
    );
  }
};
