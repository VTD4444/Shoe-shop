import db from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import Joi from 'joi';

const addressSchema = Joi.object({
  recipient_name: Joi.string().optional(),
  phone: Joi.string().optional(),
  street: Joi.string().optional(),
  city: Joi.string().optional(),
  district: Joi.string().optional(),
  ward: Joi.string().optional(),
  is_default: Joi.boolean().optional()
});

const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await db.Address.findAll({
    where: { user_id: req.user.user_id },
    order: [['is_default', 'DESC'], ['created_at', 'DESC']]
  });

  return res.status(200).json({
    message: 'Lấy danh sách địa chỉ thành công',
    data: addresses
  });
});

const addAddress = asyncHandler(async (req, res) => {
  const { error } = addressSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const user_id = req.user.user_id;
  const { is_default } = req.body;
  // Nếu địa chỉ mới được thêm là mặc định, cập nhật tất cả địa chỉ khác của người dùng này thành không mặc định

  if (is_default) {
    await db.Address.update({ is_default: false }, { where: { user_id: user_id } });
  }

  const newAddress = await db.Address.create({
    ...req.body,
    user_id: user_id
  });

  return res.status(201).json({
    message: 'Thêm địa chỉ thành công',
    data: newAddress
  });
});

const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.user_id;

  const address = await db.Address.findOne({
    where: { address_id: id, user_id }
  });

  if (!address) {
    return res.status(404).json({
      message: 'Địa chỉ không tồn tại hoặc không phải của bạn!'
    });
  }
    console.log(address)
  if(address.is_default == true){
      return res.status(400).json({ message: 'Cần 1 địa chỉ làm mặc định' });
  }
    // await address.destroy();
  return res.status(200).json({ message: 'Đã xóa địa chỉ' });
});

const updateAddress = asyncHandler(async (req, res) => {
    const { id } = req.params;
  const user_id = req.user.user_id;
    const { is_default } = req.body;
  const address = await db.Address.findOne({
    where: {
      address_id: id,
      user_id: user_id
    }
  });

  if (!address) {
    return res.status(404).json({ message: 'Địa chỉ không tồn tại hoặc không phải của bạn!' });
  }
    if (address.is_default && is_default === false) {
      return res.status(400).json({
        message: 'Phải có ít nhất một địa chỉ mặc định'
      });
    }
  if (is_default === true) {
    await db.Address.update(
      { is_default: false },
      { where: { user_id: user_id  } }
    );
  }

  await address.update(req.body);

  return res.status(200).json({
    message: 'Cập nhật địa chỉ thành công',
    data: address
  })
});


export default {
   getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
};