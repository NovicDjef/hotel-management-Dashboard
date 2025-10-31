import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Review, ReviewStats } from '@/lib/types';
import { reviewService } from '@/lib/api/services';

interface ReviewState {
  reviews: Review[];
  selectedReview: Review | null;
  stats: ReviewStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  reviews: [],
  selectedReview: null,
  stats: null,
  isLoading: false,
  error: null,
};

export const fetchReviews = createAsyncThunk(
  'reviews/fetchAll',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await reviewService.getAll(params);
      return response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const fetchReviewById = createAsyncThunk(
  'reviews/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await reviewService.getById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch review');
    }
  }
);

export const fetchReviewStats = createAsyncThunk(
  'reviews/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reviewService.getStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const createReview = createAsyncThunk(
  'reviews/create',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await reviewService.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create review');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await reviewService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
    }
  }
);

export const publishReview = createAsyncThunk(
  'reviews/publish',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await reviewService.publish(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to publish review');
    }
  }
);

export const verifyReview = createAsyncThunk(
  'reviews/verify',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await reviewService.verify(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify review');
    }
  }
);

export const respondToReview = createAsyncThunk(
  'reviews/respond',
  async ({ id, response }: { id: string; response: string }, { rejectWithValue }) => {
    try {
      const res = await reviewService.respond(id, response);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to respond to review');
    }
  }
);

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedReview: (state) => {
      state.selectedReview = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all reviews
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch by ID
    builder
      .addCase(fetchReviewById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReviewById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedReview = action.payload;
      })
      .addCase(fetchReviewById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch stats
    builder.addCase(fetchReviewStats.fulfilled, (state, action) => {
      state.stats = action.payload;
    });

    // Create review
    builder
      .addCase(createReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews.unshift(action.payload);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete review
    builder.addCase(deleteReview.fulfilled, (state, action) => {
      state.reviews = state.reviews.filter((r) => r.id !== action.payload);
    });

    // Publish review
    builder.addCase(publishReview.fulfilled, (state, action) => {
      const index = state.reviews.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.reviews[index] = action.payload;
      }
    });

    // Verify review
    builder.addCase(verifyReview.fulfilled, (state, action) => {
      const index = state.reviews.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.reviews[index] = action.payload;
      }
    });

    // Respond to review
    builder.addCase(respondToReview.fulfilled, (state, action) => {
      const index = state.reviews.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.reviews[index] = action.payload;
      }
      if (state.selectedReview?.id === action.payload.id) {
        state.selectedReview = action.payload;
      }
    });
  },
});

export const { clearError, clearSelectedReview } = reviewSlice.actions;
export default reviewSlice.reducer;
