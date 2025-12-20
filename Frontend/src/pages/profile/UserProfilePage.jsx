import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import userService from '../../services/userService';
import { toast } from 'react-toastify';
import { FiLoader } from 'react-icons/fi'; 


const UserProfilePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [originalData, setOriginalData] = useState(null); // Lưu dữ liệu gốc

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  // Gọi API lấy thông tin mới nhất khi vào trang
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const userData = await userService.getProfile();

        // Format lại ngày tháng (vì input type="date" cần format YYYY-MM-DD)
        let formattedDate = '';
        if (userData.birth_date) {
          formattedDate = userData.birth_date.split('T')[0];
        }

        const formattedData = {
          full_name: userData.full_name,
          email: userData.email,
          phone_number: userData.phone_number,
          gender: userData.gender || 'male',
          birth_date: formattedDate,
          avatar_url: userData.avatar_url
        };

        setOriginalData(formattedData); // Lưu dữ liệu gốc để so sánh khi submit
        reset(formattedData);
      } catch (error) {
        console.error("Lỗi tải hồ sơ:", error);
        toast.error("Không thể tải thông tin người dùng");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  // So sánh và chỉ gửi các trường đã thay đổi
  const onSubmit = async (data) => {
    if (!originalData) return;
    // Lấy các trường đã thay đổi
    const changedFields = {};
    Object.keys(data).forEach((key) => {
      if (data[key] !== originalData[key]) {
        changedFields[key] = data[key];
      }
    });
    if (Object.keys(changedFields).length === 0) {
      toast.info("Bạn chưa thay đổi thông tin nào!");
      return;
    }
    try {
      await userService.updateProfile(changedFields);
      toast.success("Cập nhật hồ sơ thành công!");
      // Sau khi update thành công, cập nhật lại dữ liệu gốc
      setOriginalData({ ...originalData, ...changedFields });
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật hồ sơ");
    }
  };

  // Hiển thị Loading khi đang fetch
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FiLoader className="animate-spin text-3xl text-gray-400" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-black uppercase mb-6 pb-4 border-b tracking-wide">
        Hồ sơ của tôi
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-6">
        
        {/* Phần Avatar & Input URL */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="w-24 h-24 rounded-full bg-white border-2 border-gray-200 overflow-hidden flex-shrink-0 shadow-sm">
             <img 
                src={watch('avatar_url') || "https://via.placeholder.com/150"} 
                alt="avatar" 
                className="w-full h-full object-cover"
                />
          </div>
          <div className="w-full">
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Avatar URL</label>
            <input 
              {...register('avatar_url')}
              className="w-full border border-gray-300 p-2 text-sm rounded focus:outline-black focus:border-black transition-colors"
              placeholder="https://imgur.com/..."
            />
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Họ và tên</label>
          <input 
            {...register('full_name', { required: "Vui lòng nhập tên" })}
            className="w-full border-b-2 border-gray-200 bg-transparent py-2 px-1 text-lg font-medium focus:outline-none focus:border-black transition-colors"
          />
          {errors.full_name && <span className="text-red-500 text-xs">{errors.full_name.message}</span>}
        </div>

        {/* Email (Readonly) */}
        <div>
          <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-gray-400">Email (Không thể thay đổi)</label>
          <input 
            {...register('email')}
            disabled
            className="w-full border-b border-gray-200 bg-transparent py-2 px-1 text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Số điện thoại</label>
          <input 
            {...register('phone_number')}
            className="w-full border-b-2 border-gray-200 bg-transparent py-2 px-1 text-lg font-medium focus:outline-none focus:border-black transition-colors"
          />
        </div>

        {/* Gender & BirthDate */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Giới tính</label>
            <select 
              {...register('gender')} 
              className="w-full border-b-2 border-gray-200 bg-transparent py-2 px-1 focus:outline-none focus:border-black cursor-pointer"
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Ngày sinh</label>
            <input 
              type="date"
              {...register('birth_date')}
              className="w-full border-b-2 border-gray-200 bg-transparent py-2 px-1 focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button 
            type="submit" 
            className="px-10 py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-800 transition-all transform hover:translate-y-[-2px] shadow-lg"
          >
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfilePage;