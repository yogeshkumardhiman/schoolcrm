import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { WEB_BASE_URL } from './consts/Api';

// Simple cache wrapper
const CACHE = {
    set: async (key, value) => {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error("[CACHE] Error saving data:", e);
        }
    },
    get: async (key) => {
        try {
            const data = await AsyncStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error("[CACHE] Error parsing data:", e);
            return null;
        }
    },
    remove: async (key) => {
        try {
            await AsyncStorage.removeItem(key);
        } catch (e) {
            console.error("[CACHE] Error removing data:", e);
        }
    },
};

const showToast = ({ type, message }) => {
    Toast.show({
        type: type,
        position: 'top',
        text1: message,
        visibilityTime: 4000,
        autoHide: true,
        ...ifIphoneX(
            { topOffset: 50 },
            { topOffset: 35 }
        ),
    });
};

const getResolvedUrl = (url) => {
    if (!url) return null;
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
        const parts = url.split('/uploads/');
        if (parts.length > 1) {
            return `${WEB_BASE_URL}uploads/${parts[1]}`;
        }
    }
    return url;
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
    } catch (e) {
        return dateString;
    }
};

export {
    CACHE,
    showToast,
    getResolvedUrl,
    formatDate
};