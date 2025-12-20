import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shoe_shop/features/address/presentation/add_edit_address_screen.dart';
import '../data/models/address_model.dart';
import '../logic/address_bloc.dart';
import '../data/repositories/address_repository.dart';

class AddressListScreen extends StatelessWidget {
  final bool isSelectionMode; // True nếu gọi từ Checkout

  const AddressListScreen({super.key, this.isSelectionMode = false});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) =>
          AddressBloc(context.read<AddressRepository>())
            ..add(LoadAddressesEvent()),
      child: Builder(
        builder: (context) {
          return Scaffold(
            backgroundColor: Colors.grey[50],
            appBar: AppBar(
              title: const Text(
                "MY ADDRESSES",
                style: TextStyle(
                  color: Colors.black,
                  fontWeight: FontWeight.w900,
                ),
              ),
              backgroundColor: Colors.white,
              elevation: 0,
              iconTheme: const IconThemeData(color: Colors.black),
            ),

            // NÚT THÊM MỚI
            floatingActionButton: FloatingActionButton(
              backgroundColor: Colors.black,
              child: const Icon(Icons.add, color: Colors.white),
              onPressed: () async {
                // Dùng await thay vì .then để code gọn hơn
                final result = await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const AddEditAddressScreen(),
                  ),
                );

                // Nếu có kết quả trả về (true) thì mới reload
                if (result == true && context.mounted) {
                  // Bây giờ context này đã tìm thấy Bloc nhờ widget Builder
                  context.read<AddressBloc>().add(LoadAddressesEvent());
                }
              },
            ),

            body: BlocBuilder<AddressBloc, AddressState>(
              builder: (context, state) {
                if (state is AddressLoading) {
                  return const Center(
                    child: CircularProgressIndicator(color: Colors.black),
                  );
                } else if (state is AddressError) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.error_outline,
                          size: 48,
                          color: Colors.red,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          state.message,
                          style: const TextStyle(color: Colors.grey),
                        ),
                        TextButton(
                          onPressed: () => context.read<AddressBloc>().add(
                            LoadAddressesEvent(),
                          ),
                          child: const Text("Retry"),
                        ),
                      ],
                    ),
                  );
                } else if (state is AddressLoaded) {
                  if (state.addresses.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.location_off_outlined,
                            size: 64,
                            color: Colors.grey[300],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            "No addresses found.",
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text("Click the + button to add one."),
                        ],
                      ),
                    );
                  }

                  return ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: state.addresses.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 16),
                    itemBuilder: (context, index) {
                      final address = state.addresses[index];
                      return _buildAddressItem(
                        context,
                        address,
                      ); // Truyền context con vào hàm này
                    },
                  );
                }
                return const SizedBox();
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildAddressItem(BuildContext context, AddressModel address) {
    return GestureDetector(
      onTap: () {
        if (isSelectionMode) {
          // Trả về địa chỉ đã chọn cho màn hình Checkout
          Navigator.pop(context, address);
        }
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          border: address.isDefault
              ? Border.all(color: Colors.black, width: 1.5)
              : null,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Text(
                      address.recipientName,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    if (address.isDefault) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          "DEFAULT",
                          style: TextStyle(color: Colors.white, fontSize: 10),
                        ),
                      ),
                    ],
                  ],
                ),
                // Nút Edit / Delete
                PopupMenuButton(
                  icon: const Icon(Icons.more_vert, size: 20),
                  onSelected: (value) {
                    if (value == 'edit') {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) =>
                              AddEditAddressScreen(address: address),
                        ),
                      ).then((_) {
                        if (context.mounted)
                          context.read<AddressBloc>().add(LoadAddressesEvent());
                      });
                    } else if (value == 'delete') {
                      context.read<AddressBloc>().add(
                        DeleteAddressEvent(address.id),
                      );
                    }
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(value: 'edit', child: Text("Edit")),
                    const PopupMenuItem(
                      value: 'delete',
                      child: Text(
                        "Delete",
                        style: TextStyle(color: Colors.red),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(address.phone, style: TextStyle(color: Colors.grey[600])),
            const SizedBox(height: 8),
            Text(address.fullAddress, style: const TextStyle(height: 1.4)),
          ],
        ),
      ),
    );
  }
}
