import { api } from '../client';

export interface ChatMessage {
  id: string;
  conversationId: string;
  message: string;
  senderType: 'GUEST' | 'STAFF';
  senderName: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  hotelId: string;
  guestId?: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  status: 'OPEN' | 'CLOSED' | 'PENDING';
  assignedToId?: string;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
}

export interface ConversationFilters {
  status?: string;
  assignedToId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const chatService = {
  // Get all conversations (Staff)
  getConversations: async (filters?: ConversationFilters) => {
    const response = await api.get<ChatConversation[]>('/chat/conversations', filters);
    return response;
  },

  // Get single conversation
  getConversation: async (id: string) => {
    const response = await api.get<ChatConversation>(`/chat/conversations/${id}`);
    return response.data;
  },

  // Get messages for a conversation
  getMessages: async (conversationId: string) => {
    const response = await api.get<{ messages: ChatMessage[] }>(`/chat/${conversationId}/messages`);
    return response.data;
  },

  // Send message (Staff)
  sendMessage: async (conversationId: string, message: string, senderName: string) => {
    const response = await api.post<ChatMessage>(`/chat/${conversationId}/messages`, {
      message,
      senderType: 'STAFF',
      senderName,
    });
    return response.data;
  },

  // Change conversation status
  updateStatus: async (id: string, status: 'OPEN' | 'CLOSED' | 'PENDING') => {
    const response = await api.patch<ChatConversation>(`/chat/conversations/${id}/status`, {
      status,
    });
    return response.data;
  },

  // Assign conversation to staff
  assignToStaff: async (id: string, staffId: string) => {
    const response = await api.patch<ChatConversation>(`/chat/conversations/${id}/assign`, {
      staffId,
    });
    return response.data;
  },

  // Mark conversation as read
  markAsRead: async (id: string) => {
    const response = await api.patch<ChatConversation>(`/chat/conversations/${id}/mark-read`);
    return response.data;
  },

  // Start new conversation (Public - for widget)
  startConversation: async (data: {
    hotelId: string;
    guestName: string;
    guestEmail?: string;
    guestPhone?: string;
    initialMessage: string;
  }) => {
    const response = await api.post<ChatConversation>('/chat/start', data);
    return response.data;
  },
};
