import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../services/orderService';
import { formatCurrency, formatDate, getStatusColor, getStatusText } from '../utils/format';
import { FiPackage, FiChevronRight } from 'react-icons/fi';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState(''); // Lọc theo tab

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Gọi API lấy danh sách (có thể truyền params status vào đây nếu Backend hỗ trợ lọc)
        const res = await orderService.getOrderHistory({ 
           limit: 20, 
           status: filterStatus || undefined 
        });
        setOrders(res.orders || []);
      } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [filterStatus]);

  // Tab lọc trạng thái
  const tabs = [
    { label: 'Tất cả', value: '' },
    { label: 'Chờ xử lý', value: 'pending' },
    { label: 'Đang giao', value: 'shipped' },
    { label: 'Hoàn thành', value: 'completed' },
    { label: 'Đã hủy', value: 'cancelled' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black uppercase mb-8">Lịch sử đơn hàng</h1>

      {/* Tabs Filter */}
      <div className="flex overflow-x-auto space-x-4 mb-8 border-b scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={`whitespace-nowrap pb-3 text-sm font-bold border-b-2 transition-colors
              ${filterStatus === tab.value ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10">Đang tải...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <FiPackage className="mx-auto text-4xl text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào.</p>
          <Link to="/products" className="text-black font-bold underline">Mua sắm ngay</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.order_id} className="border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow p-6 rounded-lg">
              {/* Header Card */}
              <div className="flex justify-between items-start mb-4 border-b pb-4">
                <div>
                  <p className="text-xs text-gray-500">Mã đơn: <span className="font-mono text-black">{order.order_id.slice(0, 8)}...</span></p>
                  <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                </div>
                <div className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </div>
              </div>

              {/* Body Card: Hiển thị 1 sản phẩm đại diện (preview_item) */}
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-100 flex-shrink-0">
                  <img 
                    src={order.preview_item?.thumbnail || 'placeholder.jpg'} 
                    alt="thumb" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm uppercase">{order.preview_item?.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Size: {order.preview_item?.size} | Màu: {order.preview_item?.color}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">x {order.preview_item?.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatCurrency(order.total_amount)}</p>
                  {order.items_count > 1 && (
                     <p className="text-xs text-gray-400 mt-1">Xem thêm {order.items_count - 1} sản phẩm</p>
                  )}
                </div>
              </div>

              {/* Footer Card */}
              <div className="mt-4 pt-4 border-t flex justify-end">
                <Link 
                  to={`/order/${order.order_id}`} 
                  className="flex items-center space-x-1 text-sm font-bold hover:underline"
                >
                  <span>Xem chi tiết</span> <FiChevronRight />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;