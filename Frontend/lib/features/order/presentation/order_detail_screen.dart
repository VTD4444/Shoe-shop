import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../data/repositories/order_repository.dart';
import '../logic/order_detail_bloc.dart';
import '../data/models/order_model.dart';

class OrderDetailScreen extends StatelessWidget {
  final String orderId;

  const OrderDetailScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) =>
          OrderDetailBloc(context.read<OrderRepository>())
            ..add(LoadOrderDetailEvent(orderId)),
      child: const OrderDetailView(),
    );
  }
}

class OrderDetailView extends StatelessWidget {
  const OrderDetailView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text(
          "ORDER DETAILS",
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: BlocConsumer<OrderDetailBloc, OrderDetailState>(
        listener: (context, state) {
          if (state is OrderCancelSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text("Hủy đơn hàng thành công!"),
                backgroundColor: Colors.green,
              ),
            );
          } else if (state is OrderDetailError) {
            // Nếu lỗi là do hủy thất bại, cũng hiện lên
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: Colors.red,
              ),
            );
          }
        },
        builder: (context, state) {
          if (state is OrderDetailLoading) {
            return const Center(
              child: CircularProgressIndicator(color: Colors.black),
            );
          } else if (state is OrderDetailLoaded) {
            final order = state.order;
            return _buildContent(context, order);
          }
          return const SizedBox();
        },
      ),
    );
  }

  Widget _buildContent(BuildContext context, OrderModel order) {
    final currencyFormat = NumberFormat.simpleCurrency(locale: 'vi_VN');

    // Logic: Chỉ cho phép hủy nếu trạng thái là 'pending' hoặc 'processing'
    // VÀ chưa thanh toán (unpaid) - Tùy logic nghiệp vụ,
    // Backend báo là nếu paid thì refunding, nên ở đây ta cứ cho hủy nếu chưa ship (pending/processing).
    final canCancel =
        (order.status == 'pending' || order.status == 'processing');

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Status Header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Order ID: ${order.orderId}",
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "Status: ${order.status.toUpperCase()}",
                      style: const TextStyle(
                        color: Colors.blue,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      order.paymentStatus.toUpperCase(),
                      style: TextStyle(
                        color: order.paymentStatus == 'paid'
                            ? Colors.green
                            : Colors.orange,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                if (order.note != null) ...[
                  const Divider(height: 20),
                  Text(
                    "Note: ${order.note}",
                    style: const TextStyle(color: Colors.red),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 2. Address
          if (order.shippingAddress != null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "Shipping Address",
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    order.shippingAddress!.recipientName,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Text(order.shippingAddress!.phone),
                  Text(
                    order.shippingAddress!.fullAddress,
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 16),

          // 3. Items
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Products",
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                const SizedBox(height: 16),
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: order.items?.length ?? 0,
                  separatorBuilder: (_, __) => const Divider(),
                  itemBuilder: (context, index) {
                    final item = order.items![index];
                    return Row(
                      children: [
                        Container(
                          width: 60,
                          height: 60,
                          margin: const EdgeInsets.only(right: 12),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(8),
                            image: (item.thumbnail != null)
                                ? DecorationImage(
                                    image: NetworkImage(item.thumbnail!),
                                    fit: BoxFit.cover,
                                  )
                                : null,
                            color: Colors.grey[200],
                          ),
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item.name,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                "${item.size} | ${item.color} | x${item.quantity}",
                                style: const TextStyle(color: Colors.grey),
                              ),
                            ],
                          ),
                        ),
                        Text(
                          currencyFormat.format(item.totalItemPrice),
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ],
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 4. Payment Info
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
                  currencyFormat.format(order.costBreakdown?.subtotal ?? 0),
                ),
                _buildSummaryRow(
                  "Shipping Fee",
                  currencyFormat.format(order.costBreakdown?.shippingFee ?? 0),
                ),
                _buildSummaryRow(
                  "Discount",
                  "-${currencyFormat.format(order.costBreakdown?.discount ?? 0)}",
                  color: Colors.green,
                ),
                const Divider(height: 24),
                _buildSummaryRow(
                  "Total Amount",
                  currencyFormat.format(order.costBreakdown?.finalTotal ?? 0),
                  isBold: true,
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text("Method"),
                    Text(
                      order.paymentMethod ?? "COD",
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 32),

          // 5. Cancel Button
          if (canCancel)
            SizedBox(
              width: double.infinity,
              height: 50,
              child: OutlinedButton(
                onPressed: () {
                  _showCancelDialog(context, order.orderId);
                },
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.red),
                  foregroundColor: Colors.red,
                ),
                child: const Text(
                  "CANCEL ORDER",
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(
    String label,
    String value, {
    bool isBold = false,
    Color? color,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
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
      ),
    );
  }

  void _showCancelDialog(BuildContext context, String orderId) {
    final reasonController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("Cancel Order"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text("Are you sure you want to cancel this order?"),
            const SizedBox(height: 16),
            TextField(
              controller: reasonController,
              decoration: const InputDecoration(
                labelText: "Reason (Optional)",
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Back"),
          ),
          TextButton(
            onPressed: () {
              // Gọi event Hủy
              context.read<OrderDetailBloc>().add(
                CancelOrderEvent(orderId, reasonController.text),
              );
              Navigator.pop(ctx);
            },
            child: const Text(
              "Confirm Cancel",
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }
}
