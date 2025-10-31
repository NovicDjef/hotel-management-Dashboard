import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Staff, StaffStats } from '@/lib/types';
import { staffService } from '@/lib/api/services';

interface StaffState {
  staffMembers: Staff[];
  selectedStaff: Staff | null;
  stats: StaffStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: StaffState = {
  staffMembers: [],
  selectedStaff: null,
  stats: null,
  isLoading: false,
  error: null,
};

export const fetchStaff = createAsyncThunk(
  'staff/fetchAll',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await staffService.getAll(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch staff');
    }
  }
);

export const fetchStaffStats = createAsyncThunk(
  'staff/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await staffService.getStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaff.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.isLoading = false;
        state.staffMembers = action.payload;
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStaffStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearError } = staffSlice.actions;
export default staffSlice.reducer;
