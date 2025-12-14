import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Voucher extends Model {}
  Voucher.init({
    voucher_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING, unique: true, allowNull: false },
    discount_type: { type: DataTypes.STRING, defaultValue: 'fixed' }, // percent/fixed
    discount_value: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    min_order_value: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },

    // 👇 Sửa lại tên cột cho khớp yêu cầu
    valid_from: { type: DataTypes.DATE, allowNull: false },
    valid_to: { type: DataTypes.DATE, allowNull: false },

    usage_limit: { type: DataTypes.INTEGER },
    used_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    sequelize,
    modelName: 'Voucher',
    tableName: 'vouchers',
    timestamps: true,
    updatedAt: false, 
    createdAt: 'created_at'
  });
  return Voucher;
};