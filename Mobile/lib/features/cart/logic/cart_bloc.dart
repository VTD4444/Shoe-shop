import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/models/cart_model.dart';
import '../data/repositories/cart_repository.dart';

// --- EVENTS ---
abstract class CartEvent {}

class LoadCartEvent extends CartEvent {} // Gọi khi mở app hoặc login thành công

class AddToCartEvent extends CartEvent {
  final String variantId;
  final int quantity;
  AddToCartEvent({required this.variantId, this.quantity = 1});
}

class UpdateCartItemEvent extends CartEvent {
  final String cartItemId;
  final int newQuantity;
  UpdateCartItemEvent(this.cartItemId, this.newQuantity);
}

class RemoveCartItemEvent extends CartEvent {
  final String cartItemId;
  RemoveCartItemEvent(this.cartItemId);
}

// --- STATES ---
abstract class CartState {}

class CartInitial extends CartState {}

class CartLoading extends CartState {}

class CartLoaded extends CartState {
  final CartModel cart;
  CartLoaded(this.cart);
}

class CartError extends CartState {
  final String message;
  CartError(this.message);
}

// --- BLOC ---
class CartBloc extends Bloc<CartEvent, CartState> {
  final CartRepository cartRepository;

  CartBloc(this.cartRepository) : super(CartInitial()) {
    // 1. Load Giỏ Hàng
    on<LoadCartEvent>((event, emit) async {
      emit(CartLoading());
      try {
        final cart = await cartRepository.getCart();
        emit(CartLoaded(cart));
      } catch (e) {
        emit(CartError("Không thể tải giỏ hàng"));
      }
    });

    // 2. Thêm vào giỏ
    on<AddToCartEvent>((event, emit) async {
      // Lưu lại state cũ để rollback nếu lỗi (Optimistic UI - nâng cao)
      // Ở đây làm cách an toàn: Loading -> Call API -> Reload Cart
      try {
        await cartRepository.addToCart(event.variantId, event.quantity);
        print("✅ Add success, reloading cart...");
        add(LoadCartEvent()); // <--- Dòng này quan trọng để refresh list
      } catch (e) {
        print("❌ Add failed: $e");
      }
    });

    // 3. Update & Remove (Tương tự)
    on<UpdateCartItemEvent>((event, emit) async {
      try {
        await cartRepository.updateCartItem(
          event.cartItemId,
          event.newQuantity,
        );
        add(LoadCartEvent());
      } catch (e) {
        /* Handle error */
      }
    });

    on<RemoveCartItemEvent>((event, emit) async {
      try {
        await cartRepository.removeCartItem(event.cartItemId);
        add(LoadCartEvent());
      } catch (e) {
        /* Handle error */
      }
    });
  }
}
