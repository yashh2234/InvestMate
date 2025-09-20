// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  apiGetPortfolio,
  apiGetPortfolioInsights,
  apiGetPlatformStats,
  apiGetProducts,
} from "../api/api";
import DashboardLayout from "../components/layout/DashboardLayout";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 ${className}`}>
    {children}
  </div>
);
const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState([]);
  const [insights, setInsights] = useState({
    totalInvested: 0,
    riskDistribution: {},
  });
  const [platformStats, setPlatformStats] = useState({});
  const [products, setProducts] = useState([]);
  const investmentsCount = portfolio.length;

  const fetchUserData = async () => {
    try {
      const pData = await apiGetPortfolio();
      const iData = await apiGetPortfolioInsights();
      setPortfolio(
        pData.map((inv) => ({
          id: inv.id,
          product_name: inv.name,
          amount: inv.amount,
          expected_return: inv.expected_return,
          maturity_date: inv.maturity_date,
          risk_level: inv.risk_level,
          investment_type: inv.investment_type,
        }))
      );
      setInsights(iData);
    } catch (err) {
      console.error("Failed to fetch user portfolio:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const stats = await apiGetPlatformStats();
      const productsData = await apiGetProducts();
      setPlatformStats(stats);
      setProducts(productsData);
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) return navigate("/login");

      const fetchData = async () => {
        try {
          setLoading(true);
          if (isAdmin) await fetchAdminData();
          else await fetchUserData();
        } catch (err) {
          console.error("Dashboard fetch error:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [authLoading, isAuthenticated, isAdmin]);

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
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {!isAdmin ? (
          <>
            {/* Portfolio Summary */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-4">Portfolio Summary</h2>
                <p className="text-gray-700 mb-4">
                  Total Invested: <span className="text-xl font-semibold">₹{insights.totalInvested}</span>
                </p>
                <div className="w-full h-64">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Low", value: insights.riskDistribution.low || 0 },
                          { name: "Moderate", value: insights.riskDistribution.moderate || 0 },
                          { name: "High", value: insights.riskDistribution.high || 0 },
                        ]}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ percent }) => (percent === 0 ? null : `${Math.round(percent * 100)}%`)}
                      >
                        <Cell fill="#2db642ff" />
                        <Cell fill="#e5a135ff" />
                        <Cell fill="#e35353ff" />
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value}`} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="bg-blue-50">
              <CardContent>
                <h2 className="text-xl font-bold mb-4 flex flex-col items-center">AI Insights</h2>
                <p className="text-gray-700 flex flex-col items-center">
                  Your portfolio is{" "}
                  <strong className={insights.riskDistribution.high > 50 ? "text-red-600" : "text-green-600"}>
                    {insights.riskDistribution.high > 50 ? "high risk exposed" : "well balanced"}
                  </strong>
                  .
                </p>
              </CardContent>
            </Card>

            {/* Investments Grid */}
            <Card className="lg:col-span-3">
              <CardContent>
                <h3 className="text-xl font-bold mb-4 flex flex-col items-center">
                  Your Investments: {investmentsCount}
                </h3>
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {portfolio.map((inv) => (
                    <div key={inv.id} className="p-4 bg-white rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
                      <p className="font-semibold">{inv.product_name}</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">{inv.investment_type?.toUpperCase()}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            inv.risk_level === "low" ? "bg-green-200 text-green-800" :
                            inv.risk_level === "moderate" ? "bg-yellow-200 text-yellow-800" :
                            "bg-red-200 text-red-800"
                          }`}
                        >
                          {inv.risk_level}
                        </span>
                      </div>
                      <p className="text-sm mt-2">Amount: ₹{inv.amount}</p>
                      <p className="text-sm">Expected Return: ₹{inv.expected_return}</p>
                      <p className="text-sm">Maturity: {inv.maturity_date ? new Date(inv.maturity_date).toLocaleDateString() : "-"}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Admin Stats Cards */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-green-50 to-white">
              <CardContent className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-gray-500">Total Users</p>
                  <p className="text-xl font-bold">{platformStats.totalUsers}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Invested</p>
                  <p className="text-xl font-bold">₹{platformStats.totalInvested}</p>
                </div>
                <div>
                  <p className="text-gray-500">Active Products</p>
                  <p className="text-xl font-bold">{platformStats.activeProducts}</p>
                </div>
              </CardContent>
            </Card>

            {/* Admin AI Insights */}
            <Card className="bg-blue-50">
              <CardContent>
                <h2 className="text-xl font-bold mb-4">AI Insights</h2>
                <p className="text-gray-700">
                  Platform-wide risk assessment or error summary goes here.
                </p>
              </CardContent>
            </Card>

            {/* Products Overview */}
            <Card className="lg:col-span-3">
              <CardContent>
                <h3 className="text-xl font-semibold mb-4">Products Overview</h3>
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {products.map((prod) => (
                    <div key={prod.id} className="p-4 bg-white rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
                      <p className="font-semibold">{prod.name}</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">{prod.investment_type?.toUpperCase()}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            prod.risk_level === "low" ? "bg-green-200 text-green-800" :
                            prod.risk_level === "moderate" ? "bg-yellow-200 text-yellow-800" :
                            "bg-red-200 text-red-800"
                          }`}
                        >
                          {prod.risk_level}
                        </span>
                      </div>
                      <p className="text-sm mt-2">Min Investment: ₹{prod.min_investment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
