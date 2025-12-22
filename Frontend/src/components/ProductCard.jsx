import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/format';
import { FiShoppingCart } from 'react-icons/fi';

const ProductCard = ({ product }) => {
  const imageUrl = product.thumbnail || 'https://via.placeholder.com/300x300?text=No+Image';

  return (
    <div className="group relative bg-white border border-gray-100 hover:border-black transition-all duration-300 overflow-hidden">
      
      {/* 1. Image Section */}
      <Link to={`/product/${product.product_id}`} className="block overflow-hidden relative pt-[100%]">
        <img
          src={imageUrl}
          alt={product.name}
          className="absolute top-0 left-0 w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Badge Mới (Nếu có logic check hàng mới) */}
        {/* <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
          New
        </span> */}
      </Link>

      {/* 2. Info Section */}
      <div className="p-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide truncate">
          <Link to={`/product/${product.product_id}`}>
            {product.name}
          </Link>
        </h3>
        
        <div className="mt-2 flex items-center justify-between">
          <span className="text-base font-medium text-gray-900">
            {formatCurrency(product.base_price)}
          </span>
          
          {/* Nút xem chi tiết (chỉ hiện icon) */}
          <Link
            to={`/product/${product.product_id}`}
            className="flex items-center gap-1 text-gray-400 hover:text-black transition-colors font-semibold"
          >
            <FiShoppingCart size={18} />
            <span className="text-xs">Xem chi tiết</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;