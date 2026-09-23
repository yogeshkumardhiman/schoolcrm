import { BASE_URL } from "./config";

export const fetchNotices = async () => {
  try {
    const response = await fetch(`${BASE_URL}/public/notices`);
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error("Error fetching notices:", error);
    return [];
  }
};
