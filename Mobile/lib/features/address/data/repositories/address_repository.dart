import '../../../../core/api/dio_client.dart';
import '../models/address_model.dart';

class AddressRepository {
  final DioClient _dioClient;

  AddressRepository({required DioClient dioClient}) : _dioClient = dioClient;

  // 1. Lấy danh sách
  Future<List<AddressModel>> getAddresses() async {
    try {
      final response = await _dioClient.dio.get('/addresses');
      // Response là List JSON trực tiếp: [{}, {}]
      final List data = response.data['data'] ?? [];
      return data.map((e) => AddressModel.fromJson(e)).toList();
    } catch (e) {
      print("❌ Lỗi lấy địa chỉ: $e");
      throw Exception('Failed to load addresses');
    }
  }

  // 2. Thêm mới
  Future<void> addAddress(AddressModel address) async {
    try {
      await _dioClient.dio.post('/addresses', data: address.toJson());
    } catch (e) {
      throw Exception('Add failed');
    }
  }

  // 3. Cập nhật
  Future<void> updateAddress(String id, AddressModel address) async {
    try {
      await _dioClient.dio.put('/addresses/$id', data: address.toJson());
    } catch (e) {
      throw Exception('Update failed');
    }
  }

  // 4. Xóa
  Future<void> deleteAddress(String id) async {
    try {
      await _dioClient.dio.delete('/addresses/$id');
    } catch (e) {
      throw Exception('Delete failed');
    }
  }
}
