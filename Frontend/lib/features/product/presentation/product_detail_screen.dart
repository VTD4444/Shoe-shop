import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:model_viewer_plus/model_viewer_plus.dart'; // 3D lib
import 'package:readmore/readmore.dart';
import 'package:shoe_shop/core/utils/auth_guard.dart';
import 'package:shoe_shop/features/product/data/repositories/review_repository.dart';
import 'package:shoe_shop/features/product/presentation/product_reviews_section.dart';

// --- IMPORTS CHO CART ---
import '../../cart/logic/cart_bloc.dart';
import '../../cart/presentation/cart_screen.dart'; // Import để điều hướng khi Buy Now

// --- IMPORTS PRODUCT ---
import '../logic/product_detail_bloc.dart';

class ProductDetailScreen extends StatefulWidget {
  final String productId;

  const ProductDetailScreen({super.key, required this.productId});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  // Biến để switch giữa xem Ảnh và xem 3D
  bool _show3DModel = false;
  int _currentImageIndex = 0;

  @override
  void initState() {
    super.initState();
    context.read<ProductDetailBloc>().add(
      LoadProductDetailEvent(widget.productId),
    );
  }

  // Hàm xử lý chung cho việc thêm vào giỏ
  void _handleAddToCart(
    BuildContext context,
    ProductDetailLoaded state, {
    required bool isBuyNow,
  }) {
    // 1. Validate: Phải chọn Size/Màu trước
    if (state.matchedVariant == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Please select Size and Color first!"),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (state.matchedVariant!.stock <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("This variant is out of stock"),
          backgroundColor: Colors.grey,
        ),
      );
      return;
    }

    // Dùng AuthGuard để bao bọc logic thêm giỏ hàng
    AuthGuard.checkAuthOrLogin(context, () {
      context.read<CartBloc>().add(
        AddToCartEvent(variantId: state.matchedVariant!.id, quantity: 1),
      );

      if (isBuyNow) {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const CartScreen()),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              "Added ${state.product.name} (${state.selectedSize}) to Cart",
            ),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 1),
          ),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: BlocBuilder<ProductDetailBloc, ProductDetailState>(
        builder: (context, state) {
          if (state is ProductDetailLoading) {
            return const Center(
              child: CircularProgressIndicator(color: Colors.black),
            );
          } else if (state is ProductDetailFailure) {
            return Center(child: Text(state.message));
          } else if (state is ProductDetailLoaded) {
            return _buildContent(context, state);
          }
          return const SizedBox();
        },
      ),
      // Sticky Bottom Bar
      bottomNavigationBar: _buildBottomAction(context),
    );
  }

  Widget _buildContent(BuildContext context, ProductDetailLoaded state) {
    final formatCurrency = NumberFormat.simpleCurrency(locale: 'vi_VN');
    final images = state.product.imageUrls;
    final model3DPath = state.product.model3DPath;
    final has3D = model3DPath != null;

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios, color: Colors.black),
            onPressed: () => Navigator.pop(context),
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.favorite_border, color: Colors.black),
              onPressed: () {},
            ),
            IconButton(
              icon: const Icon(Icons.share, color: Colors.black),
              onPressed: () {},
            ),
          ],
          expandedHeight: 450,
          pinned: true,
          flexibleSpace: FlexibleSpaceBar(
            background: Stack(
              children: [
                // --- 1. PRODUCT VIEWER (IMAGE or 3D) ---
                Positioned.fill(
                  child: _show3DModel && has3D
                      ? ModelViewer(
                          src: model3DPath,
                          alt: "A 3D model of ${state.product.name}",
                          ar: true,
                          autoRotate: true,
                          cameraControls: true,
                          backgroundColor: Colors.white,
                        )
                      : PageView.builder(
                          itemCount: images.length,
                          onPageChanged: (index) {
                            setState(() {
                              _currentImageIndex = index;
                            });
                          },
                          itemBuilder: (context, index) {
                            return Image.network(
                              images[index],
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) =>
                                  const Center(child: Icon(Icons.broken_image)),
                            );
                          },
                        ),
                ),

                // --- 2. INDICATOR ---
                if (!_show3DModel && images.length > 1)
                  Positioned(
                    bottom: 20,
                    left: 0,
                    right: 0,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: images.asMap().entries.map((entry) {
                        return Container(
                          width: 8.0,
                          height: 8.0,
                          margin: const EdgeInsets.symmetric(horizontal: 4.0),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: _currentImageIndex == entry.key
                                ? Colors.black
                                : Colors.grey.withOpacity(0.4),
                          ),
                        );
                      }).toList(),
                    ),
                  ),

                // --- 3. SWITCH 3D BUTTON ---
                if (has3D)
                  Positioned(
                    bottom: 20,
                    right: 20,
                    child: FloatingActionButton.extended(
                      heroTag: "btn3d",
                      backgroundColor: Colors.black,
                      elevation: 4,
                      onPressed: () {
                        setState(() {
                          _show3DModel = !_show3DModel;
                        });
                      },
                      icon: Icon(
                        _show3DModel ? Icons.image : Icons.view_in_ar,
                        color: Colors.white,
                      ),
                      label: Text(
                        _show3DModel ? "PHOTOS" : "3D VIEW",
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Brand & Rating
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      state.product.brandName.toUpperCase(),
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Colors.grey,
                      ),
                    ),
                    Row(
                      children: [
                        const Icon(Icons.star, color: Colors.amber, size: 16),
                        const SizedBox(width: 4),
                        Text(
                          "${state.product.rating} (${state.reviews.totalReviews} reviews)",
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Name
                Text(
                  state.product.name,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    height: 1.2,
                  ),
                ),
                const SizedBox(height: 8),

                // Price
                Text(
                  formatCurrency.format(
                    state.matchedVariant?.finalPrice ?? state.product.basePrice,
                  ),
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 24),
                const Divider(),
                const SizedBox(height: 24),

                // --- SELECT COLOR ---
                const Text(
                  "SELECT COLOR",
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 12,
                  children: state.product.variants
                      .map((v) => v.colorName)
                      .toSet()
                      .map((color) {
                        final isSelected = color == state.selectedColor;
                        return GestureDetector(
                          onTap: () {
                            context.read<ProductDetailBloc>().add(
                              SelectVariantEvent(color: color),
                            );
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: isSelected ? Colors.black : Colors.white,
                              border: Border.all(color: Colors.grey.shade300),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              color,
                              style: TextStyle(
                                color: isSelected ? Colors.white : Colors.black,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        );
                      })
                      .toList(),
                ),

                const SizedBox(height: 24),

                // --- SELECT SIZE ---
                const Text(
                  "SELECT SIZE",
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 12,
                  children: state.product.variants
                      .map((v) => v.size)
                      .toSet()
                      .map((size) {
                        final isSelected = size == state.selectedSize;
                        final isAvailable = state.product.variants.any(
                          (v) =>
                              v.size == size &&
                              v.colorName == state.selectedColor &&
                              v.stock > 0,
                        );

                        return Opacity(
                          opacity: isAvailable ? 1.0 : 0.3,
                          child: GestureDetector(
                            onTap: isAvailable
                                ? () {
                                    context.read<ProductDetailBloc>().add(
                                      SelectVariantEvent(size: size),
                                    );
                                  }
                                : null,
                            child: CircleAvatar(
                              radius: 22,
                              backgroundColor: isSelected
                                  ? Colors.black
                                  : Colors.grey[100],
                              child: Text(
                                size,
                                style: TextStyle(
                                  color: isSelected
                                      ? Colors.white
                                      : Colors.black,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                        );
                      })
                      .toList(),
                ),

                const SizedBox(height: 32),

                // --- DESCRIPTION ---
                const Text(
                  "DESCRIPTION",
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                ),
                const SizedBox(height: 8),
                ReadMoreText(
                  state.product.description,
                  trimLines: 3,
                  colorClickableText: Colors.black,
                  trimMode: TrimMode.Line,
                  trimCollapsedText: 'Show more',
                  trimExpandedText: 'Show less',
                  style: TextStyle(color: Colors.grey[600], height: 1.5),
                  moreStyle: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 32),
                const Divider(),
                const SizedBox(height: 16),

                // --- REVIEWS ---
                ProductReviewsSection(
                  productId: state.product.id,
                  // Lấy từ context hoặc khởi tạo mới nếu chưa có DI
                  reviewRepo: context.read<ReviewRepository>(),
                ),
                const SizedBox(height: 60),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBottomAction(BuildContext context) {
    return BlocBuilder<ProductDetailBloc, ProductDetailState>(
      builder: (context, state) {
        if (state is! ProductDetailLoaded) return const SizedBox();

        // Kiểm tra hết hàng nếu đã chọn đủ size/màu
        final isOutOfStock =
            state.matchedVariant != null && state.matchedVariant!.stock <= 0;

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, -5),
              ),
            ],
          ),
          child: SafeArea(
            child: Row(
              children: [
                // --- NÚT 1: ADD TO CART ---
                Expanded(
                  child: SizedBox(
                    height: 50,
                    child: OutlinedButton.icon(
                      onPressed: isOutOfStock
                          ? null
                          : () => _handleAddToCart(
                              context,
                              state,
                              isBuyNow: false,
                            ),
                      icon: const Icon(
                        Icons.shopping_cart_outlined,
                        color: Colors.black,
                      ),
                      label: const Text(
                        "ADD TO CART",
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Colors.black),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ),
                ),

                const SizedBox(width: 16),

                // --- NÚT 2: BUY NOW ---
                Expanded(
                  child: SizedBox(
                    height: 50,
                    child: ElevatedButton(
                      onPressed: isOutOfStock
                          ? null
                          : () => _handleAddToCart(
                              context,
                              state,
                              isBuyNow: true,
                            ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.black,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        elevation: 0,
                      ),
                      child: Text(
                        isOutOfStock ? "OUT OF STOCK" : "BUY NOW",
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
