import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import orderService from "../services/orderService";
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusText,
} from "../utils/format";
import { toast } from "react-toastify";
import { FiArrowLeft, FiMapPin, FiCreditCard } from "react-icons/fi";
import WriteReviewModal from "../components/WriteReviewModal";

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [reviewModalData, setReviewModalData] = useState({
    isOpen: false,
    product: null,
    orderId: null,
  });

  // Load chi tiết đơn
  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrderDetail(id);
      setOrder(res);
    } catch (error) {
      toast.error("Không tìm thấy đơn hàng");
      navigate("/profile/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // Xử lý Hủy đơn
  const handleCancelOrder = async () => {
    const reason = window.prompt("Vui lòng nhập lý do hủy đơn:");
    if (!reason) return;

    try {
      await orderService.cancelOrder(id, reason);
      toast.success("Đã hủy đơn hàng thành công");
      fetchDetail(); // Reload lại trang để cập nhật trạng thái
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể hủy đơn lúc này");
    }
  };

  if (loading) return <div className="text-center py-20">Đang tải...</div>;
  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-500 mb-6 hover:text-black"
      >
        <FiArrowLeft /> <span>Quay lại</span>
      </button>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase">
            Đơn hàng #{order.order_id.slice(0, 8)}
          </h1>
          <p className="text-sm text-gray-500">
            Ngày đặt: {formatDate(order.created_at)}
          </p>
        </div>
        <div
          className={`px-4 py-2 text-sm font-bold rounded border ${getStatusColor(
            order.status
          )}`}
        >
          {getStatusText(order.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Shipping Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold uppercase mb-4 flex items-center gap-2">
              <FiMapPin /> Địa chỉ nhận hàng
            </h3>
            <p className="font-bold">
              {order.shipping_address?.recipient_name}
            </p>
            <p className="text-sm text-gray-600">
              {order.shipping_address?.phone}
            </p>
            <p className="text-sm text-gray-600">
              {order.shipping_address?.full_address}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm italic text-gray-500">
                Ghi chú: {order.note || "Không có"}
              </p>
            </div>
          </div>

          {/* List Items */}
          <div>
            <h3 className="font-bold uppercase mb-4">Sản phẩm</h3>
            <div className="border rounded-lg overflow-hidden">
              {order.items.map((item) => (
                <div
                  key={item.item_id}
                  className="flex gap-4 p-4 border-b last:border-0 bg-white"
                >
                  <img
                    src={item.thumbnail}
                    alt={item.product_name}
                    className="w-20 h-20 object-cover bg-gray-100"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-sm uppercase">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Phân loại: {item.size} / {item.color}
                    </p>
                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">
                      {formatCurrency(item.total_item_price)}
                    </p>

                    {/* CHỈ HIỆN NÚT ĐÁNH GIÁ KHI ĐƠN ĐÃ HOÀN THÀNH */}
                    {order.status === "completed" && (
                      <button
                        onClick={() =>
                          setReviewModalData({
                            isOpen: true,
                            orderId: order.order_id,
                            product: {
                              product_id: item.product_id || item.variant_id,
                              product_name: item.product_name,
                              thumbnail: item.thumbnail,
                            },
                          })
                        }
                        className="mt-2 text-xs font-bold bg-black text-white px-3 py-1 hover:bg-gray-700 transition-colors"
                      >
                        Đánh giá
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment & Summary */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold uppercase mb-4 flex items-center gap-2">
              <FiCreditCard /> Thanh toán
            </h3>
            <p className="text-sm font-medium">
              Phương thức:{" "}
              <span className="font-bold">{order.payment_method}</span>
            </p>
            <p className="text-sm">
              Trạng thái:
              <span
                className={
                  order.payment_status === "paid"
                    ? "text-green-600 font-bold ml-1"
                    : "text-gray-600 ml-1"
                }
              >
                {order.payment_status === "paid"
                  ? "Đã thanh toán"
                  : "Chưa thanh toán"}
              </span>
            </p>
          </div>

          <div className="bg-white border p-6 rounded-lg">
            <h3 className="font-bold uppercase mb-4">Chi tiết giá</h3>
            <div className="space-y-2 text-sm mb-4 border-b pb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng tiền hàng</span>
                <span>{formatCurrency(order.cost_breakdown?.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span>
                  {formatCurrency(order.cost_breakdown?.shipping_fee)}
                </span>
              </div>
              {order.cost_breakdown?.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{formatCurrency(order.cost_breakdown?.discount)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between text-xl font-black">
              <span>TỔNG CỘNG</span>
              <span>{formatCurrency(order.cost_breakdown?.total_amount)}</span>
            </div>
          </div>

          {/* Nút hủy đơn (Chỉ hiện khi trạng thái là pending) */}
          {order.status === "pending" && (
            <button
              onClick={handleCancelOrder}
              className="w-full py-3 border border-red-500 text-red-500 font-bold uppercase hover:bg-red-50 transition-colors"
            >
              Hủy đơn hàng
            </button>
          )}
        </div>
      </div>

      {/* --- QUAN TRỌNG: Render Modal ở đây --- */}
      {reviewModalData.isOpen && (
        <WriteReviewModal
          isOpen={reviewModalData.isOpen}
          onClose={() =>
            setReviewModalData({ ...reviewModalData, isOpen: false })
          }
          product={reviewModalData.product}
          orderId={reviewModalData.orderId}
        />
      )}
    </div>
  );
};

export default OrderDetailPage;
