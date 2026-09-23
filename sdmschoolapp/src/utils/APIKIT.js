import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "./consts/Api";
import { CACHE } from "./helper";
import { CACHE_PARAMS } from "./consts/Global";
let APIkit = axios.create({
    timeout: 20000,
    baseURL: API_BASE_URL

})
APIkit.interceptors.request.use(async request => {
    let localToken = await CACHE.get(CACHE_PARAMS.accessToken);
    
    // Fallback: Use a dynamic import for store to avoid circular dependency
    if (!localToken) {
        try {
            const { store } = require('../store');
            const state = store.getState();
            localToken = state.auth?.token;
            if (localToken) await CACHE.set(CACHE_PARAMS.accessToken, localToken);
        } catch (e) {
            // Silence store peek errors
        }
    }

    if (localToken) {
        request.headers['Authorization'] = `Bearer ${localToken}`;
    }
    return request;
})
APIkit.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401) {
            console.warn("⚓ Institutional Authorization Breach! Validating session...");
            const { CACHE_PARAMS } = require('./consts/Global');
            const { CACHE } = require('./helper');
            const token = await CACHE.get(CACHE_PARAMS.accessToken);
            if (token) {
                await CACHE.remove(CACHE_PARAMS.accessToken);
                await CACHE.remove(CACHE_PARAMS.userData);
                await CACHE.remove(CACHE_PARAMS.userType);
                try {
                    const { store } = require('../store');
                    const { logout } = require('../slices/authSlice');
                    store.dispatch(logout());
                } catch (e) {
                    console.log("Failed to dispatch logout:", e);
                }
            }
        }
        return Promise.reject(error);
    }
);
export { APIkit }