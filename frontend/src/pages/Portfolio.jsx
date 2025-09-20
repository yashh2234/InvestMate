// src/pages/Portfolio.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiGetPortfolio, apiGetPortfolioInsights } from "../api/api";
import DashboardLayout from "../components/layout/DashboardLayout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart, Bar, CartesianGrid } from "recharts";
import { TrendingUp, ShieldCheck, PieChart as PieIcon } from "lucide-react";

export default function Portfolio() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [insights, setInsights] = useState("");
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const data = await apiGetPortfolio();
      setPortfolio(
        data.map((inv) => ({
          id: inv.id,
          product_name: inv.name,
          amount: inv.amount,
          expected_return: inv.expected_return,
          maturity_date: inv.maturity_date,
          risk_level: inv.risk_level,
          investment_type: inv.investment_type,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch portfolio:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchPortfolio();
  }, [isAuthenticated, location.pathname]);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const data = await apiGetPortfolioInsights();
        setInsights(data.insights || "No insights available.");
      } catch (err) {
        setInsights("Failed to load insights.");
      }
    }
    fetchInsights();
  }, []);

  if (loading)
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-gray-200"></div>
        </div>
      </DashboardLayout>
    );

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  // Prepare chart data
  const growthData = portfolio.map((inv) => ({
    name: inv.product_name || `Investment ${idx + 1}`,
    value: Number(inv.amount || 0) + Number(inv.expected_return || 0)
  }));

  const riskData = [
    { name: "Low", value: portfolio.filter((i) => i.risk_level === "low").length },
    { name: "Moderate", value: portfolio.filter((i) => i.risk_level === "moderate").length },
    { name: "High", value: portfolio.filter((i) => i.risk_level === "high").length },
  ];

  const COLORS = ["#4ade80", "#facc15", "#f87171"];

  // Determine overall risk for insights card
  const highRiskPercent =
    (portfolio.filter((i) => i.risk_level === "high").length / portfolio.length) * 100 || 0;
  const riskClass =
    highRiskPercent > 50
      ? "bg-red-50 border-red-400"
      : highRiskPercent > 20
      ? "bg-yellow-50 border-yellow-400"
      : "bg-green-50 border-green-400";

  return (
    <DashboardLayout>
      {/* Investments Table */}
      <div className="overflow-x-auto mb-6 bg-white rounded-xl shadow-md p-4">
        <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <TrendingUp size={20} /> Investments
        </h3>
        <table className="min-w-full border-collapse border">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Expected Return</th>
              <th className="p-2 border">Maturity Date</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Risk</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="p-2 border">{inv.product_name}</td>
                <td className="p-2 border">₹{inv.amount}</td>
                <td className="p-2 border">₹{inv.expected_return}</td>
                <td className="p-2 border">
                  {inv.maturity_date
                    ? new Date(inv.maturity_date).toLocaleDateString()
                    : "-"}
                </td>
                <td className="p-2 border text-center">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {inv.investment_type?.toUpperCase()}
                  </span>
                </td>
                <td className="p-2 border text-center">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      inv.risk_level === "low"
                        ? "bg-green-200 text-green-800"
                        : inv.risk_level === "moderate"
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {inv.risk_level}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Portfolio Growth */}
        <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
          <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <TrendingUp size={20} /> Portfolio Growth
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={growthData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value}`} />
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <Line
                type="monotone"
                dataKey="value"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
          <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <PieIcon size={20} /> Risk Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={riskData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ percent }) => `${Math.round(percent * 100)}%`}
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={36} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Portfolio Insights */}
      <div className={`p-4 rounded-xl shadow-md border-l-4 ${riskClass}`}>
        <h3 className="text-xl font-semibold flex items-center gap-2 mb-2">
          <ShieldCheck size={20} /> Portfolio Insights
        </h3>
        <p className="text-gray-700">{insights}</p>
      </div>
    </DashboardLayout>
  );
}