import db from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';

const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { variant_id, quantity } = req.body;

  const qty = parseInt(quantity) || 1;

  const variant = await db.ProductVariant.findByPk(variant_id);
  if (!variant) {
    return res.status(404).json({ message: 'Sản phẩm (biến thể) không tồn tại!' });
  }

  if (variant.stock_quantity < qty) {
    return res.status(400).json({ message: `Kho chỉ còn ${variant.stock_quantity} sản phẩm!` });
  }

  const existingItem = await db.CartItem.findOne({
    where: {
      user_id: userId,
      variant_id: variant_id
    }
  });

  if (existingItem) {
    const newQty = existingItem.quantity + qty;

    if (variant.stock_quantity < newQty) {
      return res.status(400).json({ message: 'Số lượng trong giỏ vượt quá tồn kho!' });
    }

    existingItem.quantity = newQty;
    await existingItem.save();

    return res.status(200).json({ message: 'Đã cập nhật số lượng trong giỏ', data: existingItem });

  } else {
    const newItem = await db.CartItem.create({
      user_id: userId,
      variant_id: variant_id,
      quantity: qty
    });

    return res.status(201).json({ message: 'Đã thêm vào giỏ hàng', data: newItem });
  }
});

const getCart = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;

  const cartItems = await db.CartItem.findAll({
    where: { user_id: userId },
    include: [
      {
        model: db.ProductVariant,
        as: 'variant',
        attributes: ['variant_id', 'sku', 'color_name', 'size', 'stock_quantity', 'price_modifier'],
        include: [
          {
            model: db.ProductMedia,
            as: 'variant_media',
            limit: 1
          },
          {
            model: db.Product,
              as: 'product',
            attributes: ['name', 'base_price',"product_id"],
            include: [
              {
                model: db.ProductMedia,
                as: 'media',
                where: { is_thumbnail: true },
                attributes: ['url'],
                required: false,
                limit: 1
              }
            ]
          }
        ]
      }
    ],
    order: [['created_at', 'DESC']]
  });


  let totalPrice = 0;
  let totalItems = 0;
    console.log(JSON.stringify(cartItems, null, 2));
  const formattedItems = cartItems.map(item => {
    if (!item.variant || !item.variant.product) return null;
    const variant = item.variant;
    const product = variant.product;

    // --- LOGIC CHỌN ẢNH THÔNG MINH ---
    let finalThumbnail = null;

    if (variant.variant_media && variant.variant_media.length > 0) {
      finalThumbnail = variant.variant_media[0].url;
    }
    else if (product.media && product.media.length > 0) {
      finalThumbnail = product.media[0].url;
    }

    // Tính giá
    const unitPrice = parseFloat(product.base_price) + (parseFloat(variant.price_modifier) || 0);
    totalPrice += unitPrice * item.quantity;
    totalItems += item.quantity;

    return {
      cart_item_id: item.cart_item_id,
      variant_id: variant.variant_id,
      product_name: product.name,
      sku: variant.sku,
      quantity: item.quantity,
      price_per_item: unitPrice,
      thumbnail: finalThumbnail,
      size: variant.size,
      color: variant.color_name,
      max_stock: variant.stock_quantity
    };
  }).filter(i => i !== null);

  return res.status(200).json({
    message: "Lấy giỏ hàng thành công",
    total_items: totalItems,
    total_price: totalPrice,
    items: formattedItems
  });
});


const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { id } = req.params;
  const { quantity } = req.body;

  const newQty = parseInt(quantity);
  if (!newQty || newQty <= 0) {
    return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
  }

  const cartItem = await db.CartItem.findOne({
    where: {
      cart_item_id: id,
      user_id: userId
    },
    include: [
      {
        model: db.ProductVariant,
        as: 'variant',
        include: [{ model: db.Product, as: 'product' }]
      }
    ]
  });

  if (!cartItem) {
    return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
  }

  const variant = cartItem.variant;
  if (variant.stock_quantity < newQty) {
    return res.status(400).json({ message: `Kho chỉ còn ${variant.stock_quantity} sản phẩm!` });
  }

  cartItem.quantity = newQty;
  await cartItem.save();

  const unitPrice = parseFloat(variant.product.base_price) + (parseFloat(variant.price_modifier) || 0);
  const newItemTotal = unitPrice * newQty;

  return res.status(200).json({
    message: 'Cập nhật thành công',
    item_total: newItemTotal
  });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { id } = req.params;

  const deletedCount = await db.CartItem.destroy({
    where: {
      cart_item_id: id,
      user_id: userId
    }
  });

  if (deletedCount === 0) {
    return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa' });
  }

  return res.status(200).json({ message: 'Đã xóa sản phẩm khỏi giỏ' });
});

export default {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem
};
