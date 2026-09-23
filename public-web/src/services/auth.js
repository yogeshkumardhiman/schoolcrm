import { BASE_URL } from "./config";

export const login = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Authentication failed");
    }
    return await response.json();
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};
