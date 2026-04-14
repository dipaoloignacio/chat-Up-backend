import type { Sender } from '../types/chat-message.types';

export class ConnectedUsersStore {
  private connectedUsers = new Map<string, Sender>();

  getUsers(): Sender[] {
    return Array.from(this.connectedUsers.values());
  }

  addUser(user: Sender) {
    this.connectedUsers.set(user.id, user);
  }

  removeUser(userId: string) {
    this.connectedUsers.delete(userId);
  }
}
