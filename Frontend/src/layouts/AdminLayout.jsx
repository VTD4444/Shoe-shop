import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaBox,
  FaShoppingCart,
  FaUserFriends,
  FaCog,
  FaBell,
  FaSignOutAlt,
  FaTicketAlt,
} from "react-icons/fa";
import { MdSpaceDashboard } from "react-icons/md";
import { toast } from "react-toastify";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || user.role !== "admin") {
      navigate("/admin/login");
    }
  }, [navigate]);

  const menuItems = [
    { name: "Dashboard", icon: <MdSpaceDashboard size={20} />, path: "/admin" },
    {
      name: "Sản phẩm & Kho",
      icon: <FaBox size={18} />,
      path: "/admin/products",
    },
    {
      name: "Đơn hàng",
      icon: <FaShoppingCart size={18} />,
      path: "/admin/orders",
    },
    {
      name: "Vouchers",
      icon: <FaTicketAlt size={18} />,
      path: "/admin/vouchers",
    },
  ];
  const getCurrentPageName = () => {
    const currentItem = menuItems.find(
      (item) => item.path === location.pathname
    );
    return currentItem ? currentItem.name : "Trang quản trị";
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      toast.success("Đăng xuất thành công");
      navigate("/admin/login");
    }
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6] font-sans">
      <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden lg:flex fixed h-full z-10">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <FaBox />
          </div>
          <span className="font-bold text-lg text-gray-800">
            ShoeStore Admin
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive =
              item.path === "/admin"
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button className="flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-gray-900 text-sm font-medium w-full">
            <FaCog /> Cài đặt
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center text-sm text-gray-500">
            <Link to="/admin" className="hover:text-blue-600 transition-colors">
              Trang chủ
            </Link>

            {location.pathname !== "/admin" && (
              <>
                <span className="mx-2">›</span>
                <span className="font-medium text-gray-900">
                  {getCurrentPageName()}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-gray-600">
              <FaBell size={18} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-6 border-l border-gray-200 hover:bg-gray-50 transition-colors p-2 rounded-lg"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">Quản lý cửa hàng</p>
                </div>
                <img
                  src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff"
                  alt="Admin"
                  className="w-9 h-9 rounded-full border border-gray-200"
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-100 animate-fade-in z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <FaSignOutAlt /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
