import React, { useEffect, useState } from 'react';
import productService from '../services/productService';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await productService.getTrending(8);
        // API trả về: { message: "...", data: [...] }
        setTrendingProducts(response.data || []);
      } catch (error) {
        console.error("Lỗi tải trending:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div>
      {/* 1. HERO SECTION (Giữ nguyên như cũ) */}
      <section className="bg-black text-white py-20 px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
          Future Footwear
        </h1>
        <p className="text-gray-400 mb-8">Công nghệ thử giày 3D & AI hàng đầu.</p>
        <Link to="/products" className="bg-white text-black px-8 py-3 font-bold uppercase tracking-widest hover:bg-gray-200">
          Mua ngay
        </Link>
      </section>

      {/* 2. TRENDING SECTION */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold uppercase tracking-wide">Top Bán Chạy</h2>
          <Link to="/products" className="text-sm underline">Xem tất cả</Link>
        </div>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;