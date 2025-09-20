// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { apiUpdateUserProfile, apiGetPortfolio } from "../api/api";
import { User, ShieldCheck, Activity } from "lucide-react";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [riskAppetite, setRiskAppetite] = useState("moderate");
  const [portfolio, setPortfolio] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [portfolioLoading, setPortfolioLoading] = useState(true);

  const isAdmin = user?.role === "admin";

  // Initialize risk appetite
  useEffect(() => {
    if (user) setRiskAppetite(user.risk_appetite || "moderate");
  }, [user]);

  // Fetch user's portfolio
  useEffect(() => {
    const fetchPortfolio = async () => {
      setPortfolioLoading(true);
      try {
        const data = await apiGetPortfolio();
        setPortfolio(data || []);
      } catch (err) {
        console.error("Failed to fetch portfolio:", err);
      } finally {
        setPortfolioLoading(false);
      }
    };

    if (!isAdmin) fetchPortfolio();
  }, [isAdmin]);

  // Compute recommended products based on risk appetite
  useEffect(() => {
    if (!isAdmin && portfolio.length > 0) {
      const recommended = portfolio
        .filter((p) => p.risk_level === riskAppetite)
        .sort((a, b) => b.annual_yield - a.annual_yield) // optional: highest yield first
        .slice(0, 5);
      setRecommendedProducts(recommended);
    }
  }, [portfolio, riskAppetite, isAdmin]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const updated = await apiUpdateUserProfile({ risk_appetite: riskAppetite });
      setUser(updated);
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <DashboardLayout>
        <p>Loading profile...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto space-y-6">
        {/* Profile Info */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <User size={20} /> Profile Information
          </h2>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">Name:</span> {user.first_name} {user.last_name}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Email:</span> {user.email}
          </p>
        </div>

        {/* Risk Appetite Section */}
        {!isAdmin && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck size={20} /> Risk Appetite
            </h2>
            <select
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500"
              value={riskAppetite}
              onChange={(e) => setRiskAppetite(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
            <button
              onClick={handleSave}
              disabled={loading}
              className={`w-full py-3 rounded-md text-white font-semibold transition-colors ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
              }`}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

        {/* AI Recommendations */}
        {!isAdmin && (
          <div className="bg-green-50 p-6 rounded-xl shadow-md border-l-4 border-green-400">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
              <Activity size={20} /> AI Recommendations
            </h2>
            {portfolioLoading ? (
              <p className="text-gray-700">Loading recommendations...</p>
            ) : recommendedProducts.length === 0 ? (
              <p className="text-gray-700">
                No recommendations available for your risk appetite.
              </p>
            ) : (
              <ul className="space-y-2">
                {recommendedProducts.map((prod) => (
                  <li
                    key={prod.id}
                    className="p-2 bg-white rounded shadow-sm border border-gray-200 flex justify-center items-center gap-2"
                  >
                    <span className="font-semibold">{prod.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
