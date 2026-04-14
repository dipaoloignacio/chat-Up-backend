import { SERVER_CONFIG } from '../config/server-config';
import { prisma } from '../prisma/db';
import { chatMessageService } from '../services/chat-message.service';
import type { ServerMessage } from '../types';
import { createErrorMessage } from './error.handlers';

interface SendGroupArgs {
  content: string;
  senderId: string;
  groupId?: string;
}

export const handleSendGroupMessage = async (
  payload: SendGroupArgs
): Promise<ServerMessage> => {
  try {
    const { content, groupId, senderId } = payload;

    const groupMessage = await chatMessageService.sendGroupMessage(
      content,
      senderId,
      groupId
    );

    return {
      type: 'SEND_GROUP_MESSAGES_RESPONSE',
      payload: {
        groupId: groupMessage.groupId!,
        messages: [groupMessage],
      },
    };
  } catch (error) {
    console.log(error);
    return createErrorMessage(`Error sending group message`);
  }
};

export const handleGetGroupMessages = async (
  groupId?: string
): Promise<ServerMessage> => {
  if (!groupId) {
    const defaultGroup = await prisma.group.findFirst({
      where: {
        name: SERVER_CONFIG.defaultChannelName,
      },
    });

    if (!defaultGroup) {
      throw new Error('Default group not found');
    }

    groupId = defaultGroup.id;
  }

  try {
    const messages = await chatMessageService.getGroupMessages(groupId);

    return {
      type: 'SEND_GROUP_MESSAGES_RESPONSE',
      payload: {
        messages: messages,
        groupId: groupId,
      },
    };
  } catch (error) {
    return createErrorMessage(`Error getting group messages ${groupId}`);
  }
};
