import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import PasswordStrengthMeter from "../components/forms/PasswordStrengthMeter";

// Validation Schema
const signupSchema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string(),
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must include at least one uppercase letter")
    .matches(/[a-z]/, "Password must include at least one lowercase letter")
    .matches(/[0-9]/, "Password must include at least one number")
    .matches(/[^a-zA-Z0-9]/, "Password must include at least one special character"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [strengthSuggestions, setStrengthSuggestions] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: yupResolver(signupSchema) });

  // Watch password, firstName, lastName, email
  const passwordValue = watch("password");
  const firstNameValue = watch("firstName");
  const lastNameValue = watch("lastName");
  const emailValue = watch("email");

  // Real-time AI password strength check
  useEffect(() => {
    const checkStrength = async () => {
      if (!passwordValue) {
        setStrengthSuggestions([]);
        return;
      }

      try {
        const res = await axios.post("http://localhost:5000/utils/password-strength", {
          password: passwordValue,
          firstName: firstNameValue || "",
          lastName: lastNameValue || "",
          email: emailValue || "",
        });
        setStrengthSuggestions(res.data.suggestions || []);
      } catch (err) {
        console.error("Password strength check failed:", err);
        setStrengthSuggestions([]);
      }
    };

    const debounce = setTimeout(checkStrength, 500);
    return () => clearTimeout(debounce);
  }, [passwordValue, firstNameValue, lastNameValue, emailValue]);

  const onSubmit = async (data) => {
    try {
      await signup({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
        risk_appetite: data.riskAppetite || "moderate",
      });
      navigate("/dashboard");
    } catch (e) {
      alert(e?.response?.data?.message || "Signup failed");
      if (e?.response?.data?.suggestions) {
        setStrengthSuggestions(e.response.data.suggestions);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-4">
          Create Account
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block mb-1 font-medium">First Name</label>
            <input
              {...register("firstName")}
              type="text"
              placeholder="Yash"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-red-500 text-sm mt-1">{errors.firstName?.message}</p>
          </div>

          {/* Last Name */}
          <div>
            <label className="block mb-1 font-medium">Last Name</label>
            <input
              {...register("lastName")}
              type="text"
              placeholder="Agrawal"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              {...register("email")}
              type="email"
              placeholder="example@domain.com"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-red-500 text-sm mt-1">{errors.email?.message}</p>
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              {...register("password")}
              type="password"
              placeholder="Enter password"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-red-500 text-sm mt-1">{errors.password?.message}</p>

            {/* Password Strength Meter */}
            <PasswordStrengthMeter password={passwordValue} suggestions={strengthSuggestions} />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-1 font-medium">Confirm Password</label>
            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="Re-enter password"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword?.message}</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Sign Up
          </button>

          <p className="text-center text-sm mt-3">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-indigo-600 cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
