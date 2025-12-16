class UserModel {
  final String userId;
  final String email;
  final String fullName;
  final String role;
  final String? avatarUrl;
  final String? token; // Token chỉ có khi Login

  UserModel({
    required this.userId,
    required this.email,
    required this.fullName,
    required this.role,
    this.avatarUrl,
    this.token,
  });

  // Factory để parse JSON từ server trả về
  factory UserModel.fromJson(Map<String, dynamic> json, {String? token}) {
    // API Login trả user nằm trong key "user", API Register cũng vậy
    // Token nằm ngoài object user ở API Login
    return UserModel(
      userId: json['user_id'] ?? '',
      email: json['email'] ?? '',
      fullName: json['full_name'] ?? '',
      role: json['role'] ?? 'customer',
      avatarUrl: json['avatar_url'],
      token: token,
    );
  }
}
