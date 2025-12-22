class AddressModel {
  final String id;
  final String recipientName;
  final String phone;
  final String city;
  final String district;
  final String ward;
  final bool isDefault;

  AddressModel({
    required this.id,
    required this.recipientName,
    required this.phone,
    required this.city,
    required this.district,
    required this.ward,
    required this.isDefault,
  });

  // Getter để hiển thị chuỗi địa chỉ đầy đủ
  String get fullAddress => "$ward, $district, $city";

  factory AddressModel.fromJson(Map<String, dynamic> json) {
    return AddressModel(
      // API GET thường trả về id là 'address_id' hoặc 'id'.
      // Kiểm tra lại log thực tế, ở đây mình assume là 'address_id' theo chuẩn cũ
      id: json['address_id'] ?? json['id'] ?? '',
      recipientName: json['recipient_name'] ?? '',
      phone: json['phone'] ?? '',
      city: json['city'] ?? '',
      district: json['district'] ?? '',
      ward: json['ward'] ?? '',
      isDefault: json['is_default'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'recipient_name': recipientName,
      'phone': phone,
      'city': city,
      'district': district,
      'ward': ward,
      'is_default': isDefault,
    };
  }
}
