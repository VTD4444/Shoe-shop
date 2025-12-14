import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
    }
  }
  Product.init({
    product_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    base_price: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    brand_id: { type: DataTypes.INTEGER },
    category_id: { type: DataTypes.INTEGER },
    description: { type: DataTypes.TEXT },
    average_rating: { type: DataTypes.DECIMAL(2, 1), defaultValue: 0.0 },
    sold_count: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, { sequelize, modelName: 'Product', tableName: 'products', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });
  return Product;
};