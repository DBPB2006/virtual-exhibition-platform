import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';

// Configures the Redux store with authentication state management
export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
});
