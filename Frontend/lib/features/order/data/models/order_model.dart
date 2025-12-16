class OrderModel {
  final String orderId;
  final String status;
  final String paymentStatus;
  final double totalAmount;
  final String createdAt;
  final int? itemsCount; // Dùng cho List
  final OrderItem? previewItem; // Dùng cho List

  // Các trường chi tiết (Dùng cho Detail)
  final String? paymentMethod;
  final String? note;
  final OrderAddress? shippingAddress;
  final OrderCost? costBreakdown;
  final List<OrderItem>? items;

  OrderModel({
    required this.orderId,
    required this.status,
    required this.paymentStatus,
    required this.totalAmount,
    required this.createdAt,
    this.itemsCount,
    this.previewItem,
    this.paymentMethod,
    this.note,
    this.shippingAddress,
    this.costBreakdown,
    this.items,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      orderId: json['order_id'] ?? '',
      status: json['status'] ?? 'pending',
      paymentStatus: json['payment_status'] ?? 'unpaid',
      totalAmount: (json['total_amount'] ?? 0).toDouble(),
      createdAt: json['created_at'] ?? '',
      itemsCount: json['items_count'],

      // Parse Preview Item (cho List)
      previewItem: json['preview_item'] != null
          ? OrderItem.fromJson(json['preview_item'])
          : null,

      // Parse Detail Fields
      paymentMethod: json['payment_method'],
      note: json['note'],
      shippingAddress: json['shipping_address'] != null
          ? OrderAddress.fromJson(json['shipping_address'])
          : null,
      costBreakdown: json['cost_breakdown'] != null
          ? OrderCost.fromJson(json['cost_breakdown'])
          : null,
      items: json['items'] != null
          ? (json['items'] as List).map((e) => OrderItem.fromJson(e)).toList()
          : null,
    );
  }
}

class OrderItem {
  final String name;
  final String size;
  final String color;
  final int quantity;
  final String? thumbnail;
  final double? priceAtPurchase; // Có trong Detail
  final double? totalItemPrice; // Có trong Detail

  OrderItem({
    required this.name,
    required this.size,
    required this.color,
    required this.quantity,
    this.thumbnail,
    this.priceAtPurchase,
    this.totalItemPrice,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      name:
          json['name'] ??
          json['product_name'] ??
          '', // API trả về key khác nhau ở List/Detail
      size: json['size'] ?? '',
      color: json['color'] ?? '',
      quantity: json['quantity'] ?? 1,
      thumbnail: json['thumbnail'],
      priceAtPurchase: (json['price_at_purchase'] ?? 0).toDouble(),
      totalItemPrice: (json['total_item_price'] ?? 0).toDouble(),
    );
  }
}

class OrderAddress {
  final String recipientName;
  final String phone;
  final String fullAddress;

  OrderAddress({
    required this.recipientName,
    required this.phone,
    required this.fullAddress,
  });

  factory OrderAddress.fromJson(Map<String, dynamic> json) {
    return OrderAddress(
      recipientName: json['recipient_name'] ?? '',
      phone: json['phone'] ?? '',
      fullAddress: json['full_address'] ?? '',
    );
  }
}

class OrderCost {
  final double subtotal;
  final double shippingFee;
  final double discount;
  final double finalTotal;

  OrderCost({
    required this.subtotal,
    required this.shippingFee,
    required this.discount,
    required this.finalTotal,
  });

  factory OrderCost.fromJson(Map<String, dynamic> json) {
    return OrderCost(
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      shippingFee: (json['shipping_fee'] ?? 0).toDouble(),
      discount: (json['discount'] ?? 0).toDouble(),
      finalTotal: (json['total_amount'] ?? 0).toDouble(),
    );
  }
}
