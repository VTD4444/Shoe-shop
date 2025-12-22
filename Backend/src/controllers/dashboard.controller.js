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
  const topVariants = await db.OrderItem.findAll({
    attributes: [
      'variant_id',
      [db.sequelize.fn('SUM', db.sequelize.col('quantity')), 'total_sold'] // Hàm tính tổng
    ],
    group: ['OrderItem.variant_id', 'variant.variant_id', 'variant->product.product_id'], // Group by để tính tổng
    order: [[db.sequelize.literal('total_sold'), 'DESC']],
    limit: 5,
    include: [
      {
        model: db.ProductVariant,
        as: 'variant',
        attributes: ['sku', 'size', 'color_name', 'stock_quantity'],
        include: [
          {
            model: db.Product,
            as: 'product',
            attributes: ['name']
          }
        ]
      }
    ]
  });

  const formattedData = topVariants.map(item => {
    const variant = item.variant;
    return {
      variant_id: item.variant_id,
      product_name: variant ? variant.product.name : 'Sản phẩm đã xóa',
      sku: variant ? variant.sku : 'N/A',
      attribute: variant ? `${variant.color_name} / ${variant.size}` : 'N/A',
      total_sold: parseInt(item.dataValues.total_sold),
      current_stock: variant ? variant.stock_quantity : 0
    };
  });

  return res.status(200).json({
    message: "Lấy top sản phẩm bán chạy thành công",
    data: formattedData
  });
});

export default {
  getStats,
  getTopSellingProducts
};