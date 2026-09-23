import { BASE_URL } from "./config";

/**
 * 🏛️ Central School API Service
 * Fetches all dynamic content managed in CRM Admin portal.
 */

export const fetchSchoolInfo = async () => {
  try {
    const response = await fetch(`${BASE_URL}/settings/school-info`, { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      if (data && (data.schoolName || data.name || data.id)) {
        return data;
      }
    }
  } catch (error) {
    console.error("Error fetching school info:", error);
  }
  return null;
};

export const fetchEvents = async () => {
  try {
    const res = await fetch(`${BASE_URL}/website/events`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (error) {
    console.error("Error fetching events:", error);
  }
  return [];
};

export const fetchStaffList = async () => {
  try {
    const res = await fetch(`${BASE_URL}/staff`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (error) {
    console.error("Error fetching staff:", error);
  }
  return [];
};

export const fetchGallery = async () => {
  try {
    const res = await fetch(`${BASE_URL}/website/gallery`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (error) {
    console.error("Error fetching gallery:", error);
  }
  return [];
};

export const fetchNotices = async () => {
  try {
    const res = await fetch(`${BASE_URL}/website/notices`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (error) {
    console.error("Error fetching notices:", error);
  }
  return [];
};

export const fetchTestimonials = async () => {
  try {
    const response = await fetch(`${BASE_URL}/website/testimonials`, { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) return data;
    }
  } catch (error) {
    console.error("Error fetching testimonials:", error);
  }
  return [];
};

export const fetchToppers = async () => {
  try {
    const response = await fetch(`${BASE_URL}/website/toppers`, { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) return data;
    }
  } catch (error) {
    console.error("Error fetching toppers:", error);
  }
  return [];
};

export const fetchBanners = async () => {
  try {
    const response = await fetch(`${BASE_URL}/website/web-banners`, { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) return data;
    }
  } catch (error) {
    console.error("Error fetching banners:", error);
  }
  return [];
};

export const fetchFeeStructure = async () => {
  try {
    const res = await fetch(`${BASE_URL}/public/fee-structure`, { cache: 'no-store' });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("Error fetching fee structure:", err);
  }
  return null;
};

export const fetchTransportRoutes = async () => {
  try {
    const res = await fetch(`${BASE_URL}/public/transport-routes`, { cache: 'no-store' });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("Error fetching transport routes:", err);
  }
  return null;
};

export const fetchCareersConfig = async () => {
  try {
    const res = await fetch(`${BASE_URL}/public/careers`, { cache: 'no-store' });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("Error fetching careers config:", err);
  }
  return null;
};


