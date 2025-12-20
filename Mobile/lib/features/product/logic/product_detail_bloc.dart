import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/models/product_detail_model.dart';
import '../data/models/review_model.dart';
import '../../discovery/data/repositories/product_repository.dart';

// EVENTS
abstract class ProductDetailEvent {}

class LoadProductDetailEvent extends ProductDetailEvent {
  final String productId;
  LoadProductDetailEvent(this.productId);
}

class SelectVariantEvent extends ProductDetailEvent {
  final String? color;
  final String? size;
  SelectVariantEvent({this.color, this.size});
}

// STATE
abstract class ProductDetailState {}

class ProductDetailLoading extends ProductDetailState {}

class ProductDetailFailure extends ProductDetailState {
  final String message;
  ProductDetailFailure(this.message);
}

class ProductDetailLoaded extends ProductDetailState {
  final ProductDetailModel product;
  final ReviewStats reviews;

  // Trạng thái selection
  final String selectedColor;
  final String selectedSize;
  final ProductVariant? matchedVariant; // Biến thể tìm thấy khớp color & size

  ProductDetailLoaded({
    required this.product,
    required this.reviews,
    required this.selectedColor,
    required this.selectedSize,
    this.matchedVariant,
  });

  // Helper để copyWith state khi user click chọn
  ProductDetailLoaded copyWith({
    String? selectedColor,
    String? selectedSize,
    ProductVariant? matchedVariant,
  }) {
    return ProductDetailLoaded(
      product: product,
      reviews: reviews,
      selectedColor: selectedColor ?? this.selectedColor,
      selectedSize: selectedSize ?? this.selectedSize,
      matchedVariant: matchedVariant ?? this.matchedVariant,
    );
  }
}

// BLOC
class ProductDetailBloc extends Bloc<ProductDetailEvent, ProductDetailState> {
  final ProductRepository repository;

  ProductDetailBloc(this.repository) : super(ProductDetailLoading()) {
    on<LoadProductDetailEvent>((event, emit) async {
      emit(ProductDetailLoading());
      try {
        // Gọi song song 2 API
        final results = await Future.wait([
          repository.getProductDetail(event.productId),
          repository.getProductReviews(event.productId),
        ]);

        final product = results[0] as ProductDetailModel;
        final reviews = results[1] as ReviewStats;

        // Mặc định chọn màu/size đầu tiên nếu có
        String defaultColor = product.variants.isNotEmpty
            ? product.variants.first.colorName
            : '';
        String defaultSize = product.variants.isNotEmpty
            ? product.variants.first.size
            : '';
        ProductVariant? defaultVariant = product.variants.isNotEmpty
            ? product.variants.first
            : null;

        emit(
          ProductDetailLoaded(
            product: product,
            reviews: reviews,
            selectedColor: defaultColor,
            selectedSize: defaultSize,
            matchedVariant: defaultVariant,
          ),
        );
      } catch (e) {
        emit(ProductDetailFailure(e.toString()));
      }
    });

    on<SelectVariantEvent>((event, emit) {
      if (state is ProductDetailLoaded) {
        final currentState = state as ProductDetailLoaded;
        final newColor = event.color ?? currentState.selectedColor;
        final newSize = event.size ?? currentState.selectedSize;

        // Tìm variant khớp với Color & Size mới
        ProductVariant? found;
        try {
          found = currentState.product.variants.firstWhere(
            (v) => v.colorName == newColor && v.size == newSize,
          );
        } catch (e) {
          found =
              null; // Không tìm thấy combo này (hết hàng hoặc không tồn tại)
        }

        emit(
          currentState.copyWith(
            selectedColor: newColor,
            selectedSize: newSize,
            matchedVariant: found,
          ),
        );
      }
    });
  }
}
