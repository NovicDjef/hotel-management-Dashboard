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
      console.log('👥 STAFF - Response from getAll:', response);

      // Gérer différents formats de réponse API
      let staffData: Staff[] = [];
      if (Array.isArray(response)) {
        staffData = response;
      } else if (response && typeof response === 'object') {
        staffData = response.data?.staff || response.data || response.staff || [];
      }

      console.log('✅ STAFF - Staff members loaded:', staffData.length);
      return staffData;
    } catch (error: any) {
      console.error('❌ STAFF - Failed to fetch staff:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch staff');
    }
  }
);

export const fetchStaffStats = createAsyncThunk(
  'staff/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await staffService.getStats();
      console.log('📊 STAFF - Response from getStats:', response);
      console.log('📊 STAFF - Response.data:', response.data);

      // Gérer le nouveau format de réponse API
      // Le service retourne déjà response.data, donc response = { success, message, data: { totalStaff, activeStaff, byRole, byDepartment, newHiresThisMonth } }
      let statsData: any = null;

      // Les vraies données sont dans response.data
      if (response && response.data) {
        const { totalStaff, activeStaff, byRole, byDepartment, newHiresThisMonth } = response.data;

        console.log('🔍 STAFF - Raw data from API:');
        console.log('   - totalStaff:', totalStaff);
        console.log('   - activeStaff:', activeStaff);
        console.log('   - byRole (raw):', byRole);
        console.log('   - byDepartment (raw):', byDepartment);
        console.log('   - newHiresThisMonth:', newHiresThisMonth);

        // Transformer byRole array en objet
        const byRoleObj: Record<string, number> = {};
        if (Array.isArray(byRole)) {
          console.log('✅ byRole is an array, transforming...');
          byRole.forEach((item: any) => {
            console.log(`   - Adding role ${item.role}: ${item._count}`);
            byRoleObj[item.role] = item._count;
          });
        } else {
          console.log('❌ byRole is NOT an array:', typeof byRole);
        }

        // Transformer byDepartment array en objet
        const byDepartmentObj: Record<string, number> = {};
        if (Array.isArray(byDepartment)) {
          console.log('✅ byDepartment is an array, transforming...');
          byDepartment.forEach((item: any) => {
            console.log(`   - Adding department ${item.department}: ${item._count}`);
            byDepartmentObj[item.department] = item._count;
          });
        } else {
          console.log('❌ byDepartment is NOT an array:', typeof byDepartment);
        }

        statsData = {
          total: totalStaff || 0,
          active: activeStaff || 0,
          inactive: (totalStaff || 0) - (activeStaff || 0),
          byRole: byRoleObj,
          byDepartment: byDepartmentObj,
          newHiresThisMonth: newHiresThisMonth || 0,
        };

        console.log('📊 STAFF - Parsed data:');
        console.log('   - Total staff:', totalStaff);
        console.log('   - Active staff:', activeStaff);
        console.log('   - By role:', byRoleObj);
        console.log('   - By department:', byDepartmentObj);
      } else {
        // Fallback si le format est différent
        console.log('⚠️ STAFF - Using fallback, response:', response);
        statsData = response;
      }

      console.log('✅ STAFF - Stats loaded:', statsData);
      console.log('✅ STAFF - byRole:', statsData?.byRole);
      console.log('✅ STAFF - byDepartment:', statsData?.byDepartment);
      return statsData;
    } catch (error: any) {
      console.error('❌ STAFF - Failed to fetch stats:', error);
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
