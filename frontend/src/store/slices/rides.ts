/**
 * Rides slice - Gerenciamento de corridas
 */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { RideRequest, RideFilters, PaginatedResponse } from '@/types'
import { apiService } from '@/services/api'

interface RidesState {
  rides: RideRequest[]
  currentRide: RideRequest | null
  filters: RideFilters
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    pageSize: number
    total: number
  }
}

const initialState: RidesState = {
  rides: [],
  currentRide: null,
  filters: {},
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
}

// Async thunks
export const fetchRides = createAsyncThunk(
  'rides/fetchRides',
  async (
    { page = 1, pageSize = 10, filters }: { page?: number; pageSize?: number; filters?: RideFilters },
    { rejectWithValue }: { rejectWithValue: any }
  ) => {
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('pageSize', pageSize.toString())

      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })

      const response = await apiService.get(`/rides?${params.toString()}`)

      if (response.success && response.data) {
        return response.data as PaginatedResponse<RideRequest>
      }

      return rejectWithValue(response.error || 'Failed to fetch rides')
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An error occurred')
    }
  }
)

export const requestRide = createAsyncThunk(
  'rides/requestRide',
  async (rideData: Partial<RideRequest>, { rejectWithValue }: { rejectWithValue: any }) => {
    try {
      const response = await apiService.post('/rides/request', rideData)

      if (response.success && response.data) {
        return response.data as RideRequest
      }

      return rejectWithValue(response.error || 'Failed to request ride')
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An error occurred')
    }
  }
)

export const acceptRide = createAsyncThunk(
  'rides/acceptRide',
  async (rideId: number, { rejectWithValue }: { rejectWithValue: any }) => {
    try {
      const response = await apiService.post(`/rides/${rideId}/accept`)

      if (response.success && response.data) {
        return response.data as RideRequest
      }

      return rejectWithValue(response.error || 'Failed to accept ride')
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An error occurred')
    }
  }
)

export const cancelRide = createAsyncThunk(
  'rides/cancelRide',
  async (rideId: number, { rejectWithValue }: { rejectWithValue: any }) => {
    try {
      const response = await apiService.post(`/rides/${rideId}/cancel`)

      if (response.success) {
        return { rideId }
      }

      return rejectWithValue(response.error || 'Failed to cancel ride')
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An error occurred')
    }
  }
)

// Slice
const ridesSlice = createSlice({
  name: 'rides',
  initialState,
  reducers: {
    setFilters: (state: RidesState, action: PayloadAction<RideFilters>) => {
      state.filters = action.payload
    },
    clearError: (state: RidesState) => {
      state.error = null
    },
    setCurrentRide: (state: RidesState, action: PayloadAction<RideRequest | null>) => {
      state.currentRide = action.payload
    },
  },
  extraReducers: (builder: any) => {
    // Fetch Rides
    builder
      .addCase(fetchRides.pending, (state: RidesState) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchRides.fulfilled, (state: RidesState, action: PayloadAction<any>) => {
        state.isLoading = false
        state.rides = action.payload.items
        state.pagination = {
          page: action.payload.page,
          pageSize: action.payload.pageSize,
          total: action.payload.total,
        }
      })
      .addCase(fetchRides.rejected, (state: RidesState, action: PayloadAction<any>) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Request Ride
    builder
      .addCase(requestRide.pending, (state: RidesState) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(requestRide.fulfilled, (state: RidesState, action: PayloadAction<any>) => {
        state.isLoading = false
        state.currentRide = action.payload
        state.rides.unshift(action.payload)
      })
      .addCase(requestRide.rejected, (state: RidesState, action: PayloadAction<any>) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Accept Ride
    builder
      .addCase(acceptRide.pending, (state: RidesState) => {
        state.isLoading = true
      })
      .addCase(acceptRide.fulfilled, (state: RidesState, action: PayloadAction<any>) => {
        state.isLoading = false
        const index = state.rides.findIndex((r: RideRequest) => r.id === action.payload.id)
        if (index > -1) {
          state.rides[index] = action.payload
        }
      })
      .addCase(acceptRide.rejected, (state: RidesState, action: PayloadAction<any>) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Cancel Ride
    builder
      .addCase(cancelRide.fulfilled, (state: RidesState, action: PayloadAction<any>) => {
        const index = state.rides.findIndex((r: RideRequest) => r.id === action.payload.rideId)
        if (index > -1) {
          state.rides[index].status = 'cancelled'
        }
      })
      .addCase(cancelRide.rejected, (state: RidesState, action: PayloadAction<any>) => {
        state.error = action.payload as string
      })
  },
})

export const { setFilters, clearError, setCurrentRide } = ridesSlice.actions
export default ridesSlice.reducer
