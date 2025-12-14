import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class ProductVariant extends Model {}
  ProductVariant.init({
    variant_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    product_id: { type: DataTypes.UUID },
    sku: { type: DataTypes.STRING, allowNull: false, unique: true },
    color_name: { type: DataTypes.STRING },
    color_hex: { type: DataTypes.STRING },
    size: { type: DataTypes.STRING },
    stock_quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
    price_modifier: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 }
  }, { sequelize, modelName: 'ProductVariant', tableName: 'product_variants', timestamps: true,createdAt :"created_at",updatedAt:"updated_at" });
  return ProductVariant;
};