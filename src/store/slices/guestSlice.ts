import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Guest, GuestStats } from '@/lib/types';
import { guestService } from '@/lib/api/services';

interface GuestState {
  guests: Guest[];
  selectedGuest: Guest | null;
  stats: GuestStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: GuestState = {
  guests: [],
  selectedGuest: null,
  stats: null,
  isLoading: false,
  error: null,
};

export const fetchGuests = createAsyncThunk(
  'guests/fetchAll',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await guestService.getAll(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch guests');
    }
  }
);

export const fetchGuestStats = createAsyncThunk(
  'guests/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await guestService.getStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

const guestSlice = createSlice({
  name: 'guests',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGuests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGuests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.guests = action.payload;
      })
      .addCase(fetchGuests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchGuestStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearError } = guestSlice.actions;
export default guestSlice.reducer;
