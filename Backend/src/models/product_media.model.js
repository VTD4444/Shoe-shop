import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class ProductMedia extends Model {}
  ProductMedia.init({
    media_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    product_id: { type: DataTypes.UUID },
    url: { type: DataTypes.TEXT},
    media_type: { type: DataTypes.STRING, defaultValue: 'image' },
    is_thumbnail: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, { sequelize, modelName: 'ProductMedia', tableName: 'product_media', timestamps: false });
  return ProductMedia;
};