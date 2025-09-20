// backend/utils/aiSummarizer.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
/**
 * Summarizes API error logs using AI in a concise, developer-friendly way.
 * @param {Array} logs - Array of log objects: { endpoint, status_code, error_message }
 * @returns {string} AI summary
 */
async function summarizeErrorsWithAI(logs) {
  try {
    if (!logs || logs.length === 0) return "No errors found.";

    // Only keep logs with actual error messages
    const logsWithErrors = logs.filter(
      (l) => l.error_message && l.error_message.trim() !== ""
    );
    if (logsWithErrors.length === 0) return "No errors found.";

    // Limit logs to first 50 to avoid token overload
    const limitedLogs = logsWithErrors.slice(0, 50);

    const prompt = `
You are an AI assistant. Summarize the following API error logs in a concise, developer-friendly way.
Highlight common issues and suggest possible causes.

Logs:
${limitedLogs
      .map(
        (l) =>
          `Endpoint: ${l.endpoint}, Status: ${l.status_code}, Error: ${l.error_message}`
      )
      .join("\n")}
`;

    const result = await model.generateContent(prompt);

    // Handle different SDK response structures
    let summary =
      result.response?.[0]?.output_text ||
      result.output_text ||
      result.candidates?.[0]?.content?.[0]?.text ||
      "";

    // Fallback if AI returns empty
    if (!summary.trim()) {
      summary =
        "The AI could not generate a summary. Please review the logs manually.";
    }

    return summary;
  } catch (err) {
    console.error("AI summarization failed:", err.message, err);
    if (err.status === 429 && err.errorDetails) {
      return `Rate limit exceeded. Retry after some time.`;
    }
    return "AI summarization failed. Please check logs.";
  }
}

module.exports = { summarizeErrorsWithAI };
