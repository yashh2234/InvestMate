import { NavLink } from "react-router-dom";
import { Home, BarChart2, List, User, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const { logout } = useAuth();

  const menuItems = [
    { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
    { name: "Products", icon: <List size={20} />, path: "/products" },
    { name: "Investments", icon: <BarChart2 size={20} />, path: "/portfolio" },
    { name: "Transaction Logs", icon: <List size={20} />, path: "/logs" },
    { name: "Profile", icon: <User size={20} />, path: "/profile" },
  ];

  return (
    <div className="w-64 h-screen bg-blue-900 text-white flex flex-col shadow-lg">
      {/* Logo */}
      <div className="p-6 text-2xl font-bold tracking-wide text-center border-b border-blue-700">
        InvestMate
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-4 text-sm font-medium transition
               ${isActive ? "bg-blue-700 border-l-4 border-yellow-400" : "hover:bg-blue-800"}`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-6 border-t border-blue-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2 rounded-md bg-white hover:text-red-600 transition text-black justify-center"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
