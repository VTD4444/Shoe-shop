import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../logic/auth_bloc.dart';
import '../logic/auth_event.dart';
// --- IMPORTS MỚI ---
import '../data/repositories/auth_repository.dart';
import '../logic/profile_bloc.dart';
import 'edit_profile_screen.dart';
import 'change_password_screen.dart';
import '../../address/presentation/address_list_screen.dart';
import '../../order/presentation/order_history_screen.dart';
// -------------------

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Inject ProfileBloc
    return BlocProvider(
      create: (context) =>
          ProfileBloc(context.read<AuthRepository>())..add(LoadProfileEvent()),
      child: const ProfileView(),
    );
  }
}

class ProfileView extends StatelessWidget {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          "MY ACCOUNT",
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: BlocBuilder<ProfileBloc, ProfileState>(
        builder: (context, state) {
          if (state is ProfileLoading) {
            return const Center(
              child: CircularProgressIndicator(color: Colors.black),
            );
          } else if (state is ProfileLoaded || state is ProfileUpdateSuccess) {
            // Lấy user từ state (Cần ép kiểu an toàn hoặc dùng biến tạm)
            final user = (state is ProfileLoaded)
                ? state.user
                : (state as ProfileUpdateSuccess).user;

            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // --- PROFILE HEADER ---
                  Center(
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 40,
                          backgroundColor: Colors.black,
                          backgroundImage: user.avatarUrl != null
                              ? NetworkImage(user.avatarUrl!)
                              : null,
                          child: user.avatarUrl == null
                              ? const Icon(
                                  Icons.person,
                                  size: 40,
                                  color: Colors.white,
                                )
                              : null,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          user.fullName,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          user.email,
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // --- MENU ITEMS ---
                  _buildMenuItem(
                    context,
                    "Edit Profile",
                    Icons.edit_outlined,
                    () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) =>
                              // Truyền Bloc hiện tại vào màn hình con để update được state sau khi edit
                              BlocProvider.value(
                                value: context.read<ProfileBloc>(),
                                child: EditProfileScreen(user: user),
                              ),
                        ),
                      );
                    },
                  ),

                  _buildMenuItem(
                    context,
                    "My Orders",
                    Icons.inventory_2_outlined,
                    () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const OrderHistoryScreen(),
                        ),
                      );
                    },
                  ),

                  _buildMenuItem(
                    context,
                    "Shipping Addresses",
                    Icons.location_on_outlined,
                    () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) =>
                              const AddressListScreen(isSelectionMode: false),
                        ),
                      );
                    },
                  ),

                  _buildMenuItem(
                    context,
                    "Change Password",
                    Icons.lock_outline,
                    () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => BlocProvider.value(
                            value: context.read<ProfileBloc>(),
                            child: const ChangePasswordScreen(),
                          ),
                        ),
                      );
                    },
                  ),

                  const Divider(height: 40),

                  _buildMenuItem(context, "Log Out", Icons.logout, () {
                    context.read<AuthBloc>().add(AuthLogoutRequested());
                    Navigator.popUntil(context, (route) => route.isFirst);
                  }, isDestructive: true),
                ],
              ),
            );
          } else if (state is ProfileError) {
            return Center(child: Text(state.message));
          }
          return const SizedBox();
        },
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context,
    String title,
    IconData icon,
    VoidCallback onTap, {
    bool isDestructive = false,
  }) {
    return ListTile(
      leading: Icon(icon, color: isDestructive ? Colors.red : Colors.black),
      title: Text(
        title,
        style: TextStyle(
          fontWeight: FontWeight.w500,
          color: isDestructive ? Colors.red : Colors.black,
        ),
      ),
      trailing: const Icon(
        Icons.arrow_forward_ios,
        size: 16,
        color: Colors.grey,
      ),
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(vertical: 4),
    );
  }
}
