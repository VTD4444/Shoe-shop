import axiosClient from './axiosClient';

const cartService = {
  // 1. Lấy danh sách giỏ hàng
  getCart() {
    return axiosClient.get('/cart');
  },

  // 2. Thêm vào giỏ (Body: { variant_id, quantity })
  addToCart(data) {
    return axiosClient.post('/cart/add', data);
  },

  // 3. Cập nhật số lượng (URL: /cart/{id}, Body: { quantity })
  updateItem(cartItemId, quantity) {
    return axiosClient.put(`/cart/${cartItemId}`, { quantity });
  },

  // 4. Xóa sản phẩm (URL: /cart/{id})
  removeItem(cartItemId) {
    return axiosClient.delete(`/cart/${cartItemId}`);
  }
};

export default cartService;