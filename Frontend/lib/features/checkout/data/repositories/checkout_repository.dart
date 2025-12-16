import 'package:dio/dio.dart';
import '../../../../core/api/dio_client.dart';
import '../models/order_preview_model.dart';

class CheckoutRepository {
  final DioClient _dioClient;

  CheckoutRepository({required DioClient dioClient}) : _dioClient = dioClient;

  // 1. Xem trước đơn hàng (Tính toán tiền)
  Future<OrderPreviewModel> previewOrder({
    required String addressId,
    String shippingMethod = 'standard',
    String? voucherCode,
  }) async {
    try {
      final response = await _dioClient.dio.post(
        '/orders/preview',
        data: {
          'address_id': addressId,
          'shipping_method': shippingMethod,
          if (voucherCode != null && voucherCode.isNotEmpty)
            'voucher_code': voucherCode,
        },
      );
      return OrderPreviewModel.fromJson(response.data);
    } catch (e) {
      throw Exception(
        e is DioException ? e.response?.data['message'] : 'Preview failed',
      );
    }
  }

  // 2. Đặt hàng
  Future<String> placeOrder({
    required String addressId,
    required String paymentMethod,
    required String shippingMethod,
    String? voucherCode,
    String? note,
  }) async {
    try {
      final response = await _dioClient.dio.post(
        '/orders',
        data: {
          'address_id': addressId,
          'payment_method': paymentMethod,
          'shipping_method': shippingMethod,
          'voucher_code': voucherCode,
          'note': note,
        },
      );
      // Trả về Order ID để sau này chuyển sang trang Success
      return response.data['order_id'];
    } catch (e) {
      throw Exception(
        e is DioException ? e.response?.data['message'] : 'Order failed',
      );
    }
  }

  // 3. Lấy danh sách địa chỉ THẬT từ API
  Future<List<ShippingAddress>> getMyAddresses() async {
    try {
      final response = await _dioClient.dio.get('/addresses');

      // API trả về cấu trúc: { "message": "...", "data": [...] }
      // Cần lấy list từ key ['data']
      final List data = response.data['data'] ?? [];

      return data.map((json) {
        // Map dữ liệu từ API sang ShippingAddress model dùng cho Checkout
        return ShippingAddress(
          // Kiểm tra kỹ key ID backend trả về là 'address_id' hay 'id'
          addressId: json['address_id'] ?? json['id'] ?? '',
          recipientName: json['recipient_name'] ?? '',
          phone: json['phone'] ?? '',
          // Tự ghép chuỗi địa chỉ hiển thị: Phường, Quận, Thành phố
          fullAddress: "${json['ward']}, ${json['district']}, ${json['city']}",
        );
      }).toList();
    } catch (e) {
      // In lỗi ra console để debug nếu cần
      print("Error fetching addresses for checkout: $e");
      // Trả về list rỗng thay vì throw exception để Bloc xử lý logic "Vui lòng thêm địa chỉ"
      return [];
    }
  }
}
