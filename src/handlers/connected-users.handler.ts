import { userService } from '../services/user.service';
import type { ServerMessage } from '../types';
import type { Sender } from '../types/chat-message.types';

export const handleAddConnectedUser = (user: Sender): ServerMessage => {
  userService.addUser(user);

  const users = userService.getConnectedUsers();

  return {
    type: 'SEND_CONNECTED_USERS_RESPONSE',
    payload: { users },
  };
};

export const handleRemoveConnectedUser = (userId: string): ServerMessage => {
  userService.removeUser(userId);

  const users = userService.getConnectedUsers();

  return {
    type: 'SEND_CONNECTED_USERS_RESPONSE',
    payload: { users },
  };
};

export const handleGetConnectedUsers = (): ServerMessage => {
  const users = userService.getConnectedUsers();
  return {
    type: 'SEND_CONNECTED_USERS_RESPONSE',
    payload: { users },
  };
};
