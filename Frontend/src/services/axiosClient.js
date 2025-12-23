import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://192.168.155.181:5000", // Đổi port 5000 theo port backend của bạn
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: Tự động đính kèm Token vào mọi request nếu đã đăng nhập
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor: Xử lý response (ví dụ: token hết hạn thì logout)
axiosClient.interceptors.response.use(
  (response) => {
    return response.data; // Trả về data trực tiếp cho gọn
  },
  (error) => {
    // Xử lý lỗi chung (VD: 401 Unauthorized -> xóa token, đá về login)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("access_token");
      // window.location.href = '/login'; // Cẩn thận vòng lặp redirect
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
