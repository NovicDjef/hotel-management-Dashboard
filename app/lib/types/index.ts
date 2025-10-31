// ============================================
// ENUMS & CONSTANTS
// ============================================

export enum StaffRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  RECEPTIONIST = 'RECEPTIONIST',
  HOUSEKEEPER = 'HOUSEKEEPER',
  MAINTENANCE = 'MAINTENANCE',
  ACCOUNTANT = 'ACCOUNTANT',
  MANAGER = 'MANAGER'
}

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  CLEANING = 'CLEANING',
  MAINTENANCE = 'MAINTENANCE',
  RESERVED = 'RESERVED'
}

export enum RoomType {
  STANDARD = 'STANDARD',
  DELUXE = 'DELUXE',
  SUITE = 'SUITE',
  EXECUTIVE = 'EXECUTIVE'
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  CARD = 'CARD',
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER'
}

export enum TaskType {
  CLEANING = 'CLEANING',
  MAINTENANCE = 'MAINTENANCE',
  INSPECTION = 'INSPECTION',
  OTHER = 'OTHER'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: any[];
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// AUTHENTICATION TYPES
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
  phone?: string;
  role?: StaffRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
}

// ============================================
// HOTEL TYPES
// ============================================

export interface Hotel {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  rating?: number;
  amenities?: string[];
  images?: string[];
  checkInTime: string;
  checkOutTime: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// ROOM TYPES
// ============================================

export interface RoomTypeInventory {
  id: string;
  hotelId: string;
  type: RoomType;
  name: string;
  description?: string;
  basePrice: number;
  capacity: number;
  amenities: string[];
  images?: string[];
  totalRooms: number;
  availableRooms: number;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  hotelId: string;
  roomNumber: string;
  type: RoomType;
  floor: number;
  status: RoomStatus;
  price: number;
  capacity: number;
  amenities: string[];
  images?: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomStats {
  total: number;
  available: number;
  occupied: number;
  cleaning: number;
  maintenance: number;
  reserved: number;
  occupancyRate: number;
}

// ============================================
// RESERVATION TYPES
// ============================================

export interface Reservation {
  id: string;
  hotelId: string;
  guestId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  status: ReservationStatus;
  totalAmount: number;
  paidAmount: number;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  guest?: Guest;
  room?: Room;
  payments?: Payment[];
}

export interface ReservationCalculation {
  nights: number;
  basePrice: number;
  taxes: number;
  serviceFees: number;
  totalAmount: number;
  breakdown: {
    label: string;
    amount: number;
  }[];
}

export interface ReservationStats {
  total: number;
  pending: number;
  confirmed: number;
  checkedIn: number;
  checkedOut: number;
  cancelled: number;
  revenue: number;
  averageStayDuration: number;
}

// ============================================
// GUEST TYPES
// ============================================

export interface Guest {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
  isVIP: boolean;
  loyaltyPoints: number;
  preferences?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  reservations?: Reservation[];
}

export interface GuestStats {
  total: number;
  vip: number;
  newThisMonth: number;
  repeatGuests: number;
}

// ============================================
// STAFF TYPES
// ============================================

export interface Staff {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  phone?: string;
  department?: string;
  hireDate: string;
  salary?: number;
  isActive: boolean;
  avatar?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StaffStats {
  total: number;
  active: number;
  byRole: Record<StaffRole, number>;
  byDepartment: Record<string, number>;
}

// ============================================
// TASK TYPES
// ============================================

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  assignedToId?: string;
  roomId?: string;
  dueDate?: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: Staff;
  room?: Room;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  byType: Record<TaskType, number>;
  byPriority: Record<TaskPriority, number>;
}

// ============================================
// SPA TYPES
// ============================================

export interface SpaService {
  id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  price: number;
  category: string;
  isActive: boolean;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SpaPackage {
  id: string;
  name: string;
  description?: string;
  services: string[]; // service IDs
  price: number;
  discount?: number;
  isActive: boolean;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SpaReservation {
  id: string;
  guestId: string;
  serviceId?: string;
  packageId?: string;
  date: string;
  time: string;
  duration: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  guest?: Guest;
  service?: SpaService;
  package?: SpaPackage;
}

export interface SpaCertificate {
  code: string;
  amount: number;
  purchasedBy: string;
  purchasedFor?: string;
  isPaid: boolean;
  isUsed: boolean;
  usedAt?: string;
  usedBy?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpaStats {
  totalRevenue: number;
  totalReservations: number;
  activeServices: number;
  certificatesSold: number;
  averageServicePrice: number;
}

// ============================================
// PAYMENT TYPES
// ============================================

export interface Payment {
  id: string;
  reservationId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  transactionId?: string;
  paidAt?: string;
  refundedAt?: string;
  refundAmount?: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  reservation?: Reservation;
}

export interface PaymentStats {
  totalRevenue: number;
  totalPaid: number;
  totalPending: number;
  totalRefunded: number;
  byMethod: Record<PaymentMethod, number>;
  revenueByMonth: {
    month: string;
    revenue: number;
  }[];
}

// ============================================
// INVOICE TYPES
// ============================================

export interface Invoice {
  id: string;
  invoiceNumber: string;
  reservationId: string;
  guestId: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  guest?: Guest;
  reservation?: Reservation;
}

// ============================================
// REVIEW TYPES
// ============================================

export interface Review {
  id: string;
  hotelId: string;
  guestId: string;
  reservationId?: string;
  rating: number;
  title?: string;
  comment?: string;
  isPublished: boolean;
  isVerified: boolean;
  helpfulCount: number;
  response?: string;
  respondedAt?: string;
  respondedBy?: string;
  createdAt: string;
  updatedAt: string;
  guest?: Guest;
}

export interface ReviewStats {
  total: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  verifiedReviews: number;
  publishedReviews: number;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  link?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  readAt?: string;
}

// ============================================
// INVENTORY TYPES
// ============================================

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  price: number;
  supplier?: string;
  location?: string;
  lastRestocked?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStats {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
}

// ============================================
// SERVICE TYPES (BAR & RESTAURANT)
// ============================================

export interface Service {
  id: string;
  name: string;
  description?: string;
  type: 'BAR' | 'RESTAURANT' | 'ROOM_SERVICE';
  price: number;
  isAvailable: boolean;
  category?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceOrder {
  id: string;
  guestId: string;
  roomId?: string;
  serviceId: string;
  quantity: number;
  status: 'PENDING' | 'PREPARING' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  notes?: string;
  orderedAt: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  guest?: Guest;
  service?: Service;
}

// ============================================
// REPORT TYPES
// ============================================

export interface Report {
  id: string;
  title: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  startDate: string;
  endDate: string;
  generatedBy: string;
  data: Record<string, any>;
  fileUrl?: string;
  createdAt: string;
}

export interface DashboardStats {
  todayRevenue: number;
  monthRevenue: number;
  occupancyRate: number;
  totalReservations: number;
  pendingTasks: number;
  newGuests: number;
  checkInsToday: number;
  checkOutsToday: number;
  revenueByMonth: {
    month: string;
    revenue: number;
  }[];
  reservationsByStatus: {
    status: string;
    count: number;
  }[];
  roomsByStatus: {
    status: string;
    count: number;
  }[];
  topRooms: {
    roomNumber: string;
    bookings: number;
  }[];
}
