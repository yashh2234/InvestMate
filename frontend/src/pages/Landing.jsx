// src/pages/Landing.jsx
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-xl w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-5xl font-extrabold text-indigo-700">InvestMate</h1>
          <br />
          <h3 className="text-3xl font-extrabold text-black">Mini Investment Platform</h3>
          <p className="mt-4 text-gray-600 text-lg">
            A smart way to manage your investments. Track, invest, and grow your wealth.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex justify-center gap-6">
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 transition-all"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="px-6 py-3 bg-white border border-indigo-600 text-indigo-600 rounded-xl shadow hover:bg-indigo-50 transition-all"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
