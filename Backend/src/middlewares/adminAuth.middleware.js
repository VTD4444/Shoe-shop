import userModel from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();
const adminAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Bạn chưa đăng nhập (Thiếu Token)!" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey123");
    const user = await userModel.findByPk(decoded.user_id);
    if (!user) {
      return res
        .status(401)
        .json({ message: "Token không hợp lệ hoặc tài khoản đã bị xóa!" });
    }
    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền truy cập tài nguyên này!" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "lỗi j đó rồi" });
  }
};

export default adminAuthMiddleware;
