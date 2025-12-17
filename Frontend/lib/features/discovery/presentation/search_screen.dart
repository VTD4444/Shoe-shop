import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:shoe_shop/features/checkout/data/models/search_query.dart';
import '../data/models/product_model.dart';
import '../data/repositories/product_repository.dart';
import '../logic/search_bloc.dart';
import '../../product/presentation/product_detail_screen.dart'; // Import chi tiết
import '../../product/logic/product_detail_bloc.dart';

class SearchScreen extends StatelessWidget {
  final String? initialKeyword; // Từ khóa ban đầu nếu bấm từ Home

  const SearchScreen({super.key, this.initialKeyword});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) {
        final bloc = SearchBloc(context.read<ProductRepository>());
        // Nếu có keyword truyền từ Home, trigger search luôn
        if (initialKeyword != null && initialKeyword!.isNotEmpty) {
          bloc.add(SearchByKeyword(initialKeyword!));
        }
        return bloc;
      },
      child: const SearchView(),
    );
  }
}

class SearchView extends StatefulWidget {
  const SearchView({super.key});

  @override
  State<SearchView> createState() => _SearchViewState();
}

class _SearchViewState extends State<SearchView> {
  final _searchController = TextEditingController();

  // Biến tạm để lưu Filter state
  SearchQuery _currentQuery = SearchQuery();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
        title: TextField(
          controller: _searchController,
          autofocus: true,
          textInputAction: TextInputAction.search,
          decoration: const InputDecoration(
            hintText: "Search sneakers...",
            border: InputBorder.none,
          ),
          onSubmitted: (value) {
            // Trigger search khi bấm Enter/Search trên bàn phím
            context.read<SearchBloc>().add(SearchByKeyword(value));
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () => _showFilterBottomSheet(context),
          ),
        ],
      ),
      body: BlocConsumer<SearchBloc, SearchState>(
        listener: (context, state) {
          if (state is SearchLoaded) {
            _currentQuery = state.currentQuery; // Cập nhật query hiện tại
            _searchController.text = state.currentQuery.keyword;
          }
        },
        builder: (context, state) {
          if (state is SearchLoading) {
            return const Center(
              child: CircularProgressIndicator(color: Colors.black),
            );
          } else if (state is SearchFailure) {
            return Center(child: Text(state.message));
          } else if (state is SearchLoaded) {
            if (state.products.isEmpty) {
              return const Center(child: Text("No products found."));
            }
            return _buildResultGrid(state.products);
          }
          return const Center(child: Text("Type to search..."));
        },
      ),
    );
  }

  Widget _buildResultGrid(List<ProductModel> products) {
    final formatCurrency = NumberFormat.simpleCurrency(locale: 'vi_VN');
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.7,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
      ),
      itemCount: products.length,
      itemBuilder: (context, index) {
        final product = products[index];
        return GestureDetector(
          onTap: () {
            // Chuyển sang chi tiết sản phẩm
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
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Container(
                  color: Colors.grey[100],
                  child: Image.network(product.thumbnail, fit: BoxFit.cover),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                product.brandName.toUpperCase(),
                style: TextStyle(fontSize: 10, color: Colors.grey[600]),
              ),
              Text(
                product.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              Text(
                formatCurrency.format(product.price),
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ],
          ),
        );
      },
    );
  }

  // --- FILTER BOTTOM SHEET ---
  void _showFilterBottomSheet(BuildContext parentContext) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        // Tạo biến tạm để user chỉnh sửa filter trong bottom sheet
        // trước khi bấm Apply
        String tempSortBy = _currentQuery.sortBy;
        // ... thêm các biến filter khác nếu cần (minPrice, brandIds...)

        return StatefulBuilder(
          builder: (context, setStateSheet) {
            return Container(
              padding: const EdgeInsets.all(24),
              height: MediaQuery.of(context).size.height * 0.5,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "Filter & Sort",
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
                  ),
                  const SizedBox(height: 24),

                  const Text(
                    "Sort By",
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Wrap(
                    spacing: 8,
                    children: [
                      _buildSortChip(
                        "Newest",
                        "newest",
                        tempSortBy,
                        (val) => setStateSheet(() => tempSortBy = val),
                      ),
                      _buildSortChip(
                        "Price: Low to High",
                        "price_asc",
                        tempSortBy,
                        (val) => setStateSheet(() => tempSortBy = val),
                      ),
                      _buildSortChip(
                        "Price: High to Low",
                        "price_desc",
                        tempSortBy,
                        (val) => setStateSheet(() => tempSortBy = val),
                      ),
                      _buildSortChip(
                        "Sold",
                        "sold",
                        tempSortBy,
                        (val) => setStateSheet(() => tempSortBy = val),
                      ),
                    ],
                  ),

                  const Spacer(),

                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: () {
                        // Apply Filter
                        // Update query hiện tại với giá trị mới
                        final newQuery = _currentQuery.copyWith(
                          sortBy: tempSortBy,
                        );
                        // Gọi Event ApplyFilter ở Bloc cha
                        parentContext.read<SearchBloc>().add(
                          ApplyFilter(newQuery),
                        );
                        Navigator.pop(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.black,
                      ),
                      child: const Text(
                        "APPLY FILTERS",
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildSortChip(
    String label,
    String value,
    String groupValue,
    Function(String) onSelect,
  ) {
    final isSelected = value == groupValue;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) => onSelect(value),
      selectedColor: Colors.black,
      labelStyle: TextStyle(color: isSelected ? Colors.white : Colors.black),
    );
  }
}
