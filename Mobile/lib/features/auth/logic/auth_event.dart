abstract class AuthEvent {}

class AuthLoginStarted extends AuthEvent {
  final String email;
  final String password;
  AuthLoginStarted({required this.email, required this.password});
}

class AuthRegisterStarted extends AuthEvent {
  final String email;
  final String password;
  final String fullName;
  final String? phone;
  AuthRegisterStarted({
    required this.email,
    required this.password,
    required this.fullName,
    this.phone,
  });
}

// Thêm sự kiện kiểm tra khi mở App
class AuthCheckRequested extends AuthEvent {}

// Thêm sự kiện Đăng xuất
class AuthLogoutRequested extends AuthEvent {}
