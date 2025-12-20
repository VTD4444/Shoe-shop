import 'package:shoe_shop/features/checkout/data/models/search_query.dart';
import 'package:shoe_shop/features/product/data/models/product_detail_model.dart';
import 'package:shoe_shop/features/product/data/models/review_model.dart';
import '../../../../core/api/dio_client.dart';
import '../models/product_model.dart';

class ProductRepository {
  final DioClient _dioClient;

  ProductRepository({required DioClient dioClient}) : _dioClient = dioClient;

  // 1. Lấy danh sách Trending
  Future<List<ProductModel>> getTrendingProducts() async {
    try {
      final response = await _dioClient.dio.get(
        '/products/trending',
        queryParameters: {'limit': 10},
      );
      final List data = response.data['data'];
      return data.map((e) => ProductModel.fromJson(e)).toList();
    } catch (e) {
      throw Exception('Failed to load trending');
    }
  }

  // 2. Lấy danh sách sản phẩm (Dùng cho New Arrivals)
  Future<List<ProductModel>> getNewestProducts({int limit = 10}) async {
    try {
      final response = await _dioClient.dio.post(
        '/products/search',
        data: {
          "page": 1,
          "limit": limit,
          "sort_by": "newest", // Mặc định API
        },
      );
      final List data = response.data['data'];
      return data.map((e) => ProductModel.fromJson(e)).toList();
    } catch (e) {
      throw Exception('Failed to load products');
    }
  }

  // 3. Lấy Filter (để lấy list Brand)
  Future<List<BrandModel>> getBrands() async {
    try {
      final response = await _dioClient.dio.get('/products/filters');
      final List data = response.data['brands'];
      return data.map((e) => BrandModel.fromJson(e)).toList();
    } catch (e) {
      return []; // Nếu lỗi thì trả về rỗng, không chặn app
    }
  }

  // 4. Lấy chi tiết sản phẩm
  Future<ProductDetailModel> getProductDetail(String id) async {
    try {
      final response = await _dioClient.dio.get('/products/$id');
      return ProductDetailModel.fromJson(response.data);
    } catch (e, stacktrace) {
      // --- THÊM DÒNG NÀY ĐỂ DEBUG ---
      print("❌ LỖI PARSE DATA: $e");
      print("STACKTRACE: $stacktrace");
      // -----------------------------

      throw Exception(
        'Failed to load product detail: $e',
      ); // Ném cả lỗi e ra để hiển thị lên UI nếu cần
    }
  }

  // 5. Lấy đánh giá
  Future<ReviewStats> getProductReviews(String id) async {
    try {
      final response = await _dioClient.dio.get(
        '/products/$id/reviews',
        queryParameters: {'limit': 3},
      );
      return ReviewStats.fromJson(response.data);
    } catch (e) {
      // Trả về object rỗng nếu lỗi, không chặn UI chính
      return ReviewStats(averageRating: 0, totalReviews: 0, reviews: []);
    }
  }

  Future<List<ProductModel>> searchProducts(SearchQuery query) async {
    try {
      final response = await _dioClient.dio.post(
        '/products/search',
        data: query.toJson(),
      );

      final List data = response.data['data'] ?? [];
      return data.map((json) => ProductModel.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Search failed');
    }
  }
}
