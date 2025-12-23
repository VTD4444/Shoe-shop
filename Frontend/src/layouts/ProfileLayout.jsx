import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { FiUser, FiMapPin, FiLock, FiPackage, FiLogOut } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { clearCartLocal } from '../redux/slices/cartSlice';

const ProfileLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Hồ sơ cá nhân', path: '/profile', icon: <FiUser /> },
    { label: 'Sổ địa chỉ', path: '/profile/addresses', icon: <FiMapPin /> },
    { label: 'Đổi mật khẩu', path: '/profile/password', icon: <FiLock /> },
    { label: 'Lịch sử mua hàng', path: '/profile/orders', icon: <FiPackage /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">

        {/* SIDEBAR */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <h2 className="text-xl font-black uppercase mb-6">Tài khoản</h2>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 text-sm font-bold transition-colors
                  ${location.pathname === item.path
                    ? 'bg-black text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-black'}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              onClick={() => {
                dispatch(logout());
                dispatch(clearCartLocal());
                navigate('/login');
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              <FiLogOut />
              <span>Đăng xuất</span>
            </button>
          </nav>
        </aside>

        {/* CONTENT AREA */}
        <div className="flex-1 min-h-[500px] border border-gray-100 p-6 md:p-8 rounded-lg shadow-sm">
          <Outlet /> {/* Các trang con sẽ hiển thị ở đây */}
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;