import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class CartItem extends Model {}
  CartItem.init({
    cart_item_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID },
    variant_id: { type: DataTypes.UUID },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 }
  }, {
    sequelize,
    modelName: 'CartItem',
    tableName: 'cart_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at' 
  });
  return CartItem;
};