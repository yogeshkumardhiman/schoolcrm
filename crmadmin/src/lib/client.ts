import { APP_CONFIG } from '@/constants/config';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost';
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl) {
      if (isLocalhost && envUrl.includes('127.0.0.1')) {
        return envUrl.replace('127.0.0.1', 'localhost');
      }
      if (!isLocalhost && envUrl.includes('localhost')) {
        return envUrl.replace('localhost', '127.0.0.1');
      }
      return envUrl;
    }
    return isLocalhost ? 'http://localhost:4000' : 'http://127.0.0.1:4000';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';
};

async function handleResponse(response: Response) {
  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.replace('/login');
      }
    }
    const error = await response.json().catch(() => ({ error: 'Unknown API error' }));
    throw new Error(error.message || error.error || error.detail || `HTTP Error ${response.status}`);
  }
  return response.json();
}

async function requestApi(endpoint: string, options: RequestInit = {}) {
  const primaryBase = getApiBaseUrl();
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem(APP_CONFIG.auth.tokens.auth) ||
        localStorage.getItem('sdm_auth_token')
      : null;

  const headers: Record<string, string> = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers as Record<string, string>),
  };

  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${primaryBase}${endpoint}`, {
      ...options,
      headers,
    });
    return await handleResponse(response);
  } catch (err: any) {
    if (err?.name === 'TypeError' && err?.message === 'Failed to fetch') {
      console.warn(
        `[API Client] Network connection to ${primaryBase}${endpoint} failed. Ensure backend is running on port 4000.`,
      );
    }
    throw err;
  }
}

const client = {
  get: async (endpoint: string, options: RequestInit = {}) => {
    return requestApi(endpoint, { ...options, method: 'GET' });
  },

  post: async (endpoint: string, data?: any, options: RequestInit = {}) => {
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      return client.upload(endpoint, data, options);
    }
    return requestApi(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  put: async (endpoint: string, data?: any, options: RequestInit = {}) => {
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      return client.upload(endpoint, data, { ...options, method: 'PUT' });
    }
    return requestApi(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  delete: async (endpoint: string, options: RequestInit = {}) => {
    return requestApi(endpoint, { ...options, method: 'DELETE' });
  },

  // For file uploads
  upload: async (endpoint: string, formData: FormData, options: RequestInit = {}) => {
    const primaryBase = getApiBaseUrl();
    const token = typeof window !== 'undefined' ? localStorage.getItem(APP_CONFIG.auth.tokens.auth) || localStorage.getItem('sdm_auth_token') : null;
    const headers = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };
    const response = await fetch(`${primaryBase}${endpoint}`, {
      ...options,
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse(response);
  }
};

export default client;
