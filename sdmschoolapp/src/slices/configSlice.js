import { createSlice } from '@reduxjs/toolkit';
import { APIkit } from '../utils/APIKIT';
import { API_END_POINTS } from '../utils/consts/Api';

const initialState = {
  primaryColor: '#6C63FF',
  secondaryColor: '#8B5CF6',
  schoolName: 'School Name',
  appTitle: 'School App',
  logoUrl: null,
  activeFeatures: ['fees', 'homework', 'exams', 'notice', 'timetable', 'calendar', 'helpdesk', 'profile'],
  maintenanceMode: false,
  enableOnlinePayments: false,
  razorpayKeyId: null,
  emergencyAlert: { active: false, title: '', message: '' },
  timings: null,
  banners: [],
  webBanners: [],
  loading: false,
  error: null,
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    configStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    configSuccess: (state, action) => {
      const isValidColor = (color) => {
        if (!color || typeof color !== 'string') return false;
        return /^#([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(color);
      };

      state.loading = false;
      state.schoolName = action.payload.school_name || action.payload.schoolName || 'RANI PUBLIC SCHOOL';
      state.appTitle = action.payload.app_title || action.payload.appTitle || 'RP SCHOOL';
      const pColor = action.payload.primary_color || action.payload.primaryColor;
      const sColor = action.payload.secondary_color || action.payload.secondaryColor;
      state.primaryColor = isValidColor(pColor) ? pColor : '#6C63FF';
      state.secondaryColor = isValidColor(sColor) ? sColor : '#8B5CF6';
      state.logoUrl = action.payload.logo_url || action.payload.logoUrl || action.payload.logoImage || null;
      state.activeFeatures = action.payload.active_features || [];
      state.maintenanceMode = action.payload.maintenance_mode || false;
      state.enableOnlinePayments = action.payload.enableOnlinePayments || false;
      state.razorpayKeyId = action.payload.razorpayKeyId || null;
      state.emergencyAlert = action.payload.emergency_alert || { active: false, title: '', message: '' };
      state.timings = action.payload.timings || null;
    },
    bannersSuccess: (state, action) => {
      state.banners = action.payload || [];
    },
    webBannersSuccess: (state, action) => {
      state.webBanners = action.payload || [];
    },
    configFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const { configStart, configSuccess, bannersSuccess, webBannersSuccess, configFailure } = configSlice.actions;

// Async Thunk to fetch app configurations and active banners on launch
export const fetchAppConfiguration = (callback) => {
  return async (dispatch, getState) => {
    // 🛡️ DEDUPLICATION GUARD: Prevent duplicate concurrent API requests to protect server
    if (getState()?.config?.loading) {
      console.log("[configSlice] Sync request already in progress. Ignoring duplicate trigger.");
      if (callback) callback(false, null);
      return;
    }

    dispatch(configStart());
    try {
      console.log("[configSlice] Fetching mobile app settings and banners...");
      
      // 1. Fetch Dynamic Settings Parameters
      const settingsRes = await APIkit.get(API_END_POINTS.settings);
      if (settingsRes && settingsRes.data) {
        dispatch(configSuccess(settingsRes.data));
      }
      
      // 2. Fetch Active Banner List
      const bannersRes = await APIkit.get(API_END_POINTS.banners);
      if (bannersRes && bannersRes.data) {
        dispatch(bannersSuccess(bannersRes.data));
      }

      // 3. Fetch Web Banners
      try {
        const webBannersRes = await APIkit.get(API_END_POINTS.webBanners);
        if (webBannersRes && webBannersRes.data) {
          dispatch(webBannersSuccess(webBannersRes.data));
        }
      } catch (wbErr) {
        console.error("[configSlice] Error fetching web banners:", wbErr?.message || wbErr);
      }
      
      if (callback) callback(true, settingsRes?.data);
    } catch (err) {
      console.error("[configSlice] Error fetching configuration:", err?.message || err);
      dispatch(configFailure(err?.message || 'Configuration Sync Failure'));
      if (callback) callback(false, null);
    }
  };
};

export default configSlice.reducer;
