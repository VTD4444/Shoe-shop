class ProductModel {
  final String id;
  final String name;
  final double price;
  final String thumbnail;
  final String brandName;
  final double? rating;
  final int? soldCount;

  ProductModel({
    required this.id,
    required this.name,
    required this.price,
    required this.thumbnail,
    required this.brandName,
    this.rating,
    this.soldCount,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['product_id'] ?? '',
      name: json['name'] ?? '',
      // Xử lý an toàn cho số thực
      price: double.tryParse(json['base_price'].toString()) ?? 0.0,
      thumbnail: json['thumbnail'] ?? '',
      brandName: json['brand_name'] ?? '',
      rating: json['average_rating'] != null
          ? double.tryParse(json['average_rating'].toString())
          : null,
      soldCount: json['sold_count'],
    );
  }
}

class BrandModel {
  final int id;
  final String name;

  BrandModel({required this.id, required this.name});

  factory BrandModel.fromJson(Map<String, dynamic> json) {
    return BrandModel(id: json['brand_id'], name: json['name']);
  }
}
