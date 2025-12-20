import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/api/axios';

export const checkAuthStatus = createAsyncThunk(
    'auth/checkStatus',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/api/auth/check-auth');
            if (response.data.isAuthenticated) {
                return response.data.user;
            } else {
                return rejectWithValue('Not authenticated');
            }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to check auth');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async () => {
        try {
            await api.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout error', error);
        }
    }
);

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: true, // Add loading state for initial check
};

// Manages global authentication state, including login/logout actions and session checks
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user } = action.payload;
            state.user = user;
            state.isAuthenticated = true;
            state.loading = false;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(checkAuthStatus.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkAuthStatus.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.loading = false;
            })
            .addCase(checkAuthStatus.rejected, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.loading = false;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.loading = false;
            });
    },
});

export const { setCredentials, logout, setLoading } = authSlice.actions;

export default authSlice.reducer;
