import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shoe_shop/features/address/data/repositories/address_repository.dart';
import 'package:shoe_shop/features/address/logic/address_bloc.dart';
import 'package:shoe_shop/features/checkout/data/repositories/checkout_repository.dart';
import 'package:shoe_shop/features/checkout/logic/checkout_bloc.dart';
import 'package:shoe_shop/features/order/data/repositories/order_repository.dart';
import 'package:shoe_shop/features/product/data/repositories/review_repository.dart';
import 'core/api/dio_client.dart';
import 'core/storage/storage_helper.dart';
import 'features/auth/data/repositories/auth_repository.dart';
import 'features/auth/logic/auth_bloc.dart';
import 'features/auth/logic/auth_event.dart';
import 'features/auth/logic/auth_state.dart';
import 'features/discovery/data/repositories/product_repository.dart';
import 'features/discovery/logic/home_bloc.dart';
import 'features/discovery/presentation/home_screen.dart';
import 'features/cart/data/repositories/cart_repository.dart';
import 'features/cart/logic/cart_bloc.dart';

void main() async {
  // Đảm bảo binding được khởi tạo nếu hàm main là async
  WidgetsFlutterBinding.ensureInitialized();

  final storageHelper = StorageHelper();
  // Nếu storageHelper cần init async thì thêm await storageHelper.init();

  final dioClient = DioClient(storageHelper);

  final authRepository = AuthRepository(
    dioClient: dioClient,
    storageHelper: storageHelper,
  );
  final productRepository = ProductRepository(dioClient: dioClient);
  final cartRepository = CartRepository(dioClient: dioClient);
  final checkoutRepository = CheckoutRepository(dioClient: dioClient);
  final addressRepository = AddressRepository(dioClient: dioClient);
  final orderRepository = OrderRepository(dioClient: dioClient);
  final reviewRepository = ReviewRepository(dioClient: dioClient);

  runApp(
    MyApp(
      authRepository: authRepository,
      productRepository: productRepository,
      cartRepository: cartRepository,
      checkoutRepository: checkoutRepository,
      addressRepository: addressRepository,
      orderRepository: orderRepository,
      reviewRepository: reviewRepository,
    ),
  );
}

class MyApp extends StatelessWidget {
  final AuthRepository authRepository;
  final ProductRepository productRepository;
  final CartRepository cartRepository;
  final CheckoutRepository checkoutRepository;
  final AddressRepository addressRepository;
  final OrderRepository orderRepository;
  final ReviewRepository reviewRepository;

  const MyApp({
    super.key,
    required this.authRepository,
    required this.productRepository,
    required this.cartRepository,
    required this.checkoutRepository,
    required this.addressRepository,
    required this.orderRepository,
    required this.reviewRepository,
  });

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider.value(value: authRepository),
        RepositoryProvider.value(value: productRepository),
        RepositoryProvider.value(value: cartRepository),
        RepositoryProvider.value(value: checkoutRepository),
        RepositoryProvider.value(value: addressRepository),
        RepositoryProvider.value(value: orderRepository),
        RepositoryProvider.value(value: reviewRepository),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider(
            create: (context) =>
                AuthBloc(authRepository)..add(AuthCheckRequested()),
          ),
          BlocProvider(create: (context) => HomeBloc(productRepository)),

          BlocProvider(create: (context) => CartBloc(cartRepository)),

          // --------------------------------------------------------
          BlocProvider(create: (context) => CheckoutBloc(checkoutRepository)),
          BlocProvider(
            create: (context) =>
                AddressBloc(addressRepository)..add(LoadAddressesEvent()),
          ),
        ],
        child: MaterialApp(
          debugShowCheckedModeBanner: false,
          title: 'Shoe Shop',
          theme: ThemeData(
            primarySwatch: Colors.blue,
            scaffoldBackgroundColor: Colors.white,
          ),
          // Luôn gọi AppNavigator để quyết định logic
          home: const AppNavigator(),
        ),
      ),
    );
  }
}

class AppNavigator extends StatelessWidget {
  const AppNavigator({super.key});

  @override
  Widget build(BuildContext context) {
    // Dùng BlocListener để thực hiện các hành động ngầm (Side effects)
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthSuccess) {
          // KHI VÀ CHỈ KHI đăng nhập thành công -> Mới tải giỏ hàng
          print("User logged in -> Loading Cart...");
          context.read<CartBloc>().add(LoadCartEvent());
        } else if (state is AuthUnauthenticated) {
          // Nếu đăng xuất hoặc chưa đăng nhập -> Có thể clear giỏ hàng local nếu cần
          // context.read<CartBloc>().add(ClearCartLocalEvent()); // Nếu bạn có event này
        }
      },
      // Dùng BlocBuilder để quyết định giao diện
      child: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, state) {
          if (state is AuthLoading) {
            // Màn hình chờ khi đang kiểm tra Token trong máy
            return const Scaffold(
              body: Center(
                child: CircularProgressIndicator(color: Colors.black),
              ),
            );
          }

          // --- LOGIC GUEST MODE ---
          // Dù là AuthSuccess (Đã login) hay AuthUnauthenticated (Chưa login)
          // -> Đều vào HomeScreen.
          // Việc chặn tính năng sẽ do AuthGuard (bạn đã làm ở bước trước) đảm nhận.
          return const HomeScreen();
        },
      ),
    );
  }
}
