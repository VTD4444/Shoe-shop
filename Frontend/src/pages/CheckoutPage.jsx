import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { formatCurrency } from '../utils/format';
import orderService from '../services/orderService';
import addressService from '../services/addressService'; // Import service địa chỉ
import { fetchCart } from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';
import { FiCreditCard, FiTruck, FiMapPin, FiPlus, FiAlertCircle } from 'react-icons/fi';

const CheckoutPage = () => {
  const { cartItems, totalAmount } = useSelector((state) => state.cart);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State
  const [addresses, setAddresses] = useState([]); // Danh sách địa chỉ từ API
  const [selectedAddressId, setSelectedAddressId] = useState(null); // ID địa chỉ đang chọn
  
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [note, setNote] = useState('');

  // 1. Load danh sách địa chỉ khi Mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await addressService.getAll();
        setAddresses(res.data);
        
        if (res.length > 0) {
          // Tìm địa chỉ mặc định
          const defaultAddr = res.find(a => a.is_default);
          // Nếu có mặc định thì chọn, không thì chọn cái đầu tiên
          setSelectedAddressId(defaultAddr ? defaultAddr.address_id : res[0].address_id);
        }
      } catch (error) {
        console.error("Lỗi tải địa chỉ:", error);
      }
    };
    fetchAddresses();
  }, []);

  // Nếu giỏ hàng trống đá về trang sản phẩm
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-xl font-bold uppercase">Giỏ hàng đang trống</h2>
        <Link to="/products" className="underline hover:text-gray-600">Quay lại mua sắm</Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    // Validate: Bắt buộc phải chọn địa chỉ
    if (!selectedAddressId) {
      toast.error("Vui lòng thêm địa chỉ giao hàng trước khi thanh toán!");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        address_id: selectedAddressId,
        payment_method: paymentMethod === 'QR' ? 'MOMO' : 'COD', // Mapping Payment Method
        shipping_method: shippingMethod,
        note: note,
        voucher_code: null // Chức năng voucher có thể phát triển sau
      };

      const res = await orderService.createOrder(orderData);
      
      // Thành công -> Reset giỏ hàng
      dispatch(fetchCart());

      // Điều hướng
      if (res.payment_url && paymentMethod === 'QR') {
        // Nếu là QR -> Sang trang Payment quét mã
        navigate(`/payment/${res.order_id}`, { state: { paymentUrl: res.payment_url } });
      } else {
        // Nếu là COD -> Sang trang Success
        navigate(`/order-success/${res.order_id}`);
      }

    } catch (error) {
      toast.error(error.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-12 animate-fade-in">
      
      {/* === LEFT COLUMN: NHẬP LIỆU === */}
      <div>
        
        {/* 1. ĐỊA CHỈ GIAO HÀNG */}
        <div className="mb-10">
          <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2 border-b border-black pb-2">
            <FiMapPin /> Thông tin giao hàng
          </h2>
          
          {/* Case 1: Chưa có địa chỉ */}
          {addresses.length === 0 ? (
            <div className="bg-red-50 border border-red-200 p-6 text-center rounded-lg">
              <FiAlertCircle className="text-3xl text-red-500 mx-auto mb-2" />
              <p className="text-red-600 font-bold mb-4">Bạn chưa thiết lập địa chỉ nhận hàng.</p>
              <Link 
                to="/profile/addresses" 
                className="inline-block bg-black text-white px-6 py-2 text-sm font-bold uppercase hover:bg-gray-800"
              >
                <FiPlus className="inline mr-1" /> Thêm địa chỉ mới
              </Link>
            </div>
          ) : (
            // Case 2: Đã có địa chỉ -> List ra để chọn
            <div className="space-y-4">
              {addresses.map((addr) => (
                <label 
                  key={addr.address_id}
                  className={`block border-2 p-4 cursor-pointer transition-all hover:bg-gray-50
                    ${selectedAddressId === addr.address_id ? 'border-black bg-gray-50' : 'border-gray-200'}`}
                >
                  <div className="flex items-start gap-3">
                    <input 
                      type="radio" 
                      name="address" 
                      value={addr.address_id}
                      checked={selectedAddressId === addr.address_id}
                      onChange={() => setSelectedAddressId(addr.address_id)}
                      className="mt-1 accent-black w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold uppercase text-sm">{addr.recipient_name}</span>
                        <span className="text-gray-500 text-xs">| {addr.phone}</span>
                        {addr.is_default && (
                          <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded font-bold uppercase">Mặc định</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {addr.street}, {addr.ward}, {addr.district}, {addr.city}
                      </p>
                    </div>
                  </div>
                </label>
              ))}

              <Link to="/profile/addresses" className="inline-block text-xs font-bold text-gray-500 hover:text-black underline mt-2">
                + Quản lý / Thêm địa chỉ khác
              </Link>
            </div>
          )}
        </div>

        {/* 2. VẬN CHUYỂN */}
        <div className="mb-10">
          <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2 border-b border-black pb-2">
            <FiTruck /> Vận chuyển
          </h2>
          <div className="flex gap-4">
            <button 
              className={`flex-1 py-4 border-2 font-bold text-sm uppercase transition-all
                ${shippingMethod === 'standard' ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'}`}
              onClick={() => setShippingMethod('standard')}
            >
              Tiêu chuẩn (15k)
            </button>
            <button 
              className={`flex-1 py-4 border-2 font-bold text-sm uppercase transition-all
                ${shippingMethod === 'express' ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'}`}
              onClick={() => setShippingMethod('express')}
            >
              Hỏa tốc (25k)
            </button>
          </div>
        </div>

        {/* 3. THANH TOÁN */}
        <div className="mb-10">
          <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2 border-b border-black pb-2">
             <FiCreditCard /> Thanh toán
          </h2>
          <div className="space-y-3">
            <label className={`flex items-center space-x-3 p-4 border-2 cursor-pointer transition-all
               ${paymentMethod === 'COD' ? 'border-black bg-gray-50' : 'border-gray-200 hover:bg-gray-50'}`}>
              <input 
                type="radio" 
                name="payment" 
                checked={paymentMethod === 'COD'} 
                onChange={() => setPaymentMethod('COD')}
                className="accent-black w-5 h-5"
              />
              <div>
                 <span className="font-bold block text-sm uppercase">Thanh toán khi nhận hàng (COD)</span>
                 <span className="text-xs text-gray-500">Bạn chỉ phải thanh toán khi đã nhận được giày.</span>
              </div>
            </label>
            
            <label className={`flex items-center space-x-3 p-4 border-2 cursor-pointer transition-all
               ${paymentMethod === 'QR' ? 'border-black bg-gray-50' : 'border-gray-200 hover:bg-gray-50'}`}>
              <input 
                type="radio" 
                name="payment" 
                checked={paymentMethod === 'QR'} 
                onChange={() => setPaymentMethod('QR')}
                className="accent-black w-5 h-5"
              />
              <div>
                <span className="font-bold block text-sm uppercase">Chuyển khoản / QR Code (SePay)</span>
                <span className="text-xs text-gray-500">Quét mã QR qua App ngân hàng hoặc Ví điện tử.</span>
              </div>
            </label>
          </div>

          <textarea
            placeholder="Ghi chú cho shipper (Ví dụ: Giao giờ hành chính, gọi trước khi giao...)"
            className="w-full border border-gray-300 mt-4 p-3 text-sm focus:outline-black min-h-[100px]"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>

      {/* === RIGHT COLUMN: TÓM TẮT ĐƠN === */}
      <div className="bg-gray-50 p-8 h-fit border border-gray-200 sticky top-24">
        <h3 className="font-black uppercase mb-6 text-xl">Đơn hàng của bạn</h3>
        
        {/* List items scrollable nếu quá dài */}
        <div className="space-y-4 mb-6 border-b border-gray-200 pb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
          {cartItems.map(item => (
            <div key={item.cart_item_id} className="flex justify-between items-start text-sm">
              <div className="flex gap-3">
                 <div className="font-bold w-6 h-6 bg-black text-white flex items-center justify-center rounded-full text-xs">
                   {item.quantity}
                 </div>
                 <div>
                   <p className="font-bold uppercase">{item.product_name}</p>
                   <p className="text-xs text-gray-500">Size: {item.size} | Màu: {item.color}</p>
                 </div>
              </div>
              <span className="font-medium">{formatCurrency(item.price_per_item * item.quantity)}</span>
            </div>
          ))}
        </div>

        {/* Cost breakdown */}
        <div className="space-y-2 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tạm tính</span>
              <span className="font-bold">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phí vận chuyển</span>
              <span>{shippingMethod === 'express' ? '50.000 đ' : 'Miễn phí'}</span>
            </div>
        </div>

        <div className="flex justify-between text-2xl font-black mb-8 pt-4 border-t border-black">
          <span>TỔNG CỘNG</span>
          <span>
            {formatCurrency(totalAmount + (shippingMethod === 'express' ? 50000 : 0))}
          </span>
        </div>

        <button 
          onClick={handlePlaceOrder}
          disabled={loading || addresses.length === 0} // Disable nếu không có địa chỉ
          className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
        >
          {loading ? (
             <span className="flex items-center justify-center gap-2">
               <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
               Đang xử lý...
             </span>
          ) : 'ĐẶT HÀNG NGAY'}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          Bằng việc đặt hàng, bạn đồng ý với điều khoản dịch vụ của Shoe Shop.
        </p>
      </div>
    </div>
  );
};

export default CheckoutPage;