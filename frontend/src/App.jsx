// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Portfolio from "./pages/Portfolio";
import Logs from "./pages/Logs";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ResetPassword from "./components/auth/ResetPassword";
import RequestOTP from "./components/auth/RequestOTP";
import { AuthProvider } from "./context/AuthContext";
import ResetPasswordPage from "./pages/ResetPasswordPage";
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portfolio"
              element={
                <ProtectedRoute>
                  <Portfolio />
                </ProtectedRoute>
              }
            />
            <Route
              path="/logs"
              element={
                <ProtectedRoute>
                  <Logs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/request-otp"
              element={
                <RequestOTP>
                  <Profile />
                </RequestOTP>
              }
            />
            <Route
              path="/reset-password"
              element={
                <ResetPassword>
                  <Profile />
                </ResetPassword>
              }
            />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}
