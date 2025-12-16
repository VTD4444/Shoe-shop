class ReviewStats {
  final double averageRating;
  final int totalReviews;
  final List<ReviewModel> reviews;

  ReviewStats({
    required this.averageRating,
    required this.totalReviews,
    required this.reviews,
  });

  factory ReviewStats.fromJson(Map<String, dynamic> json) {
    return ReviewStats(
      averageRating: double.tryParse(json['average_rating'].toString()) ?? 0.0,
      totalReviews: json['total_reviews'] ?? 0,
      reviews: (json['reviews'] as List)
          .map((e) => ReviewModel.fromJson(e))
          .toList(),
    );
  }
}

class ReviewModel {
  final String userName;
  final double rating;
  final String content;
  final String createdAt;
  final String variantInfo;

  ReviewModel({
    required this.userName,
    required this.rating,
    required this.content,
    required this.createdAt,
    required this.variantInfo,
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    return ReviewModel(
      userName: json['user_name'] ?? 'Hidden Name',
      rating: double.tryParse(json['rating'].toString()) ?? 0.0,
      content: json['content'] ?? '',
      createdAt: json['created_at'] ?? '',
      variantInfo: json['variant_info'] ?? '',
    );
  }
}
