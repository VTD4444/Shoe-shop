import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/models/order_model.dart';
import '../data/repositories/order_repository.dart';

abstract class OrderDetailEvent {}

class LoadOrderDetailEvent extends OrderDetailEvent {
  final String orderId;
  LoadOrderDetailEvent(this.orderId);
}

class CancelOrderEvent extends OrderDetailEvent {
  final String orderId;
  final String reason;
  CancelOrderEvent(this.orderId, this.reason);
}

abstract class OrderDetailState {}

class OrderDetailLoading extends OrderDetailState {}

class OrderDetailLoaded extends OrderDetailState {
  final OrderModel order;
  OrderDetailLoaded(this.order);
}

class OrderDetailError extends OrderDetailState {
  final String message;
  OrderDetailError(this.message);
}

class OrderCancelSuccess extends OrderDetailState {
  // Trạng thái tạm thời khi hủy thành công để show thông báo
}

class OrderDetailBloc extends Bloc<OrderDetailEvent, OrderDetailState> {
  final OrderRepository repository;

  OrderDetailBloc(this.repository) : super(OrderDetailLoading()) {
    on<LoadOrderDetailEvent>((event, emit) async {
      emit(OrderDetailLoading());
      try {
        final order = await repository.getOrderDetail(event.orderId);
        emit(OrderDetailLoaded(order));
      } catch (e) {
        emit(OrderDetailError("Không tải được chi tiết đơn hàng"));
      }
    });

    on<CancelOrderEvent>((event, emit) async {
      try {
        await repository.cancelOrder(event.orderId, event.reason);
        emit(OrderCancelSuccess());
        // Sau khi hủy xong, load lại chi tiết để cập nhật trạng thái mới (Cancelled)
        add(LoadOrderDetailEvent(event.orderId));
      } catch (e) {
        // Emit lỗi nhưng giữ nguyên màn hình hiện tại (cần xử lý khéo léo hơn ở UI hoặc dùng Listener)
        emit(OrderDetailError(e.toString().replaceAll("Exception: ", "")));
        // Load lại để user không bị kẹt ở màn hình trắng nếu lỗi
        add(LoadOrderDetailEvent(event.orderId));
      }
    });
  }
}
