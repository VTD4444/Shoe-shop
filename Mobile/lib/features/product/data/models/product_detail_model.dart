class ProductDetailModel {
  final String id;
  final String name;
  final double basePrice;
  final double rating;
  final String description;
  final String brandName;
  final List<ProductMedia> medias;
  final List<ProductVariant> variants;

  ProductDetailModel({
    required this.id,
    required this.name,
    required this.basePrice,
    required this.rating,
    required this.description,
    required this.brandName,
    required this.medias,
    required this.variants,
  });

  // 1. Lọc lấy danh sách chỉ chứa ảnh
  List<String> get imageUrls {
    return medias.where((m) => m.type == 'image').map((m) => m.url).toList();
  }

  // 2. Lấy đường dẫn file 3D (nếu có)
  String? get model3DPath {
    try {
      final model = medias.firstWhere((m) => m.type == '3d_model');
      // Backend trả về: "adidas_racer_tr21.glb"
      // Frontend nối thêm path assets:
      return 'assets/models_3d/${model.url}';
    } catch (e) {
      return null; // Không có 3D
    }
  }

  factory ProductDetailModel.fromJson(Map<String, dynamic> json) {
    return ProductDetailModel(
      id: json['product_id'],
      name: json['name'],
      basePrice: double.tryParse(json['base_price'].toString()) ?? 0.0,
      rating: double.tryParse(json['average_rating'].toString()) ?? 0.0,
      description: json['description'] ?? '',
      brandName: json['brand']?['name'] ?? '',
      medias: (json['media'] as List? ?? [])
          .map((e) => ProductMedia.fromJson(e))
          .toList(),
      variants: (json['variants'] as List)
          .map((e) => ProductVariant.fromJson(e))
          .toList(),
    );
  }
}

class ProductMedia {
  final String url;
  final String type; // 'image', 'video', '3d_model'

  ProductMedia({required this.url, required this.type});

  factory ProductMedia.fromJson(Map<String, dynamic> json) {
    return ProductMedia(url: json['url'], type: json['media_type']);
  }
}

class ProductVariant {
  final String id;
  final String sku;
  final String colorName;
  final String colorHex;
  final String size;
  final int stock;
  final double finalPrice;

  ProductVariant({
    required this.id,
    required this.sku,
    required this.colorName,
    required this.colorHex,
    required this.size,
    required this.stock,
    required this.finalPrice,
  });

  factory ProductVariant.fromJson(Map<String, dynamic> json) {
    return ProductVariant(
      id: json['variant_id'],
      sku: json['sku'] ?? '',
      colorName: json['color_name'] ?? 'Unknown',
      colorHex: json['color_hex'] ?? '#000000',
      size: json['size'],
      stock: json['stock_quantity'] ?? 0,
      finalPrice: double.tryParse(json['final_price'].toString()) ?? 0.0,
    );
  }
}
