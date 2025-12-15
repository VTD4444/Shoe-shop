import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

import UserModel from './user.model.js';
import AddressModel from "./address.model.js";
import BrandModel from './brand.model.js';
import CategoryModel from './category.model.js';
import ProductModel from './product.model.js';
import ProductVariantModel from './product_variant.model.js';
import ProductMediaModel from './product_media.model.js';
import VoucherModel from './voucher.model.js';
import CartItemModel from './cart_item.model.js';
import OrderModel from './order.model.js';
import OrderItemModel from './order_item.model.js';
import ReviewModel from "./review.model.js";
const db = {};
db.Sequelize=Sequelize;
db.sequelize = sequelize;

db.User = UserModel(sequelize, DataTypes);
db.Address= AddressModel(sequelize, DataTypes);
db.Brand = BrandModel(sequelize, DataTypes);
db.Category = CategoryModel(sequelize, DataTypes);
db.Product = ProductModel(sequelize, DataTypes);
db.ProductVariant = ProductVariantModel(sequelize, DataTypes);
db.ProductMedia = ProductMediaModel(sequelize, DataTypes);
db.Voucher = VoucherModel(sequelize, DataTypes);
db.CartItem = CartItemModel(sequelize, DataTypes);
db.Order = OrderModel(sequelize, DataTypes);
db.OrderItem = OrderItemModel(sequelize, DataTypes);
db.Review = ReviewModel(sequelize, DataTypes);
// --- User & Address ---
db.User.hasMany(db.Address, { foreignKey: 'user_id', as: 'addresses' });
db.Address.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

// --- Product & Brand ---
db.Brand.hasMany(db.Product, { foreignKey: 'brand_id' });
db.Product.belongsTo(db.Brand, { foreignKey: 'brand_id', as: 'brand' });

// --- Product & Category ---
db.Category.hasMany(db.Product, { foreignKey: 'category_id' });
db.Product.belongsTo(db.Category, { foreignKey: 'category_id', as: 'category' });

// --- Product & Variant ---
db.Product.hasMany(db.ProductVariant, { foreignKey: 'product_id', as: 'variants' });
db.ProductVariant.belongsTo(db.Product, { foreignKey: 'product_id', as: 'product' });

// --- Product & Media ---
db.Product.hasMany(db.ProductMedia, { foreignKey: 'product_id', as: 'media' });
db.ProductMedia.belongsTo(db.Product, { foreignKey: 'product_id' });

db.ProductVariant.hasMany(db.ProductMedia, { foreignKey: 'variant_id', as: 'variant_media' });
db.ProductMedia.belongsTo(db.ProductVariant, { foreignKey: 'variant_id' });

// --- Cart (Giỏ hàng) ---
// User có nhiều CartItem
db.User.hasMany(db.CartItem, { foreignKey: 'user_id', as: 'cart_items' });
db.CartItem.belongsTo(db.User, { foreignKey: 'user_id' });

// CartItem thuộc về 1 Variant (để lấy giá, màu, size)
db.ProductVariant.hasMany(db.CartItem, { foreignKey: 'variant_id' });
db.CartItem.belongsTo(db.ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

// --- Order (Đơn hàng) ---
db.User.hasMany(db.Order, { foreignKey: 'user_id', as: 'orders' });
db.Order.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

db.Order.hasMany(db.OrderItem, { foreignKey: 'order_id', as: 'items' });
db.OrderItem.belongsTo(db.Order, { foreignKey: 'order_id' });

db.Voucher.hasMany(db.Order, { foreignKey: 'voucher_id' });
db.Order.belongsTo(db.Voucher, { foreignKey: 'voucher_id', as: 'voucher' });

db.ProductVariant.hasMany(db.OrderItem, { foreignKey: 'variant_id' });
db.OrderItem.belongsTo(db.ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

db.User.hasMany(db.Review, { foreignKey: 'user_id', as: 'reviews' });
db.Review.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

db.Product.hasMany(db.Review, { foreignKey: 'product_id', as: 'reviews' });
db.Review.belongsTo(db.Product, { foreignKey: 'product_id', as: 'product' });

db.ProductVariant.hasMany(db.Review, { foreignKey: 'variant_id' });
db.Review.belongsTo(db.ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;