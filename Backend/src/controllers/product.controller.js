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


const getInventory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, sort, brand_id, category_id } = req.body;
  const offset = (page - 1) * limit;

  const productWhere = {};
  const variantWhere = {};

  if (search) {
    productWhere.name = { [Op.iLike]: `%${search}%` };
  }
  if (brand_id) {
    productWhere.brand_id = brand_id;
  }
  if (category_id) {
    productWhere.category_id = category_id;
  }
  let orderClause = [['created_at', 'DESC']];
  if (sort === 'stock_asc') {
    orderClause = [
      [db.sequelize.literal('(SELECT COALESCE(SUM("stock_quantity"), 0) FROM "product_variants" WHERE "product_variants"."product_id" = "Product"."product_id")'), 'ASC']
    ];
  } else if (sort === 'stock_desc') {
    orderClause = [
      [db.sequelize.literal('(SELECT COALESCE(SUM("stock_quantity"), 0) FROM "product_variants" WHERE "product_variants"."product_id" = "Product"."product_id")'), 'DESC']
    ];
  } else if (sort === 'price_asc') {
    orderClause = [['base_price', 'ASC']];
  } else if (sort === 'price_desc') {
    orderClause = [['base_price', 'DESC']];
  } else if (sort === 'name_asc') {
    orderClause = [['name', 'ASC']];
  } else if (sort === 'name_desc') {
    orderClause = [['name', 'DESC']];
  }

  const { count, rows } = await db.Product.findAndCountAll({
    where: productWhere,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: orderClause,
    distinct: true,
    include: [
      {
        model: db.ProductVariant,
        as: 'variants',
        where: Object.keys(variantWhere).length > 0 ? variantWhere : undefined,
        required: false,
        order: [['stock_quantity', 'ASC']]
      },
      {
        model: db.ProductMedia,
        as: 'media',
        where: { is_thumbnail: true },
        limit: 1,
        required: false,
        attributes: ['url']
      },
      {
        model: db.Brand,
        as: 'brand',
        attributes: ['brand_id', 'name']
      },
      {
        model: db.Category,
        as: 'category',
        attributes: ['category_id', 'name']
      }
    ]
  });

  const formattedData = rows.map(product => {
    const basePrice = parseFloat(product.base_price || 0);
    const variants = product.variants || [];

    const totalStock = variants.reduce((sum, v) => sum + v.stock_quantity, 0);

    const mappedVariants = variants.map(v => ({
      variant_id: v.variant_id,
      sku: v.sku,
      attribute: `${v.color_name || '?'} / ${v.size || '?'}`,

      color_name: v.color_name,
      size: v.size,

      original_price: basePrice,
      price_modifier: parseFloat(v.price_modifier || 0),
      final_price: basePrice + parseFloat(v.price_modifier || 0), // Giá bán cuối

      stock_quantity: v.stock_quantity,
      status: v.stock_quantity <= 5 ? 'low_stock' : 'in_stock',
    }));

    return {
      product_id: product.product_id,
      product_name: product.name,
      image: product.media?.[0]?.url || 'https://via.placeholder.com/150',
      description: product.description || '',
      brand_id: product.brand?.brand_id || null,
      brand_name: product.brand?.name || 'Chưa cập nhật',

      category_id: product.category?.category_id || null,
      category_name: product.category?.name || 'Chưa cập nhật',

      total_stock: totalStock,
      total_variants: variants.length,
      variants: mappedVariants
    };
  });

  return res.status(200).json({
    message: "Lấy danh sách kho hàng thành công",
    meta: {
      current_page: parseInt(page),
      total_pages: Math.ceil(count / limit),
      total_items: count,
      items_per_page: parseInt(limit)
    },
    data: formattedData
  });
});

const updateProductMaster = asyncHandler(async (req, res) => {
  const { id } = req.params; // Product ID
  const {
    name,
    description,
    base_price,
    brand_id,     // <-- Nhận ID thương hiệu
    category_id,  // <-- Nhận ID danh mục
    is_active,    // <-- Trạng thái
    ar_model_url,

    // Danh sách variants cần update
    variants_update
  } = req.body;

  const t = await db.sequelize.transaction();

  try {
    // 1. Update Product Cha
    const product = await db.Product.findByPk(id, { transaction: t });
    if (!product) {
      await t.rollback();
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const newBasePrice = base_price !== undefined ? parseFloat(base_price) : parseFloat(product.base_price);

    await product.update({
      name,
      description,
      base_price: newBasePrice,
      brand_id,
      category_id,
      is_active,
      ...(ar_model_url !== undefined && { ar_model_url })
    }, { transaction: t });

    if (variants_update && Array.isArray(variants_update)) {
      for (const item of variants_update) {
        if (item.variant_id) {


          let newModifier = undefined;

          if (item.final_price !== undefined) {
            newModifier = parseFloat(item.final_price) - newBasePrice;
          } else if (item.price_modifier !== undefined) {
            newModifier = item.price_modifier;
          }

          const updateData = {};
          if (item.stock_quantity !== undefined) updateData.stock_quantity = item.stock_quantity;
          if (newModifier !== undefined) updateData.price_modifier = newModifier;
          if (item.sku) updateData.sku = item.sku; // Cho phép sửa SKU

          if (Object.keys(updateData).length > 0) {
            await db.ProductVariant.update(
              updateData,
              {
                where: {
                  variant_id: item.variant_id,
                  product_id: id
                },
                transaction: t
              }
            );
          }
        }
      }
    }

    await t.commit();

    return res.status(200).json({
      message: "Cập nhật sản phẩm thành công!",
      data: { product_id: id }
    });

  } catch (error) {
    await t.rollback();
    console.error("Master Update Error:", error);
    return res.status(500).json({ message: "Lỗi cập nhật sản phẩm", error: error.message });
  }
});

const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    base_price,
    brand_id,
    category_id,
    image_url,
    is_active = true
  } = req.body;

  if (!name || !base_price) {
    return res.status(400).json({ message: "Tên và giá gốc là bắt buộc" });
  }

  const t = await db.sequelize.transaction();

  try {
    const newProduct = await db.Product.create({
      name,
      description,
      base_price: parseFloat(base_price),
      brand_id: brand_id || null,
      category_id: category_id || null,
      is_active,
      sold_count: 0,
      average_rating: 0
    }, { transaction: t });

    // Tạo ảnh thumbnail nếu có
    if (image_url) {
      await db.ProductMedia.create({
        product_id: newProduct.product_id,
        url: image_url,
        media_type: 'image',
        is_thumbnail: true
      }, { transaction: t });
    }

    // Tạm thời tạo 1 variant mặc định nếu muốn, hoặc để trống
    // Logic: Nếu không có variant, sản phẩm có thể không hiện lên ở một số chỗ query inner join
    // Tạo 1 variant mặc định: Free Size / Default Color
    await db.ProductVariant.create({
      product_id: newProduct.product_id,
      color_name: 'Default',
      color_hex: '#000000',
      size: 'Free',
      sku: `SKU-${newProduct.product_id}-${Date.now()}`,
      stock_quantity: 0,
      price_modifier: 0
    }, { transaction: t });

    await t.commit();

    return res.status(201).json({
      message: "Tạo sản phẩm thành công!",
      data: newProduct
    });

  } catch (error) {
    await t.rollback();
    console.error("Create Product Error:", error);
    return res.status(500).json({ message: "Lỗi tạo sản phẩm", error: error.message });
  }
});

const addProductVariant = asyncHandler(async (req, res) => {
  const { id } = req.params; // product_id
  const {
    sku,
    color_name,
    color_hex,
    size,
    stock_quantity,
    price_modifier // chênh lệch so với giá gốc
  } = req.body;

  if (!sku) {
    return res.status(400).json({ message: "SKU là bắt buộc" });
  }

  // Check product exists
  const product = await db.Product.findByPk(id);
  if (!product) {
    return res.status(404).json({ message: "Sản phẩm không tồn tại" });
  }

  // Check SKU unique
  const existingSku = await db.ProductVariant.findOne({ where: { sku } });
  if (existingSku) {
    return res.status(400).json({ message: "Mã SKU này đã tồn tại!" });
  }

  const newVariant = await db.ProductVariant.create({
    product_id: id,
    sku,
    color_name,
    color_hex: color_hex || '#000000',
    size,
    stock_quantity: parseInt(stock_quantity) || 0,
    price_modifier: parseFloat(price_modifier) || 0
  });

  return res.status(201).json({
    message: "Thêm biến thể thành công!",
    data: newVariant
  });
});

export default {
  searchProducts, getFilterMetadata, getTrendingProducts, getProductDetail, getInventory, updateProductMaster, createProduct, addProductVariant
};