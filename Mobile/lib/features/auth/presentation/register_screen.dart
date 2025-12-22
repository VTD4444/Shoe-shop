import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../logic/auth_bloc.dart';
import '../logic/auth_event.dart';
import '../logic/auth_state.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();

  // Controllers
  final _fullNameController = TextEditingController();
  final _phoneController = TextEditingController(); // Optional
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _isPasswordVisible = false;
  bool _isConfirmPasswordVisible = false;

  @override
  void dispose() {
    _fullNameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _onRegisterPressed() {
    if (_formKey.currentState!.validate()) {
      // Gửi sự kiện Đăng ký
      context.read<AuthBloc>().add(
        AuthRegisterStarted(
          email: _emailController.text.trim(),
          password: _passwordController.text,
          fullName: _fullNameController.text.trim(),
          phone: _phoneController.text.trim().isEmpty
              ? null
              : _phoneController.text.trim(),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      // AppBar đơn giản với nút Back màu đen
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back_ios_new,
            color: Colors.black,
            size: 20,
          ),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthRegisterSuccess) {
            // Đăng ký thành công -> Hiện thông báo -> Quay về Login
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Account created! Please log in.'),
                backgroundColor: Colors.black,
              ),
            );
            Navigator.pop(context); // Quay về trang Login
          } else if (state is AuthFailure) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: Colors.red.shade900,
              ),
            );
          }
        },
        builder: (context, state) {
          final isLoading = state is AuthLoading;

          return SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(
                horizontal: 24.0,
                vertical: 10,
              ),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // --- HEADER ---
                    const Text(
                      "BECOME A MEMBER",
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 2.0,
                        color: Colors.black,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      "Join the exclusive community.",
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 40),

                    // --- FULL NAME ---
                    _buildMinimalTextField(
                      controller: _fullNameController,
                      label: "FULL NAME",
                      icon: Icons.person_outline,
                      validator: (value) => (value == null || value.isEmpty)
                          ? 'Name is required'
                          : null,
                    ),
                    const SizedBox(height: 20),

                    // --- PHONE (Optional) ---
                    _buildMinimalTextField(
                      controller: _phoneController,
                      label: "PHONE NUMBER (OPTIONAL)",
                      icon: Icons.phone_outlined,
                      keyboardType: TextInputType.phone,
                    ),
                    const SizedBox(height: 20),

                    // --- EMAIL ---
                    _buildMinimalTextField(
                      controller: _emailController,
                      label: "EMAIL ADDRESS",
                      icon: Icons.email_outlined,
                      keyboardType: TextInputType.emailAddress,
                      validator: (value) {
                        if (value == null || !value.contains('@'))
                          return 'Invalid email';
                        return null;
                      },
                    ),
                    const SizedBox(height: 20),

                    // --- PASSWORD ---
                    _buildMinimalTextField(
                      controller: _passwordController,
                      label: "PASSWORD",
                      icon: Icons.lock_outline,
                      obscureText: !_isPasswordVisible,
                      suffixIcon: IconButton(
                        icon: Icon(
                          _isPasswordVisible
                              ? Icons.visibility_outlined
                              : Icons.visibility_off_outlined,
                          color: Colors.black,
                          size: 20,
                        ),
                        onPressed: () => setState(
                          () => _isPasswordVisible = !_isPasswordVisible,
                        ),
                      ),
                      validator: (value) => (value == null || value.length < 6)
                          ? 'Min 6 characters'
                          : null,
                    ),
                    const SizedBox(height: 20),

                    // --- CONFIRM PASSWORD ---
                    _buildMinimalTextField(
                      controller: _confirmPasswordController,
                      label: "CONFIRM PASSWORD",
                      icon: Icons.lock_clock_outlined,
                      obscureText: !_isConfirmPasswordVisible,
                      suffixIcon: IconButton(
                        icon: Icon(
                          _isConfirmPasswordVisible
                              ? Icons.visibility_outlined
                              : Icons.visibility_off_outlined,
                          color: Colors.black,
                          size: 20,
                        ),
                        onPressed: () => setState(
                          () => _isConfirmPasswordVisible =
                              !_isConfirmPasswordVisible,
                        ),
                      ),
                      validator: (value) {
                        if (value != _passwordController.text)
                          return 'Passwords do not match';
                        return null;
                      },
                    ),
                    const SizedBox(height: 40),

                    // --- REGISTER BUTTON ---
                    SizedBox(
                      height: 56,
                      child: ElevatedButton(
                        onPressed: isLoading ? null : _onRegisterPressed,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.black,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: const RoundedRectangleBorder(
                            borderRadius: BorderRadius.zero,
                          ),
                        ),
                        child: isLoading
                            ? const SizedBox(
                                height: 24,
                                width: 24,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Text(
                                "CREATE ACCOUNT",
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                  letterSpacing: 1.2,
                                ),
                              ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // --- TERMS TEXT ---
                    Text(
                      "By joining, you agree to our Terms of Service and Privacy Policy.",
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey[500], fontSize: 12),
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  // Reuse Widget (Copy từ LoginScreen sang hoặc tách ra file riêng)
  Widget _buildMinimalTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool obscureText = false,
    Widget? suffixIcon,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,
      style: const TextStyle(fontWeight: FontWeight.w500),
      cursorColor: Colors.black,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(
          color: Colors.grey[500],
          fontSize: 12,
          fontWeight: FontWeight.w400,
          letterSpacing: 1.0,
        ),
        prefixIcon: Icon(icon, color: Colors.black, size: 22),
        suffixIcon: suffixIcon,
        enabledBorder: UnderlineInputBorder(
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: const UnderlineInputBorder(
          borderSide: BorderSide(color: Colors.black, width: 2),
        ),
        errorBorder: const UnderlineInputBorder(
          borderSide: BorderSide(color: Colors.red),
        ),
        focusedErrorBorder: const UnderlineInputBorder(
          borderSide: BorderSide(color: Colors.red, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(vertical: 16),
      ),
      validator: validator,
    );
  }
}
