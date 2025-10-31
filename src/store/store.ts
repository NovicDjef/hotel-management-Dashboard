import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import reservationReducer from './slices/reservationSlice';
import roomReducer from './slices/roomSlice';
import guestReducer from './slices/guestSlice';
import staffReducer from './slices/staffSlice';
import taskReducer from './slices/taskSlice';
import spaReducer from './slices/spaSlice';
import notificationReducer from './slices/notificationSlice';
import dashboardReducer from './slices/dashboardSlice';
import paymentReducer from './slices/paymentSlice';
import invoiceReducer from './slices/invoiceSlice';
import reviewReducer from './slices/reviewSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    reservations: reservationReducer,
    rooms: roomReducer,
    guests: guestReducer,
    staff: staffReducer,
    tasks: taskReducer,
    spa: spaReducer,
    notifications: notificationReducer,
    dashboard: dashboardReducer,
    payments: paymentReducer,
    invoices: invoiceReducer,
    reviews: reviewReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/login/fulfilled', 'auth/checkAuth/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user', 'auth.tokens'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
