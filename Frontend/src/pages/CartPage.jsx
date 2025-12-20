import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCart, updateCartItem, removeCartItem } from '../redux/slices/cartSlice'; // Import actions mới
import { formatCurrency } from '../utils/format';
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft } from 'react-icons/fi';

const CartPage = () => {
  const { cartItems, totalAmount, isLoading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Check login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      dispatch(fetchCart()); // Luôn refresh giỏ khi vào trang này
    }
  }, [isAuthenticated, dispatch, navigate]);

  if (isLoading && cartItems.length === 0) return <div className="text-center py-20">Đang tải giỏ hàng...</div>;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4 uppercase">Giỏ hàng trống</h2>
        <Link to="/products" className="bg-black text-white px-6 py-3 font-bold uppercase tracking-widest hover:bg-opacity-80">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black uppercase mb-8 tracking-tighter">Giỏ hàng của bạn</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* === LIST ITEMS === */}
        <div className="flex-1 space-y-6">
          {cartItems.map((item) => (
            <div key={item.cart_item_id} 
                 className="flex flex-col sm:flex-row items-center gap-4 border-b pb-6 last:border-0">
              
              {/* Image */}
              <Link to={`/products`} className="w-24 h-24 bg-gray-100 flex-shrink-0">
                <img src={item.thumbnail} alt={item.product_name} className="w-full h-full object-cover" />
              </Link>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-bold uppercase text-sm">{item.product_name}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  SKU: {item.sku} <br/>
                  Size: {item.size} | Màu: {item.color}
                </p>
                <div className="font-medium mt-2">{formatCurrency(item.price_per_item)}</div>
              </div>

              {/* Quantity Control */}
              <div className="flex items-center border border-gray-300">
                <button 
                  // Gọi API update giảm
                  onClick={() => dispatch(updateCartItem({ cart_item_id: item.cart_item_id, quantity: item.quantity - 1 }))}
                  className="p-2 hover:bg-gray-100 disabled:opacity-50"
                  disabled={item.quantity <= 1}
                >
                  <FiMinus size={14} />
                </button>
                
                <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                
                <button 
                  // Gọi API update tăng (Check max_stock)
                  onClick={() => {
                     if (item.quantity < item.max_stock) {
                        dispatch(updateCartItem({ cart_item_id: item.cart_item_id, quantity: item.quantity + 1 }));
                     } else {
                        alert(`Chỉ còn ${item.max_stock} sản phẩm trong kho`);
                     }
                  }}
                  className="p-2 hover:bg-gray-100 disabled:opacity-50"
                  disabled={item.quantity >= item.max_stock}
                >
                  <FiPlus size={14} />
                </button>
              </div>

              {/* Remove */}
              <button 
                // Gọi API delete
                onClick={() => {
                  dispatch(removeCartItem(item.cart_item_id));
                }}
                className="text-gray-400 hover:text-red-600 transition-colors p-2"
              >
                <FiTrash2 size={20} />
              </button>
            </div>
          ))}
          
          <Link to="/products" className="inline-flex items-center space-x-2 text-sm font-bold text-gray-500 hover:text-black mt-4">
             <FiArrowLeft /> <span>Tiếp tục mua sắm</span>
          </Link>
        </div>

        {/* === SUMMARY === */}
        <div className="w-full lg:w-96 bg-gray-50 p-6 h-fit">
          <h2 className="text-xl font-bold uppercase mb-6">Tổng đơn hàng</h2>
          
          <div className="space-y-4 mb-6 border-b border-gray-200 pb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tạm tính</span>
              <span className="font-medium">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Vận chuyển</span>
              <span className="font-medium">Tính khi thanh toán</span>
            </div>
          </div>

          <div className="flex justify-between text-lg font-black mb-8">
            <span>TỔNG CỘNG</span>
            {/* Tổng tiền lấy trực tiếp từ API trả về */}
            <span>{formatCurrency(totalAmount)}</span>
          </div>

          <Link to="/checkout" className="block w-full bg-black text-white text-center py-4 font-bold uppercase tracking-widest hover:bg-opacity-80 transition-opacity">
            Thanh toán
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;