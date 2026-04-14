import { prisma } from '../prisma/db';
import { ConnectedUsersStore } from '../store/connected-users.store';
import type { Sender } from '../types/chat-message.types';

class UserService {
  private connectedUsersStore = new ConnectedUsersStore();

  async getSenderById(userId: string): Promise<Sender | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    return {
      email: user.email,
      id: user.id,
      name: user.name,
    };
  }

  // Usuarios conectados
  getConnectedUsers(): Sender[] {
    return this.connectedUsersStore.getUsers();
  }

  addUser(user: Sender) {
    this.connectedUsersStore.addUser(user);
  }

  removeUser(userId: string) {
    this.connectedUsersStore.removeUser(userId);
  }
}

export const userService = new UserService();
