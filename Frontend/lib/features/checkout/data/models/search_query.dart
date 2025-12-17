class SearchQuery {
  String keyword;
  int page;
  int limit;
  String sortBy;
  List<int> brandIds;
  double? minPrice;
  double? maxPrice;

  SearchQuery({
    this.keyword = "",
    this.page = 1,
    this.limit = 12,
    this.sortBy = "newest",
    this.brandIds = const [],
    this.minPrice,
    this.maxPrice,
  });

  Map<String, dynamic> toJson() {
    return {
      if (keyword.isNotEmpty) 'q': keyword,
      'page': page,
      'limit': limit,
      'sort_by': sortBy,
      if (brandIds.isNotEmpty) 'brand_ids': brandIds,
      if (minPrice != null) 'min_price': minPrice,
      if (maxPrice != null) 'max_price': maxPrice,
    };
  }

  // Hàm copyWith để dễ dàng update 1 vài trường khi filter
  SearchQuery copyWith({
    String? keyword,
    int? page,
    String? sortBy,
    List<int>? brandIds,
    double? minPrice,
    double? maxPrice,
  }) {
    return SearchQuery(
      keyword: keyword ?? this.keyword,
      page: page ?? this.page,
      limit: this.limit,
      sortBy: sortBy ?? this.sortBy,
      brandIds: brandIds ?? this.brandIds,
      minPrice: minPrice ?? this.minPrice,
      maxPrice: maxPrice ?? this.maxPrice,
    );
  }
}
