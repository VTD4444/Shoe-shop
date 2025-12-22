import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// 1. Thunk Đăng ký
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      // API trả về: { message, user }
      const response = await authService.register(userData);
      return response; 
    } catch (error) {
      // Lấy lỗi từ backend trả về (nếu có)
      return thunkAPI.rejectWithValue(error.response?.data || 'Đăng ký thất bại');
    }
  }
);

// 2. Thunk Đăng nhập
export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      // API trả về: { message, token, user }
      const response = await authService.login(userData);
      
      // Lưu token vào LocalStorage ngay lập tức
      if (response.token) {
        localStorage.setItem('access_token', response.token);
      }
      return response; 
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || 'Đăng nhập thất bại');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null, 
    isLoading: false,
    error: null,
    registerSuccess: false, // Để thông báo đăng ký thành công
    isAuthenticated: !!localStorage.getItem('access_token'),
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('access_token');
      state.user = null;
      state.isAuthenticated = false;
    },
    resetRegisterSuccess: (state) => {
      state.registerSuccess = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Xử lý Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user; // Lưu thông tin user từ response
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Lỗi đăng nhập';
      })

      // Xử lý Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.registerSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.registerSuccess = true; // Đánh dấu đã đăng ký xong để chuyển trang
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Lỗi đăng ký';
      });
  },
});

export const { logout, resetRegisterSuccess } = authSlice.actions;
export default authSlice.reducer;