import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../logic/profile_bloc.dart';

class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _oldPassCtrl = TextEditingController();
  final _newPassCtrl = TextEditingController();
  final _confirmPassCtrl = TextEditingController();

  void _onSubmit() {
    if (_formKey.currentState!.validate()) {
      context.read<ProfileBloc>().add(
        ChangePasswordEvent(
          _oldPassCtrl.text,
          _newPassCtrl.text,
          _confirmPassCtrl.text,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          "CHANGE PASSWORD",
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: BlocListener<ProfileBloc, ProfileState>(
        listener: (context, state) {
          if (state is ChangePasswordSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text("Password changed. Please login again."),
              ),
            );
            // Logic: Logout luôn hoặc giữ lại tùy yêu cầu. API yêu cầu login lại.
            Navigator.pop(context);
          } else if (state is ProfileError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: Colors.red,
              ),
            );
          }
        },
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                _buildPassField("Current Password", _oldPassCtrl),
                const SizedBox(height: 16),
                _buildPassField("New Password", _newPassCtrl),
                const SizedBox(height: 16),
                _buildPassField(
                  "Confirm New Password",
                  _confirmPassCtrl,
                  isConfirm: true,
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
                      "UPDATE PASSWORD",
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
      ),
    );
  }

  Widget _buildPassField(
    String label,
    TextEditingController ctrl, {
    bool isConfirm = false,
  }) {
    return TextFormField(
      controller: ctrl,
      obscureText: true,
      cursorColor: Colors.black,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.grey),
        border: const OutlineInputBorder(),
        focusedBorder: const OutlineInputBorder(
          borderSide: BorderSide(color: Colors.black, width: 2),
        ),
      ),
      validator: (val) {
        if (val == null || val.length < 6) return "Min 6 chars";
        if (isConfirm && val != _newPassCtrl.text) return "Password mismatch";
        return null;
      },
    );
  }
}
