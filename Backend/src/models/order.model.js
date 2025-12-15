import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Order extends Model {}
  Order.init({
    order_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'pending' },
    total_amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    payment_method: { type: DataTypes.STRING },
    payment_status: { type: DataTypes.STRING, defaultValue: 'unpaid' },
    shipping_method: { type: DataTypes.STRING },

    shipping_fee: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    discount_amount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },

    voucher_id: { type: DataTypes.INTEGER, allowNull: true },

    shipping_address: { type: DataTypes.JSONB },
    note: { type: DataTypes.TEXT }
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Order;
};