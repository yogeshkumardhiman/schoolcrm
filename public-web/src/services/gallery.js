import { BASE_URL } from "./config";

export const fetchGallery = async () => {
  try {
    const response = await fetch(`${BASE_URL}/public/gallery`);
    return await response.json();
  } catch (error) {
    console.warn("Institutional Vault Activated.");
    return [];
  }
};
