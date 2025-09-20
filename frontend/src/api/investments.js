// frontend/src/api/investments.js
import client from "./client";

// Fetch all investments (returns array directly)
export async function apiGetInvestments() {
  try {
    const { data } = await client.get("/investments");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Failed to fetch investments:", err);
    return [];
  }
}


// Invest in a product
export async function apiInvest(payload) {
  const { data } = await client.post("/investments", payload);
  return data;
}

// Fetch user's portfolio (same as investments)
export async function apiGetPortfolio() {
  try {
    const { data } = await client.get("/investments", {
      headers: { "Cache-Control": "no-cache" },
    });
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Failed to fetch portfolio:", err);
    return [];
  }
}


// Fetch AI portfolio insights
export async function apiGetPortfolioInsights() {
  try {
    const { data } = await client.get("/portfolio/insights");
    return data;
  } catch (err) {
    console.error("Failed to fetch portfolio insights:", err);
    return { totalInvested: 0, riskDistribution: { low: 0, moderate: 0, high: 0 }, aiText: "" };
  }
}


export async function apiGetPlatformStats() {
  const { data } = await client.get("/admin/platform-stats");
  return data; // { totalUsers, totalInvested, activeProducts }
}