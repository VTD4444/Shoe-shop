import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:shoe_shop/core/utils/auth_guard.dart';
import 'package:shoe_shop/features/discovery/presentation/search_screen.dart';
import '../data/models/product_model.dart';
import '../logic/home_bloc.dart';
import '../../product/presentation/product_detail_screen.dart'; // Màn hình chi tiết
import '../../product/logic/product_detail_bloc.dart'; // Bloc chi tiết
import '../../discovery/data/repositories/product_repository.dart'; // Để lấy repo
import '../../cart/logic/cart_bloc.dart'; // Để lắng nghe state giỏ hàng
import '../../cart/presentation/cart_screen.dart'; // Để chuyển trang
import '../../auth/presentation/profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    // Kích hoạt load dữ liệu ngay khi vào màn hình
    context.read<HomeBloc>().add(HomeInitialLoad());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: _buildAppBar(),
      body: BlocBuilder<HomeBloc, HomeState>(
        builder: (context, state) {
          if (state is HomeLoading) {
            return const Center(
              child: CircularProgressIndicator(color: Colors.black),
            );
          } else if (state is HomeFailure) {
            return Center(child: Text("Error: ${state.message}"));
          } else if (state is HomeLoaded) {
            return RefreshIndicator(
              color: Colors.black,
              onRefresh: () async {
                context.read<HomeBloc>().add(HomeInitialLoad());
                context.read<CartBloc>().add(LoadCartEvent());
              },
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 1. Search Bar giả lập (bấm vào sẽ sang trang Search)
                    _buildSearchBar(),

                    const SizedBox(height: 24),

                    // 2. Brand List (Chạy ngang)
                    if (state.brands.isNotEmpty) ...[
                      SizedBox(
                        height: 40,
                        child: ListView.separated(
                          padding: const EdgeInsets.symmetric(horizontal: 24),
                          scrollDirection: Axis.horizontal,
                          itemCount: state.brands.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(width: 24),
                          itemBuilder: (context, index) {
                            return Center(
                              child: Text(
                                state.brands[index].name.toUpperCase(),
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                  color: Colors.black,
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 32),
                    ],

                    // 3. Section: Trending
                    _buildSectionHeader("TRENDING NOW"),
                    const SizedBox(height: 16),
                    SizedBox(
                      height: 280, // Chiều cao card
                      child: ListView.separated(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        scrollDirection: Axis.horizontal,
                        itemCount: state.trendingProducts.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 16),
                        itemBuilder: (context, index) {
                          return _buildProductCard(
                            state.trendingProducts[index],
                            width: 160,
                          );
                        },
                      ),
                    ),

                    const SizedBox(height: 40),

                    // 4. Section: New Arrivals (Dạng lưới hoặc list dọc)
                    _buildSectionHeader("NEW ARRIVALS"),
                    const SizedBox(height: 16),
                    ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      shrinkWrap: true,
                      physics:
                          const NeverScrollableScrollPhysics(), // Để scroll theo cha
                      itemCount: state.newestProducts.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 24),
                      itemBuilder: (context, index) {
                        return _buildWideProductCard(
                          state.newestProducts[index],
                        );
                      },
                    ),

                    const SizedBox(height: 40),
                  ],
                ),
              ),
            );
          }
          return const SizedBox();
        },
      ),
    );
  }

  // --- WIDGETS CON ---
  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      titleSpacing: 24,
      title: const Text(
        "SHOE MASTER",
        style: TextStyle(
          color: Colors.black,
          fontWeight: FontWeight.w900,
          letterSpacing: 2.0,
          fontSize: 20,
        ),
      ),
      actions: [
        // --- 1. Search Icon (Giữ nguyên) ---
        IconButton(
          icon: const Icon(Icons.search, color: Colors.black),
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const SearchScreen()),
            );
          },
        ),

        // --- 2. Cart Icon (Giữ nguyên) ---
        BlocBuilder<CartBloc, CartState>(
          builder: (context, state) {
            int cartCount = 0;
            if (state is CartLoaded) {
              cartCount = state.cart.totalItems;
            }

            return Stack(
              alignment: Alignment.center,
              children: [
                IconButton(
                  icon: const Icon(
                    Icons.shopping_bag_outlined,
                    color: Colors.black,
                  ),
                  onPressed: () {
                    AuthGuard.checkAuthOrLogin(context, () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const CartScreen()),
                      );
                    });
                  },
                ),
                // Chỉ hiện Badge khi số lượng > 0
                if (cartCount > 0)
                  Positioned(
                    top: 10,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: Colors.red, // Màu đỏ nổi bật trên nền trắng/đen
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 16,
                        minHeight: 16,
                      ),
                      child: Text(
                        '$cartCount',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            );
          },
        ),

        // --- 3. THÊM PROFILE ICON Ở ĐÂY ---
        IconButton(
          icon: const Icon(Icons.person_outline, color: Colors.black),
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const ProfileScreen()),
            );
          },
        ),
        // ------------------------
        const SizedBox(width: 16),
      ],
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: GestureDetector(
        onTap: () {
          // --- NAVIGATION ---
          Navigator.push(
            context,
            MaterialPageRoute(
              // Không truyền keyword để vào ô trống
              builder: (_) => const SearchScreen(),
            ),
          );
        },
        child: Container(
          height: 50,
          decoration: BoxDecoration(color: Colors.grey[100]),
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              const Icon(Icons.search, color: Colors.grey),
              const SizedBox(width: 12),
              Text(
                "Search for sneakers...",
                style: TextStyle(color: Colors.grey[500], fontSize: 14),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w900,
              letterSpacing: 1.0,
            ),
          ),
          GestureDetector(
            onTap: () {},
            child: const Text(
              "VIEW ALL",
              style: TextStyle(
                fontSize: 12,
                decoration: TextDecoration.underline,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Card dọc (cho Trending)
  Widget _buildProductCard(ProductModel product, {required double width}) {
    final formatCurrency = NumberFormat.simpleCurrency(locale: 'vi_VN');

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => BlocProvider(
              create: (context) =>
                  ProductDetailBloc(context.read<ProductRepository>()),
              child: ProductDetailScreen(productId: product.id),
            ),
          ),
        );
      },
      child: SizedBox(
        width: width,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Container(
                color: Colors.grey[100],
                width: double.infinity,
                child: Image.network(
                  product.thumbnail,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) =>
                      const Icon(Icons.image_not_supported),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              product.brandName.toUpperCase(),
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              product.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
            ),
            const SizedBox(height: 4),
            Text(
              formatCurrency.format(product.price),
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }

  // Card ngang lớn (cho New Arrivals) - Style tạp chí
  Widget _buildWideProductCard(ProductModel product) {
    final formatCurrency = NumberFormat.simpleCurrency(locale: 'vi_VN');

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => BlocProvider(
              create: (context) =>
                  ProductDetailBloc(context.read<ProductRepository>()),
              child: ProductDetailScreen(productId: product.id),
            ),
          ),
        );
      },
      child: Container(
        height: 140,
        color: Colors.white,
        child: Row(
          children: [
            // Ảnh bên trái
            Container(
              width: 120,
              height: 140,
              color: Colors.grey[100],
              child: Image.network(
                product.thumbnail,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) =>
                    const Icon(Icons.image_not_supported),
              ),
            ),
            const SizedBox(width: 16),
            // Thông tin bên phải
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    product.brandName.toUpperCase(),
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    product.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    formatCurrency.format(product.price),
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                  if (product.soldCount != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      "${product.soldCount} sold",
                      style: TextStyle(color: Colors.grey[500], fontSize: 11),
                    ),
                  ],
                ],
              ),
            ),
            // Nút mũi tên sang trọng
            const Padding(
              padding: EdgeInsets.only(right: 8.0),
              child: Icon(Icons.arrow_forward, size: 20),
            ),
          ],
        ),
      ),
    );
  }
}
