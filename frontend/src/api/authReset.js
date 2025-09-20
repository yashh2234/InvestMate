import client from "./client";

// Request reset (OTP or email link)
export async function apiRequestPasswordReset({ email, mode }) {
  return client.post("/auth/request-password-reset", { email, mode });
}

// Perform reset (OTP or token link)
export async function apiResetPassword(payload) {
  try {
    const { data } = await client.post("/auth/reset-password", payload);
    return data;
  } catch (err) {
    console.error("Reset API error:", err.response?.data || err.message);
    throw err;
  }
}
