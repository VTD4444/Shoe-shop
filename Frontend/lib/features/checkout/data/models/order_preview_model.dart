class OrderPreviewModel {
  final double merchandiseSubtotal;
  final double shippingFee;
  final double discountAmount;
  final double finalTotal;
  final ShippingAddress? shippingAddress; // Có thể null nếu chưa chọn địa chỉ
  final VoucherInfo? voucherInfo;

  OrderPreviewModel({
    required this.merchandiseSubtotal,
    required this.shippingFee,
    required this.discountAmount,
    required this.finalTotal,
    this.shippingAddress,
    this.voucherInfo,
  });

  factory OrderPreviewModel.fromJson(Map<String, dynamic> json) {
    return OrderPreviewModel(
      merchandiseSubtotal:
          double.tryParse(json['merchandise_subtotal'].toString()) ?? 0,
      shippingFee: double.tryParse(json['shipping_fee'].toString()) ?? 0,
      discountAmount: double.tryParse(json['discount_amount'].toString()) ?? 0,
      finalTotal: double.tryParse(json['final_total'].toString()) ?? 0,
      shippingAddress: json['shipping_address'] != null
          ? ShippingAddress.fromJson(json['shipping_address'])
          : null,
      voucherInfo: json['voucher_info'] != null
          ? VoucherInfo.fromJson(json['voucher_info'])
          : null,
    );
  }
}

class ShippingAddress {
  final String addressId;
  final String recipientName;
  final String phone;
  final String fullAddress; // FE tự ghép chuỗi từ city, district...

  ShippingAddress({
    required this.addressId,
    required this.recipientName,
    required this.phone,
    required this.fullAddress,
  });

  factory ShippingAddress.fromJson(Map<String, dynamic> json) {
    return ShippingAddress(
      addressId: json['address_id'],
      recipientName: json['recipient_name'],
      phone: json['phone'],
      // Ghép địa chỉ đơn giản để hiển thị
      fullAddress: "${json['ward']}, ${json['district']}, ${json['city']}",
    );
  }
}

class VoucherInfo {
  final bool valid;
  final String message;
  final String code;

  VoucherInfo({required this.valid, required this.message, required this.code});

  factory VoucherInfo.fromJson(Map<String, dynamic> json) {
    return VoucherInfo(
      valid: json['valid'] ?? false,
      message: json['message'] ?? '',
      code: json['code'] ?? '',
    );
  }
}
