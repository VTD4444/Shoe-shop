class CartModel {
  final int totalItems;
  final double totalPrice;
  final List<CartItemModel> items;

  CartModel({
    required this.totalItems,
    required this.totalPrice,
    required this.items,
  });

  factory CartModel.fromJson(Map<String, dynamic> json) {
    return CartModel(
      totalItems: json['total_items'] ?? 0,
      totalPrice: double.tryParse(json['total_price'].toString()) ?? 0.0,
      items: (json['items'] as List? ?? [])
          .map((e) => CartItemModel.fromJson(e))
          .toList(),
    );
  }
}

class CartItemModel {
  final String cartItemId;
  final String variantId;
  final String productName;
  final String sku;
  final int quantity;
  final double pricePerItem;
  final String thumbnail;
  final String size;
  final String color;
  final int maxStock;

  CartItemModel({
    required this.cartItemId,
    required this.variantId,
    required this.productName,
    required this.sku,
    required this.quantity,
    required this.pricePerItem,
    required this.thumbnail,
    required this.size,
    required this.color,
    required this.maxStock,
  });

  factory CartItemModel.fromJson(Map<String, dynamic> json) {
    return CartItemModel(
      cartItemId: json['cart_item_id'],
      variantId: json['variant_id'],
      productName: json['product_name'] ?? '',
      sku: json['sku'] ?? '',
      quantity: json['quantity'] ?? 1,
      pricePerItem: double.tryParse(json['price_per_item'].toString()) ?? 0.0,
      thumbnail: json['thumbnail'] ?? '',
      size: json['size'] ?? '',
      color: json['color'] ?? '',
      maxStock: json['max_stock'] ?? 99,
    );
  }
}
