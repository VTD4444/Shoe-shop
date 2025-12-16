import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../features/auth/data/models/user_model.dart';

class StorageHelper {
  // Cấu hình bảo mật cho Android/iOS
  final _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );

  static const _tokenKey = 'auth_token';
  static const _userKey = 'auth_user_info';

  // 1. Lưu Token
  Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  // 2. Lấy Token
  Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  // 3. Lưu thông tin User (dạng JSON string) để dùng offline/lúc mở app
  Future<void> saveUser(UserModel user) async {
    // Chuyển object UserModel thành Map -> rồi thành String JSON
    // Lưu ý: Bạn cần thêm phương thức toJson() trong UserModel (xem bổ sung bên dưới)
    String userJson = jsonEncode({
      'user_id': user.userId,
      'email': user.email,
      'full_name': user.fullName,
      'role': user.role,
      'avatar_url': user.avatarUrl,
    });
    await _storage.write(key: _userKey, value: userJson);
  }

  // 4. Lấy thông tin User
  Future<UserModel?> getUser() async {
    String? userJson = await _storage.read(key: _userKey);
    if (userJson == null) return null;
    try {
      return UserModel.fromJson(jsonDecode(userJson));
    } catch (e) {
      return null;
    }
  }

  // 5. Xóa dữ liệu (Đăng xuất)
  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
