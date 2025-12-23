import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/userService';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { clearCartLocal } from '../../redux/slices/cartSlice';

const ChangePasswordPage = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await userService.changePassword(data);
      toast.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại!");
      toast.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại!");
      dispatch(logout()); // Logout bắt user đăng nhập lại cho an toàn
      dispatch(clearCartLocal());
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-black uppercase mb-6 pb-4 border-b">Đổi mật khẩu</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-6">
        <div>
          <label className="block text-sm font-bold mb-1">Mật khẩu hiện tại</label>
          <input
            type="password"
            {...register('current_password', { required: "Nhập mật khẩu cũ" })}
            className="w-full border p-3 text-sm focus:outline-black"
          />
          {errors.current_password && <p className="text-red-500 text-xs mt-1">{errors.current_password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Mật khẩu mới</label>
          <input
            type="password"
            {...register('new_password', { required: "Nhập mật khẩu mới", minLength: { value: 6, message: "Tối thiểu 6 ký tự" } })}
            className="w-full border p-3 text-sm focus:outline-black"
          />
          {errors.new_password && <p className="text-red-500 text-xs mt-1">{errors.new_password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            {...register('confirm_password', {
              required: "Vui lòng xác nhận",
              validate: val => val === watch('new_password') || "Mật khẩu không khớp"
            })}
            className="w-full border p-3 text-sm focus:outline-black"
          />
          {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>}
        </div>

        <button type="submit" className="px-8 py-3 bg-black text-white font-bold uppercase hover:bg-gray-800">
          Xác nhận
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordPage;