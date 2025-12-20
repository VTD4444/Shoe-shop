import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, resetRegisterSuccess } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';

const RegisterPage = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Lấy state từ Redux
  const { isLoading, error, registerSuccess } = useSelector((state) => state.auth);

  // Nếu đăng ký thành công -> Chuyển sang trang Login
  useEffect(() => {
    if (registerSuccess) {
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      dispatch(resetRegisterSuccess()); // Reset trạng thái
      navigate('/login');
    }
  }, [registerSuccess, navigate, dispatch]);

  const onSubmit = (data) => {
    // Data gồm: full_name, email, password, phone_number
    dispatch(registerUser(data));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-4 py-10">
      <div className="max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-2 uppercase tracking-widest">
          Tạo tài khoản
        </h2>
        <p className="text-center text-mute mb-8 text-sm">
          Trở thành thành viên của Shoe Shop
        </p>

        {error && (
          <div className="bg-red-50 text-error p-3 text-sm mb-4 text-center border border-red-100">
            {typeof error === 'string' ? error : 'Đăng ký thất bại'}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Full Name - BẮT BUỘC */}
          <Input
            label="Họ và tên"
            placeholder="Nguyễn Văn A"
            {...register('full_name', { required: 'Vui lòng nhập họ tên' })}
            error={errors.full_name}
          />

          {/* Email - BẮT BUỘC */}
          <Input
            label="Email"
            type="email"
            placeholder="example@email.com"
            {...register('email', { 
              required: 'Vui lòng nhập Email',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Email không hợp lệ"
              }
            })}
            error={errors.email}
          />

          {/* Phone - KHÔNG BẮT BUỘC */}
          <Input
            label="Số điện thoại (Tùy chọn)"
            type="tel"
            placeholder="0987..."
            {...register('phone_number')}
            error={errors.phone_number}
          />
          
          {/* Password - BẮT BUỘC */}
          <Input
            label="Mật khẩu"
            type="password"
            placeholder="******"
            {...register('password', { 
              required: 'Vui lòng nhập mật khẩu', 
              minLength: { value: 6, message: 'Mật khẩu phải từ 6 ký tự' } 
            })}
            error={errors.password}
          />

          {/* Confirm Password - Validate ở Frontend */}
          <Input
            label="Nhập lại mật khẩu"
            type="password"
            placeholder="******"
            {...register('confirm_password', { 
              required: 'Vui lòng xác nhận mật khẩu',
              validate: (val) => {
                if (watch('password') !== val) {
                  return "Mật khẩu không khớp";
                }
              }
            })}
            error={errors.confirm_password}
          />

          <div className="mt-8">
            <Button type="submit" isLoading={isLoading}>
              Đăng Ký
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-mute">
            Đã có tài khoản?{' '}
            <span 
              className="text-accent font-bold cursor-pointer hover:underline"
              onClick={() => navigate('/login')}
            >
              Đăng nhập ngay
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;