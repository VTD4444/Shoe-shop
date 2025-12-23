import axiosClient from "./axiosClient";

const voucherService = {
  createVoucher: (data) => {
    return axiosClient.post("/vouchers", data);
  },
  getAllVouchers: () => {
    return axiosClient.get("/vouchers");
  },
  updateVoucher: (id, data) => {
    return axiosClient.put(`/vouchers/${id}`, data);
  },
  deleteVoucher: (id) => {
    return axiosClient.delete(`/vouchers/${id}`);
  },
};

export default voucherService;
