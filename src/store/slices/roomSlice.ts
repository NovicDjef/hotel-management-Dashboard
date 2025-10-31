import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Room, RoomStats } from '@/lib/types';
import { roomService } from '@/lib/api/services';

interface RoomState {
  rooms: Room[];
  selectedRoom: Room | null;
  stats: RoomStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: RoomState = {
  rooms: [],
  selectedRoom: null,
  stats: null,
  isLoading: false,
  error: null,
};

export const fetchRooms = createAsyncThunk(
  'rooms/fetchAll',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await roomService.getAll(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch rooms');
    }
  }
);

export const fetchRoomStats = createAsyncThunk(
  'rooms/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await roomService.getStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const updateRoomStatus = createAsyncThunk(
  'rooms/updateStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await roomService.updateStatus(id, status);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

const roomSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchRoomStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(updateRoomStatus.fulfilled, (state, action) => {
        const index = state.rooms.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.rooms[index] = action.payload;
        }
      });
  },
});

export const { clearError } = roomSlice.actions;
export default roomSlice.reducer;
