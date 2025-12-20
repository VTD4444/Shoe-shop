import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';

const OrderSuccessPage = () => {
  const { id } = useParams();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <FiCheckCircle className="text-green-500 text-6xl mb-4" />
      <h1 className="text-3xl font-black uppercase mb-2">Đặt hàng thành công!</h1>
      <p className="text-gray-600 mb-8">
        Mã đơn hàng của bạn là: <span className="font-bold text-black">{id}</span>
      </p>
      
      <div className="flex gap-4">
        <Link to="/" className="px-6 py-3 border border-black font-bold uppercase hover:bg-gray-100">
          Về trang chủ
        </Link>
        <Link to="/profile/orders" className="px-6 py-3 bg-black text-white font-bold uppercase hover:bg-opacity-80">
          Xem đơn hàng
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;