import { createSlice } from '@reduxjs/toolkit';
import messaging from '@react-native-firebase/messaging';

const initialState = {
  token: null,
  user: null,
  role: null, // 'teacher' or 'student'
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.role = action.payload.role;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.role = null;
      state.loading = false;
      state.error = null;
    },
    updateAuth: (state, action) => {
      state.user = { ...state.user, ...action.payload.user };
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateAuth } = authSlice.actions;

export const syncProfile = (callback) => {
    return async dispatch => {
        try {
            const { APIService } = require('../services/APIServices');
            const { CACHE, CACHE_PARAMS } = require('../utils');
            const response = await new APIService().getProfile();
            if (response?.status === 200) {
                dispatch(updateAuth({ user: response.data }));
                await CACHE.set(CACHE_PARAMS.userData, response.data);
                if (callback) callback(response.data);
            } else {
                if (callback) callback(null);
            }
        } catch (err) {
            console.error("Profile Sync Error:", err);
            if (callback) callback(null);
        }
    };
};

export const updateProfile = (userId, payload, callback) => {
    return async dispatch => {
        try {
            const { APIService } = require('../services/APIServices');
            const { CACHE, CACHE_PARAMS } = require('../utils');
            const response = await new APIService().updateStaffProfile(userId, payload);
            if (response?.status === 200 || response?.status === 201) {
                dispatch(updateAuth({ user: response.data }));
                await CACHE.set(CACHE_PARAMS.userData, response.data);
                if (callback) callback(response.data);
            } else {
                if (callback) callback(null);
            }
        } catch (err) {
            console.error("Profile Update Error:", err);
            if (callback) callback(null);
        }
    };
};

export const loginUser = (payload, callback) => {
    return async dispatch => {
        dispatch(loginStart());
        try {
            const { APIService } = require('../services/APIServices');
            const { CACHE, CACHE_PARAMS } = require('../utils');
            const response = await new APIService().login(payload);
            
            if (response.data && response.data.token) {
                try {
                    await CACHE.set(CACHE_PARAMS.accessToken, response.data.token);
                    await CACHE.set(CACHE_PARAMS.userData, response.data.user);
                    await CACHE.set(CACHE_PARAMS.userType, response.data.role);
                } catch (e) {
                    console.log("⚓ Session Persistence Registry Error", e);
                }

                // --- 📲 SYNC FCM DEVICE TOKEN ON FRESH LOGIN ---
                try {
                    const authStatus = await messaging().hasPermission();
                    if (authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL) {
                        const fcmToken = await messaging().getToken();
                        if (fcmToken) {
                            await new APIService().syncDeviceToken(fcmToken);
                            console.log('✅ [FCM Sync] Device token synced to server immediately after login.');
                        }
                    }
                } catch (fcmErr) {
                    console.log('⚠️ [FCM Sync Error Post-Login]:', fcmErr.message);
                }

                dispatch(loginSuccess({
                    token: response.data.token,
                    user: response.data.user,
                    role: response.data.role
                }));
                if (callback) callback({ success: true });
            } else {
                throw new Error('Malformed Response Hub');
            }
        } catch (err) {
            console.log("💥 AUTH HUB FAILURE:", err);
            const serverError = err.response?.data?.error;
            const status = err.response?.status;
            
            let finalError = 'Institutional Connectivity Breach. Please verify your network entry point.';
            
            if (serverError) {
                finalError = serverError;
            } else if (status === 401) {
                finalError = 'Access Denied: Invalid institutional credentials provided.';
            } else if (err.message === 'Network Error') {
                finalError = 'Server Unreachable: Verify institutional IP/Port synchronization.';
            }

            dispatch(loginFailure(finalError));
            if (callback) callback({ success: false, error: finalError });
        }
    };
};

export default authSlice.reducer;
