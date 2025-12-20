import axiosClient from './axiosClient';

const addressService = {
  getAll() {
    return axiosClient.get('/addresses');
  },
  create(data) {
    return axiosClient.post('/addresses', data);
  },
  update(id, data) {
    return axiosClient.put(`/addresses/${id}`, data);
  },
  delete(id) {
    return axiosClient.delete(`/addresses/${id}`);
  }
};

export default addressService;