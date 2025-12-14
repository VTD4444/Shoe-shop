import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class OrderItem extends Model {}
  OrderItem.init({
    item_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    order_id: { type: DataTypes.UUID },
    variant_id: { type: DataTypes.UUID },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    price_at_purchase: { type: DataTypes.DECIMAL(15, 2), allowNull: false }
  }, {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });
  return OrderItem;
};