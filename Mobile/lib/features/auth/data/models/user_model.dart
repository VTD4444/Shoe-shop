class UserModel {
  final String userId;
  final String email;
  final String fullName;
  final String? phoneNumber; // Mới
  final String? gender; // Mới
  final String? birthDate; // Mới (String yyyy-MM-dd)
  final String role;
  final String? avatarUrl;
  final String? token; // Token chỉ có khi Login

  UserModel({
    required this.userId,
    required this.email,
    required this.fullName,
    this.phoneNumber,
    this.gender,
    this.birthDate,
    this.avatarUrl,
    required this.role,
    this.token,
  });

  factory UserModel.fromJson(Map<String, dynamic> json, {String? token}) {
    return UserModel(
      userId: json['user_id'] ?? '',
      email: json['email'] ?? '',
      fullName: json['full_name'] ?? '',
      phoneNumber: json['phone_number'],
      gender: json['gender'],
      birthDate: json['birth_date'], // Backend trả về yyyy-MM-dd
      avatarUrl: json['avatar_url'],
      role: json['role'] ?? 'customer',
      token: token,
    );
  }

  // Hàm tiện ích để copy object (dùng khi update state)
  UserModel copyWith({
    String? fullName,
    String? phoneNumber,
    String? gender,
    String? birthDate,
    String? avatarUrl,
  }) {
    return UserModel(
      userId: userId,
      email: email,
      fullName: fullName ?? this.fullName,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      gender: gender ?? this.gender,
      birthDate: birthDate ?? this.birthDate,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      role: role,
      token: token,
    );
  }
}
