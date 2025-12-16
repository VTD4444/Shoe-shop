import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shoe_shop/features/address/data/repositories/address_repository.dart';
import 'package:shoe_shop/features/address/logic/address_bloc.dart';
import 'package:shoe_shop/features/checkout/data/repositories/checkout_repository.dart';
import 'package:shoe_shop/features/checkout/logic/checkout_bloc.dart';
import 'core/api/dio_client.dart';
import 'core/storage/storage_helper.dart';
import 'features/auth/data/repositories/auth_repository.dart';
import 'features/auth/logic/auth_bloc.dart';
import 'features/auth/logic/auth_event.dart';
import 'features/auth/logic/auth_state.dart';
import 'features/auth/presentation/login_screen.dart';
import 'features/discovery/data/repositories/product_repository.dart';
import 'features/discovery/logic/home_bloc.dart';
import 'features/discovery/presentation/home_screen.dart';
import 'features/cart/data/repositories/cart_repository.dart';
import 'features/cart/logic/cart_bloc.dart';

void main() {
  // 1. Khởi tạo Storage trước
  final storageHelper = StorageHelper();

  // 2. Truyền Storage vào DioClient
  final dioClient = DioClient(storageHelper);

  // 3. Các Repo giữ nguyên
  final authRepository = AuthRepository(
    dioClient: dioClient,
    storageHelper: storageHelper,
  );
  final productRepository = ProductRepository(dioClient: dioClient);
  final cartRepository = CartRepository(dioClient: dioClient);
  final checkoutRepository = CheckoutRepository(dioClient: dioClient);
  final addressRepository = AddressRepository(dioClient: dioClient);

  runApp(
    MyApp(
      authRepository: authRepository,
      productRepository: productRepository,
      cartRepository: cartRepository,
      checkoutRepository: checkoutRepository,
      addressRepository: addressRepository,
    ),
  );
}

class MyApp extends StatelessWidget {
  final AuthRepository authRepository;
  final ProductRepository productRepository;
  final CartRepository cartRepository;
  final CheckoutRepository checkoutRepository;
  final AddressRepository addressRepository;

  const MyApp({
    super.key,
    required this.authRepository,
    required this.productRepository,
    required this.cartRepository,
    required this.checkoutRepository,
    required this.addressRepository,
  });

  @override
  Widget build(BuildContext context) {
    // SỬ DỤNG MultiRepositoryProvider ĐỂ BAO BỌC TOÀN APP
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider.value(value: authRepository),
        RepositoryProvider.value(value: productRepository),
        RepositoryProvider.value(value: cartRepository),
        RepositoryProvider.value(value: checkoutRepository),
        RepositoryProvider.value(value: addressRepository),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider(
            create: (context) =>
                AuthBloc(authRepository)..add(AuthCheckRequested()),
          ),
          BlocProvider(create: (context) => HomeBloc(productRepository)),
          BlocProvider(
            create: (context) => CartBloc(cartRepository)..add(LoadCartEvent()),
          ),
          BlocProvider(
            create: (context) =>
                // CheckoutBloc(checkoutRepository), // Tạo khi dùng
                CheckoutBloc(checkoutRepository),
          ),
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
            // Font mặc định nếu muốn
          ),
          home: const AppNavigator(),
        ),
      ),
    );
  }
}

// Widget điều hướng thông minh
class AppNavigator extends StatelessWidget {
  const AppNavigator({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        if (state is AuthLoading) {
          // Có thể tạo một Splash Screen đẹp hơn ở đây
          return const Scaffold(
            body: Center(child: CircularProgressIndicator(color: Colors.black)),
          );
        } else if (state is AuthSuccess) {
          return const HomeScreen();
        } else {
          // Chưa login -> Vào màn hình Login đẹp vừa làm
          return const LoginScreen();
        }
      },
    );
  }
}
