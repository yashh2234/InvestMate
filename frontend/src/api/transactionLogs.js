// src/api/transactionLogs.js
import client from "./client";

export async function apiGetTransactionLogs(params = {}) {
  try {
    const { data } = await client.get("/transaction-logs", { params });
    return {
      logs: data.logs || [],
      ai_summary: data.ai_summary || "",
    };
  } catch (err) {
    console.error("Failed to fetch transaction logs:", err);
    return { logs: [], ai_summary: "" };
  }
}
