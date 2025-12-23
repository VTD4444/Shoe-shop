import axiosClient from "./axiosClient";

const orderService = {
  // 1. Tạo đơn hàng
  createOrder(data) {
    // Body: { address_id, payment_method, shipping_method, voucher_code, note }
    return axiosClient.post("/orders", data);
  },

  // 2. Lấy chi tiết đơn hàng (Dùng để polling trạng thái thanh toán)
  getOrderDetail(orderId) {
    return axiosClient.get(`/orders/${orderId}`);
  },

  // 3. Lấy lịch sử (Dùng sau này)
  getOrderHistory(params) {
    return axiosClient.get("/orders", { params });
  },

  cancelOrder(orderId, reason) {
    return axiosClient.put(`/orders/${orderId}/cancel`, { reason });
  },

  // Admin
  getAllOrders() {
    return axiosClient.get("/orders/all");
  },

  updateOrderStatus(orderId, status) {
    return axiosClient.put("/orders/status", { orderId, status });
  },

  getAdminOrderDetail(orderId) {
    return axiosClient.get(`/orders/detail/${orderId}`);
  },
};

export default orderService;
