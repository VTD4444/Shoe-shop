import axiosClient from './axiosClient';

const userService = {
  getProfile() {
    return axiosClient.get('/users/profile');
  },
  updateProfile(data) {
    return axiosClient.put('/users/profile', data);
  },
  changePassword(data) {
    return axiosClient.put('/users/change-password', data);
  }
};

export default userService;