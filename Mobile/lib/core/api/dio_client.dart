import 'package:dio/dio.dart';
import '../constants/api_constants.dart';
import '../storage/storage_helper.dart';
import 'auth_interceptor.dart'; // Import file vừa tạo

class DioClient {
  final Dio _dio;
  final StorageHelper _storageHelper;

  // Cần truyền StorageHelper vào constructor
  DioClient(this._storageHelper)
    : _dio = Dio(
        BaseOptions(
          baseUrl: ApiConstants.baseUrl,
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 10),
          headers: {'Content-Type': 'application/json'},
        ),
      ) {
    // Đăng ký Interceptor tại đây
    _dio.interceptors.add(AuthInterceptor(_storageHelper));

    // Thêm Log để dễ debug (Thấy rõ request gửi đi cái gì, trả về cái gì)
    _dio.interceptors.add(
      LogInterceptor(requestBody: true, responseBody: true),
    );
  }

  Dio get dio => _dio;
}
