import { useState, useEffect } from "react";
import axios from "axios";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [strengthSuggestions, setStrengthSuggestions] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Check password strength in real-time
  useEffect(() => {
    const checkStrength = async () => {
      if (newPassword.length < 6) {
        setStrengthSuggestions(["Password too short"]);
        return;
      }
      try {
        const res = await axios.post("http://localhost:5000/utils/password-strength", {
          password: newPassword,
        });
        setStrengthSuggestions(res.data.suggestions || []);
      } catch (err) {
        console.error("Password strength error:", err);
        setStrengthSuggestions([]);
      }
    };

    const delayDebounce = setTimeout(checkStrength, 500); // debounce 0.5s
    return () => clearTimeout(delayDebounce);
  }, [newPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/auth/reset-password", {
        email,
        otp,
        new_password: newPassword,
      });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Error resetting password");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />

        <label className="block mb-2">OTP</label>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />

        <label className="block mb-2">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded mb-2"
        />

        {/* Password Strength Suggestions */}
        {strengthSuggestions.length > 0 && (
          <ul className="text-red-600 text-sm mb-4">
            {strengthSuggestions.map((s, idx) => (
              <li key={idx}>• {s}</li>
            ))}
          </ul>
        )}

        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
          Reset Password
        </button>
      </form>

      {message && <p className="text-green-600 mt-4">{message}</p>}
      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}
