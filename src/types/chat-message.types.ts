export interface ChatMessage {
  id: string;
  groupId?: string;
  receiverId?: string;
  sender: Sender;
  content: string;
  createdAt: number;
}

export interface Sender {
  id: string;
  name: string;
  email: string;
}
