// frontend/src/pages/ResetPasswordPage.jsx
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiResetPassword } from "../api/authReset";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");

  async function handleReset(e) {
    e.preventDefault();
    if (!newPass || newPass.length < 8) return setMsg("Password must be at least 8 characters");
    if (newPass !== confirm) return setMsg("Passwords do not match");

    try {
      await apiResetPassword({ email, token, new_password: newPass });
      setMsg("Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMsg(err?.response?.data?.message || "Password reset failed");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-4">
          Reset Password
        </h2>

        <form onSubmit={handleReset} className="space-y-4">
          <p className="text-sm text-gray-600">Resetting password for: {email}</p>

          <input
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            placeholder="New password"
            className="w-full px-3 py-2 border rounded-lg"
            required
          />

          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            className="w-full px-3 py-2 border rounded-lg"
            required
          />

          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Reset Password
          </button>
        </form>

        {msg && <p className="mt-3 text-center text-sm text-gray-700">{msg}</p>}
      </div>
    </div>
  );
}
