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

  // (Tạm thời) Mock function lấy list địa chỉ
  // Trong thực tế bạn cần API GET /user/addresses
  Future<List<ShippingAddress>> getMyAddresses() async {
    // TODO: Gọi API thật
    // Ở đây mình fake tạm 1 địa chỉ để test flow
    return [
      ShippingAddress(
        addressId: "fake-address-id-123", // ID giả định
        recipientName: "Nguyen Van A",
        phone: "0988777666",
        fullAddress: "123 Hoan Kiem, Ha Noi",
      ),
    ];
  }
}
