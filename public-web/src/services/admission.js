import { BASE_URL } from "./config";

export const submitInquiry = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/admissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error("Error submitting inquiry:", error);
    return { success: false, message: "Server reached, simulation success." };
  }
};

export const submitContact = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error("Error submitting contact message:", error);
    return {
      success: false,
      message: "Institutional Error: Use Offline Helpline instead.",
    };
  }
};
