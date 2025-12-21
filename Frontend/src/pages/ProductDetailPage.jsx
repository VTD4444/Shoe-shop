import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import productService from '../services/productService';
import { formatCurrency } from '../utils/format';
import { FiBox, FiImage, FiX } from 'react-icons/fi';
import Model3DViewer from '../components/Model3DViewer';
import ShoeTryOn from '../components/ShoeTryOn';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { addToCart } from '../redux/slices/cartSlice';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State cho lựa chọn của user
  const [selectedColor, setSelectedColor] = useState(null); // Lưu color_name (VD: "Red")
  const [selectedSize, setSelectedSize] = useState(null);   // Lưu size (VD: "42")
  const [activeImage, setActiveImage] = useState(null);     // Ảnh đang hiển thị to
  const [is3DMode, setIs3DMode] = useState(false); // Chế độ xem 3D
  const [isTryOnOpen, setIsTryOnOpen] = useState(false); // Panel thử giày ảo
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await productService.getDetail(id);
        setProduct(data);
        // Set ảnh default là ảnh đầu tiên hoặc ảnh thumbnail
        if (data.media && data.media.length > 0) {
          setActiveImage(data.media.find(m => m.is_thumbnail)?.url || data.media[0].url);
        }
      } catch (error) {
        console.error("Lỗi tải chi tiết:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!product) return <div className="text-center py-20">Không tìm thấy sản phẩm</div>;

  // LOGIC XỬ LÝ BIẾN THỂ (VARIANTS)
  // 1. Lấy danh sách màu duy nhất
  const uniqueColors = [...new Set(product.variants.map(v => v.color_name))].filter(Boolean);

  // 2. Lấy danh sách size duy nhất
  const uniqueSizes = [...new Set(product.variants.map(v => v.size))].sort();

  // 3. Tìm variant khớp với selection
  const currentVariant = product.variants.find(
    v => v.color_name === selectedColor && v.size === selectedSize
  );

  // 4. Kiểm tra tồn kho
  const isOutOfStock = currentVariant && currentVariant.stock_quantity <= 0;

  // 5. Tính giá (nếu chọn variant thì lấy final_price, ko thì lấy base_price)
  const displayPrice = currentVariant ? currentVariant.final_price : product.base_price;

  // 6. Tìm model 3D (nếu có)
  const model3D = product.media.find(m => m.media_type === '3d_model');

  // Hàm chuyển đổi chế độ xem
  const toggle3DMode = () => {
    setIs3DMode(!is3DMode);
  };

  // Hàm xử lý thêm vào giỏ
  const handleAddToCart = async () => {
    // 1. Validate Login
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để mua hàng!");
      navigate('/login');
      return;
    }

    // 2. Validate Variant
    if (!currentVariant) {
      toast.error("Vui lòng chọn Size và Màu sắc!");
      return;
    }
    if (isOutOfStock) {
      toast.warning("Sản phẩm tạm hết hàng!");
      return;
    }

    // 3. Gọi API qua Redux Thunk
    // Chỉ cần gửi variant_id và quantity
    const resultAction = await dispatch(addToCart({
      variant_id: currentVariant.variant_id,
      quantity: 1
    }));

    if (addToCart.fulfilled.match(resultAction)) {
      toast.success("Đã thêm vào giỏ hàng!");
    } else {
      toast.error(resultAction.payload || "Lỗi thêm giỏ hàng");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* === LEFT: MEDIA VIEWER === */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 relative overflow-hidden rounded-lg shadow-inner">

            {/* LOGIC HIỂN THỊ CHÍNH */}
            {is3DMode && model3D ? (
              // Nếu đang bật mode 3D -> Hiện Viewer, truyền tên file (VD: nike.glb)
              <Model3DViewer fileName={model3D.url} />
            ) : (
              // Ngược lại -> Hiện ảnh
              <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
            )}

            {/* Nút Toggle 3D/Image */}
            {model3D && (
              <button
                onClick={toggle3DMode}
                className={`absolute bottom-4 right-4 px-4 py-2 text-sm font-bold flex items-center space-x-2 shadow-lg transition-all transform hover:scale-105
                  ${is3DMode
                    ? 'bg-white text-black border border-black' // Style nút khi đang xem 3D (để tắt)
                    : 'bg-black text-white' // Style nút khi đang xem ảnh (để bật)
                  }`}
              >
                {is3DMode ? (
                  <>
                    <FiImage size={18} /> <span>XEM ẢNH</span>
                  </>
                ) : (
                  <>
                    <FiBox size={18} /> <span>XEM 3D</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Thumbnails List */}
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {product.media.filter(m => m.media_type === 'image').map((media) => (
              <img
                key={media.media_id}
                src={media.url}
                alt="thumbnail"
                onClick={() => setActiveImage(media.url)}
                className={`w-20 h-20 object-cover cursor-pointer border-2 ${activeImage === media.url ? 'border-black' : 'border-transparent'}`}
              />
            ))}
          </div>
        </div>

        {/* === RIGHT: PRODUCT INFO === */}
        <div>
          <h2 className="text-gray-500 uppercase tracking-widest text-sm mb-2">
            {product.brand?.name} - {product.category?.name}
          </h2>
          <h1 className="text-4xl font-black uppercase mb-4">{product.name}</h1>

          <div className="text-2xl font-medium mb-8">
            {formatCurrency(displayPrice)}
          </div>

          <p className="text-gray-600 mb-8 leading-relaxed">
            {product.description}
          </p>

          {/* Selector: COLOR */}
          {uniqueColors.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-sm uppercase mb-3">Màu sắc</h3>
              <div className="flex space-x-3">
                {uniqueColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all
                      ${selectedColor === color ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:border-black'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selector: SIZE */}
          {uniqueSizes.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between mb-3">
                <h3 className="font-bold text-sm uppercase">Size</h3>
                <button className="text-xs underline text-gray-500">Hướng dẫn chọn size</button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {uniqueSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 border text-sm font-bold transition-all
                      ${selectedSize === size ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-200 hover:border-black'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!currentVariant || isOutOfStock}
            className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-4"
          >
            {!currentVariant
              ? "Vui lòng chọn Size & Màu"
              : isOutOfStock
                ? "Hết hàng"
                : "Thêm vào giỏ hàng"}
          </button>


          {/* Nút Thử Giày Ảo */}
          <button
            onClick={() => setIsTryOnOpen(true)}
            className="w-full border border-black text-black py-4 font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
          >
            Thử trên chân (AI Try-on)
          </button>

          {/* Panel toàn màn hình cho Try On */}
          {isTryOnOpen && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center">
              <div className="w-full h-full flex flex-col items-center justify-center relative">
                <div className="mb-4 text-white text-lg font-semibold drop-shadow-lg">Hướng camera về phía chân bạn <button
                  onClick={() => setIsTryOnOpen(false)}
                  className="ml-20 text-white text-3xl p-2 rounded-full hover:bg-white hover:text-black transition"
                  aria-label="Đóng thử giày"
                >
                  <FiX />
                </button></div>
                <ShoeTryOn />
                {/* Logo che DeepAR.ai */}
                <img
                  src="/logo.png"
                  alt="Shoe Shop Logo"
                  className="absolute top-20 right-8 z-20 w-64 h-auto opacity-95 pointer-events-none select-none"
                  style={{ maxWidth: '350px' }}
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;