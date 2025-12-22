import 'package:dio/dio.dart';
import '../../../../core/api/dio_client.dart';
import '../models/cart_model.dart';

class CartRepository {
  final DioClient _dioClient;

  CartRepository({required DioClient dioClient}) : _dioClient = dioClient;

  // 1. Lấy giỏ hàng
  Future<CartModel> getCart() async {
    try {
      final response = await _dioClient.dio.get('/cart');
      return CartModel.fromJson(response.data);
    } catch (e) {
      // Nếu lỗi (ví dụ chưa login hoặc giỏ rỗng lần đầu), trả về giỏ rỗng
      return CartModel(totalItems: 0, totalPrice: 0, items: []);
    }
  }

  // 2. Thêm vào giỏ
  Future<void> addToCart(String variantId, int quantity) async {
    try {
      await _dioClient.dio.post(
        '/cart/add',
        data: {'variant_id': variantId, 'quantity': quantity},
      );
    } catch (e) {
      throw Exception(
        e is DioException ? e.response?.data['message'] : 'Add to cart failed',
      );
    }
  }

  // 3. Cập nhật số lượng
  Future<void> updateCartItem(String cartItemId, int quantity) async {
    try {
      await _dioClient.dio.put(
        '/cart/$cartItemId',
        data: {'quantity': quantity},
      );
    } catch (e) {
      throw Exception('Update failed');
    }
  }

  // 4. Xóa item
  Future<void> removeCartItem(String cartItemId) async {
    try {
      await _dioClient.dio.delete('/cart/$cartItemId');
    } catch (e) {
      throw Exception('Remove failed');
    }
  }
}
