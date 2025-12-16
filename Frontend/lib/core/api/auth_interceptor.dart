import 'package:dio/dio.dart';
import '../storage/storage_helper.dart';

class AuthInterceptor extends Interceptor {
  final StorageHelper storageHelper;

  AuthInterceptor(this.storageHelper);

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // 1. Lấy token từ bộ nhớ
    final token = await storageHelper.getToken();

    // 2. Nếu có token, gắn vào Header
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    // 3. Cho phép request đi tiếp
    super.onRequest(options, handler);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // (Nâng cao) Nếu gặp lỗi 401 Unauthorized -> Có thể xử lý logout tại đây
    super.onError(err, handler);
  }
}
