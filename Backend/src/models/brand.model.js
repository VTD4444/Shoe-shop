import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Brand extends Model {}
  Brand.init({
    brand_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    logo_url: { type: DataTypes.TEXT }
  }, { sequelize, modelName: 'Brand', tableName: 'brands', timestamps: false });
  return Brand;
};