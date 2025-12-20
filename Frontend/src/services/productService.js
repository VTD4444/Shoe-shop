import axiosClient from './axiosClient';

const productService = {
  // 1. Tìm kiếm và Lọc (Master Search API) - Method: POST
  search(filterParams) {
    // filterParams: { q, page, limit, sort_by, brand_ids, ... }
    return axiosClient.post('/products/search', filterParams);
  },

  // 2. Chi tiết sản phẩm - Method: GET
  getDetail(id) {
    return axiosClient.get(`/products/${id}`);
  },

  // 3. Lấy Metadata cho bộ lọc - Method: GET
  getFilterMeta() {
    return axiosClient.get('/products/filters');
  },

  // 4. Lấy sản phẩm bán chạy - Method: GET
  getTrending(limit = 8) {
    return axiosClient.get('/products/trending', {
      params: { limit }
    });
  }
};

export default productService;