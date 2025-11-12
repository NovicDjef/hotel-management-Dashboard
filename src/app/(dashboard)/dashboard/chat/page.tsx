'use client';

import React, { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Select,
  Badge,
  Input,
} from '@/components/ui';
import {
  MessageSquare,
  Send,
  Search,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  UserCog,
} from 'lucide-react';
import { chatService, staffService, type ChatConversation, type ChatMessage } from '@/lib/api/services';
import { useClientDate } from '@/hooks/useClientDate';

const getStatusBadge = (status: string) => {
  const variants = {
    OPEN: 'success',
    PENDING: 'warning',
    CLOSED: 'gray',
  } as const;

  const labels = {
    OPEN: 'Ouvert',
    PENDING: 'En attente',
    CLOSED: 'Fermé',
  };

  return (
    <Badge variant={variants[status as keyof typeof variants] || 'default'} size="sm">
      {labels[status as keyof typeof labels] || status}
    </Badge>
  );
};

export default function ChatPage() {
  const { formatDate } = useClientDate();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState({
    status: '',
    assignedToId: '',
    search: '',
  });

  useEffect(() => {
    loadConversations();
    loadStaffMembers();
  }, [filters]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      markAsRead(selectedConversation.id);

      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        loadMessages(selectedConversation.id);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await chatService.getConversations(filters);
      setConversations(response.data || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStaffMembers = async () => {
    try {
      const response = await staffService.getAll({ page: 1, limit: 100 });
      setStaffMembers(response.data || []);
    } catch (error) {
      console.error('Failed to load staff members:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await chatService.getMessages(conversationId);
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      await chatService.markAsRead(conversationId);
      loadConversations();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setIsSending(true);
      const senderName = 'Support'; // TODO: Get from logged in user
      await chatService.sendMessage(selectedConversation.id, newMessage, senderName);
      setNewMessage('');
      await loadMessages(selectedConversation.id);
      await loadConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setIsSending(false);
    }
  };

  const handleChangeStatus = async (conversationId: string, status: 'OPEN' | 'CLOSED' | 'PENDING') => {
    try {
      await chatService.updateStatus(conversationId, status);
      loadConversations();
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation({ ...selectedConversation, status });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleAssignStaff = async (conversationId: string, staffId: string) => {
    try {
      await chatService.assignToStaff(conversationId, staffId);
      loadConversations();
    } catch (error) {
      console.error('Failed to assign staff:', error);
    }
  };

  const unreadCount = conversations.filter(c => c.unreadCount && c.unreadCount > 0).length;
  const openCount = conversations.filter(c => c.status === 'OPEN').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Chat Support
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérer les conversations avec les clients
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Conversations actives</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{openCount}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Non lus</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{unreadCount}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{conversations.length}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                options={[
                  { value: '', label: 'Tous les statuts' },
                  { value: 'OPEN', label: 'Ouvert' },
                  { value: 'PENDING', label: 'En attente' },
                  { value: 'CLOSED', label: 'Fermé' },
                ]}
              />

              <Select
                value={filters.assignedToId}
                onChange={(e) => setFilters({ ...filters, assignedToId: e.target.value })}
                options={[
                  { value: '', label: 'Tous les agents' },
                  ...staffMembers.map((staff) => ({
                    value: staff.id,
                    label: `${staff.firstName} ${staff.lastName}`,
                  })),
                ]}
              />
            </div>
          </CardBody>
        </Card>

        {/* Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Conversations ({conversations.length})
              </h3>
            </CardHeader>
            <CardBody className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Aucune conversation</p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {conversation.guestName}
                            </p>
                            {conversation.unreadCount && conversation.unreadCount > 0 && (
                              <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {conversation.guestEmail || conversation.guestPhone}
                          </p>
                        </div>
                        {getStatusBadge(conversation.status)}
                      </div>

                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
                          {conversation.lastMessage}
                        </p>
                      )}

                      {conversation.assignedTo && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <UserCog className="w-3 h-3" />
                          <span>
                            {conversation.assignedTo.firstName} {conversation.assignedTo.lastName}
                          </span>
                        </div>
                      )}

                      {conversation.lastMessageAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(conversation.lastMessageAt, 'PPp')}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {selectedConversation.guestName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedConversation.guestEmail || selectedConversation.guestPhone}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedConversation.assignedToId || ''}
                        onChange={(e) =>
                          handleAssignStaff(selectedConversation.id, e.target.value)
                        }
                        options={[
                          { value: '', label: 'Non assigné' },
                          ...staffMembers.map((staff) => ({
                            value: staff.id,
                            label: `${staff.firstName} ${staff.lastName}`,
                          })),
                        ]}
                      />
                      <Select
                        value={selectedConversation.status}
                        onChange={(e) =>
                          handleChangeStatus(
                            selectedConversation.id,
                            e.target.value as 'OPEN' | 'CLOSED' | 'PENDING'
                          )
                        }
                        options={[
                          { value: 'OPEN', label: 'Ouvert' },
                          { value: 'PENDING', label: 'En attente' },
                          { value: 'CLOSED', label: 'Fermé' },
                        ]}
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardBody className="p-0">
                  {/* Messages */}
                  <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderType === 'STAFF' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.senderType === 'STAFF'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-semibold opacity-80">
                              {message.senderName}
                            </p>
                            <p className="text-xs opacity-70">
                              {formatDate(message.createdAt, 'p')}
                            </p>
                          </div>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Tapez votre message..."
                        disabled={isSending}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                      />
                      <Button
                        type="submit"
                        disabled={isSending || !newMessage.trim()}
                        leftIcon={<Send className="w-4 h-4" />}
                      >
                        Envoyer
                      </Button>
                    </form>
                  </div>
                </CardBody>
              </>
            ) : (
              <CardBody>
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Sélectionnez une conversation pour commencer
                  </p>
                </div>
              </CardBody>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
