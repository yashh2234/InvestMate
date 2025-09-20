// frontend/src/components/ResetPasswordModal.jsx
import { useState, useEffect } from "react";
import { apiRequestPasswordReset, apiResetPassword } from "../api/authReset";
import { checkPasswordStrength } from "../utils/passwordStrength"; 

export default function ResetPasswordModal({ onClose }) {
  const [step, setStep] = useState("request"); // request | otp | set
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState("otp"); // "otp" or "token"
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [passwordErrors, setPasswordErrors] = useState([]);

  // 🔹 Live password strength validation
  useEffect(() => {
    if (newPass) {
      setPasswordErrors(checkPasswordStrength(newPass));
    } else {
      setPasswordErrors([]);
    }
  }, [newPass]);

  async function handleRequest(e) {
    e.preventDefault();
    try {
      await apiRequestPasswordReset({ email, mode });
      setMsg("Check your email for instructions.");
      if (mode === "otp") setStep("otp");
      else setStep("set");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to send reset request");
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    if (newPass !== confirm) return setMsg("Passwords do not match");
    if (passwordErrors.length) return setMsg("Please fix password issues first");

    try {
      await apiResetPassword({ email, otp, token, new_password: newPass });
      setMsg("Password reset successful. You can log in now.");
      setTimeout(onClose, 2000);
    } catch (err) {
      setMsg(err?.response?.data?.message || "Reset failed");
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96">
        {step === "request" && (
          <form onSubmit={handleRequest}>
            <h2 className="text-lg font-semibold mb-3">Reset Password</h2>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border p-2 rounded mb-3"
            />
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            >
              <option value="otp">OTP (code sent to email)</option>
              <option value="token">Email link</option>
            </select>
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Send Reset Instructions
            </button>
          </form>
        )}

        {step !== "request" && (
          <form onSubmit={handleReset}>
            {mode === "otp" && (
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full border p-2 rounded mb-3"
              />
            )}
            {mode === "token" && (
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste reset token from email link"
                className="w-full border p-2 rounded mb-3"
              />
            )}
            <input
              type="password"
              required
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="New password"
              className="w-full border p-2 rounded mb-2"
            />
            {/* 🔹 Show live password strength feedback */}
            {passwordErrors.length > 0 && (
              <ul className="text-sm text-red-600 mb-2">
                {passwordErrors.map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
              </ul>
            )}
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              className="w-full border p-2 rounded mb-3"
            />
            <button
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
              disabled={passwordErrors.length > 0}
            >
              Reset Password
            </button>
          </form>
        )}

        {msg && <p className="mt-3 text-sm text-center text-gray-700">{msg}</p>}

        <button
          onClick={onClose}
          className="mt-4 w-full text-sm text-gray-600 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
