import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../data/repositories/checkout_repository.dart';
import '../logic/checkout_bloc.dart';

// Màn hình này cần nhận Repository từ main hoặc context
class CheckoutScreen extends StatelessWidget {
  const CheckoutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Tạo Bloc riêng cho màn hình này
    return BlocProvider(
      create: (context) => CheckoutBloc(
        // Lưu ý: Cần thêm CheckoutRepository vào MultiRepositoryProvider ở main.dart trước
        context.read<CheckoutRepository>(),
      )..add(InitCheckoutEvent()),
      child: const CheckoutView(),
    );
  }
}

class CheckoutView extends StatefulWidget {
  const CheckoutView({super.key});

  @override
  State<CheckoutView> createState() => _CheckoutViewState();
}

class _CheckoutViewState extends State<CheckoutView> {
  final _voucherController = TextEditingController();
  final _noteController = TextEditingController();
  String _selectedPayment = 'COD'; // Default payment

  @override
  Widget build(BuildContext context) {
    final formatCurrency = NumberFormat.simpleCurrency(locale: 'vi_VN');

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text(
          "CHECKOUT",
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: BlocConsumer<CheckoutBloc, CheckoutState>(
        listener: (context, state) {
          if (state is CheckoutFailure) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: Colors.red,
              ),
            );
          } else if (state is CheckoutOrderSuccess) {
            // TODO: Chuyển sang màn hình Success
            showDialog(
              context: context,
              barrierDismissible: false,
              builder: (_) => AlertDialog(
                title: const Text("Order Placed!"),
                content: Text("Order ID: ${state.orderId}"),
                actions: [
                  TextButton(
                    onPressed: () {
                      Navigator.pop(context); // Close dialog
                      Navigator.pop(context); // Close checkout
                      Navigator.pop(context); // Close cart (Back to Home)
                    },
                    child: const Text("OK"),
                  ),
                ],
              ),
            );
          }
        },
        builder: (context, state) {
          if (state is CheckoutLoading) {
            return const Center(
              child: CircularProgressIndicator(color: Colors.black),
            );
          }
          if (state is CheckoutLoaded) {
            final preview = state.preview;
            final address = preview.shippingAddress;

            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. SHIPPING ADDRESS
                  _buildSectionTitle("SHIPPING ADDRESS"),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: address == null
                        ? const Text("Please add address")
                        : Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                address.recipientName,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(address.phone),
                              const SizedBox(height: 4),
                              Text(
                                address.fullAddress,
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                            ],
                          ),
                  ),
                  const SizedBox(height: 24),

                  // 2. SHIPPING METHOD
                  _buildSectionTitle("SHIPPING METHOD"),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      children: [
                        RadioListTile(
                          value: 'standard',
                          groupValue: state.selectedShippingMethod,
                          title: const Text("Standard Delivery"),
                          subtitle: const Text("3-5 days"),
                          activeColor: Colors.black,
                          onChanged: (val) {
                            context.read<CheckoutBloc>().add(
                              ChangeShippingMethodEvent('standard'),
                            );
                          },
                        ),
                        RadioListTile(
                          value: 'express',
                          groupValue: state.selectedShippingMethod,
                          title: const Text("Express Delivery"),
                          subtitle: const Text("1-2 days"),
                          activeColor: Colors.black,
                          onChanged: (val) {
                            context.read<CheckoutBloc>().add(
                              ChangeShippingMethodEvent('express'),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // 3. VOUCHER
                  _buildSectionTitle("VOUCHER CODE"),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _voucherController,
                          decoration: InputDecoration(
                            hintText: "Enter code",
                            filled: true,
                            fillColor: Colors.white,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide.none,
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: () {
                          context.read<CheckoutBloc>().add(
                            ApplyVoucherEvent(_voucherController.text),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                        child: const Text("APPLY"),
                      ),
                    ],
                  ),
                  if (preview.voucherInfo != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Text(
                        preview.voucherInfo!.message,
                        style: TextStyle(
                          color: preview.voucherInfo!.valid
                              ? Colors.green
                              : Colors.red,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  const SizedBox(height: 24),

                  // 4. PAYMENT METHOD
                  _buildSectionTitle("PAYMENT METHOD"),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      children: [
                        RadioListTile(
                          value: 'COD',
                          groupValue: _selectedPayment,
                          title: const Text("Cash on Delivery (COD)"),
                          activeColor: Colors.black,
                          onChanged: (v) =>
                              setState(() => _selectedPayment = v.toString()),
                        ),
                        RadioListTile(
                          value: 'MOMO',
                          groupValue: _selectedPayment,
                          title: const Text("Momo Wallet"),
                          activeColor: Colors.black,
                          onChanged: (v) =>
                              setState(() => _selectedPayment = v.toString()),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // 5. SUMMARY
                  _buildSectionTitle("ORDER SUMMARY"),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      children: [
                        _buildSummaryRow(
                          "Subtotal",
                          formatCurrency.format(preview.merchandiseSubtotal),
                        ),
                        const SizedBox(height: 8),
                        _buildSummaryRow(
                          "Shipping",
                          formatCurrency.format(preview.shippingFee),
                        ),
                        const SizedBox(height: 8),
                        _buildSummaryRow(
                          "Discount",
                          "-${formatCurrency.format(preview.discountAmount)}",
                          color: Colors.green,
                        ),
                        const Divider(height: 24),
                        _buildSummaryRow(
                          "TOTAL",
                          formatCurrency.format(preview.finalTotal),
                          isBold: true,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: () {
                        context.read<CheckoutBloc>().add(
                          PlaceOrderEvent(
                            paymentMethod: _selectedPayment,
                            note: _noteController.text,
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.black,
                      ),
                      child: const Text(
                        "PLACE ORDER",
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            );
          }
          return const SizedBox();
        },
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontWeight: FontWeight.w900,
          fontSize: 13,
          color: Colors.grey,
        ),
      ),
    );
  }

  Widget _buildSummaryRow(
    String label,
    String value, {
    bool isBold = false,
    Color? color,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
            fontSize: isBold ? 16 : 14,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
            fontSize: isBold ? 16 : 14,
            color: color,
          ),
        ),
      ],
    );
  }
}
