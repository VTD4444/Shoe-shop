import 'package:dio/dio.dart';
import '../../../../core/api/dio_client.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/storage/storage_helper.dart';
import '../models/user_model.dart';

class AuthRepository {
  final DioClient _dioClient;
  final StorageHelper _storageHelper;

  AuthRepository({
    required DioClient dioClient,
    required StorageHelper storageHelper,
  }) : _dioClient = dioClient,
       _storageHelper = storageHelper;

  // 1. Chức năng Đăng nhập & Lưu token vào StorageHelper
  Future<UserModel> login(String email, String password) async {
    try {
      final response = await _dioClient.dio.post(
        ApiConstants.login,
        data: {'email': email, 'password': password},
      );

      // Theo specs: Response có field "token" và object "user"
      final token = response.data['token'];
      final userData = response.data['user'];
      final user = UserModel.fromJson(userData, token: token);

      // Lưu Token và User vào máy
      await _storageHelper.saveToken(token);
      await _storageHelper.saveUser(user);

      return user;
    } on DioException catch (e) {
      // Xử lý lỗi từ server (ví dụ: sai pass, 400, 401, 500)
      throw Exception(e.response?.data['message'] ?? 'Lỗi kết nối server');
    }
  }

  // 2. Chức năng Đăng ký
  Future<UserModel> register(
    String email,
    String password,
    String fullName,
    String? phone,
  ) async {
    try {
      final response = await _dioClient.dio.post(
        ApiConstants.register,
        data: {
          'email': email,
          'password': password,
          'full_name': fullName,
          'phone_number': phone,
        },
      );

      // Theo specs: Register xong trả về message và user (không có token)
      final userData = response.data['user'];
      return UserModel.fromJson(userData);
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Đăng ký thất bại');
    }
  }

  // 2. Kiểm tra trạng thái đăng nhập (Auto Login)
  Future<UserModel?> getCurrentUser() async {
    // Đọc token từ máy
    final token = await _storageHelper.getToken();
    final user = await _storageHelper.getUser();

    if (token != null && user != null) {
      // Nếu có token, trả về user đã lưu (để app vào thẳng màn hình chính)
      // *Nâng cao: Tại đây nên gọi thêm 1 API lấy profile mới nhất để update lại
      return user;
    }
    return null; // Chưa đăng nhập
  }

  // 3. Đăng xuất
  Future<void> logout() async {
    await _storageHelper.clearAll();
  }

  // 4. Lấy thông tin Profile mới nhất
  Future<UserModel> getProfile() async {
    try {
      final response = await _dioClient.dio.get('/users/profile');
      return UserModel.fromJson(response.data);
    } catch (e) {
      throw Exception('Load profile failed');
    }
  }

  // 5. Cập nhật Profile
  Future<UserModel> updateProfile({
    String? fullName,
    String? phoneNumber,
    String? gender,
    String? birthDate,
  }) async {
    try {
      final response = await _dioClient.dio.put(
        '/users/profile',
        data: {
          if (fullName != null) 'full_name': fullName,
          if (phoneNumber != null) 'phone_number': phoneNumber,
          if (gender != null) 'gender': gender,
          if (birthDate != null) 'birth_date': birthDate,
        },
      );
      // API trả về key "user" chứa thông tin mới
      return UserModel.fromJson(response.data['user']);
    } catch (e) {
      throw Exception('Update profile failed');
    }
  }

  // 6. Đổi mật khẩu
  Future<void> changePassword(
    String currentPass,
    String newPass,
    String confirmPass,
  ) async {
    try {
      await _dioClient.dio.put(
        '/users/change-password',
        data: {
          'current_password': currentPass,
          'new_password': newPass,
          'confirm_password': confirmPass,
        },
      );
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Change password failed');
    }
  }
}
