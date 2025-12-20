import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';
import { toast } from 'react-toastify';

const PaymentPage = () => {
  const { id } = useParams(); // Order ID
  const location = useLocation();
  const navigate = useNavigate();
  
  // Link thanh toán backend trả về (SePay link hoặc QR data)
  const paymentUrl = location.state?.paymentUrl;
  const [status, setStatus] = useState('pending'); // unpaid/paid

  // LOGIC POLLING: Kiểm tra trạng thái mỗi 3 giây
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await orderService.getOrderDetail(id);
        if (res.payment_status === 'paid') {
          setStatus('paid');
          toast.success("Thanh toán thành công!");
          // Đợi 1s rồi chuyển hướng
          setTimeout(() => navigate(`/order-success/${id}`), 1000);
        }
      } catch (error) {
        console.error("Lỗi check status:", error);
      }
    };

    const intervalId = setInterval(checkStatus, 3000); // 3 giây gọi 1 lần

    // Cleanup khi component unmount
    return () => clearInterval(intervalId);
  }, [id, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 shadow-xl max-w-md w-full text-center border-t-4 border-black">
        <h2 className="text-2xl font-black uppercase mb-2">Thanh toán đơn hàng</h2>
        <p className="text-sm text-gray-500 mb-6">Mã đơn: {id}</p>

        {status === 'paid' ? (
          <div className="text-green-600 font-bold text-xl py-10">
            ✓ ĐÃ THANH TOÁN THÀNH CÔNG
          </div>
        ) : (
          <>
             {/* Hiển thị QR Code */}
             {paymentUrl ? (
               <div className="mb-6 flex justify-center">
                 {/* Nếu paymentUrl là link ảnh QR */}
                 <img src={paymentUrl} alt="QR Code" className="w-64 h-64 object-contain border" />
                 
                 {/* Nếu paymentUrl là link redirect của SePay thì dùng iframe hoặc nút bấm */}
                 {/* <iframe src={paymentUrl} title="SePay" className="w-full h-96" /> */}
               </div>
             ) : (
               <div className="text-red-500 mb-6">Không lấy được mã QR</div>
             )}

             <p className="text-sm font-medium mb-4 animate-pulse">
               Đang chờ xác nhận thanh toán...
             </p>
             
             <div className="text-xs text-gray-400">
               Hệ thống sẽ tự động chuyển trang khi nhận được tiền.
             </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;