import axiosClient from './axiosClient';

const authService = {
  // Đăng ký: Gửi full_name, email, password, phone_number
  register(data) {
    return axiosClient.post('/auth/register', data);
  },
  
  // Đăng nhập: Gửi email, password
  login(data) {
    return axiosClient.post('/auth/login', data); 
  },

  getProfile() {
    return axiosClient.get('/auth/me'); 
  }
};

export default authService;