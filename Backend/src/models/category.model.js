import {Model} from "sequelize";

export default (sequelize, DataTypes) => {
    class Category extends Model {
    }

    Category.init({
        category_id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        name: {type: DataTypes.STRING, allowNull: false},
        parent_id: {type: DataTypes.INTEGER, allowNull: true}

    }, {sequelize, modelName: 'Category', tableName: 'categories', timestamps: false});
    return Category;
};
