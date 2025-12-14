import jwt from 'jsonwebtoken';
import db from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');

    const user = await db.User.findByPk(decoded.id);

    req.user = user ? user : null;

    next();

  } catch (error) {
    req.user = null;
    next();
  }
};

export default optionalAuthMiddleware;