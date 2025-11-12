import { api } from '../client';

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
  // Get all settings
  getAll: async () => {
    const response = await api.get<SystemSettings>('/settings');
    return response.data;
  },

  // Update all settings
  updateAll: async (settings: SystemSettings) => {
    const response = await api.put<SystemSettings>('/settings', settings);
    return response.data;
  },

  // Reset to default
  reset: async () => {
    const response = await api.post<SystemSettings>('/settings/reset');
    return response.data;
  },

  // Reservation policy
  getReservationPolicy: async () => {
    const response = await api.get<ReservationPolicySettings>('/settings/reservation-policy');
    return response.data;
  },

  updateReservationPolicy: async (policy: ReservationPolicySettings) => {
    const response = await api.put<ReservationPolicySettings>('/settings/reservation-policy', policy);
    return response.data;
  },

  // Payment settings
  getPayment: async () => {
    const response = await api.get<PaymentSettings>('/settings/payment');
    return response.data;
  },

  updatePayment: async (payment: PaymentSettings) => {
    const response = await api.put<PaymentSettings>('/settings/payment', payment);
    return response.data;
  },

  // Notification settings
  getNotifications: async () => {
    const response = await api.get<NotificationSettings>('/settings/notifications');
    return response.data;
  },

  updateNotifications: async (notifications: NotificationSettings) => {
    const response = await api.put<NotificationSettings>('/settings/notifications', notifications);
    return response.data;
  },

  // Security settings
  getSecurity: async () => {
    const response = await api.get<SecuritySettings>('/settings/security');
    return response.data;
  },

  updateSecurity: async (security: SecuritySettings) => {
    const response = await api.put<SecuritySettings>('/settings/security', security);
    return response.data;
  },

  // Appearance settings
  updateAppearance: async (appearance: AppearanceSettings) => {
    const response = await api.put<AppearanceSettings>('/settings/appearance', appearance);
    return response.data;
  },

  // Integration settings
  updateIntegrations: async (integrations: IntegrationSettings) => {
    const response = await api.put<IntegrationSettings>('/settings/integrations', integrations);
    return response.data;
  },
};
