import jwt from 'jsonwebtoken';
import db from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Bạn chưa đăng nhập (Thiếu Token)!' });
    }
    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');

    const user = await db.User.findByPk(decoded.user_id);

    if (!user) {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc tài khoản đã bị xóa!' });
    }

    req.user = user;
    next();

  } catch (error) {
    console.log(error);
    return res.status(403).json({ message: 'Token lỗi hoặc hết hạn' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      message: 'Truy cập bị từ chối! Bạn không phải là Quản trị viên.'
    });
  }
};


export default verifyToken;

export { verifyToken, isAdmin };