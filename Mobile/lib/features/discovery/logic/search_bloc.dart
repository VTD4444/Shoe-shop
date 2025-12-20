import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shoe_shop/features/checkout/data/models/search_query.dart';
import '../data/models/product_model.dart';
import '../data/repositories/product_repository.dart';

// --- EVENTS ---
abstract class SearchEvent {}

class SearchByKeyword extends SearchEvent {
  final String keyword;
  SearchByKeyword(this.keyword);
}

class ApplyFilter extends SearchEvent {
  final SearchQuery query;
  ApplyFilter(this.query);
}

// --- STATES ---
abstract class SearchState {}

class SearchInitial extends SearchState {}

class SearchLoading extends SearchState {}

class SearchLoaded extends SearchState {
  final List<ProductModel> products;
  final SearchQuery currentQuery; // Giữ lại query để UI biết đang lọc cái gì

  SearchLoaded(this.products, this.currentQuery);
}

class SearchFailure extends SearchState {
  final String message;
  SearchFailure(this.message);
}

// --- BLOC ---
class SearchBloc extends Bloc<SearchEvent, SearchState> {
  final ProductRepository repository;

  SearchBloc(this.repository) : super(SearchInitial()) {
    // 1. Tìm kiếm theo từ khóa
    on<SearchByKeyword>((event, emit) async {
      emit(SearchLoading());
      try {
        // Tạo query mới chỉ với keyword, reset các filter khác
        final query = SearchQuery(keyword: event.keyword);
        final results = await repository.searchProducts(query);
        emit(SearchLoaded(results, query));
      } catch (e) {
        emit(SearchFailure("Search failed"));
      }
    });

    // 2. Áp dụng bộ lọc (Sort, Price, Brand...)
    on<ApplyFilter>((event, emit) async {
      emit(SearchLoading());
      try {
        final results = await repository.searchProducts(event.query);
        emit(SearchLoaded(results, event.query));
      } catch (e) {
        emit(SearchFailure("Filter failed"));
      }
    });
  }
}
