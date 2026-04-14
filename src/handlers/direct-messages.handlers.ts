import { chatMessageService } from '../services/chat-message.service';
import { userService } from '../services/user.service';
import type { ServerMessage } from '../types';
import { createErrorMessage } from './error.handlers';

export const handleGetDirectMessages = async (
  receiverId: string,
  senderId: string
): Promise<ServerMessage> => {
  const receiverUser = await userService.getSenderById(receiverId);

  if (!receiverUser) {
    return createErrorMessage(`Receiver user not found: ${receiverId}`);
  }

  try {
    const messages = await chatMessageService.getDirectMessages(
      receiverId,
      senderId
    );

    return {
      type: 'SEND_DIRECT_MESSAGES_RESPONSE',
      payload: {
        messages,
        receiverId,
      },
    };
  } catch (error) {
    return createErrorMessage(`Error getting direct messages`);
  }
};

interface SendDirectMessageArgs {
  content: string;
  senderId: string;
  receiverId: string;
}

export const handleDirectMessage = async (
  args: SendDirectMessageArgs
): Promise<ServerMessage> => {
  const { content, receiverId, senderId } = args;

  try {
    const directMessage = await chatMessageService.sendDirectMessage(
      content,
      senderId,
      receiverId
    );

    return {
      type: 'SEND_DIRECT_MESSAGES_RESPONSE',
      payload: {
        receiverId,
        messages: [directMessage],
      },
    };
  } catch (error) {
    return createErrorMessage(
      `Error sending a direct message to ${receiverId}`
    );
  }
};
