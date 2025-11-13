import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { SpaService, SpaPackage, SpaReservation, SpaCertificate, SpaStats, SpaCategoryData } from '@/lib/types';
import { spaService } from '@/lib/api/services';

interface SpaState {
  // Catégories
  categories: SpaCategoryData[];

  // Services
  services: SpaService[];
  selectedService: SpaService | null;

  // Forfaits
  packages: SpaPackage[];
  selectedPackage: SpaPackage | null;

  // Réservations
  reservations: SpaReservation[];
  selectedReservation: SpaReservation | null;

  // Certificats
  certificates: SpaCertificate[];
  selectedCertificate: SpaCertificate | null;
  availableAmounts: number[];

  // Stats
  stats: SpaStats | null;

  // UI State
  isLoading: boolean;
  error: string | null;
}

const initialState: SpaState = {
  categories: [],
  services: [],
  selectedService: null,
  packages: [],
  selectedPackage: null,
  reservations: [],
  selectedReservation: null,
  certificates: [],
  selectedCertificate: null,
  availableAmounts: [],
  stats: null,
  isLoading: false,
  error: null,
};

// ==================== CATÉGORIES ====================

export const fetchSpaCategories = createAsyncThunk(
  'spa/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await spaService.getAllCategories();
      console.log('🏷️ SPA - Response from getAllCategories:', response);

      // Gérer différents formats de réponse API
      let categoriesData: SpaCategoryData[] = [];

      if (Array.isArray(response)) {
        categoriesData = response;
      } else if (response && typeof response === 'object') {
        categoriesData = response?.data?.categories || response?.data || response?.categories || [];
      }

      console.log('✅ SPA - Categories loaded:', categoriesData.length);
      return categoriesData;
    } catch (error: any) {
      console.error('❌ SPA - Failed to fetch categories:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

// ==================== SERVICES ====================

export const fetchSpaServices = createAsyncThunk(
  'spa/fetchServices',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await spaService.getAllServices(params);
      console.log('✨ SPA - Response from getAllServices:', response);

      // Gérer différents formats de réponse API
      let servicesData: SpaService[] = [];

      if (Array.isArray(response)) {
        servicesData = response;
      } else if (response && typeof response === 'object') {
        servicesData = response?.data?.services || response?.data || response?.services || [];
      }

      console.log('✅ SPA - Services loaded:', servicesData.length);
      return servicesData;
    } catch (error: any) {
      console.error('❌ SPA - Failed to fetch services:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch services');
    }
  }
);

export const createSpaService = createAsyncThunk(
  'spa/createService',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await spaService.createService(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create service');
    }
  }
);

export const updateSpaService = createAsyncThunk(
  'spa/updateService',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await spaService.updateService(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update service');
    }
  }
);

export const deleteSpaService = createAsyncThunk(
  'spa/deleteService',
  async (id: string, { rejectWithValue }) => {
    try {
      await spaService.deleteService(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete service');
    }
  }
);

// ==================== FORFAITS ====================

export const fetchSpaPackages = createAsyncThunk(
  'spa/fetchPackages',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await spaService.getAllPackages(params);
      console.log('📦 SPA - Response from getAllPackages:', response);

      // Gérer différents formats de réponse API
      let packagesData: SpaPackage[] = [];

      if (Array.isArray(response)) {
        packagesData = response;
      } else if (response && typeof response === 'object') {
        packagesData = response?.data?.packages || response?.data || response?.packages || [];
      }

      console.log('✅ SPA - Packages loaded:', packagesData.length);
      return packagesData;
    } catch (error: any) {
      console.error('❌ SPA - Failed to fetch packages:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch packages');
    }
  }
);

export const createSpaPackage = createAsyncThunk(
  'spa/createPackage',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await spaService.createPackage(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create package');
    }
  }
);

export const updateSpaPackage = createAsyncThunk(
  'spa/updatePackage',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await spaService.updatePackage(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update package');
    }
  }
);

export const deleteSpaPackage = createAsyncThunk(
  'spa/deletePackage',
  async (id: string, { rejectWithValue }) => {
    try {
      await spaService.deletePackage(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete package');
    }
  }
);

// ==================== RÉSERVATIONS ====================

export const fetchSpaReservations = createAsyncThunk(
  'spa/fetchReservations',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await spaService.getAllReservations(params);
      console.log('📅 SPA - Response from getAllReservations:', response);

      // Gérer différents formats de réponse API
      let reservationsData: SpaReservation[] = [];

      if (Array.isArray(response)) {
        reservationsData = response;
      } else if (response && typeof response === 'object') {
        reservationsData = response?.data?.reservations || response?.data || response?.reservations || [];
      }

      console.log('✅ SPA - Reservations loaded:', reservationsData.length);
      return reservationsData;
    } catch (error: any) {
      console.error('❌ SPA - Failed to fetch reservations:', error);
      console.error('Error response:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reservations');
    }
  }
);

export const createSpaReservation = createAsyncThunk(
  'spa/createReservation',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await spaService.createReservation(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create reservation');
    }
  }
);

export const updateSpaReservation = createAsyncThunk(
  'spa/updateReservation',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await spaService.updateReservation(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update reservation');
    }
  }
);

export const cancelSpaReservation = createAsyncThunk(
  'spa/cancelReservation',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await spaService.cancelReservation(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel reservation');
    }
  }
);

export const deleteSpaReservation = createAsyncThunk(
  'spa/deleteReservation',
  async (id: string, { rejectWithValue }) => {
    try {
      await spaService.deleteReservation(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete reservation');
    }
  }
);

// ==================== CERTIFICATS ====================

export const fetchSpaCertificates = createAsyncThunk(
  'spa/fetchCertificates',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await spaService.getAllCertificates(params);
      console.log('🎁 SPA - Response from getAllCertificates:', response);

      // Gérer différents formats de réponse API
      let certificatesData: SpaCertificate[] = [];

      if (Array.isArray(response)) {
        certificatesData = response;
      } else if (response && typeof response === 'object') {
        certificatesData = response?.data?.certificates || response?.data || response?.certificates || [];
      }

      console.log('✅ SPA - Certificates loaded:', certificatesData.length);
      return certificatesData;
    } catch (error: any) {
      console.error('❌ SPA - Failed to fetch certificates:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch certificates');
    }
  }
);

export const fetchAvailableAmounts = createAsyncThunk(
  'spa/fetchAvailableAmounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await spaService.getAvailableAmounts();
      // Gérer différents formats de réponse API
      if (Array.isArray(response)) {
        return response;
      }
      return response?.data || response?.amounts || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch available amounts');
    }
  }
);

export const createSpaCertificate = createAsyncThunk(
  'spa/createCertificate',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await spaService.createCertificate(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create certificate');
    }
  }
);

export const validateSpaCertificate = createAsyncThunk(
  'spa/validateCertificate',
  async (code: string, { rejectWithValue }) => {
    try {
      const response = await spaService.validateCertificate(code);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to validate certificate');
    }
  }
);

export const useSpaCertificate = createAsyncThunk(
  'spa/useCertificate',
  async ({ code, data }: { code: string; data?: any }, { rejectWithValue }) => {
    try {
      const response = await spaService.useCertificate(code, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to use certificate');
    }
  }
);

export const markCertificateAsPaid = createAsyncThunk(
  'spa/markCertificateAsPaid',
  async (code: string, { rejectWithValue }) => {
    try {
      const response = await spaService.markCertificateAsPaid(code);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark certificate as paid');
    }
  }
);

// ==================== STATISTIQUES ====================

export const fetchSpaStats = createAsyncThunk(
  'spa/fetchStats',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await spaService.getStatistics(params);
      console.log('📊 SPA - Response from getStatistics:', response);

      // Gérer différents formats de réponse API
      let statsData: SpaStats | null = null;

      if (response && typeof response === 'object') {
        statsData = response?.data || response;
      }

      console.log('✅ SPA - Stats loaded:', statsData);
      return statsData;
    } catch (error: any) {
      console.error('❌ SPA - Failed to fetch stats:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

// ==================== SLICE ====================

const spaSlice = createSlice({
  name: 'spa',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedService: (state) => {
      state.selectedService = null;
    },
    clearSelectedPackage: (state) => {
      state.selectedPackage = null;
    },
    clearSelectedReservation: (state) => {
      state.selectedReservation = null;
    },
    clearSelectedCertificate: (state) => {
      state.selectedCertificate = null;
    },
  },
  extraReducers: (builder) => {
    // ==================== CATÉGORIES ====================
    builder
      .addCase(fetchSpaCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSpaCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchSpaCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ==================== SERVICES ====================
    builder
      .addCase(fetchSpaServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSpaServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = action.payload;
      })
      .addCase(fetchSpaServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(createSpaService.fulfilled, (state, action) => {
      state.services.unshift(action.payload);
    });

    builder.addCase(updateSpaService.fulfilled, (state, action) => {
      const index = state.services.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.services[index] = action.payload;
      }
    });

    builder.addCase(deleteSpaService.fulfilled, (state, action) => {
      state.services = state.services.filter((s) => s.id !== action.payload);
    });

    // ==================== FORFAITS ====================
    builder
      .addCase(fetchSpaPackages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSpaPackages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.packages = action.payload;
      })
      .addCase(fetchSpaPackages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(createSpaPackage.fulfilled, (state, action) => {
      state.packages.unshift(action.payload);
    });

    builder.addCase(updateSpaPackage.fulfilled, (state, action) => {
      const index = state.packages.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.packages[index] = action.payload;
      }
    });

    builder.addCase(deleteSpaPackage.fulfilled, (state, action) => {
      state.packages = state.packages.filter((p) => p.id !== action.payload);
    });

    // ==================== RÉSERVATIONS ====================
    builder
      .addCase(fetchSpaReservations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSpaReservations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reservations = action.payload;
      })
      .addCase(fetchSpaReservations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(createSpaReservation.fulfilled, (state, action) => {
      state.reservations.unshift(action.payload);
    });

    builder.addCase(updateSpaReservation.fulfilled, (state, action) => {
      const index = state.reservations.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.reservations[index] = action.payload;
      }
    });

    builder.addCase(cancelSpaReservation.fulfilled, (state, action) => {
      const index = state.reservations.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.reservations[index] = action.payload;
      }
    });

    builder.addCase(deleteSpaReservation.fulfilled, (state, action) => {
      state.reservations = state.reservations.filter((r) => r.id !== action.payload);
    });

    // ==================== CERTIFICATS ====================
    builder
      .addCase(fetchSpaCertificates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSpaCertificates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.certificates = action.payload;
      })
      .addCase(fetchSpaCertificates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(fetchAvailableAmounts.fulfilled, (state, action) => {
      state.availableAmounts = action.payload;
    });

    builder.addCase(createSpaCertificate.fulfilled, (state, action) => {
      state.certificates.unshift(action.payload);
    });

    builder.addCase(markCertificateAsPaid.fulfilled, (state, action) => {
      const index = state.certificates.findIndex((c) => c.code === action.payload.code);
      if (index !== -1) {
        state.certificates[index] = action.payload;
      }
    });

    // ==================== STATISTIQUES ====================
    builder.addCase(fetchSpaStats.fulfilled, (state, action) => {
      state.stats = action.payload;
    });
  },
});

export const {
  clearError,
  clearSelectedService,
  clearSelectedPackage,
  clearSelectedReservation,
  clearSelectedCertificate,
} = spaSlice.actions;

export default spaSlice.reducer;
