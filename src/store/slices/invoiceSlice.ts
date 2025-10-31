import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Invoice } from '@/lib/types';
import { invoiceService } from '@/lib/api/services';

interface InvoiceState {
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: InvoiceState = {
  invoices: [],
  selectedInvoice: null,
  isLoading: false,
  error: null,
};

export const fetchInvoices = createAsyncThunk(
  'invoices/fetchAll',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await invoiceService.getAll(params);
      return response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoices');
    }
  }
);

export const fetchInvoiceById = createAsyncThunk(
  'invoices/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await invoiceService.getById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoice');
    }
  }
);

export const generateInvoice = createAsyncThunk(
  'invoices/generate',
  async (reservationId: string, { rejectWithValue }) => {
    try {
      const response = await invoiceService.generate(reservationId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate invoice');
    }
  }
);

export const updateInvoice = createAsyncThunk(
  'invoices/update',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update invoice');
    }
  }
);

export const sendInvoice = createAsyncThunk(
  'invoices/send',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await invoiceService.send(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send invoice');
    }
  }
);

export const downloadInvoicePDF = createAsyncThunk(
  'invoices/downloadPDF',
  async (id: string, { rejectWithValue }) => {
    try {
      const blob = await invoiceService.downloadPDF(id);
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to download invoice');
    }
  }
);

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedInvoice: (state) => {
      state.selectedInvoice = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all invoices
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch by ID
    builder
      .addCase(fetchInvoiceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedInvoice = action.payload;
      })
      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Generate invoice
    builder
      .addCase(generateInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices.unshift(action.payload);
      })
      .addCase(generateInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update invoice
    builder
      .addCase(updateInvoice.fulfilled, (state, action) => {
        const index = state.invoices.findIndex((inv) => inv.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
        if (state.selectedInvoice?.id === action.payload.id) {
          state.selectedInvoice = action.payload;
        }
      });

    // Send invoice
    builder
      .addCase(sendInvoice.fulfilled, (state, action) => {
        const index = state.invoices.findIndex((inv) => inv.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      });
  },
});

export const { clearError, clearSelectedInvoice } = invoiceSlice.actions;
export default invoiceSlice.reducer;
