// src/components/products/InvestModal.jsx
import { useState } from "react";
import { apiInvest } from "../../api/api";

export default function InvestModal({ product, onClose, onInvested }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  if (!product) return null; // <-- safe guard

  const handleSubmit = async () => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      return alert("Please enter a valid amount");
    }
    if (parsed < product.min_investment) {
      return alert(`Amount must be at least ₹${product.min_investment}`);
    }
    if (product.max_investment && parsed > product.max_investment) {
      return alert(`Amount cannot exceed ₹${product.max_investment}`);
    }

    setLoading(true);
    try {
      // Call backend to invest
      await apiInvest({ product_id: product.id, amount: parsed });

      // Optional: small delay to ensure backend commits
      await new Promise((res) => setTimeout(res, 100));

      // Trigger parent callback to refresh page data
      if (onInvested) await onInvested();

      // Close modal
      onClose();
    } catch (err) {
      console.error("Investment API error:", err);
      alert(err.response?.data?.message || "Investment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Invest in {product.name}</h2>

        <p className="text-sm text-gray-600 mb-2">
          Min: ₹{product.min_investment}
          {product.max_investment && ` | Max: ₹${product.max_investment}`}
        </p>

        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
          min={product.min_investment}
          max={product.max_investment || undefined}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
