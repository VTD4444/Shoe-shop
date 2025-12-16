import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/models/product_model.dart';
import '../data/repositories/product_repository.dart';

// --- EVENTS ---
abstract class HomeEvent {}

class HomeInitialLoad extends HomeEvent {}

// --- STATES ---
abstract class HomeState {}

class HomeInitial extends HomeState {}

class HomeLoading extends HomeState {}

class HomeLoaded extends HomeState {
  final List<ProductModel> trendingProducts;
  final List<ProductModel> newestProducts;
  final List<BrandModel> brands;

  HomeLoaded({
    required this.trendingProducts,
    required this.newestProducts,
    required this.brands,
  });
}

class HomeFailure extends HomeState {
  final String message;
  HomeFailure(this.message);
}

// --- BLOC ---
class HomeBloc extends Bloc<HomeEvent, HomeState> {
  final ProductRepository productRepository;

  HomeBloc(this.productRepository) : super(HomeInitial()) {
    on<HomeInitialLoad>((event, emit) async {
      emit(HomeLoading());
      try {
        // Gọi song song 3 API để tiết kiệm thời gian
        final results = await Future.wait([
          productRepository.getTrendingProducts(),
          productRepository.getNewestProducts(limit: 6),
          productRepository.getBrands(),
        ]);

        emit(
          HomeLoaded(
            trendingProducts: results[0] as List<ProductModel>,
            newestProducts: results[1] as List<ProductModel>,
            brands: results[2] as List<BrandModel>,
          ),
        );
      } catch (e) {
        emit(HomeFailure(e.toString()));
      }
    });
  }
}
