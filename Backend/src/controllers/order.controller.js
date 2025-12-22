import db from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Op } from "sequelize";

const previewOrder = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { address_id, voucher_code, shipping_method } = req.body;

  const cartItems = await db.CartItem.findAll({
    where: { user_id: userId },
    include: [
      {
        model: db.ProductVariant,
        as: "variant",
        include: [{ model: db.Product, as: "product" }],
      },
    ],
  });

  if (cartItems.length === 0) {
    return res.status(400).json({ message: "Giỏ hàng trống!" });
  }

  let merchandiseSubtotal = 0;
  cartItems.forEach((item) => {
    if (item.variant && item.variant.product) {
      const price =
        parseFloat(item.variant.product.base_price) +
        (parseFloat(item.variant.price_modifier) || 0);
      merchandiseSubtotal += price * item.quantity;
    }
  });

  let shippingFee = 0;
  let shippingAddress = null;

  if (address_id) {
    const address = await db.Address.findOne({
      where: { address_id, user_id: userId },
    });
    if (address) {
      shippingAddress = address;
      const city = address.city.toLowerCase();
      if (
        city.includes("hà nội") ||
        city.includes("hồ chí minh") ||
        city.includes("ha noi") ||
        city.includes("ho chi minh")
      ) {
        shippingFee = 15000;
      } else {
        shippingFee = 30000;
      }

      if (shipping_method === "express") shippingFee += 10000;
    }
  }

  let discountAmount = 0;
  let voucherInfo = null;

  if (voucher_code) {
    const voucher = await db.Voucher.findOne({
      where: {
        code: voucher_code,
        is_active: true,
        valid_from: { [Op.lte]: new Date() },
        valid_to: { [Op.gte]: new Date() },
      },
    });

    if (!voucher) {
      voucherInfo = { valid: false, message: "Mã không tồn tại hoặc hết hạn" };
    } else {
      if (merchandiseSubtotal < parseFloat(voucher.min_order_value)) {
        voucherInfo = {
          valid: false,
          message: `Đơn hàng phải từ ${parseFloat(
            voucher.min_order_value
          ).toLocaleString()}đ`,
        };
      } else {
        if (voucher.discount_type === "percent") {
          discountAmount =
            merchandiseSubtotal * (parseFloat(voucher.discount_value) / 100);
        } else {
          discountAmount = parseFloat(voucher.discount_value);
        }

        if (discountAmount > merchandiseSubtotal)
          discountAmount = merchandiseSubtotal;

        voucherInfo = {
          valid: true,
          voucher_id: voucher.voucher_id,
          code: voucher.code,
          discount_value: discountAmount,
        };
      }
    }
  }

  const finalTotal = merchandiseSubtotal + shippingFee - discountAmount;

  return res.status(200).json({
    merchandise_subtotal: merchandiseSubtotal,
    shipping_fee: shippingFee,
    shipping_address: shippingAddress,
    discount_amount: discountAmount,
    voucher_info: voucherInfo,
    final_total: finalTotal,
  });
});
const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { address_id, payment_method, shipping_method, voucher_code, note } =
    req.body;

  const cartItems = await db.CartItem.findAll({
    where: { user_id: userId },
    include: [
      {
        model: db.ProductVariant,
        as: "variant",
        include: [{ model: db.Product, as: "product" }],
      },
    ],
  });

  if (cartItems.length === 0) {
    return res
      .status(400)
      .json({ message: "Giỏ hàng trống! Không thể đặt hàng." });
  }

  let merchandiseSubtotal = 0;
  const orderItemsData = [];

  for (const item of cartItems) {
    if (!item.variant || !item.variant.product) {
      return res.status(400).json({
        message: "Có sản phẩm lỗi trong giỏ hàng, vui lòng kiểm tra lại.",
      });
    }

    if (item.variant.stock_quantity < item.quantity) {
      return res.status(400).json({
        message: `Sản phẩm "${item.variant.product.name}" (Size: ${item.variant.size}) không đủ hàng! Kho còn: ${item.variant.stock_quantity}`,
      });
    }

    const price =
      parseFloat(item.variant.product.base_price) +
      (parseFloat(item.variant.price_modifier) || 0);
    merchandiseSubtotal += price * item.quantity;

    orderItemsData.push({
      variant_id: item.variant.variant_id,
      quantity: item.quantity,
      price_at_purchase: price,
    });
  }

  let shippingFee = 30000;
  let shippingAddressSnapshot = {};

  if (address_id) {
    const address = await db.Address.findOne({
      where: { address_id, user_id: userId },
    });
    if (!address)
      return res
        .status(404)
        .json({ message: "Địa chỉ giao hàng không tồn tại" });

    shippingAddressSnapshot = {
      recipient_name: address.recipient_name,
      phone: address.phone,
      full_address: `${address.street}, ${address.ward}, ${address.district}, ${address.city}`,
    };

    const city = address.city.toLowerCase();
    if (city.includes("hà nội") || city.includes("hồ chí minh")) {
      shippingFee = 15000;
    }
    if (shipping_method === "express") shippingFee += 10000;
  }

  let discountAmount = 0;
  let voucherId = null;

  if (voucher_code) {
    const voucher = await db.Voucher.findOne({
      where: { code: voucher_code, is_active: true },
    });

    if (voucher) {
      if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
        return res
          .status(400)
          .json({ message: "Mã giảm giá đã hết lượt sử dụng!" });
      }

      const now = new Date();
      if (
        new Date(voucher.valid_from) > now ||
        new Date(voucher.valid_to) < now
      ) {
        return res
          .status(400)
          .json({ message: "Mã giảm giá chưa bắt đầu hoặc đã hết hạn!" });
      }

      if (merchandiseSubtotal >= parseFloat(voucher.min_order_value)) {
        voucherId = voucher.voucher_id;
        if (voucher.discount_type === "percent") {
          discountAmount =
            merchandiseSubtotal * (parseFloat(voucher.discount_value) / 100);
        } else {
          discountAmount = parseFloat(voucher.discount_value);
        }
        if (discountAmount > merchandiseSubtotal)
          discountAmount = merchandiseSubtotal;
      } else {
        return res.status(400).json({
          message: `Đơn hàng chưa đạt giá trị tối thiểu để dùng mã này!`,
        });
      }
    } else {
      return res.status(400).json({ message: "Mã giảm giá không tồn tại!" });
    }
  }

  const finalTotal = merchandiseSubtotal + shippingFee - discountAmount;

  const result = await db.sequelize.transaction(async (t) => {
    // A. Tạo Đơn hàng
    const newOrder = await db.Order.create(
      {
        user_id: userId,
        status: "pending",
        payment_status: "unpaid",
        total_amount: finalTotal,
        payment_method: payment_method || "COD",
        shipping_method: shipping_method || "standard",
        shipping_fee: shippingFee,
        discount_amount: discountAmount,
        voucher_id: voucherId,
        shipping_address: shippingAddressSnapshot,
        note: note,
      },
      { transaction: t }
    );

    const itemsToCreate = orderItemsData.map((item) => ({
      ...item,
      order_id: newOrder.order_id,
    }));
    await db.OrderItem.bulkCreate(itemsToCreate, { transaction: t });

    for (const item of cartItems) {
      await db.ProductVariant.decrement("stock_quantity", {
        by: item.quantity,
        where: { variant_id: item.variant_id },
        transaction: t,
      });

      await db.Product.increment("sold_count", {
        by: item.quantity,
        where: { product_id: item.variant.product.product_id },
        transaction: t,
      });
    }
    if (voucherId) {
      await db.Voucher.increment("used_count", {
        by: 1,
        where: { voucher_id: voucherId },
        transaction: t,
      });
    }
    await db.CartItem.destroy({
      where: { user_id: userId },
      transaction: t,
    });

    return newOrder;
  });

  let message = "Đặt hàng thành công";
  const orderId = result.order_id;

  // ✅ KHUYẾN NGHỊ: Dùng finalTotal đã tính toán ở trên thay vì req.body.total_amount để bảo mật
  const amount = finalTotal;

  // CẤU HÌNH TÀI KHOẢN NGÂN HÀNG CỦA BẠN
  const myBank = "MB";
  const myTk = "0961115529";

  // Tạo link ảnh QR
  const paymentUrl = `https://qr.sepay.vn/img?bank=${myBank}&acc=${myTk}&template=compact&amount=${amount}&des=${orderId}`;

  return res.status(201).json({
    message: message,
    order_id: result.order_id, // Ở đây bạn đã dùng đúng result
    status: result.status,
    payment_status: result.payment_status,
    payment_url: paymentUrl,
  });
});
const markOrderAsPaid = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { id } = req.params;

  const order = await db.Order.findOne({
    where: {
      order_id: id,
      user_id: userId,
    },
  });

  if (!order) {
    return res.status(404).json({ message: "Đơn hàng không tồn tại" });
  }

  if (order.payment_status === "paid") {
    return res
      .status(200)
      .json({ message: "Đơn hàng này đã được thanh toán rồi" });
  }

  order.payment_status = "paid";

  await order.save();

  return res.status(200).json({
    message: "Xác nhận thanh toán thành công",
    order_id: order.order_id,
    status: order.status,
    payment_status: order.payment_status,
  });
});

const getOrderHistory = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;

  const { page = 1, limit = 10, status, payment_status } = req.query;

  const offset = (page - 1) * limit;

  const whereClause = { user_id: userId };

  if (status) {
    whereClause.status = status;
  }

  if (payment_status) {
    whereClause.payment_status = payment_status;
  }

  const { count, rows } = await db.Order.findAndCountAll({
    where: whereClause,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["created_at", "DESC"]],
    distinct: true,
    include: [
      {
        model: db.OrderItem,
        as: "items",
        include: [
          {
            model: db.ProductVariant,
            as: "variant",
            attributes: ["sku", "size", "color_name", "variant_id"],
            include: [
              { model: db.ProductMedia, as: "variant_media", limit: 1 },
              {
                model: db.Product,
                as: "product",
                attributes: ["name", "product_id"],
                include: [
                  {
                    model: db.ProductMedia,
                    as: "media",
                    where: { is_thumbnail: true },
                    attributes: ["url"],
                    required: false,
                    limit: 1,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  const formattedOrders = rows.map((order) => {
    const firstItem =
      order.items && order.items.length > 0 ? order.items[0] : null;
    let previewItemData = null;

    if (firstItem && firstItem.variant && firstItem.variant.product) {
      const variant = firstItem.variant;
      const product = variant.product;

      let thumbnail = null;
      if (variant.variant_media && variant.variant_media.length > 0) {
        thumbnail = variant.variant_media[0].url;
      } else if (product.media && product.media.length > 0) {
        thumbnail = product.media[0].url;
      }

      previewItemData = {
        name: product.name,
        size: variant.size,
        color: variant.color_name,
        quantity: firstItem.quantity,
        thumbnail: thumbnail,
      };
    }

    return {
      order_id: order.order_id,
      status: order.status,
      payment_status: order.payment_status,
      total_amount: parseFloat(order.total_amount),
      created_at: order.created_at,
      items_count: order.items.length,
      preview_item: previewItemData,
    };
  });

  return res.status(200).json({
    message: "Lấy lịch sử đơn hàng thành công",
    current_page: parseInt(page),
    total_pages: Math.ceil(count / limit),
    total_items: count,
    orders: formattedOrders,
  });
});
const cancelOrder = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { id } = req.params;
  const { reason } = req.body;

  const order = await db.Order.findOne({
    where: { order_id: id, user_id: userId },
    include: [
      {
        model: db.OrderItem,
        as: "items",
      },
    ],
  });

  if (!order) {
    return res.status(404).json({ message: "Đơn hàng không tồn tại" });
  }

  if (!["pending", "processing"].includes(order.status)) {
    return res.status(400).json({
      message: "Đơn hàng đã được giao cho vận chuyển, không thể hủy!",
    });
  }

  await db.sequelize.transaction(async (t) => {
    order.status = "cancelled";
    order.note = order.note
      ? `${order.note} | Lý do hủy: ${reason || "Không có"}`
      : `Lý do hủy: ${reason || "Không có"}`;

    if (order.payment_status === "paid") {
      order.payment_status = "refunding";
    }

    await order.save({ transaction: t });

    for (const item of order.items) {
      await db.ProductVariant.increment("stock_quantity", {
        by: item.quantity,
        where: { variant_id: item.variant_id },
        transaction: t,
      });

      const variant = await db.ProductVariant.findByPk(item.variant_id, {
        transaction: t,
      });
      if (variant) {
        await db.Product.decrement("sold_count", {
          by: item.quantity,
          where: { product_id: variant.product_id },
          transaction: t,
        });
      }
    }

    if (order.voucher_id) {
      await db.Voucher.decrement("used_count", {
        by: 1,
        where: { voucher_id: order.voucher_id },
        transaction: t,
      });
    }
  });

  return res.status(200).json({
    message: "Hủy đơn hàng thành công",
    order_id: id,
    status: "cancelled",
    payment_status: order.payment_status,
  });
});

const getOrderDetail = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { id } = req.params;

  const order = await db.Order.findOne({
    where: {
      order_id: id,
      user_id: userId,
    },
    include: [
      {
        model: db.OrderItem,
        as: "items",
        include: [
          {
            model: db.ProductVariant,
            as: "variant",
            attributes: ["size", "color_name", "sku", "variant_id"],
            include: [
              {
                model: db.Product,
                as: "product",
                attributes: ["name", "product_id"],
                include: [
                  {
                    model: db.ProductMedia,
                    as: "media",
                    where: { is_thumbnail: true },
                    attributes: ["url"],
                    required: false,
                    limit: 1,
                  },
                ],
              },
              {
                model: db.ProductMedia,
                as: "variant_media",
                attributes: ["url"],
                limit: 1,
              },
            ],
          },
        ],
      },
      {
        model: db.Voucher,
        as: "voucher",
        attributes: ["code", "discount_value", "discount_type"],
      },
    ],
  });

  if (!order) {
    return res.status(404).json({ message: "Đơn hàng không tồn tại" });
  }

  let calculatedSubtotal = 0;

  const formattedItems = order.items.map((item) => {
    const itemTotal = parseFloat(item.price_at_purchase) * item.quantity;
    calculatedSubtotal += itemTotal;

    let thumbnail = null;

    if (item.variant) {
      if (item.variant.variant_media && item.variant.variant_media.length > 0) {
        thumbnail = item.variant.variant_media[0].url;
      } else if (
        item.variant.product &&
        item.variant.product.media &&
        item.variant.product.media.length > 0
      ) {
        thumbnail = item.variant.product.media[0].url;
      }
    }

    return {
      item_id: item.item_id,
      product_name: item.variant?.product?.name || "Sản phẩm không tồn tại",
      product_id: item.variant?.product?.product_id,
      variant_id: item.variant?.variant_id,
      quantity: item.quantity,
      price_at_purchase: parseFloat(item.price_at_purchase),
      total_item_price: itemTotal,
      size: item.variant?.size,
      color: item.variant?.color_name,
      thumbnail: thumbnail,
    };
  });

  return res.status(200).json({
    order_id: order.order_id,
    status: order.status,
    payment_status: order.payment_status,
    created_at: order.created_at,
    payment_method: order.payment_method,
    note: order.note,
    shipping_address: order.shipping_address,
    voucher_code: order.voucher ? order.voucher.code : null,
    cost_breakdown: {
      subtotal: calculatedSubtotal,
      shipping_fee: parseFloat(order.shipping_fee),
      discount: parseFloat(order.discount_amount),
      total_amount: parseFloat(order.total_amount),
    },
    items: formattedItems,
  });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await db.Order.findAll();
  return res.status(200).json(orders);
});

const changeOrderStatus = asyncHandler(async (req, res) => {
  const orderId = req.body.orderId;
  const newStatus = req.body.status;
  const order = await db.Order.findByPk(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  order.status = newStatus;
  await order.save();
  return res.status(200).json({ message: "Order status updated", order });
});

export default {
  previewOrder,
  createOrder,
  markOrderAsPaid,
  getOrderHistory,
  cancelOrder,
  getOrderDetail,
  getAllOrders,
  changeOrderStatus,
};
