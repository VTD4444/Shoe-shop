import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { FiShoppingBag, FiUser, FiSearch, FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { clearCartLocal } from '../redux/slices/cartSlice'; // Import thêm action clear giỏ hàng

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  // Lấy số lượng từ cart (nếu bạn đã làm phần giỏ hàng)
  const { totalQuantity } = useSelector((state) => state.cart); 
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCartLocal()); // Xóa giỏ hàng local khi logout
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* 1. Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center group">
            <span className="text-2xl font-black tracking-tighter uppercase group-hover:text-gray-700 transition-colors">
              SHOE<span className="text-gray-400">.</span>SHOP
            </span>
          </Link>

          {/* 2. Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-sm font-bold uppercase hover:text-gray-500 transition-colors">Trang chủ</Link>
            <Link to="/products" className="text-sm font-bold uppercase hover:text-gray-500 transition-colors">Sản phẩm</Link>
            {/* Thêm link Tra cứu đơn hàng nếu muốn */}
          </nav>

          {/* 3. Icons & Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <button className="text-black hover:text-gray-500 transition-transform hover:scale-110">
              <FiSearch size={20} />
            </button>
            
            <Link to="/cart" className="relative text-black hover:text-gray-500 transition-transform hover:scale-110">
              <FiShoppingBag size={20} />
              {totalQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {totalQuantity}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4 border-l pl-4 border-gray-200">
                {/* --- SỬA ĐOẠN NÀY --- */}
                {/* Biến tên người dùng thành Link trỏ về /profile */}
                <Link to="/profile" className="flex flex-col items-end group cursor-pointer">
                  <span className="text-xs font-black uppercase group-hover:text-gray-500 transition-colors">
                    {user?.full_name || 'Member'}
                  </span>
                  <span className="text-[10px] text-gray-400">Tài khoản</span>
                </Link>

                <button 
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Đăng xuất"
                >
                  <FiLogOut size={20} />
                </button>
                {/* --------------------- */}
              </div>
            ) : (
              <Link to="/login" className="flex items-center space-x-1 text-sm font-bold hover:opacity-70">
                <FiUser size={20} />
                <span>LOGIN</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             {/* Hiện giỏ hàng trên mobile luôn cho tiện */}
             <Link to="/cart" className="relative text-black">
              <FiShoppingBag size={20} />
              {totalQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {totalQuantity}
                </span>
              )}
            </Link>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Dropdown) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-lg h-screen z-50">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 text-lg font-bold border-b border-gray-50">TRANG CHỦ</Link>
            <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 text-lg font-bold border-b border-gray-50">SẢN PHẨM</Link>
            
            {isAuthenticated ? (
               <>
                 <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 text-lg font-bold border-b border-gray-50 text-blue-600">
                   QUẢN LÝ TÀI KHOẢN ({user?.full_name})
                 </Link>
                 <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="block w-full text-left py-3 text-lg font-bold text-red-600">
                   ĐĂNG XUẤT
                 </button>
               </>
            ) : (
               <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 text-lg font-bold text-black">
                 ĐĂNG NHẬP / ĐĂNG KÝ
               </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;