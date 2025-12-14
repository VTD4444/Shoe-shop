import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

import UserModel from './user.model.js';
import AddressModel from "./address.model.js";
const db = {};

db.sequelize = sequelize;

db.User = UserModel(sequelize, DataTypes);
db.Address= AddressModel(sequelize, DataTypes);

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;