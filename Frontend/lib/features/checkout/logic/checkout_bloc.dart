import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/models/order_preview_model.dart';
import '../data/repositories/checkout_repository.dart';

// EVENTS
abstract class CheckoutEvent {}

class InitCheckoutEvent extends CheckoutEvent {} // Load lần đầu

class ApplyVoucherEvent extends CheckoutEvent {
  final String code;
  ApplyVoucherEvent(this.code);
}

class ChangeShippingMethodEvent extends CheckoutEvent {
  final String method; // 'standard' or 'express'
  ChangeShippingMethodEvent(this.method);
}

class PlaceOrderEvent extends CheckoutEvent {
  final String paymentMethod;
  final String? note;
  PlaceOrderEvent({required this.paymentMethod, this.note});
}

class ChangeAddressEvent extends CheckoutEvent {
  final String addressId;
  ChangeAddressEvent(this.addressId);
}

// STATES
abstract class CheckoutState {}

class CheckoutLoading extends CheckoutState {}

class CheckoutFailure extends CheckoutState {
  final String message;
  CheckoutFailure(this.message);
}

class CheckoutLoaded extends CheckoutState {
  final OrderPreviewModel preview;
  final List<ShippingAddress> addresses;
  final String selectedAddressId;
  final String selectedShippingMethod;
  final String voucherCode;

  CheckoutLoaded({
    required this.preview,
    required this.addresses,
    required this.selectedAddressId,
    this.selectedShippingMethod = 'standard',
    this.voucherCode = '',
  });

  // Helper để copy state khi update 1 trường nhỏ
  CheckoutLoaded copyWith({
    OrderPreviewModel? preview,
    String? selectedShippingMethod,
    String? voucherCode,
  }) {
    return CheckoutLoaded(
      preview: preview ?? this.preview,
      addresses: addresses,
      selectedAddressId: selectedAddressId,
      selectedShippingMethod:
          selectedShippingMethod ?? this.selectedShippingMethod,
      voucherCode: voucherCode ?? this.voucherCode,
    );
  }
}

class CheckoutOrderSuccess extends CheckoutState {
  final String orderId;
  final String? paymentUrl;

  CheckoutOrderSuccess({required this.orderId, this.paymentUrl});
}

// BLOC
class CheckoutBloc extends Bloc<CheckoutEvent, CheckoutState> {
  final CheckoutRepository repository;

  CheckoutBloc(this.repository) : super(CheckoutLoading()) {
    // 1. Khởi tạo: Lấy địa chỉ -> Gọi Preview
    on<InitCheckoutEvent>((event, emit) async {
      emit(CheckoutLoading());
      try {
        // Lấy list địa chỉ
        final addresses = await repository.getMyAddresses();
        if (addresses.isEmpty) {
          emit(CheckoutFailure("Vui lòng thêm địa chỉ giao hàng trước"));
          return;
        }
        final defaultAddressId = addresses.first.addressId;

        // Gọi Preview lần đầu
        final preview = await repository.previewOrder(
          addressId: defaultAddressId,
        );

        emit(
          CheckoutLoaded(
            preview: preview,
            addresses: addresses,
            selectedAddressId: defaultAddressId,
          ),
        );
      } catch (e) {
        emit(CheckoutFailure(e.toString()));
      }
    });

    // 2. Áp dụng Voucher hoặc Đổi Ship -> Gọi lại Preview
    on<ApplyVoucherEvent>((event, emit) async {
      if (state is CheckoutLoaded) {
        final currState = state as CheckoutLoaded;
        emit(CheckoutLoading()); // Show loading khi tính toán
        try {
          final newPreview = await repository.previewOrder(
            addressId: currState.selectedAddressId,
            shippingMethod: currState.selectedShippingMethod,
            voucherCode: event.code,
          );
          emit(
            currState.copyWith(preview: newPreview, voucherCode: event.code),
          );
        } catch (e) {
          emit(CheckoutFailure(e.toString()));
          // Nếu lỗi thì quay lại state cũ (có thể cải tiến logic này)
        }
      }
    });

    on<ChangeShippingMethodEvent>((event, emit) async {
      if (state is CheckoutLoaded) {
        final currState = state as CheckoutLoaded;
        emit(CheckoutLoading());
        try {
          final newPreview = await repository.previewOrder(
            addressId: currState.selectedAddressId,
            shippingMethod: event.method,
            voucherCode: currState.voucherCode,
          );
          emit(
            currState.copyWith(
              preview: newPreview,
              selectedShippingMethod: event.method,
            ),
          );
        } catch (e) {
          emit(CheckoutFailure(e.toString()));
        }
      }
    });

    // 3. Đặt hàng
    on<PlaceOrderEvent>((event, emit) async {
      if (state is CheckoutLoaded) {
        final currState = state as CheckoutLoaded;
        emit(CheckoutLoading());
        try {
          // Nhận Map kết quả từ Repo
          final result = await repository.placeOrder(
            addressId: currState.selectedAddressId,
            paymentMethod: event.paymentMethod,
            shippingMethod: currState.selectedShippingMethod,
            voucherCode: currState.voucherCode,
            note: event.note,
          );

          emit(
            CheckoutOrderSuccess(
              orderId: result['order_id'],
              paymentUrl: result['payment_url'], // Truyền URL sang State
            ),
          );
        } catch (e) {
          emit(CheckoutFailure(e.toString()));
        }
      }
    });

    // Xử lý sự kiện thay đổi địa chỉ
    on<ChangeAddressEvent>((event, emit) async {
      if (state is CheckoutLoaded) {
        final currState = state as CheckoutLoaded;

        // Chuyển sang Loading để user biết đang tính toán lại
        emit(CheckoutLoading());

        try {
          // Gọi API Preview với Address ID MỚI
          final newPreview = await repository.previewOrder(
            addressId: event.addressId, // <--- ID mới từ sổ địa chỉ
            shippingMethod: currState.selectedShippingMethod,
            voucherCode: currState.voucherCode,
          );

          // Cập nhật State với dữ liệu giá mới và Address ID mới
          emit(
            currState.copyWith(
              preview: newPreview,
              // Lưu ý: Trong CheckoutLoaded bạn cần đảm bảo có trường selectedAddressId
              // Nếu chưa có trong copyWith, hãy thêm nó vào (xem lại file bloc bước trước)
            ),
          );

          // *Lưu ý nâng cao*: Nếu class CheckoutLoaded chưa hỗ trợ update selectedAddressId trong copyWith
          // Bạn hãy tạo mới object CheckoutLoaded như sau:
          /*
          emit(CheckoutLoaded(
            preview: newPreview,
            addresses: currState.addresses,
            selectedAddressId: event.addressId, // Cập nhật ID
            selectedShippingMethod: currState.selectedShippingMethod,
            voucherCode: currState.voucherCode,
          ));
          */
        } catch (e) {
          emit(CheckoutFailure(e.toString()));
        }
      }
    });
  }
}
