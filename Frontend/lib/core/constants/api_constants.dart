import 'dart:io';

class ApiConstants {
  // Tự động check nếu là Android thì dùng 10.0.2.2, ngược lại dùng localhost
  static String get baseUrl {
    if (Platform.isAndroid) {
      return 'http://192.168.1.78:5000';
    }
    return 'http://localhost:5000';
  }

  static const String login = '/auth/login';
  static const String register = '/auth/register';
}
