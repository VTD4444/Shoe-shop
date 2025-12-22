import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/models/address_model.dart';
import '../data/repositories/address_repository.dart';

// EVENTS
abstract class AddressEvent {}

class LoadAddressesEvent extends AddressEvent {}

class AddAddressEvent extends AddressEvent {
  final AddressModel address;
  AddAddressEvent(this.address);
}

class EditAddressEvent extends AddressEvent {
  final String id;
  final AddressModel address;
  EditAddressEvent(this.id, this.address);
}

class DeleteAddressEvent extends AddressEvent {
  final String id;
  DeleteAddressEvent(this.id);
}

// STATES
abstract class AddressState {}

class AddressLoading extends AddressState {}

class AddressLoaded extends AddressState {
  final List<AddressModel> addresses;
  AddressLoaded(this.addresses);
}

class AddressError extends AddressState {
  final String message;
  AddressError(this.message);
}

// BLOC
class AddressBloc extends Bloc<AddressEvent, AddressState> {
  final AddressRepository repository;

  AddressBloc(this.repository) : super(AddressLoading()) {
    on<LoadAddressesEvent>((event, emit) async {
      emit(AddressLoading());
      try {
        final list = await repository.getAddresses();
        emit(AddressLoaded(list));
      } catch (e) {
        emit(AddressError("Không tải được danh sách địa chỉ"));
      }
    });

    on<AddAddressEvent>((event, emit) async {
      try {
        await repository.addAddress(event.address);
        add(LoadAddressesEvent()); // Reload list sau khi thêm
      } catch (e) {
        // Handle error (có thể emit state lỗi tạm thời)
      }
    });

    on<EditAddressEvent>((event, emit) async {
      try {
        await repository.updateAddress(event.id, event.address);
        add(LoadAddressesEvent());
      } catch (e) {}
    });

    on<DeleteAddressEvent>((event, emit) async {
      try {
        await repository.deleteAddress(event.id);
        add(LoadAddressesEvent());
      } catch (e) {}
    });
  }
}
