import 'package:dio/dio.dart';
import '../../../../core/api/dio_client.dart';
import '../models/review_model.dart';

class ReviewRepository {
  final DioClient _dioClient;
  ReviewRepository({required DioClient dioClient}) : _dioClient = dioClient;

  Future<ReviewSummaryModel> getReviews(String productId) async {
    try {
      final response = await _dioClient.dio.get('/products/$productId/reviews');
      return ReviewSummaryModel.fromJson(response.data);
    } catch (e) {
      throw Exception('Load reviews failed');
    }
  }

  Future<void> submitReview({
    required String productId,
    required String orderId,
    required int rating,
    required String content,
  }) async {
    try {
      await _dioClient.dio.post(
        '/products/$productId/reviews',
        data: {'order_id': orderId, 'rating': rating, 'content': content},
      );
    } catch (e) {
      // Bắt lỗi từ Backend trả về (AI filter, chưa mua hàng...)
      if (e is DioException && e.response != null) {
        throw Exception(e.response!.data['message']);
      }
      throw Exception('Submit review failed');
    }
  }
}
