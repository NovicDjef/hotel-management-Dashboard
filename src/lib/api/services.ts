import apiService from './client';
import { hotelId } from './client';

// ==================== TYPES ====================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: any[];
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== AUTHENTIFICATION ====================

export const authService = {
  staffLogin: async (credentials: { email: string; password: string }) => {
    const response = await apiService.post('/auth/staff/login', credentials);
    return response.data;
  },

  staffRegister: async (data: any) => {
    const response = await apiService.post('/auth/staff/register', data);
    return response.data;
  },

  guestRegister: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
  }) => {
    const response = await apiService.post('/auth/guest/register', data);
    return response.data;
  },

  requestOTP: async (email: string) => {
    const response = await apiService.post('/auth/guest/request-otp', { email });
    return response.data;
  },

  verifyOTP: async (email: string, otp: string) => {
    const response = await apiService.post('/auth/guest/verify-otp', { email, otp });
    return response.data;
  },

  logout: async () => {
    const response = await apiService.post('/auth/logout');
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiService.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiService.get('/auth/me');
    return response.data;
  },
};

// ==================== DASHBOARD ====================

export const dashboardService = {
  getStats: async () => {
    const response = await apiService.get('/reports/dashboard');
    return response.data;
  },
};

// ==================== RÉSERVATIONS ====================

export const reservationService = {
  getAll: async (params?: any) => {
    const response = await apiService.get('/reservations', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiService.get(`/reservations/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiService.post('/reservations/guest', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiService.put(`/reservations/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiService.delete(`/reservations/${id}`);
    return response.data;
  },

  checkIn: async (id: string) => {
    const response = await apiService.post(`/reservations/${id}/check-in`);
    return response.data;
  },

  checkOut: async (id: string) => {
    const response = await apiService.post(`/reservations/${id}/check-out`);
    return response.data;
  },

  confirm: async (id: string) => {
    const response = await apiService.post(`/reservations/${id}/confirm`);
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await apiService.post(`/reservations/${id}/cancel`);
    return response.data;
  },

  calculate: async (data: {
    roomType: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    hotelId?: string;
  }) => {
    const response = await apiService.post('/reservations/calculate', {
      ...data,
      hotelId: data.hotelId || hotelId,
    });
    return response.data;
  },

  confirmPayment: async (id: string, data: { paymentMethodId: string }) => {
    const response = await apiService.post(`/reservations/${id}/confirm-payment`, data);
    return response.data;
  },

  getStats: async () => {
    const response = await apiService.get('/reservations/stats');
    return response.data;
  },

  checkAvailability: async (data: {
    checkInDate: string;
    checkOutDate: string;
    hotelId?: string;
  }) => {
    const response = await apiService.get('/reservations/availability', {
      params: {
        ...data,
        hotelId: data.hotelId || hotelId,
      },
    });
    return response.data;
  },
};

// ==================== CHAMBRES ====================

export const roomService = {
  getAll: async (params?: any) => {
    const response = await apiService.get(`/room-types/hotels/${hotelId}`, { params });
    console.log('Response from getAll rooms:', response);
    return response.data;
  },

  getById: async (id: string, hotelIdParam?: string) => {
    const response = await apiService.get(`/rooms/${id}`, {
      params: { hotelId: hotelIdParam || hotelId },
    });
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiService.post('/rooms', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiService.put(`/rooms/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiService.delete(`/rooms/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await apiService.patch(`/rooms/${id}/status`, { status });
    return response.data;
  },

  getByFloor: async (floor: number, hotelIdParam?: string) => {
    const response = await apiService.get(`/rooms/floor/${floor}`, {
      params: { hotelId: hotelIdParam || hotelId },
    });
    return response.data;
  },

  checkAvailability: async (data: {
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
  }) => {
    const response = await apiService.post('/rooms/check-availability', data);
    return response.data;
  },

  getStats: async () => {
    const response = await apiService.get('/rooms/stats');
    return response.data;
  },

  getCleaningNeeded: async () => {
    const response = await apiService.get('/rooms/cleaning-needed');
    return response.data;
  },

  // Room Types
  getAllRoomTypes: (hotelIdParam?: string) => {
    const id = hotelIdParam || hotelId;
    return apiService.get(`/room-types/hotels/${id}`);
  },

  getRoomTypesStats: (hotelIdParam?: string) => {
    const id = hotelIdParam || hotelId;
    return apiService.get(`/room-types/hotels/${id}/stats`);
  },

  getRoomType: (roomType: string, hotelIdParam?: string) => {
    const id = hotelIdParam || hotelId;
    return apiService.get(`/room-types/hotels/${id}/${roomType}`);
  },

  // Vérifier disponibilité par date (avec décompte par type)
  checkAvailabilityByDate: async (params: {
    hotelId?: string;
    checkInDate: string;
    checkOutDate: string;
  }) => {
    const response = await apiService.get('/rooms/availability/by-date', {
      params: {
        hotelId: params.hotelId || hotelId,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
      },
    });
    return response.data;
  },
};

// ==================== CLIENTS (GUESTS) ====================

export const guestService = {
  getAll: async (params?: any) => {
    const response = await apiService.get('/guests', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiService.get(`/guests/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiService.post('/guests', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiService.put(`/guests/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiService.delete(`/guests/${id}`);
    return response.data;
  },

  toggleVIP: async (id: string) => {
    const response = await apiService.patch(`/guests/${id}/toggle-vip`);
    return response.data;
  },

  addLoyaltyPoints: async (id: string, points: number) => {
    const response = await apiService.post(`/guests/${id}/loyalty-points`, { points });
    return response.data;
  },

  getStats: async () => {
    const response = await apiService.get('/guests/stats');
    return response.data;
  },
};

// ==================== PERSONNEL (STAFF) ====================

export const staffService = {
  getAll: async (params?: any) => {
    const response = await apiService.get('/staff', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiService.get(`/staff/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiService.post('/staff', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiService.put(`/staff/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiService.delete(`/staff/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await apiService.get('/staff/stats');
    return response.data;
  },
};

// ==================== TÂCHES ====================

export const taskService = {
  getAll: async (params?: any) => {
    const response = await apiService.get('/tasks', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiService.get(`/tasks/${id}`);
    return response.data;
  },

  getMyTasks: async () => {
    const response = await apiService.get('/tasks/my-tasks');
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiService.post('/tasks', data);
    return response.data;
  },

  createCleaning: async (roomId: string) => {
    const response = await apiService.post('/tasks/cleaning', { roomId });
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiService.put(`/tasks/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiService.delete(`/tasks/${id}`);
    return response.data;
  },

  start: async (id: string) => {
    const response = await apiService.post(`/tasks/${id}/start`);
    return response.data;
  },

  complete: async (id: string, notes?: string) => {
    const response = await apiService.post(`/tasks/${id}/complete`, { notes });
    return response.data;
  },

  cancel: async (id: string, reason?: string) => {
    const response = await apiService.post(`/tasks/${id}/cancel`, { reason });
    return response.data;
  },

  getStats: async () => {
    const response = await apiService.get('/tasks/stats');
    return response.data;
  },
};

// ==================== SPA ====================

export const spaService = {
  // ==================== CATÉGORIES SPA ====================

  getAllCategories: async () => {
    const response = await apiService.get('/reservations/spa-categories');
    return response.data;
  },

  // ==================== SERVICES SPA ====================

  // Services (publiques)
  getAllServices: async (params?: any) => {
    const response = await apiService.get('/spa/services', { params });
    return response.data;
  },

  getServiceById: async (id: string) => {
    const response = await apiService.get(`/spa/services/${id}`);
    return response.data;
  },

  // Services (admin)
  createService: async (data: any) => {
    const response = await apiService.post('/spa/services', data);
    return response.data;
  },

  updateService: async (id: string, data: any) => {
    const response = await apiService.put(`/spa/services/${id}`, data);
    return response.data;
  },

  deleteService: async (id: string) => {
    const response = await apiService.delete(`/spa/services/${id}`);
    return response.data;
  },

  // ==================== FORFAITS SPA ====================

  // Forfaits (publiques)
  getAllPackages: async (params?: any) => {
    const response = await apiService.get('/spa/forfaits', { params });
    return response.data;
  },

  getPackageById: async (id: string) => {
    const response = await apiService.get(`/spa/forfaits/${id}`);
    return response.data;
  },

  // Forfaits (admin)
  createPackage: async (data: any) => {
    const response = await apiService.post('/spa/forfaits', data);
    return response.data;
  },

  updatePackage: async (id: string, data: any) => {
    const response = await apiService.put(`/spa/forfaits/${id}`, data);
    return response.data;
  },

  deletePackage: async (id: string) => {
    const response = await apiService.delete(`/spa/forfaits/${id}`);
    return response.data;
  },

  // ==================== RÉSERVATIONS SPA ====================

  getAllReservations: async (params?: any) => {
    const response = await apiService.get('/reservations/all-spa-reservations', { params });
    return response.data;
  },

  getReservationById: async (id: string) => {
    const response = await apiService.get(`/reservations/spa-reservations/${id}`);
    return response.data;
  },

  createReservation: async (data: any) => {
    const response = await apiService.post('/reservations/spa-reservations', data);
    return response.data;
  },

  updateReservation: async (id: string, data: any) => {
    const response = await apiService.put(`/reservations/spa-reservations/${id}`, data);
    return response.data;
  },

  cancelReservation: async (id: string) => {
    const response = await apiService.patch(`/spa/reservations/${id}/cancel`);
    return response.data;
  },

  deleteReservation: async (id: string) => {
    const response = await apiService.delete(`/spa/reservations/${id}`);
    return response.data;
  },

  // ==================== CERTIFICATS CADEAUX ====================

  // Certificats (publiques)
  getAvailableAmounts: async () => {
    const response = await apiService.get('/spa/certificats/amounts');
    return response.data;
  },

  // Certificats (admin)
  getAllCertificates: async (params?: any) => {
    const response = await apiService.get('/spa/certificats/amounts', { params });
    return response.data;
  },

  getCertificateByCode: async (code: string) => {
    const response = await apiService.get(`/spa/certificats/${code}`);
    return response.data;
  },

  createCertificate: async (data: any) => {
    const response = await apiService.post('/spa/certificats', data);
    return response.data;
  },

  validateCertificate: async (code: string) => {
    const response = await apiService.post('/spa/certificats/validate', { code });
    return response.data;
  },

  useCertificate: async (code: string, data?: any) => {
    const response = await apiService.post('/spa/certificats/use', { code, ...data });
    return response.data;
  },

  markCertificateAsPaid: async (code: string) => {
    const response = await apiService.patch(`/spa/certificats/${code}/mark-paid`);
    return response.data;
  },

  // ==================== STATISTIQUES ====================

  getStatistics: async (params?: any) => {
    const response = await apiService.get('/spa/statistics', { params });
    return response.data;
  },
};

// ==================== CHAT ====================

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
    const response = await apiService.get('/chat/conversations', { params: filters });
    return response.data;
  },

  // Get single conversation
  getConversation: async (id: string) => {
    const response = await apiService.get(`/chat/conversations/${id}`);
    return response.data;
  },

  // Get messages for a conversation
  getMessages: async (conversationId: string) => {
    const response = await apiService.get(`/chat/${conversationId}/messages`);
    return response.data;
  },

  // Send message (Staff)
  sendMessage: async (conversationId: string, message: string, senderName: string) => {
    const response = await apiService.post(`/chat/${conversationId}/messages`, {
      message,
      senderType: 'STAFF',
      senderName,
    });
    return response.data;
  },

  // Change conversation status
  updateStatus: async (id: string, status: 'OPEN' | 'CLOSED' | 'PENDING') => {
    const response = await apiService.patch(`/chat/conversations/${id}/status`, {
      status,
    });
    return response.data;
  },

  // Assign conversation to staff
  assignToStaff: async (id: string, staffId: string) => {
    const response = await apiService.patch(`/chat/conversations/${id}/assign`, {
      staffId,
    });
    return response.data;
  },

  // Mark conversation as read
  markAsRead: async (id: string) => {
    const response = await apiService.patch(`/chat/conversations/${id}/mark-read`);
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
    const response = await apiService.post('/chat/start', data);
    return response.data;
  },
};

// ==================== AVIS (REVIEWS) ====================

// Routes publiques pour les guests
export const guestReviewService = {
  getHotelReviews: async (hotelIdParam: string) => {
    const response = await apiService.get(`/guest-reviews/hotel/${hotelIdParam}`);
    return response.data;
  },

  getMyReviews: async () => {
    const response = await apiService.get('/guest-reviews/my-reviews');
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiService.post('/guest-reviews', data);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiService.get(`/guest-reviews/${id}`);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiService.put(`/guest-reviews/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiService.delete(`/guest-reviews/${id}`);
    return response.data;
  },

  markAsHelpful: async (id: string) => {
    const response = await apiService.post(`/guest-reviews/${id}/helpful`);
    return response.data;
  },
};

// Routes staff pour gérer les avis
export const reviewService = {
  getAll: async (params?: any) => {
    const response = await apiService.get('/reviews', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiService.get(`/reviews/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await apiService.get('/reviews/stats');
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiService.post('/reviews', data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiService.delete(`/reviews/${id}`);
    return response.data;
  },

  publish: async (id: string) => {
    const response = await apiService.post(`/reviews/${id}/publish`);
    return response.data;
  },

  verify: async (id: string) => {
    const response = await apiService.post(`/reviews/${id}/verify`);
    return response.data;
  },

  respond: async (id: string, response: string) => {
    const res = await apiService.post(`/reviews/${id}/respond`, { response });
    return res.data;
  },
};

// ==================== PAIEMENTS ====================

export const paymentService = {
  getAll: async (params?: any) => {
    const response = await apiService.get('/payments', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiService.get(`/payments/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiService.post('/payments', data);
    return response.data;
  },

  refund: async (id: string, data?: any) => {
    const response = await apiService.post(`/payments/${id}/refund`, data);
    return response.data;
  },

  getStats: async () => {
    const response = await apiService.get('/payments/stats');
    return response.data;
  },
};

// ==================== FACTURES ====================

export const invoiceService = {
  getAll: async (params?: any) => {
    const response = await apiService.get('/invoices', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiService.get(`/invoices/${id}`);
    return response.data;
  },

  generate: async (reservationId: string) => {
    const response = await apiService.post(`/invoices/generate/${reservationId}`);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiService.put(`/invoices/${id}`, data);
    return response.data;
  },

  send: async (id: string) => {
    const response = await apiService.post(`/invoices/${id}/send`);
    return response.data;
  },

  downloadPDF: async (id: string) => {
    const response = await apiService.get(`/invoices/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// ==================== UTILITAIRES ====================

export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  return apiService.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const sendContactMessage = (data: {
  nom: string;
  email: string;
  sujet: string;
  message: string;
}) => {
  return apiService.post('/contact', data);
};

// ==================== SETTINGS ====================

export interface HotelSettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  website?: string;
  description?: string;
  stars: string;
  logo?: string;
}

export interface ReservationPolicySettings {
  checkInTime: string;
  checkOutTime: string;
  minAdvanceBooking: number;
  maxAdvanceBooking: number;
  cancellationDeadline: number;
  requireDeposit: boolean;
  depositPercentage: number;
  autoConfirm: boolean;
}

export interface PaymentSettings {
  currency: string;
  taxRate: number;
  acceptCreditCard: boolean;
  acceptDebitCard: boolean;
  acceptCash: boolean;
  acceptPaypal: boolean;
  stripePublicKey?: string;
  stripeSecretKey?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  bookingConfirmation: boolean;
  paymentConfirmation: boolean;
  cancellationNotice: boolean;
  reminderBeforeCheckIn: boolean;
  reminderDays: number;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
}

export interface SecuritySettings {
  passwordMinLength: number;
  requireUppercase: boolean;
  requireNumber: boolean;
  requireSpecialChar: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  twoFactorAuth: boolean;
  ipWhitelist?: string;
}

export interface AppearanceSettings {
  defaultLanguage: string;
  dateFormat: string;
  timeFormat: string;
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  favicon?: string;
}

export interface IntegrationSettings {
  googleMapsApiKey?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  sendGridApiKey?: string;
  reservationWebhook?: string;
  paymentWebhook?: string;
}

export interface SystemSettings {
  hotel?: HotelSettings;
  reservationPolicy?: ReservationPolicySettings;
  payment?: PaymentSettings;
  notifications?: NotificationSettings;
  security?: SecuritySettings;
  appearance?: AppearanceSettings;
  integrations?: IntegrationSettings;
}

export const settingsService = {
  getAll: async () => {
    const response = await apiService.get('/settings');
    return response.data;
  },

  updateAll: async (settings: SystemSettings) => {
    const response = await apiService.put('/settings', settings);
    return response.data;
  },

  reset: async () => {
    const response = await apiService.post('/settings/reset');
    return response.data;
  },

  getReservationPolicy: async () => {
    const response = await apiService.get('/settings/reservation-policy');
    return response.data;
  },

  updateReservationPolicy: async (policy: ReservationPolicySettings) => {
    const response = await apiService.put('/settings/reservation-policy', policy);
    return response.data;
  },

  getPayment: async () => {
    const response = await apiService.get('/settings/payment');
    return response.data;
  },

  updatePayment: async (payment: PaymentSettings) => {
    const response = await apiService.put('/settings/payment', payment);
    return response.data;
  },

  getNotifications: async () => {
    const response = await apiService.get('/settings/notifications');
    return response.data;
  },

  updateNotifications: async (notifications: NotificationSettings) => {
    const response = await apiService.put('/settings/notifications', notifications);
    return response.data;
  },

  getSecurity: async () => {
    const response = await apiService.get('/settings/security');
    return response.data;
  },

  updateSecurity: async (security: SecuritySettings) => {
    const response = await apiService.put('/settings/security', security);
    return response.data;
  },

  updateAppearance: async (appearance: AppearanceSettings) => {
    const response = await apiService.put('/settings/appearance', appearance);
    return response.data;
  },

  updateIntegrations: async (integrations: IntegrationSettings) => {
    const response = await apiService.put('/settings/integrations', integrations);
    return response.data;
  },
};

// Export tout
export default {
  auth: authService,
  dashboard: dashboardService,
  reservations: reservationService,
  rooms: roomService,
  guests: guestService,
  staff: staffService,
  tasks: taskService,
  spa: spaService,
  chat: chatService,
  settings: settingsService,
  reviews: reviewService,
  payments: paymentService,
  invoices: invoiceService,
  uploadImage,
  sendContactMessage,
};
