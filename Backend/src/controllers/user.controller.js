import asyncHandler from '../utils/asyncHandler.js';
import Joi from "joi";
import bcrypt from "bcryptjs";
const getProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  return res.status(200).json({
    user_id: user.user_id,
    email: user.email,
    full_name: user.full_name,
    phone_number: user.phone_number,
    gender: user.gender,
    birth_date: user.birth_date,
    avatar_url: user.avatar_url,
    created_at: user.created_at
  });
});

const updateProfileSchema = Joi.object({
  full_name: Joi.string().min(2).optional(),
  phone_number: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  birth_date: Joi.date().iso().less('now').optional(),
  avatar_url: Joi.string().uri().optional()
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = req.user;


  const { error } = updateProfileSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { full_name, phone_number, gender, birth_date, avatar_url } = req.body;

  if (full_name !== undefined) user.full_name = full_name;
  if (phone_number !== undefined) user.phone_number = phone_number;
  if (gender !== undefined) user.gender = gender;
  if (birth_date !== undefined) user.birth_date = birth_date;
  if (avatar_url !== undefined) user.avatar_url = avatar_url;

  await user.save();

  return res.status(200).json({
    message: "Cập nhật hồ sơ thành công",
    user: {
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      phone_number: user.phone_number,
      gender: user.gender,
      birth_date: user.birth_date,
      avatar_url: user.avatar_url
    }
  });
});


const changePassword = asyncHandler(async (req, res) => {
  const user = req.user;
  const { current_password, new_password, confirm_password } = req.body;

  if (!current_password || !new_password || !confirm_password) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin!' });
  }

  if (new_password !== confirm_password) {
    return res.status(400).json({ message: 'Mật khẩu xác nhận không khớp!' });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
  }

  const isMatch = await bcrypt.compare(current_password, user.password_hash);
  if (!isMatch) {
    return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng!' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(new_password, salt);

  user.password_hash = hashedPassword;
  await user.save();

  return res.status(200).json({ message: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.' });
});


export default {
  getProfile,updateProfile,changePassword
};