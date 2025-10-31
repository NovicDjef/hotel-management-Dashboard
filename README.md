# 🏨 Hotel Admin Dashboard

A comprehensive hotel management system built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4. This dashboard provides full functionality for managing hotel operations including reservations, rooms, guests, staff, tasks, and more.

## ✨ Features

### Core Functionality
- 🔐 **Authentication System** - Staff login with JWT tokens and auto-refresh
- 📊 **Dashboard Overview** - Real-time statistics, charts, and KPIs
- 🛏️ **Room Management** - Manage rooms, types, status, and availability
- 📅 **Reservation System** - Full booking lifecycle (pending → confirmed → checked-in → checked-out)
- 👥 **Guest Management** - Track guests, VIP status, and loyalty points
- 👔 **Staff Management** - Manage employees with role-based permissions
- 📋 **Task Management** - Assign and track cleaning & maintenance tasks
- 💆 **Spa Services** - Manage spa services, packages, and reservations (Coming Soon)
- 💳 **Payments** - Handle payments, invoices, and financial transactions (Coming Soon)
- 📈 **Reports** - Generate detailed analytics and reports (Coming Soon)
- 🔔 **Notifications** - Real-time notification system

### Technical Features
- ⚡ **Next.js 16** with App Router
- 🎨 **Tailwind CSS v4** with dark mode support
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🔄 **Real-time Updates** - Automatic data refresh
- 🎯 **Type Safety** - Full TypeScript coverage
- 🎭 **State Management** - Zustand for global state
- 📡 **API Integration** - Axios with automatic token refresh
- 🛡️ **Protected Routes** - Middleware-based authentication
- 🎨 **UI Components** - Reusable, accessible components

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Backend API running on `http://localhost:5001` (or configured in `.env.local`)

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_APP_NAME="Hotel Admin Dashboard"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

3. **Run the development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Default Credentials

For testing purposes, use:
- **Email**: `admin@hotel.com`
- **Password**: `password123`

*(These are demo credentials - replace with actual ones from your backend)*

## 📁 Project Structure

```
hotel-admin-dashboard/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── (auth)/              # Authentication pages
│   │   │   └── login/           # Login page
│   │   └── (dashboard)/         # Protected dashboard pages
│   │       └── dashboard/       # Main dashboard
│   │           ├── page.tsx     # Dashboard home
│   │           ├── reservations/
│   │           ├── rooms/
│   │           ├── guests/
│   │           ├── staff/
│   │           ├── tasks/
│   │           ├── spa/
│   │           ├── payments/
│   │           ├── reports/
│   │           ├── notifications/
│   │           └── settings/
│   │
│   ├── components/              # React components
│   │   ├── layouts/             # Layout components
│   │   └── ui/                  # Reusable UI components
│   │
│   ├── lib/                     # Utilities and libraries
│   │   ├── api/                 # API client and services
│   │   └── types/               # TypeScript type definitions
│   │
│   ├── stores/                  # Zustand state management
│   └── middleware.ts            # Next.js middleware for auth
│
├── public/                      # Static assets
├── .env.local                   # Environment variables (gitignored)
└── .env.example                 # Example environment variables
```

## 🎨 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 🔌 API Integration

### Base URL
```
http://localhost:5001
```

### Authentication Flow
1. User logs in → Receives access & refresh tokens
2. Tokens stored in localStorage
3. Access token sent with every API request
4. Automatic token refresh on 401 errors
5. Redirect to login if refresh fails

## 🎯 Key Features

### Dashboard Statistics
- Real-time revenue tracking
- Occupancy rate calculation
- Reservation status breakdown
- Room status visualization
- Interactive charts using Recharts

### Reservation Management
- Full CRUD operations
- Check-in/Check-out functionality
- Status tracking
- Payment integration

### Room Management
- Room inventory management
- Real-time status updates
- Floor-based organization
- Price management

### Guest Management
- Guest profiles
- VIP status toggle
- Loyalty points system
- Reservation history

### Staff Management
- Employee profiles
- Role-based access control
- Department organization

### Task Management
- Create cleaning and maintenance tasks
- Assign to staff members
- Priority levels
- Status tracking

## 🔐 Role-Based Permissions

- **SUPER_ADMIN**: Full system access
- **ADMIN**: Hotel operations management
- **RECEPTIONIST**: Front desk operations
- **HOUSEKEEPER**: Cleaning tasks
- **MAINTENANCE**: Maintenance tasks
- **ACCOUNTANT**: Financial operations
- **MANAGER**: Reports and analytics

## 📱 Responsive Design

Works seamlessly on:
- 🖥️ Desktop (1920px+)
- 💻 Laptop (1280px+)
- 📱 Tablet (768px+)
- 📱 Mobile (320px+)

## 🚧 Roadmap

- [x] Authentication system
- [x] Dashboard with statistics
- [x] Reservation management
- [x] Room management
- [x] Guest management
- [x] Staff management
- [x] Task management
- [ ] Spa services management
- [ ] Payment processing
- [ ] Invoice generation
- [ ] Reports and analytics
- [ ] Real-time notifications
- [ ] Multi-language support

## 📄 License

This project is licensed under the MIT License.

---

**Made with ❤️ for hotel management**
