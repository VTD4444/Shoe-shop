import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/models/user_model.dart';
import '../data/repositories/auth_repository.dart';

// EVENTS
abstract class ProfileEvent {}

class LoadProfileEvent extends ProfileEvent {}

class UpdateProfileEvent extends ProfileEvent {
  final String? fullName;
  final String? phoneNumber;
  final String? gender;
  final String? birthDate;
  UpdateProfileEvent({
    this.fullName,
    this.phoneNumber,
    this.gender,
    this.birthDate,
  });
}

class ChangePasswordEvent extends ProfileEvent {
  final String currentPass;
  final String newPass;
  final String confirmPass;
  ChangePasswordEvent(this.currentPass, this.newPass, this.confirmPass);
}

// STATES
abstract class ProfileState {}

class ProfileInitial extends ProfileState {}

class ProfileLoading extends ProfileState {}

class ProfileLoaded extends ProfileState {
  final UserModel user;
  ProfileLoaded(this.user);
}

class ProfileUpdateSuccess extends ProfileState {
  final UserModel user; // Trả về user mới để update UI
  ProfileUpdateSuccess(this.user);
}

class ChangePasswordSuccess extends ProfileState {} // Đổi pass xong

class ProfileError extends ProfileState {
  final String message;
  ProfileError(this.message);
}

// BLOC
class ProfileBloc extends Bloc<ProfileEvent, ProfileState> {
  final AuthRepository authRepository;

  ProfileBloc(this.authRepository) : super(ProfileInitial()) {
    on<LoadProfileEvent>((event, emit) async {
      emit(ProfileLoading());
      try {
        final user = await authRepository.getProfile();
        emit(ProfileLoaded(user));
      } catch (e) {
        emit(ProfileError(e.toString()));
      }
    });

    on<UpdateProfileEvent>((event, emit) async {
      emit(ProfileLoading());
      try {
        final newUser = await authRepository.updateProfile(
          fullName: event.fullName,
          phoneNumber: event.phoneNumber,
          gender: event.gender,
          birthDate: event.birthDate,
        );
        emit(ProfileUpdateSuccess(newUser));
        // Quay về trạng thái Loaded để hiển thị data mới
        emit(ProfileLoaded(newUser));
      } catch (e) {
        emit(ProfileError(e.toString()));
      }
    });

    on<ChangePasswordEvent>((event, emit) async {
      emit(ProfileLoading());
      try {
        await authRepository.changePassword(
          event.currentPass,
          event.newPass,
          event.confirmPass,
        );
        emit(ChangePasswordSuccess());
        // Sau khi đổi pass, load lại profile để giữ trạng thái
        add(LoadProfileEvent());
      } catch (e) {
        emit(ProfileError(e.toString()));
        // Quay lại trạng thái cũ nếu có thể (cần logic phức tạp hơn, ở đây ta load lại)
        add(LoadProfileEvent());
      }
    });
  }
}
