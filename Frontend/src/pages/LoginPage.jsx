import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Lấy state từ Redux
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Effect: Nếu đã login rồi thì đá về Home luôn
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    dispatch(loginUser(data));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-4">
      <div className="max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-8 uppercase tracking-widest">
          Đăng Nhập
        </h2>

        {/* Hiển thị lỗi chung nếu có */}
        {error && (
          <div className="bg-red-50 text-error p-3 text-sm mb-4 text-center border border-red-100">
            {typeof error === 'string' ? error : 'Có lỗi xảy ra'}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            type="email"
            placeholder="example@email.com"
            {...register('email', { required: 'Vui lòng nhập Email' })}
            error={errors.email}
          />
          
          <Input
            label="Mật khẩu"
            type="password"
            placeholder="******"
            {...register('password', { required: 'Vui lòng nhập mật khẩu', minLength: { value: 6, message: 'Tối thiểu 6 ký tự' } })}
            error={errors.password}
          />

          <div className="mt-8">
            <Button type="submit" isLoading={isLoading}>
              Đăng Nhập
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-mute">
            Chưa có tài khoản?{' '}
            <span 
              className="text-accent font-bold cursor-pointer hover:underline"
              onClick={() => navigate('/register')}
            >
              Đăng ký ngay
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;