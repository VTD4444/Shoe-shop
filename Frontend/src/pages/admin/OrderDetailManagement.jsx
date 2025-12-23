import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import orderService from "../../services/orderService";
import { toast } from "react-toastify";

const OrderDetailManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAdminOrderDetail(id);
      setOrder(response);
    } catch (error) {
      console.error("Failed to fetch order detail:", error);
      toast.error("Không thể tải chi tiết đơn hàng");
      navigate("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Xác nhận chuyển trạng thái sang "${newStatus}"?`)) {
      return;
    }

    try {
      setUpdating(true);
      await orderService.updateOrderStatus(id, newStatus);
      toast.success("Cập nhật trạng thái thành công");
      setOrder({ ...order, status: newStatus });
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "delivering":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const statusOptions = [
    { value: "pending", label: "Chờ xử lý" },
    { value: "processing", label: "Đang xử lý" },
    { value: "delivering", label: "Đang giao" },
    { value: "completed", label: "Hoàn thành" },
    { value: "cancelled", label: "Đã hủy" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/orders"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Quay lại"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            Chi tiết đơn hàng #{order.order_id.slice(0, 8)}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 font-medium">Trạng thái:</span>
          <select
            className={`text-sm rounded border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${getStatusColor(
              order.status
            )}`}
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updating || order.status === "cancelled"}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Sản phẩm
            </h2>
            <div className="divide-y divide-gray-100">
              {order.items.map((item, index) => (
                <div key={index} className="py-4 flex gap-4">
                  <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Img
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {item.product_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Phân loại: {item.color} / {item.size}
                    </p>
                    <p className="text-sm text-gray-500">
                      Số lượng: x{item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(item.price_at_purchase)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Tổng: {formatCurrency(item.total_item_price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Thanh toán
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{formatCurrency(order.cost_breakdown.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span>{formatCurrency(order.cost_breakdown.shipping_fee)}</span>
              </div>
              {order.cost_breakdown.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{formatCurrency(order.cost_breakdown.discount)}</span>
                </div>
              )}
              <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between font-bold text-lg text-gray-900">
                <span>Tổng cộng</span>
                <span>{formatCurrency(order.cost_breakdown.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Thông tin đơn hàng
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Ngày đặt:</span>
                <span className="text-gray-900">
                  {formatDate(order.created_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phương thức thanh toán:</span>
                <span className="text-gray-900 font-medium uppercase">
                  {order.payment_method}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Trạng thái thanh toán:</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    order.payment_status === "paid"
                      ? "bg-green-100 text-green-800"
                      : order.payment_status === "refunding"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {order.payment_status === "paid"
                    ? "Đã thanh toán"
                    : order.payment_status === "refunding"
                    ? "Đang hoàn tiền"
                    : "Chưa thanh toán"}
                </span>
              </div>
              {order.note && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <span className="text-gray-500 block mb-1">Ghi chú:</span>
                  <p className="text-gray-700 italic">{order.note}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Địa chỉ giao hàng
            </h2>
            {order.shipping_address ? (
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-medium text-gray-900">
                  {order.shipping_address.recipient_name}
                </p>
                <p>{order.shipping_address.phone}</p>
                <p>
                  {order.shipping_address.full_address ||
                    `${order.shipping_address.street}, ${order.shipping_address.ward}, ${order.shipping_address.district}, ${order.shipping_address.city}`}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Không có thông tin địa chỉ
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailManagement;
