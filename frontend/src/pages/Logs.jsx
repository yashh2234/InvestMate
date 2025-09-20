// src/pages/Logs.jsx
import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { apiGetTransactionLogs } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { AlertCircle, Filter } from "lucide-react";

export default function Logs() {
  const { user } = useAuth();
  const { role } = user || {};

  const [logs, setLogs] = useState([]);
  const [aiSummary, setAiSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterMethod, setFilterMethod] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterEmail, setFilterEmail] = useState("");

  const statusMap = {
    200: "OK",
    201: "Created",
    304: "Not Modified",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Server Error",
  };

  const getStatusBadge = (code) => {
    const label = statusMap[code] || "Other";
    const base =
      "px-2 py-1 rounded text-xs font-semibold inline-block text-center";

    if (code === 304)
      return <span className={`${base} bg-blue-100 text-blue-700`}>{`${code} ${label}`}</span>;
    if (code >= 200 && code < 300)
      return <span className={`${base} bg-green-100 text-green-700`}>{`${code} ${label}`}</span>;
    if (code >= 400 && code < 500)
      return <span className={`${base} bg-orange-100 text-orange-700`}>{`${code} ${label}`}</span>;
    if (code >= 500)
      return <span className={`${base} bg-red-100 text-red-700`}>{`${code} ${label}`}</span>;

    return <span className={`${base} bg-gray-100 text-gray-700`}>{code}</span>;
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (role === "admin" && filterEmail.trim()) {
        params.email = filterEmail.trim();
      }
      const res = await apiGetTransactionLogs(params);
      setLogs(res.logs || []);
      setAiSummary(res.ai_summary || "");
    } catch (err) {
      console.error(err);
      setLogs([]);
      setAiSummary("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Apply filters
  const filteredLogs = logs.filter(
    (log) =>
      (filterMethod === "all" || log.http_method === filterMethod) &&
      (filterStatus === "all" || String(log.status_code) === filterStatus)
  );

  if (loading)
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-gray-200"></div>
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      {/* AI Summary */}
      {aiSummary && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-xl shadow-md mb-6 flex items-start gap-2">
          <AlertCircle size={20} className="text-red-500 mt-1" />
          <div>
            <p className="font-semibold">
              AI Error Summary {role === "admin" && filterEmail ? `(for ${filterEmail})` : ""}
            </p>
            <p className="text-gray-700">{aiSummary}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-6 flex flex-wrap items-center gap-4">
        <Filter size={20} className="text-gray-600" />
        <select
          className="border p-2 rounded"
          value={filterMethod}
          onChange={(e) => setFilterMethod(e.target.value)}
        >
          <option value="all">All Methods</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>

        <select
          className="border p-2 rounded"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status Codes</option>
          {Object.keys(statusMap).map((code) => (
            <option key={code} value={code}>
              {code} {statusMap[code]}
            </option>
          ))}
        </select>

        {role === "admin" && (
          <>
            <input
              type="text"
              placeholder="Filter by user email"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              className="border p-2 rounded"
            />
            <button
              onClick={loadLogs}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Apply
            </button>
            <button
              onClick={() => {
                setFilterEmail("");
                loadLogs();
              }}
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              Clear
            </button>
          </>
        )}
      </div>

      {/* Logs Table */}
      <div className="bg-white p-4 rounded-xl shadow-md overflow-x-auto">
        <table className="min-w-full border-collapse border">
          <thead className="bg-gray-100 sticky top-0 shadow-md">
            <tr>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">User Email</th>
              <th className="p-2 border">Endpoint</th>
              <th className="p-2 border">Method</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Error Message</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">
                  No logs found.
                </td>
              </tr>
            )}
            {filteredLogs.map((log, idx) => (
              <tr
                key={log.id}
                className={idx % 2 === 0 ? "bg-gray-50" : ""}
              >
                <td className="p-2 border">{log.created_at ? new Date(log.created_at).toLocaleString() : "-"}</td>
                <td className="p-2 border">{log.email || "—"}</td>
                <td className="p-2 border">{log.endpoint}</td>
                <td className="p-2 border font-semibold">{log.http_method}</td>
                <td className="p-2 border">{getStatusBadge(log.status_code)}</td>
                <td className="p-2 border text-red-600">
                  {log.error_message && log.error_message.trim() !== "" ? log.error_message : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
