import db from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import { Op } from 'sequelize';

const getStats = asyncHandler(async (req, res) => {
  const [revenue, totalOrders, pendingOrders, lowStockVariants] = await Promise.all([

    db.Order.sum('total_amount', {
      where: { payment_status: 'paid' }
    }),

    db.Order.count(),

    db.Order.count({
      where: { status: 'pending' }
    }),

    db.ProductVariant.count({
      where: {
        stock_quantity: {
          [Op.lte]: 5
        }
      }
    })
  ]);

  const finalRevenue = revenue || 0;

  return res.status(200).json({
    message: "Lấy thống kê Dashboard thành công",
    data: {
      revenue: parseFloat(finalRevenue),
      total_orders: totalOrders,
      pending_orders: pendingOrders,
      low_stock_variants: lowStockVariants
    }
  });
});

// API 2: Lấy Top 5 biến thể bán chạy nhất
const getTopSellingProducts = asyncHandler(async (req, res) => {
  // B1: Lấy top variant_id dựa trên số lượng bán (nhóm theo variant_id)
  const topVariantsRaw = await db.OrderItem.findAll({
    attributes: [
      'variant_id',
      [db.sequelize.fn('SUM', db.sequelize.col('quantity')), 'total_sold']
    ],
    group: ['variant_id'],
    order: [[db.sequelize.literal('total_sold'), 'DESC']],
    limit: 5
  });

  const topVariantIds = topVariantsRaw.map(item => item.variant_id);

  // B2: Lấy thông tin chi tiết của các variant cùng với Product và Media (ảnh)
  const detailedVariants = await db.ProductVariant.findAll({
    where: {
      variant_id: {
        [Op.in]: topVariantIds
      }
    },
    include: [
      {
        model: db.Product,
        as: 'product',
        attributes: ['name'],
        include: [
          {
            model: db.ProductMedia,
            as: 'media',
            attributes: ['url'],
            // Ưu tiên lấy ảnh thumbnail, nếu không thì lấy ảnh bất kỳ
            required: false,
            where: { is_thumbnail: true }
          }
        ]
      }
    ]
  });

  // Nếu không tìm thấy ảnh thumbnail, fallback có thể cần query lại hoặc xử lý ở frontend,
  // nhưng ở đây ta giả định data chuẩn hoặc chấp nhận null. 
  // Để chắc chắn hơn, ta có thể bỏ where is_thumbnail ở include trên và filter bằng JS,
  // nhưng để tối ưu query ta giữ nguyên, nếu null thì frontend hiển thị placeholder.

  // B3: Merge data và format
  const formattedData = topVariantsRaw.map(statItem => {
    const variantDetail = detailedVariants.find(v => v.variant_id === statItem.variant_id);

    if (!variantDetail) return null;

    const product = variantDetail.product;
    const totalSold = parseInt(statItem.dataValues.total_sold);
    const currentStock = variantDetail.stock_quantity;

    // Xử lý status
    let stockStatus = 'In Stock';
    if (currentStock === 0) stockStatus = 'Out of Stock';
    else if (currentStock <= 10) stockStatus = 'Low Stock';
    else if (currentStock >= 100) stockStatus = 'High Stock';

    // Lấy ảnh
    let imageUrl = null;
    if (product && product.media && product.media.length > 0) {
      imageUrl = product.media[0].url;
    }

    return {
      product_name: product ? product.name : 'Sản phẩm đã xóa',
      product_image: imageUrl,
      sku: variantDetail.sku,
      variant: `${variantDetail.size} / ${variantDetail.color_name}`,
      total_sold: totalSold,
      current_stock: currentStock,
      stock_status: stockStatus
    };
  }).filter(item => item !== null);

  return res.status(200).json({
    message: "Lấy top sản phẩm bán chạy thành công",
    data: formattedData
  });
});

// API 3: Biểu đồ doanh thu
const getRevenueChart = asyncHandler(async (req, res) => {
  const { period = '7days' } = req.query;

  let startDate = new Date();
  if (period === '7days') {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === '30days') {
    startDate.setDate(startDate.getDate() - 30);
  } else if (period === '90days') {
    startDate.setDate(startDate.getDate() - 90);
  } else {
    startDate.setDate(startDate.getDate() - 7);
  }


  const revenueData = await db.Order.findAll({
    attributes: [
      [db.sequelize.fn('DATE', db.sequelize.col('created_at')), 'date'],
      [db.sequelize.fn('SUM', db.sequelize.col('total_amount')), 'revenue']
    ],
    where: {
      payment_status: 'paid',
      created_at: {
        [Op.gte]: startDate
      }
    },
    group: [db.sequelize.fn('DATE', db.sequelize.col('created_at'))],
    order: [[db.sequelize.fn('DATE', db.sequelize.col('created_at')), 'ASC']]
  });

  return res.status(200).json({
    message: "Lấy dữ liệu biểu đồ thành công",
    data: revenueData
  });
});


export default {
  getStats,
  getTopSellingProducts,
  getRevenueChart
};