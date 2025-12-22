import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../data/repositories/order_repository.dart';
import '../logic/order_list_bloc.dart';
import '../data/models/order_model.dart';
import 'order_detail_screen.dart';

class OrderHistoryScreen extends StatelessWidget {
  const OrderHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Inject Bloc và Repository tại đây
    return BlocProvider(
      create: (context) => OrderListBloc(context.read<OrderRepository>()),
      child: const OrderHistoryView(),
    );
  }
}

class OrderHistoryView extends StatefulWidget {
  const OrderHistoryView({super.key});

  @override
  State<OrderHistoryView> createState() => _OrderHistoryViewState();
}

class _OrderHistoryViewState extends State<OrderHistoryView>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Định nghĩa các Tab
  final List<String> _statuses = [
    'all',
    'pending',
    'shipping',
    'completed',
    'cancelled',
  ];
  final List<String> _titles = [
    'All',
    'Pending',
    'Shipping',
    'Completed',
    'Cancelled',
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _statuses.length, vsync: this);
    _tabController.addListener(_onTabChanged);
    // Load tab đầu tiên
    context.read<OrderListBloc>().add(LoadOrdersEvent('all'));
  }

  void _onTabChanged() {
    if (_tabController.indexIsChanging) {
      final status = _statuses[_tabController.index];
      context.read<OrderListBloc>().add(LoadOrdersEvent(status));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text(
          "MY ORDERS",
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          labelColor: Colors.black,
          indicatorColor: Colors.black,
          unselectedLabelColor: Colors.grey,
          tabs: _titles.map((t) => Tab(text: t)).toList(),
        ),
      ),
      body: BlocBuilder<OrderListBloc, OrderListState>(
        builder: (context, state) {
          if (state is OrderListLoading) {
            return const Center(
              child: CircularProgressIndicator(color: Colors.black),
            );
          } else if (state is OrderListError) {
            return Center(child: Text(state.message));
          } else if (state is OrderListLoaded) {
            if (state.orders.isEmpty) {
              return const Center(
                child: Text("No orders found in this status."),
              );
            }
            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: state.orders.length,
              separatorBuilder: (_, __) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                return _buildOrderItem(context, state.orders[index]);
              },
            );
          }
          return const SizedBox();
        },
      ),
    );
  }

  Widget _buildOrderItem(BuildContext context, OrderModel order) {
    final currencyFormat = NumberFormat.simpleCurrency(locale: 'vi_VN');
    final item = order.previewItem;

    return GestureDetector(
      onTap: () async {
        // Điều hướng sang màn hình chi tiết
        await Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => OrderDetailScreen(orderId: order.orderId),
          ),
        );
        // Quay lại thì reload list để cập nhật trạng thái nếu có hủy
        if (context.mounted) {
          final status = _statuses[_tabController.index];
          context.read<OrderListBloc>().add(LoadOrdersEvent(status));
        }
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  "ID: ...${order.orderId.substring(order.orderId.length - 8)}",
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                _buildStatusBadge(order.status),
              ],
            ),
            const Divider(height: 24),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Thumbnail
                Container(
                  width: 70,
                  height: 70,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    color: Colors.grey[200],
                    image: (item?.thumbnail != null)
                        ? DecorationImage(
                            image: NetworkImage(item!.thumbnail!),
                            fit: BoxFit.cover,
                          )
                        : null,
                  ),
                  child: item?.thumbnail == null
                      ? const Icon(Icons.image)
                      : null,
                ),
                const SizedBox(width: 12),
                // Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item?.name ?? "Product Name",
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        "Size: ${item?.size} | Color: ${item?.color}",
                        style: TextStyle(color: Colors.grey[600], fontSize: 13),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        "x${item?.quantity} items",
                        style: TextStyle(color: Colors.grey[600], fontSize: 13),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  "${order.itemsCount ?? 1} items",
                  style: const TextStyle(color: Colors.grey),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text("Total Payment", style: TextStyle(fontSize: 12)),
                    Text(
                      currencyFormat.format(order.totalAmount),
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: Colors.black,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    String text = status.toUpperCase();
    switch (status) {
      case 'pending':
        color = Colors.orange;
        break;
      case 'processing':
        color = Colors.blue;
        break;
      case 'shipping':
        color = Colors.purple;
        break;
      case 'completed':
        color = Colors.green;
        break;
      case 'cancelled':
        color = Colors.red;
        break;
      default:
        color = Colors.grey;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      ),
    );
  }
}
