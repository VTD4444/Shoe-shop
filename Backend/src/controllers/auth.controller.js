import db from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Joi from "joi";
import dotenv from "dotenv";
import asyncHandler from "../utils/asyncHandler.js";

dotenv.config();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  full_name: Joi.string().min(2).required(),
  phone_number: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const register = asyncHandler(async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password, full_name, phone_number } = req.body;

  const existingUser = await db.User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ message: "Email này đã được sử dụng!" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await db.User.create({
    email,
    password_hash: hashedPassword,
    full_name,
    phone_number,
    role: "customer",
  });

  const userResponse = {
    user_id: newUser.user_id,
    email: newUser.email,
    full_name: newUser.full_name,
    role: newUser.role,
  };

  return res.status(201).json({
    message: "Đăng ký thành công",
    user: userResponse,
  });
});

const login = asyncHandler(async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;

  const user = await db.User.findOne({
    where: { email },
    attributes: [
      "user_id",
      "email",
      "password_hash",
      "full_name",
      "role",
      "avatar_url",
      "is_active",
    ],
  });

  if (!user) {
    return res.status(404).json({ message: "Email không tồn tại!" });
  }

  if (!user.is_active) {
    return res.status(403).json({ message: "Tài khoản đã bị khóa!" });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ message: "Mật khẩu không đúng!" });
  }
  console.log(process.env.JWT_SECRET);
  const token = jwt.sign(
    { user_id: user.user_id, role: user.role },
    process.env.JWT_SECRET
  );

  const userData = {
    user_id: user.user_id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    avatar_url: user.avatar_url,
  };

  return res.status(200).json({
    message: "Đăng nhập thành công",
    token,
    user: userData,
  });
});

const adminLogin = asyncHandler(async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { email, password } = req.body;

  const user = await db.User.findOne({
    where: { email, role: "admin" },
    attributes: [
      "user_id",
      "email",
      "password_hash",
      "full_name",
      "role",
      "avatar_url",
      "is_active",
    ],
  });
  if (!user) {
    return res
      .status(404)
      .json({ message: "Email không tồn tại hoặc không có quyền truy cập!" });
  }

  if (!user.is_active) {
    return res.status(403).json({ message: "Tài khoản đã bị khóa!" });
  }
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ message: "Mật khẩu không đúng!" });
  }
  const token = jwt.sign(
    { user_id: user.user_id, role: user.role },
    process.env.JWT_SECRET
  );
  const userData = {
    user_id: user.user_id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    avatar_url: user.avatar_url,
  };
  return res.status(200).json({
    message: "Đăng nhập thành công",
    token,
    user: userData,
  });
});

export default {
  register,
  login,
  adminLogin,
};
