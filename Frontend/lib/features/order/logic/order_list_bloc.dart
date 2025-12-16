import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/models/order_model.dart';
import '../data/repositories/order_repository.dart';

abstract class OrderListEvent {}

class LoadOrdersEvent extends OrderListEvent {
  final String status; // 'all', 'pending', 'completed'...
  LoadOrdersEvent(this.status);
}

abstract class OrderListState {}

class OrderListLoading extends OrderListState {}

class OrderListLoaded extends OrderListState {
  final List<OrderModel> orders;
  OrderListLoaded(this.orders);
}

class OrderListError extends OrderListState {
  final String message;
  OrderListError(this.message);
}

class OrderListBloc extends Bloc<OrderListEvent, OrderListState> {
  final OrderRepository repository;

  OrderListBloc(this.repository) : super(OrderListLoading()) {
    on<LoadOrdersEvent>((event, emit) async {
      emit(OrderListLoading());
      try {
        final orders = await repository.getOrders(status: event.status);
        emit(OrderListLoaded(orders));
      } catch (e) {
        emit(OrderListError(e.toString()));
      }
    });
  }
}
