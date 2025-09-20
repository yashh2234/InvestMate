// src/pages/Products.jsx
import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import {
  apiGetProducts,
  apiInvest,
  apiGetPortfolio,
  apiDeleteProduct,
  apiGetRecommendedProducts,
} from "../api/api";
import AddProductModal from "../components/products/AddProductModal";
import EditProductModal from "../components/products/EditProductModal";
import InvestModal from "../components/products/InvestModal";

export default function Products() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [products, setProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState([]);

  // Filters
  const [filterType, setFilterType] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");
  const [filterMinYield, setFilterMinYield] = useState("");
  const [filterMaxYield, setFilterMaxYield] = useState("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [investProduct, setInvestProduct] = useState(null);

  const fetchPortfolio = async () => {
    try {
      const data = await apiGetPortfolio();
      setPortfolio([...data]);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await apiGetProducts();
      setProducts(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommended = async () => {
    if (!isAdmin) {
      try {
        const res = await apiGetRecommendedProducts();
        setRecommendedProducts(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("Failed to load recommended products:", err);
      }
    }
  };

  useEffect(() => {
    loadProducts();
    loadRecommended();
  }, []);

  const filteredProducts = useMemo(() => {
    // Exclude recommended products from main grid
    const recommendedIds = recommendedProducts.map((p) => p.id);

    return products
      .filter((p) => !recommendedIds.includes(p.id))
      .filter((p) => {
        const typeMatch =
          filterType === "all" || (p.investment_type || "").toLowerCase() === filterType;
        const riskMatch =
          filterRisk === "all" || (p.risk_level || "").toLowerCase() === filterRisk;
        const minYieldMatch = !filterMinYield || (p.annual_yield || 0) >= parseFloat(filterMinYield);
        const maxYieldMatch = !filterMaxYield || (p.annual_yield || 0) <= parseFloat(filterMaxYield);
        return typeMatch && riskMatch && minYieldMatch && maxYieldMatch;
      });
  }, [products, recommendedProducts, filterType, filterRisk, filterMinYield, filterMaxYield]);

  const handleInvest = (product) => setInvestProduct(product);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await apiDeleteProduct(id);
      loadProducts();
      loadRecommended();
    } catch (err) {
      alert("Failed to delete product");
    }
  };

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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        {isAdmin && (
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
            onClick={() => setShowAddModal(true)}
          >
            + Add Product
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-wrap gap-4 items-center">
        <select
          className="border p-2 rounded"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="bond">Bond</option>
          <option value="fd">FD</option>
          <option value="mf">MF</option>
          <option value="etf">ETF</option>
          <option value="other">Other</option>
        </select>

        <select
          className="border p-2 rounded"
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
        >
          <option value="all">All Risks</option>
          <option value="low">Low</option>
          <option value="moderate">Moderate</option>
          <option value="high">High</option>
        </select>

        <input
          type="number"
          placeholder="Min Yield %"
          className="border p-2 rounded w-28"
          value={filterMinYield}
          onChange={(e) => setFilterMinYield(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Yield %"
          className="border p-2 rounded w-28"
          value={filterMaxYield}
          onChange={(e) => setFilterMaxYield(e.target.value)}
        />

        <button
          className="text-sm text-gray-600 hover:text-gray-800"
          onClick={() => {
            setFilterType("all");
            setFilterRisk("all");
            setFilterMinYield("");
            setFilterMaxYield("");
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Recommended Products */}
      {!isAdmin && recommendedProducts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Recommended Products</h2>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {recommendedProducts.map((prod) => (
              <div
                key={prod.id}
                className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl shadow hover:shadow-xl hover:-translate-y-1 transition transform relative"
              >
                <span className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-semibold px-2 py-1 rounded-full">
                  AI Suggested
                </span>

                <h3 className="font-semibold text-lg">{prod.name}</h3>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">{prod.investment_type?.toUpperCase()}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      prod.risk_level === "low"
                        ? "bg-green-200 text-green-800"
                        : prod.risk_level === "moderate"
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {prod.risk_level}
                  </span>
                </div>
                <p className="mt-1 text-sm">
                  Tenure: {prod.tenure_months || "-"} mo | Yield: {prod.annual_yield || "-"}%
                </p>
                <p className="mt-2 text-sm text-gray-600 truncate">{prod.description || "No description"}</p>
                <button
                  className="mt-3 w-full bg-blue-500 text-white rounded hover:bg-blue-600 px-3 py-1 transition"
                  onClick={() => handleInvest(prod)}
                >
                  Invest
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Products Grid */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.length === 0 && <p>No products found.</p>}
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className="p-4 bg-white rounded-xl shadow hover:shadow-xl hover:-translate-y-1 transition transform relative"
          >
            <h3 className="font-semibold text-lg">{prod.name}</h3>
            <div className="flex gap-2 mt-1 flex-wrap">
              <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">{prod.investment_type?.toUpperCase()}</span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  prod.risk_level === "low"
                    ? "bg-green-200 text-green-800"
                    : prod.risk_level === "moderate"
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                {prod.risk_level}
              </span>
            </div>
            <p className="mt-1 text-sm">
              Tenure: {prod.tenure_months || "-"} mo | Yield: {prod.annual_yield || "-"}%
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Min: ₹{prod.min_investment || "-"} {prod.max_investment ? `| Max: ₹${prod.max_investment}` : ""}
            </p>
            <p className="mt-2 text-sm text-gray-600 truncate">{prod.description || "No description"}</p>

            {isAdmin ? (
              <div className="mt-3 flex gap-2">
                <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition" onClick={() => setEditProduct(prod)}>Edit</button>
                <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition" onClick={() => handleDelete(prod.id)}>Delete</button>
              </div>
            ) : (
              <button
                className="mt-3 w-full bg-blue-500 text-white rounded hover:bg-blue-600 px-3 py-1 transition"
                onClick={() => handleInvest(prod)}
              >
                Invest
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Modals */}
      {showAddModal && <AddProductModal onClose={() => setShowAddModal(false)} onProductAdded={setProducts} />}
      {editProduct && <EditProductModal product={editProduct} onClose={() => setEditProduct(null)} onProductUpdated={setProducts} />}
      {investProduct && <InvestModal product={investProduct} onClose={() => setInvestProduct(null)} onInvested={async () => { await fetchPortfolio(); await loadRecommended(); setInvestProduct(null); }} />}
    </DashboardLayout>
  );
}
