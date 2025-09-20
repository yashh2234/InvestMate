import { Bell, User, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const Header = () => {
  const { user, logout } = useAuth();
  const firstName = user?.first_name || "User";
  const location = useLocation();

  // Map paths to page titles
  const pageTitles = {
    "/dashboard": "Dashboard",
    "/products": "Products",
    "/portfolio": "Investments",
    "/logs": "Transaction Logs",
    "/profile": "Profile",
  };
  const pageTitle = pageTitles[location.pathname] || "";

  return (
    <header className="w-full h-16 bg-white shadow-md flex items-center justify-between px-6">
      {/* Page Title */}
      <h2 className="text-lg font-semibold text-gray-700">{pageTitle}</h2>

      {/* Right side: notifications + user */}
      <div className="flex items-center gap-4 relative">
        {/* Notification Bell */}
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        </button>

        {/* User Dropdown */}
          <User className="text-gray-600" size={20} />
          <span className="text-gray-700 font-medium">Hi, {firstName}</span>
      </div>
    </header>
  );
};

export default Header;
