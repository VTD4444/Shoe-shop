import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/repositories/checkout_repository.dart';
import 'order_success_screen.dart';

class SePayPaymentScreen extends StatefulWidget {
  final String orderId;
  final String paymentUrl; // Link ảnh QR từ backend trả về
  final double amount;

  const SePayPaymentScreen({
    super.key,
    required this.orderId,
    required this.paymentUrl,
    required this.amount,
  });

  @override
  State<SePayPaymentScreen> createState() => _SePayPaymentScreenState();
}

class _SePayPaymentScreenState extends State<SePayPaymentScreen> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    // Bắt đầu hỏi Server xem đã nhận được tiền chưa
    _startPolling();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startPolling() {
    // Cứ 3 giây gọi API 1 lần
    _timer = Timer.periodic(const Duration(seconds: 3), (timer) async {
      try {
        final repo = context.read<CheckoutRepository>();
        // Gọi API check status (bạn đã viết ở bước Momo)
        final status = await repo.getOrderStatus(widget.orderId);

        if (status == 'paid' || status == 'processing') {
          timer.cancel();
          if (!mounted) return;

          // Chuyển sang màn hình thành công
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (_) => OrderSuccessScreen(orderId: widget.orderId),
            ),
          );

          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text("Thanh toán thành công!"),
              backgroundColor: Colors.green,
            ),
          );
        }
      } catch (e) {
        print("Polling error: $e");
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          "THANH TOÁN QR",
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
        automaticallyImplyLeading: false, // Chặn nút back mặc định
        actions: [
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () {
              // Xử lý hủy đơn tương tự Momo
              Navigator.pop(context);
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Text(
                "Quét mã QR để thanh toán",
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                "Đơn hàng: ${widget.orderId}",
                style: const TextStyle(fontSize: 16, color: Colors.grey),
              ),
              const SizedBox(height: 32),

              // --- HIỂN THỊ ẢNH QR ---
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 20,
                    ),
                  ],
                  border: Border.all(color: Colors.grey.shade200),
                ),
                // Dùng Image.network vì SePay trả về link ảnh
                child: Image.network(
                  widget.paymentUrl,
                  height: 300,
                  fit: BoxFit.contain,
                  loadingBuilder: (context, child, loadingProgress) {
                    if (loadingProgress == null) return child;
                    return const SizedBox(
                      height: 300,
                      width: 300,
                      child: Center(child: CircularProgressIndicator()),
                    );
                  },
                ),
              ),

              // ------------------------
              const SizedBox(height: 32),
              const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.black,
                    ),
                  ),
                  SizedBox(width: 12),
                  Text(
                    "Đang chờ thanh toán...",
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Text(
                "Hệ thống sẽ tự động chuyển tiếp sau khi nhận được tiền.",
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
