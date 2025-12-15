import db from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import { Sequelize } from 'sequelize'; // 👈 Import thêm để dùng hàm đếm (COUNT)

// ... (Hàm addReview cũ giữ nguyên)

// 28. Lấy danh sách đánh giá (Get Reviews by Product ID)
const getProductReviews = asyncHandler(async (req, res) => {
  const { id } = req.params; // Lấy product_id từ URL
  const { page = 1, limit = 10, star, sort } = req.query;

  const offset = (page - 1) * limit;

  // 1. Xây dựng bộ lọc (Filter)
  const whereClause = {
    product_id: id,
    is_hidden: false
  };

  // Nếu có lọc theo số sao (VD: ?star=5)
  if (star) {
    whereClause.rating = star;
  }

  // 2. Xử lý sắp xếp (Sort)
  let orderClause = [['created_at', 'DESC']]; // Mặc định: Mới nhất
  if (sort === 'highest') {
    orderClause = [['rating', 'DESC']]; // Điểm cao nhất
  }
  // (Nếu muốn thêm 'lowest' thì thêm else if vào đây)

  // 3. Query DB: Lấy danh sách review
  const { count, rows } = await db.Review.findAndCountAll({
    where: whereClause,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: orderClause,
    include: [
      {
        model: db.User,
        as: 'user',
        attributes: ['full_name', 'avatar_url']
      },
      {
        model: db.ProductVariant,
        as: 'variant',
        attributes: ['size', 'color_name']
      }
    ]
  });

  // 4. Query DB: Thống kê số lượng từng sao (Group By)
  // Kết quả thô sẽ dạng: [{ rating: 5, count: 10 }, { rating: 4, count: 2 }]
  const ratingStats = await db.Review.findAll({
    where: { product_id: id, is_hidden: false },
    attributes: [
      'rating',
      [Sequelize.fn('COUNT', Sequelize.col('rating')), 'count']
    ],
    group: ['rating']
  });

  // Chuyển đổi format ratingStats sang object { "5": 10, "4": 2, ... }
  const ratingCounts = { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 };
  ratingStats.forEach(stat => {
    ratingCounts[stat.rating] = parseInt(stat.dataValues.count);
  });

  const product = await db.Product.findByPk(id, {
    attributes: ['average_rating']
  });

  const formattedReviews = rows.map(review => ({
    review_id: review.review_id,
    user_name: review.user ? review.user.full_name : 'Ẩn danh',
    avatar_url: review.user ? review.user.avatar_url : null,
    rating: review.rating,
    content: review.comment,
    created_at: review.created_at,
    variant_info: review.variant
      ? `Màu: ${review.variant.color_name}, Size: ${review.variant.size}`
      : null
  }));

  return res.status(200).json({
    average_rating: parseFloat(product?.average_rating || 0),
    total_reviews: count,
    rating_counts: ratingCounts,
    reviews: formattedReviews
  });
});

const submitReview = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { id } = req.params;
  const { order_id, rating, content } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Số sao phải từ 1 đến 5' });
  }

  if (content && content.length < 10) {
    return res.status(400).json({ message: 'Nội dung đánh giá quá ngắn (tối thiểu 10 ký tự).' });
  }

  // 2. VERIFIED PURCHASE CHECK (Quan trọng)
  // Tìm đơn hàng theo đúng order_id user gửi lên
  const order = await db.Order.findOne({
    where: {
      order_id: order_id,
      user_id: userId,
      status: 'completed' // Bắt buộc đơn phải giao thành công
    },
    include: [
      {
        model: db.OrderItem,
        as: 'items',
        required: true,
        include: [
          {
            model: db.ProductVariant,
            as: 'variant',
            where: { product_id: id },
            required: true
          }
        ]
      }
    ]
  });

  if (!order) {
    return res.status(403).json({
      error_code: "NOT_VERIFIED_PURCHASE",
      message: "Bạn cần mua và nhận hàng thành công trước khi đánh giá sản phẩm này."
    });
  }

  const variantId = order.items[0].variant_id;

  const existingReview = await db.Review.findOne({
    where: { user_id: userId, product_id: id }
  });

  if (existingReview) {
    return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi.' });
  }

  // 4. (TẠM BỎ QUA AI FILTER TẠI ĐÂY)
  // Nếu sau này làm AI, sẽ check content ở bước này.

  // 5. TẠO REVIEW
  const newReview = await db.Review.create({
    user_id: userId,
    product_id: id,
    variant_id: variantId,
    rating,
    comment: content
  });

  const reviews = await db.Review.findAll({
    where: { product_id: id },
    attributes: ['rating']
  });

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = (totalRating / reviews.length).toFixed(1);

  await db.Product.update(
    {
      average_rating: avgRating,
      review_count: reviews.length
    },
    { where: { product_id: id } }
  );

  return res.status(201).json({
    message: "Đánh giá của bạn đã được đăng thành công",
    review_id: newReview.review_id
  });
});
export default {
  submitReview,
  getProductReviews
};