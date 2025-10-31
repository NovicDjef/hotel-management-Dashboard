import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Payment, PaymentStats } from '@/lib/types';
import { paymentService } from '@/lib/api/services';

interface PaymentState {
  payments: Payment[];
  selectedPayment: Payment | null;
  stats: PaymentStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  payments: [],
  selectedPayment: null,
  stats: null,
  isLoading: false,
  error: null,
};

export const fetchPayments = createAsyncThunk(
  'payments/fetchAll',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await paymentService.getAll(params);
      return response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payments');
    }
  }
);

export const fetchPaymentById = createAsyncThunk(
  'payments/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await paymentService.getById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment');
    }
  }
);

export const fetchPaymentStats = createAsyncThunk(
  'payments/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentService.getStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const createPayment = createAsyncThunk(
  'payments/create',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await paymentService.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment');
    }
  }
);

export const refundPayment = createAsyncThunk(
  'payments/refund',
  async ({ id, data }: { id: string; data?: any }, { rejectWithValue }) => {
    try {
      const response = await paymentService.refund(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to refund payment');
    }
  }
);

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedPayment: (state) => {
      state.selectedPayment = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all payments
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch by ID
    builder
      .addCase(fetchPaymentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedPayment = action.payload;
      })
      .addCase(fetchPaymentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch stats
    builder
      .addCase(fetchPaymentStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });

    // Create payment
    builder
      .addCase(createPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments.unshift(action.payload);
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Refund payment
    builder
      .addCase(refundPayment.fulfilled, (state, action) => {
        const index = state.payments.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
        if (state.selectedPayment?.id === action.payload.id) {
          state.selectedPayment = action.payload;
        }
      });
  },
});

export const { clearError, clearSelectedPayment } = paymentSlice.actions;
export default paymentSlice.reducer;
