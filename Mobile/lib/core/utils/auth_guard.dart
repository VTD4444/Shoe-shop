import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../features/auth/logic/auth_bloc.dart';
import '../../features/auth/logic/auth_state.dart';
import '../../features/auth/presentation/login_screen.dart';

class AuthGuard {
  static void checkAuthOrLogin(
    BuildContext context,
    VoidCallback onAuthenticated,
  ) {
    final authState = context.read<AuthBloc>().state;

    if (authState is AuthAuthenticated || authState is AuthSuccess) {
      // Đã đăng nhập -> Chạy luôn hành động (VD: Add to cart)
      onAuthenticated();
    } else {
      // Chưa đăng nhập -> Mở Login
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      ).then((result) {
        // --- QUAN TRỌNG ---
        // result chính là giá trị true mà ta vừa trả về ở bước 1 (Navigator.pop(context, true))
        if (result == true) {
          // Nếu login thành công -> Tự động chạy hành động ban đầu
          onAuthenticated();
        }
      });
    }
  }
}
