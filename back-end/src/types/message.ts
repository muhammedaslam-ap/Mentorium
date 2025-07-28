export interface MessageReaction {
  userId: string;
  emoji: string;
}


export interface Message {
  _id?: string;
  privateChatId: string;
  sender: string;
  content?: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  imageUrl?: string;
  reactions?: MessageReaction[];
}
