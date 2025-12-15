import db from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import { Op } from 'sequelize';

const searchProducts = asyncHandler(async (req, res) => {
  const {
    q,
    page = 1,
    limit = 12,
    sort_by = 'newest',
    brand_ids,
    category_ids,
    min_price,
    max_price,
  } = req.body;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(Math.max(1, parseInt(limit)), 100);

  if (min_price && (isNaN(min_price) || min_price < 0)) {
    return res.status(400).json({ message: 'Giá tối thiểu không hợp lệ' });
  }

  if (max_price && (isNaN(max_price) || max_price < 0)) {
    return res.status(400).json({ message: 'Giá tối đa không hợp lệ' });
  }

  const whereClause = {};

  if (q) {
    const sanitizedQuery = q.replace(/[%_]/g, '\\$&');
    whereClause.name = { [Op.iLike]: `%${sanitizedQuery}%` };
  }

  const parseIds = (ids) => {
    if (!ids) return [];
    if (Array.isArray(ids)) return ids.map(id => parseInt(id)).filter(id => !isNaN(id));
    if (typeof ids === 'string') return ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    return [];
  };

  const brandIdsArray = parseIds(brand_ids);
  const categoryIdsArray = parseIds(category_ids);

  if (brandIdsArray.length > 0) whereClause.brand_id = { [Op.in]: brandIdsArray };
  if (categoryIdsArray.length > 0) whereClause.category_id = { [Op.in]: categoryIdsArray };

  if (min_price || max_price) {
    whereClause.base_price = {};
    if (min_price) whereClause.base_price[Op.gte] = parseFloat(min_price);
    if (max_price) whereClause.base_price[Op.lte] = parseFloat(max_price);
  }

  const sortMap = {
    'price_asc': [['base_price', 'ASC']],
    'price_desc': [['base_price', 'DESC']],
    'newest': [['created_at', 'DESC']],
    'oldest': [['created_at', 'ASC']],
    'sold': [['sold_count', 'DESC']],
  };

  const order = sortMap[sort_by] || sortMap['newest'];
  const offset = (pageNum - 1) * limitNum;

  const { count, rows } = await db.Product.findAndCountAll({
    where: whereClause,
    limit: limitNum,
    offset: offset,
    order: order,
    include: [
      {
        model: db.Brand,
        as: 'brand',
        attributes: ['brand_id', 'name']
      },
      {
        model: db.Category,
        as: 'category',
        attributes: ['category_id', 'name']
      },
      {
        model: db.ProductMedia,
        as: 'media',
        where: { is_thumbnail: true },
        attributes: ['url'],
        required: false,
        limit: 1
      },
        {
        model: db.ProductVariant,
        as: 'variants',
        attributes: ['variant_id']
      }
    ],
    distinct: true
  });

const products = rows.map(p => {
    const product = p.toJSON();

    return {
      product_id: product.product_id,
      name: product.name,
      base_price: parseFloat(product.base_price),
      average_rating: parseFloat(product.average_rating),

      thumbnail: (product.media && product.media.length > 0) ? product.media[0].url : null,

      brand_name: product.brand ? product.brand.name : null,
      category_name: product.category ? product.category.name : null,

      total_variants: product.variants ? product.variants.length : 0,

      sold_count: product.sold_count || 0
    };
  });

  return res.status(200).json({
    meta: {
      total_items: count,
      total_pages: Math.ceil(count / limitNum),
      current_page: pageNum,
      limit: limitNum
    },
    data: products
  });
});

const getFilterMetadata = asyncHandler(async (req, res) => {
  const [brands, categories, minPrice, maxPrice, sizesData, colorsData] = await Promise.all([

    db.Brand.findAll({
      attributes: ['brand_id', 'name'],
      order: [['name', 'ASC']]
    }),

    db.Category.findAll({
      attributes: ['category_id', 'name'],
      order: [['name', 'ASC']]
    }),

    db.Product.min('base_price'),

    db.Product.max('base_price'),

    db.ProductVariant.findAll({
      attributes: [
        [db.Sequelize.fn('DISTINCT', db.Sequelize.col('size')), 'size']
      ],
      order: [['size', 'ASC']],
      raw: true
    }),

    db.ProductVariant.findAll({
      attributes: [
        [db.Sequelize.fn('DISTINCT', db.Sequelize.col('color_name')), 'name'],
        'color_hex'
      ],
      // Group by để loại bỏ các cặp trùng nhau (VD: 10 đôi giày đều màu Đỏ thì chỉ lấy 1)
      group: ['color_name', 'color_hex'],
      raw: true
    })
  ]);

  // xử lý lại mảng Sizes (chuyển từ [{size: "38"}, {size: "39"}] -> ["38", "39"])
  const distinctSizes = sizesData
    .map(item => item.size)
    .filter(s => s) // Lọc bỏ giá trị null/rỗng
    .sort((a, b) => parseFloat(a) - parseFloat(b)); // Sắp xếp theo số (38, 39, 40...)

  const distinctColors = colorsData.map(c => ({
    name: c.name,
    hex: c.color_hex || '#000000' // Mặc định nếu ko có hex
  }));

  return res.status(200).json({
    brands: brands,
    categories: categories,
    sizes: distinctSizes,
    colors: distinctColors,
    price_range: {
      min: parseFloat(minPrice) || 0,
      max: parseFloat(maxPrice) || 0
    }
  });
});


const getTrendingProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const products = await db.Product.findAll({
    order: [['sold_count', 'DESC']],
    limit: limit,
    attributes: ['product_id', 'name', 'base_price', 'average_rating', 'sold_count'],
    include: [
      {
        model: db.ProductMedia,
        as: 'media',
        where: { is_thumbnail: true },
        attributes: ['url'],
        required: false,
        limit: 1
      },
      {
        model: db.Brand,
        as: 'brand',
        attributes: ['name']
      }
    ]
  });

  const data = products.map(p => {
    const product = p.toJSON();
    return {
      product_id: product.product_id,
      name: product.name,
      base_price: parseFloat(product.base_price),
      average_rating: parseFloat(product.average_rating),
      sold_count: product.sold_count,
      thumbnail: (product.media && product.media.length > 0) ? product.media[0].url : null,
        brand_name: product.brand ? product.brand.name : null
    };
  });

  return res.status(200).json({
    message: 'Lấy top bán chạy thành công',
    data: data
  });
});

const getProductDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await db.Product.findOne({
    where: { product_id: id },
    include: [
      {
        model: db.Brand,
        as: 'brand',
        attributes: ['brand_id', 'name', 'logo_url']
      },
      {
        model: db.Category,
        as: 'category',
        attributes: ['category_id', 'name']
      },
      {
        model: db.ProductMedia,
        as: 'media',
        attributes: ['media_id', 'url', 'media_type', 'is_thumbnail']
      },
      {
        model: db.ProductVariant,
        as: 'variants',
        attributes: ['variant_id', 'sku', 'color_name', 'color_hex', 'size', 'stock_quantity', 'price_modifier']
      }
    ]
  });

  if (!product) {
    return res.status(404).json({ message: 'Sản phẩm không tồn tại!' });
  }

  const p = product.toJSON();
  const basePrice = parseFloat(p.base_price);

  const formattedVariants = p.variants.map(v => {
    const modifier = parseFloat(v.price_modifier) || 0;
    return {
      variant_id: v.variant_id,
      sku: v.sku,
      color_name: v.color_name,
      color_hex: v.color_hex || '#000000', // Mặc định đen nếu null
      size: v.size,
      stock_quantity: v.stock_quantity,
      final_price: basePrice + modifier
    };
  });

  return res.status(200).json({
    product_id: p.product_id,
    name: p.name,
    base_price: basePrice,
    average_rating: parseFloat(p.average_rating),
    description: p.description,

    brand: p.brand,
    category: p.category,

    media: p.media,

    variants: formattedVariants
  });
});

export default {
  searchProducts,getFilterMetadata,getTrendingProducts,  getProductDetail
};