import React, { useEffect, useState } from 'react';
import productService from '../services/productService';
import ProductCard from '../components/ProductCard';
import { FiFilter, FiX } from 'react-icons/fi';

const ProductsPage = () => {
  // State chứa dữ liệu Metadata cho bộ lọc
  const [meta, setMeta] = useState({ brands: [], categories: [], sizes: [], colors: [], price_range: {} });
  
  // State chứa danh sách sản phẩm kết quả
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // State chứa các tiêu chí lọc người dùng đang chọn
  const [filters, setFilters] = useState({
    q: '',
    page: 1,
    limit: 12,
    sort_by: 'newest',
    brand_ids: [],
    category_ids: [],
    min_price: null,
    max_price: null,
  });

  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // 1. Load Metadata (Chạy 1 lần đầu tiên)
  useEffect(() => {
    productService.getFilterMeta().then((res) => {
      setMeta(res); // Lưu vào state để vẽ UI
      // Set giá mặc định cho slider nếu cần
      setFilters(prev => ({
        ...prev,
        min_price: res.price_range.min,
        max_price: res.price_range.max
      }));
    });
  }, []);

  // 2. Gọi API Search mỗi khi `filters` thay đổi
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await productService.search(filters);
        // API trả về: { meta: {...}, data: [...] }
        setProducts(response.data || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce nhẹ để tránh gọi API liên tục khi gõ search
    const timeout = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timeout);
  }, [filters]);

  // Hàm xử lý khi check vào Brand/Category (Logic toggle mảng ID)
  const handleCheckboxChange = (type, id) => {
    setFilters(prev => {
      const list = prev[type]; // VD: prev.brand_ids
      const newList = list.includes(id) 
        ? list.filter(item => item !== id) // Bỏ check
        : [...list, id]; // Check thêm
      return { ...prev, [type]: newList, page: 1 }; // Reset về trang 1
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* === SIDEBAR FILTER === */}
        <aside className={`w-full md:w-64 flex-shrink-0 ${showMobileFilter ? 'block' : 'hidden md:block'}`}>
          <div className="sticky top-20 space-y-8">
            <div className="flex justify-between md:hidden">
              <h3 className="font-bold text-xl">BỘ LỌC</h3>
              <button onClick={() => setShowMobileFilter(false)}><FiX size={24}/></button>
            </div>

            {/* Tìm kiếm từ khóa */}
            <div>
              <h4 className="font-bold mb-3 uppercase text-sm">Tìm kiếm</h4>
              <input 
                type="text" 
                placeholder="Tên giày, SKU..." 
                className="w-full border p-2 text-sm bg-gray-50 focus:outline-black"
                value={filters.q}
                onChange={(e) => setFilters({...filters, q: e.target.value, page: 1})}
              />
            </div>

            {/* Brands */}
            <div>
              <h4 className="font-bold mb-3 uppercase text-sm">Thương hiệu</h4>
              <div className="space-y-2">
                {meta.brands.map(brand => (
                  <label key={brand.brand_id} className="flex items-center space-x-2 text-sm cursor-pointer hover:text-gray-600">
                    <input 
                      type="checkbox" 
                      className="accent-black"
                      checked={filters.brand_ids.includes(brand.brand_id)}
                      onChange={() => handleCheckboxChange('brand_ids', brand.brand_id)}
                    />
                    <span>{brand.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-bold mb-3 uppercase text-sm">Danh mục</h4>
              <div className="space-y-2">
                {meta.categories.map(cat => (
                  <label key={cat.category_id} className="flex items-center space-x-2 text-sm cursor-pointer hover:text-gray-600">
                    <input 
                      type="checkbox" 
                      className="accent-black"
                      checked={filters.category_ids.includes(cat.category_id)}
                      onChange={() => handleCheckboxChange('category_ids', cat.category_id)}
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Sort (Sắp xếp) */}
            <div>
              <h4 className="font-bold mb-3 uppercase text-sm">Sắp xếp</h4>
              <select 
                className="w-full border p-2 text-sm bg-gray-50 focus:outline-black"
                value={filters.sort_by}
                onChange={(e) => setFilters({...filters, sort_by: e.target.value})}
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="sold">Bán chạy nhất</option>
              </select>
            </div>
          </div>
        </aside>

        {/* === MAIN CONTENT === */}
        <div className="flex-1">
          {/* Mobile Filter Toggle */}
          <button 
            className="md:hidden w-full mb-4 flex items-center justify-center space-x-2 border py-3 font-bold"
            onClick={() => setShowMobileFilter(true)}
          >
            <FiFilter /> <span>BỘ LỌC & SẮP XẾP</span>
          </button>

          {/* Product Grid */}
          {loading ? (
            <div className="text-center py-20">Đang tìm kiếm...</div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length > 0 ? (
                  products.map(p => <ProductCard key={p.product_id} product={p} />)
                ) : (
                  <div className="col-span-full text-center py-20 text-gray-500">
                    Không tìm thấy sản phẩm phù hợp.
                  </div>
                )}
              </div>
              
              {/* Pagination đơn giản */}
              <div className="mt-10 flex justify-center space-x-2">
                <button 
                  disabled={filters.page <= 1}
                  onClick={() => setFilters({...filters, page: filters.page - 1})}
                  className="px-4 py-2 border hover:bg-black hover:text-white disabled:opacity-30"
                >
                  Prev
                </button>
                <span className="px-4 py-2 border bg-gray-100">{filters.page}</span>
                <button 
                  // Logic disable nút Next cần thêm info total_pages từ API response, tạm thời để mở
                  onClick={() => setFilters({...filters, page: filters.page + 1})}
                  className="px-4 py-2 border hover:bg-black hover:text-white"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;