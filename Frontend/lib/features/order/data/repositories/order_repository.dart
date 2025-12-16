import 'package:dio/dio.dart';
import '../../../../core/api/dio_client.dart';
import '../models/order_model.dart';

class OrderRepository {
  final DioClient _dioClient;

  OrderRepository({required DioClient dioClient}) : _dioClient = dioClient;

  // 8. Lấy danh sách đơn hàng
  Future<List<OrderModel>> getOrders({String? status, int page = 1}) async {
    try {
      final response = await _dioClient.dio.get(
        '/orders',
        queryParameters: {
          'page': page,
          'limit': 10,
          if (status != null && status != 'all') 'status': status,
        },
      );
      // API trả về { "orders": [...] }
      final List data = response.data['orders'] ?? [];
      return data.map((e) => OrderModel.fromJson(e)).toList();
    } catch (e) {
      throw Exception('Failed to load orders');
    }
  }

  // 9. Lấy chi tiết đơn hàng
  Future<OrderModel> getOrderDetail(String orderId) async {
    try {
      final response = await _dioClient.dio.get('/orders/$orderId');
      return OrderModel.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to load order detail');
    }
  }

  // 10. Hủy đơn hàng
  Future<void> cancelOrder(String orderId, String reason) async {
    try {
      await _dioClient.dio.put(
        '/orders/$orderId/cancel',
        data: {'reason': reason},
      );
    } catch (e) {
      // Bắt lỗi 400 từ Backend (VD: Đã giao vận chuyển, không thể hủy)
      if (e is DioException && e.response != null) {
        throw Exception(e.response!.data['message'] ?? 'Cancel failed');
      }
      throw Exception('Failed to cancel order');
    }
  }
}
