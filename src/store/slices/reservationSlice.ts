import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Reservation, ReservationStats } from '@/lib/types';
import { reservationService, roomService } from '@/lib/api/services';

interface ReservationState {
  reservations: Reservation[];
  selectedReservation: Reservation | null;
  stats: ReservationStats | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: ReservationState = {
  reservations: [],
  selectedReservation: null,
  stats: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const fetchReservations = createAsyncThunk(
  'reservations/fetchAll',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await reservationService.getAll(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reservations');
    }
  }
);

export const fetchReservationById = createAsyncThunk(
  'reservations/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await reservationService.getById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reservation');
    }
  }
);

export const fetchReservationStats = createAsyncThunk(
  'reservations/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reservationService.getStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const createReservation = createAsyncThunk(
  'reservations/create',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await reservationService.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create reservation');
    }
  }
);

export const updateReservation = createAsyncThunk(
  'reservations/update',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await reservationService.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update reservation');
    }
  }
);

export const checkIn = createAsyncThunk(
  'reservations/checkIn',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await reservationService.checkIn(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check in');
    }
  }
);

export const checkOut = createAsyncThunk(
  'reservations/checkOut',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await reservationService.checkOut(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check out');
    }
  }
);

export const cancelReservation = createAsyncThunk(
  'reservations/cancel',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await reservationService.cancel(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel reservation');
    }
  }
);

export const confirmReservation = createAsyncThunk(
  'reservations/confirm',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await reservationService.confirm(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to confirm reservation');
    }
  }
);

export const calculatePrice = createAsyncThunk(
  'reservations/calculate',
  async (data: {
    roomType: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    hotelId?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await reservationService.calculate(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to calculate price');
    }
  }
);

export const confirmPayment = createAsyncThunk(
  'reservations/confirmPayment',
  async ({ id, data }: { id: string; data: { paymentMethodId: string } }, { rejectWithValue }) => {
    try {
      const response = await reservationService.confirmPayment(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to confirm payment');
    }
  }
);

export const checkAvailability = createAsyncThunk(
  'reservations/checkAvailability',
  async (data: {
    checkInDate: string;
    checkOutDate: string;
    hotelId?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await reservationService.checkAvailability(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check availability');
    }
  }
);

// ✨ Attribution automatique de chambre
export const autoAssignRoom = createAsyncThunk(
  'reservations/autoAssignRoom',
  async (reservation: Reservation, { rejectWithValue }) => {
    try {
      console.log('🤖 AUTO-ASSIGN - Starting auto room assignment for reservation:', reservation.id);

      // Si une chambre est déjà attribuée, on skip
      if (reservation.roomId) {
        console.log('✅ AUTO-ASSIGN - Room already assigned:', reservation.roomId);
        return reservation;
      }

      // Récupérer les chambres disponibles du bon type
      const availableRooms = await roomService.getAvailableForAssignment({
        roomType: reservation.roomType,
        checkInDate: reservation.checkInDate,
        checkOutDate: reservation.checkOutDate,
        hotelId: reservation.hotelId,
      });

      console.log('🔍 AUTO-ASSIGN - Available rooms:', availableRooms);

      // Extraire le tableau de chambres (gérer différents formats de réponse)
      let rooms: any[] = [];
      if (Array.isArray(availableRooms)) {
        rooms = availableRooms;
      } else if (availableRooms?.data && Array.isArray(availableRooms.data)) {
        rooms = availableRooms.data;
      } else if (availableRooms?.availableRooms && Array.isArray(availableRooms.availableRooms)) {
        rooms = availableRooms.availableRooms;
      }

      // Si aucune chambre disponible
      if (!rooms || rooms.length === 0) {
        console.log('⚠️ AUTO-ASSIGN - No available rooms found');
        return reservation;
      }

      // Prendre la première chambre disponible
      const roomToAssign = rooms[0];
      console.log('🏨 AUTO-ASSIGN - Assigning room:', roomToAssign.roomNumber);

      // Attribuer la chambre
      await roomService.assignToReservation({
        reservationId: reservation.id,
        roomId: roomToAssign.id,
      });

      console.log('✅ AUTO-ASSIGN - Room assigned successfully');

      // Récupérer la réservation mise à jour
      const updatedReservation = await reservationService.getById(reservation.id);
      return updatedReservation;
    } catch (error: any) {
      console.error('❌ AUTO-ASSIGN - Error:', error);
      // Ne pas rejeter l'erreur pour ne pas bloquer le processus
      // Juste retourner la réservation telle quelle
      return reservation;
    }
  }
);

// Slice
const reservationSlice = createSlice({
  name: 'reservations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedReservation: (state) => {
      state.selectedReservation = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch all reservations
    builder
      .addCase(fetchReservations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reservations = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch by ID
    builder
      .addCase(fetchReservationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReservationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedReservation = action.payload;
      })
      .addCase(fetchReservationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch stats
    builder
      .addCase(fetchReservationStats.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchReservationStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchReservationStats.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Create
    builder
      .addCase(createReservation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reservations.unshift(action.payload);
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update
    builder
      .addCase(updateReservation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReservation.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.reservations.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.reservations[index] = action.payload;
        }
        if (state.selectedReservation?.id === action.payload.id) {
          state.selectedReservation = action.payload;
        }
      })
      .addCase(updateReservation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Check in
    builder.addCase(checkIn.fulfilled, (state, action) => {
      const index = state.reservations.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.reservations[index] = action.payload;
      }
      if (state.selectedReservation?.id === action.payload.id) {
        state.selectedReservation = action.payload;
      }
    });

    // Check out
    builder.addCase(checkOut.fulfilled, (state, action) => {
      const index = state.reservations.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.reservations[index] = action.payload;
      }
      if (state.selectedReservation?.id === action.payload.id) {
        state.selectedReservation = action.payload;
      }
    });

    // Cancel
    builder.addCase(cancelReservation.fulfilled, (state, action) => {
      const index = state.reservations.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.reservations[index] = action.payload;
      }
      if (state.selectedReservation?.id === action.payload.id) {
        state.selectedReservation = action.payload;
      }
    });

    // Confirm
    builder.addCase(confirmReservation.fulfilled, (state, action) => {
      const index = state.reservations.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.reservations[index] = action.payload;
      }
      if (state.selectedReservation?.id === action.payload.id) {
        state.selectedReservation = action.payload;
      }
    });

    // Confirm Payment
    builder.addCase(confirmPayment.fulfilled, (state, action) => {
      const index = state.reservations.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.reservations[index] = action.payload;
      }
      if (state.selectedReservation?.id === action.payload.id) {
        state.selectedReservation = action.payload;
      }
    });

    // Auto Assign Room
    builder.addCase(autoAssignRoom.fulfilled, (state, action) => {
      const index = state.reservations.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.reservations[index] = action.payload;
      }
      if (state.selectedReservation?.id === action.payload.id) {
        state.selectedReservation = action.payload;
      }
    });
  },
});

export const { clearError, clearSelectedReservation, setPage } = reservationSlice.actions;
export default reservationSlice.reducer;
