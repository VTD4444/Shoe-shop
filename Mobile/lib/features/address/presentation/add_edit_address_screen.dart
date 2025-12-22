import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/models/address_model.dart';
import '../data/repositories/address_repository.dart';

class AddEditAddressScreen extends StatefulWidget {
  final AddressModel? address; // Nếu null là Thêm mới, có data là Sửa

  const AddEditAddressScreen({super.key, this.address});

  @override
  State<AddEditAddressScreen> createState() => _AddEditAddressScreenState();
}

class _AddEditAddressScreenState extends State<AddEditAddressScreen> {
  final _formKey = GlobalKey<FormState>();

  // Controllers
  late TextEditingController _nameCtrl;
  late TextEditingController _phoneCtrl;
  late TextEditingController _cityCtrl;
  late TextEditingController _distCtrl;
  late TextEditingController _wardCtrl;
  bool _isDefault = false;

  @override
  void initState() {
    super.initState();
    final a = widget.address;
    _nameCtrl = TextEditingController(text: a?.recipientName ?? '');
    _phoneCtrl = TextEditingController(text: a?.phone ?? '');
    _cityCtrl = TextEditingController(text: a?.city ?? '');
    _distCtrl = TextEditingController(text: a?.district ?? '');
    _wardCtrl = TextEditingController(text: a?.ward ?? '');
    _isDefault = a?.isDefault ?? false;
  }

  void _onSubmit() async {
    if (_formKey.currentState!.validate()) {
      final repo = context.read<AddressRepository>();

      final newAddress = AddressModel(
        id: widget.address?.id ?? '', // ID rỗng nếu thêm mới
        recipientName: _nameCtrl.text,
        phone: _phoneCtrl.text,
        city: _cityCtrl.text,
        district: _distCtrl.text,
        ward: _wardCtrl.text,
        isDefault: _isDefault,
      );

      try {
        if (widget.address == null) {
          await repo.addAddress(newAddress);
        } else {
          await repo.updateAddress(widget.address!.id, newAddress);
        }
        if (mounted) Navigator.pop(context, true);
      } catch (e) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text("Error: $e")));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(
          widget.address == null ? "ADD ADDRESS" : "EDIT ADDRESS",
          style: const TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              _buildTextField("Full Name", _nameCtrl, Icons.person),
              const SizedBox(height: 16),
              _buildTextField(
                "Phone Number",
                _phoneCtrl,
                Icons.phone,
                type: TextInputType.phone,
              ),
              const SizedBox(height: 16),
              _buildTextField(
                "City / Province",
                _cityCtrl,
                Icons.location_city,
              ),
              const SizedBox(height: 16),
              _buildTextField("District", _distCtrl, Icons.map),
              const SizedBox(height: 16),
              _buildTextField(
                "Ward / Commune",
                _wardCtrl,
                Icons.holiday_village,
              ),
              const SizedBox(height: 24),

              SwitchListTile(
                title: const Text(
                  "Set as Default Address",
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                value: _isDefault,
                activeColor: Colors.black,
                onChanged: (val) => setState(() => _isDefault = val),
              ),

              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _onSubmit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black,
                  ),
                  child: const Text(
                    "SAVE ADDRESS",
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(
    String label,
    TextEditingController ctrl,
    IconData icon, {
    TextInputType? type,
  }) {
    return TextFormField(
      controller: ctrl,
      keyboardType: type,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: Colors.black),
        border: const OutlineInputBorder(),
        focusedBorder: const OutlineInputBorder(
          borderSide: BorderSide(color: Colors.black, width: 2),
        ),
      ),
      validator: (val) => (val == null || val.isEmpty) ? 'Required' : null,
    );
  }
}
