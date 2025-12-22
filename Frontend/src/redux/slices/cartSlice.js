import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartService from '../../services/cartService';

// 1. Thunk lấy giỏ hàng
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, thunkAPI) => {
    try {
      const response = await cartService.getCart();
      return response; // Trả về { total_items, total_price, items: [...] }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || 'Lỗi tải giỏ hàng');
    }
  }
);

// 2. Thunk thêm vào giỏ
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ variant_id, quantity }, thunkAPI) => {
    try {
      await cartService.addToCart({ variant_id, quantity });
      // Thêm xong thì load lại giỏ hàng để cập nhật số lượng badge và tổng tiền
      thunkAPI.dispatch(fetchCart());
      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || 'Lỗi thêm giỏ hàng');
    }
  }
);

// 3. Thunk cập nhật số lượng
export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ cart_item_id, quantity }, thunkAPI) => {
    try {
      await cartService.updateItem(cart_item_id, quantity);
      thunkAPI.dispatch(fetchCart()); // Load lại để tính lại tổng tiền
      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || 'Lỗi cập nhật');
    }
  }
);

// 4. Thunk xóa item
export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async (cart_item_id, thunkAPI) => {
    try {
      await cartService.removeItem(cart_item_id);
      thunkAPI.dispatch(fetchCart());
      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || 'Lỗi xóa sản phẩm');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cartItems: [],
    totalQuantity: 0, // total_items từ API
    totalAmount: 0,   // total_price từ API
    isLoading: false,
    error: null,
  },
  reducers: {
    // Action để clear giỏ khi logout
    clearCartLocal: (state) => {
      state.cartItems = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      // Xử lý fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        // Mapping dữ liệu từ API vào State
        state.cartItems = action.payload.items || [];
        state.totalQuantity = action.payload.total_items || 0;
        state.totalAmount = action.payload.total_price || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCartLocal } = cartSlice.actions;
export default cartSlice.reducer;