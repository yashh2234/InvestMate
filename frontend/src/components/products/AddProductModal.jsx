// src/components/products/AddProductModal.jsx
import { useState } from "react";
import { apiCreateProduct, apiGetProducts, apiGenerateProductDescription } from "../../api/api";

export default function AddProductModal({ onClose, onProductAdded }) {
  const [form, setForm] = useState({
    name: "",
    investment_type: "bond",
    tenure_months: 12,
    annual_yield: 8,
    risk_level: "moderate",
    min_investment: 1000,
    max_investment: null,
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        ["tenure_months", "annual_yield", "min_investment", "max_investment"].includes(name)
          ? value === "" ? null : Number(value)
          : value,
    }));
  };

  const handleGenerateDescription = async () => {
    if (!form.name) return alert("Please enter the product name first");

    try {
      const desc = await apiGenerateProductDescription({
        name: form.name,
        investment_type: form.investment_type,
        tenure_months: form.tenure_months,
        annual_yield: form.annual_yield,
        risk_level: form.risk_level,
        min_investment: form.min_investment,
        max_investment: form.max_investment,
      });
      setForm((prev) => ({ ...prev, description: desc }));
    } catch (err) {
  console.error("Generate description failed:", err);

  // Axios attaches response info here
  const message =
    err.response?.data?.message ||    // backend error message
    err.response?.data?.error ||      // some APIs return "error"
    err.message;                      // fallback

  alert(`Failed to generate description: ${message}`);
}

  };

  const handleSubmit = async () => {
    // Validation
    if (!form.name.trim()) return alert("Product name is required");
    if (form.min_investment <= 0) return alert("Min investment must be greater than 0");
    if (form.max_investment && form.max_investment < form.min_investment)
      return alert("Max investment cannot be less than Min investment");

    try {
      await apiCreateProduct(form);
      const updated = await apiGetProducts();
      onProductAdded(updated);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add product");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Add New Product</h2>

        {/* Product Name */}
        <div className="mb-3 flex items-center gap-3">
          <label htmlFor="name" className="w-40 font-semibold">Product Name:</label>
          <input
            id="name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="border p-2 rounded flex-1"
            placeholder="Enter product name"
          />
        </div>

        {/* Investment Type */}
        <div className="mb-3 flex items-center gap-3">
          <label htmlFor="investment_type" className="w-40 font-semibold">Investment Type:</label>
          <select
            id="investment_type"
            name="investment_type"
            value={form.investment_type}
            onChange={handleChange}
            className="border p-2 rounded flex-1"
          >
            <option value="bond">Bond</option>
            <option value="fd">Fixed Deposit</option>
            <option value="mf">Mutual Fund</option>
            <option value="etf">ETF</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Tenure */}
        <div className="mb-3 flex items-center gap-3">
          <label htmlFor="tenure_months" className="w-40 font-semibold">Tenure (months):</label>
          <input
            id="tenure_months"
            type="number"
            name="tenure_months"
            value={form.tenure_months}
            onChange={handleChange}
            className="border p-2 rounded flex-1"
            min={1}
          />
        </div>

        {/* Annual Yield */}
        <div className="mb-3 flex items-center gap-3">
          <label htmlFor="annual_yield" className="w-40 font-semibold">Annual Yield (%):</label>
          <input
            id="annual_yield"
            type="number"
            step="0.5"
            name="annual_yield"
            value={form.annual_yield}
            onChange={handleChange}
            className="border p-2 rounded flex-1"
            min={0}
          />
        </div>

        {/* Risk Level */}
        <div className="mb-3 flex items-center gap-3">
          <label htmlFor="risk_level" className="w-40 font-semibold">Risk Level:</label>
          <select
            id="risk_level"
            name="risk_level"
            value={form.risk_level}
            onChange={handleChange}
            className="border p-2 rounded flex-1"
          >
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Min Investment */}
        <div className="mb-3 flex items-center gap-3">
          <label htmlFor="min_investment" className="w-40 font-semibold">Min Investment (₹):</label>
          <input
            id="min_investment"
            type="number"
            name="min_investment"
            value={form.min_investment}
            onChange={handleChange}
            className="border p-2 rounded flex-1"
            min={1000}
          />
        </div>

        {/* Max Investment (optional) */}
        <div className="mb-3 flex items-center gap-3">
          <label htmlFor="max_investment" className="w-40 font-semibold">Max Investment (₹):</label>
          <input
            id="max_investment"
            type="number"
            name="max_investment"
            value={form.max_investment ?? ""}
            onChange={handleChange}
            className="border p-2 rounded flex-1"
            placeholder="Optional"
            min={form.min_investment}
          />
        </div>

        {/* Description with AI generate */}
        <div className="mb-3 flex items-start gap-3">
          <label htmlFor="description" className="w-40 font-semibold">Description:</label>
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              placeholder="Product Description"
              rows={3}
            />
            <button
              type="button"
              className="self-start px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={handleGenerateDescription}
            >
              Generate Description
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
