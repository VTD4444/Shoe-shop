import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/repositories/auth_repository.dart';
import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository authRepository;

  AuthBloc(this.authRepository) : super(AuthInitial()) {
    // Xử lý sự kiện Login
    on<AuthCheckRequested>((event, emit) async {
      print('AuthCheckRequested event received');
      emit(AuthLoading());
      try {
        final user = await authRepository.getCurrentUser();
        if (user != null) {
          // Có user trong bộ nhớ -> Vào thẳng
          emit(AuthSuccess(user));
        } else {
          // Không có -> Về màn hình Login (trạng thái Failure hoặc Initial)
          emit(AuthInitial());
        }
      } catch (e) {
        emit(AuthInitial());
      }
    });

    on<AuthLoginStarted>((event, emit) async {
      print("👉 BLOC: Đã nhận sự kiện LoginStarted"); // Log kiểm tra
      emit(AuthLoading());
      try {
        print("👉 BLOC: Đang gọi Repository...");
        final user = await authRepository.login(event.email, event.password);
        print("✅ BLOC: Login thành công!");
        emit(AuthSuccess(user));
      } catch (e) {
        print("❌ BLOC: Login thất bại. Lỗi: $e"); // QUAN TRỌNG: Xem lỗi gì
        emit(AuthFailure(e.toString()));
      }
    });

    // Xử lý sự kiện Register
    on<AuthRegisterStarted>((event, emit) async {
      emit(AuthLoading());
      try {
        final user = await authRepository.register(
          event.email,
          event.password,
          event.fullName,
          event.phone,
        );
        emit(AuthRegisterSuccess(user));
      } catch (e) {
        emit(AuthFailure(e.toString()));
      }
    });

    // Xử lý Logout
    on<AuthLogoutRequested>((event, emit) async {
      emit(AuthLoading());
      await authRepository.logout();
      emit(AuthInitial()); // Quay về màn hình chào/login
    });
  }
}
