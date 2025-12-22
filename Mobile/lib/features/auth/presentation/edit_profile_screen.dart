import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart'; // Để format date
import '../data/models/user_model.dart';
import '../logic/profile_bloc.dart'; // Import Bloc mới

class EditProfileScreen extends StatefulWidget {
  final UserModel user;
  const EditProfileScreen({super.key, required this.user});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  late TextEditingController _nameCtrl;
  late TextEditingController _phoneCtrl;
  late TextEditingController _dobCtrl;
  String? _gender;

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController(text: widget.user.fullName);
    _phoneCtrl = TextEditingController(text: widget.user.phoneNumber ?? '');
    _dobCtrl = TextEditingController(text: widget.user.birthDate ?? '');
    _gender = widget.user.gender;
  }

  Future<void> _selectDate(BuildContext context) async {
    DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime(2000),
      firstDate: DateTime(1950),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: ThemeData.light().copyWith(
            colorScheme: const ColorScheme.light(
              primary: Colors.black,
            ), // Style lịch màu đen
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      // API yêu cầu định dạng YYYY-MM-DD
      setState(() {
        _dobCtrl.text = DateFormat('yyyy-MM-dd').format(picked);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          "EDIT PROFILE",
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: BlocListener<ProfileBloc, ProfileState>(
        listener: (context, state) {
          if (state is ProfileUpdateSuccess) {
            ScaffoldMessenger.of(
              context,
            ).showSnackBar(const SnackBar(content: Text("Update Successful!")));
            Navigator.pop(context); // Quay về
          } else if (state is ProfileError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: Colors.red,
              ),
            );
          }
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              // Avatar (Placeholder)
              const CircleAvatar(
                radius: 50,
                backgroundColor: Colors.black,
                child: Icon(Icons.person, size: 50, color: Colors.white),
              ),
              const SizedBox(height: 32),

              _buildTextField("Full Name", _nameCtrl),
              const SizedBox(height: 16),
              _buildTextField(
                "Phone Number",
                _phoneCtrl,
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 16),

              // Date Picker Field
              GestureDetector(
                onTap: () => _selectDate(context),
                child: AbsorbPointer(
                  child: _buildTextField(
                    "Date of Birth",
                    _dobCtrl,
                    suffixIcon: Icons.calendar_today,
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Gender Dropdown
              DropdownButtonFormField<String>(
                value: _gender,
                decoration: const InputDecoration(
                  labelText: "Gender",
                  border: OutlineInputBorder(),
                  focusedBorder: OutlineInputBorder(
                    borderSide: BorderSide(color: Colors.black),
                  ),
                ),
                items: ['male', 'female', 'other'].map((String val) {
                  return DropdownMenuItem(
                    value: val,
                    child: Text(val.toUpperCase()),
                  );
                }).toList(),
                onChanged: (val) => setState(() => _gender = val),
              ),

              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: () {
                    context.read<ProfileBloc>().add(
                      UpdateProfileEvent(
                        fullName: _nameCtrl.text,
                        phoneNumber: _phoneCtrl.text,
                        birthDate: _dobCtrl.text,
                        gender: _gender,
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black,
                  ),
                  child: const Text(
                    "SAVE CHANGES",
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
    TextEditingController ctrl, {
    TextInputType? keyboardType,
    IconData? suffixIcon,
  }) {
    return TextField(
      controller: ctrl,
      keyboardType: keyboardType,
      cursorColor: Colors.black,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.grey),
        border: const OutlineInputBorder(),
        focusedBorder: const OutlineInputBorder(
          borderSide: BorderSide(color: Colors.black, width: 2),
        ),
        suffixIcon: suffixIcon != null
            ? Icon(suffixIcon, color: Colors.black)
            : null,
      ),
    );
  }
}
