import db from "../models/index.js";

const Voucher = db.Voucher;

// Create a new voucher
export const createVoucher = async (req, res) => {
  try {
    const {
      code,
      discount_type,
      discount_value,
      min_order_value,
      valid_from,
      valid_to,
      usage_limit,
    } = req.body;

    const existingVoucher = await Voucher.findOne({ where: { code } });
    if (existingVoucher) {
      return res.status(400).json({ message: "Voucher code already exists" });
    }

    const newVoucher = await Voucher.create({
      code,
      discount_type,
      discount_value,
      min_order_value,
      valid_from,
      valid_to,
      usage_limit,
      is_active: true,
    });

    return res.status(201).json({
      message: "Voucher created successfully",
      data: newVoucher,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error creating voucher", error: error.message });
  }
};

// Get all vouchers
export const getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.findAll({
      order: [["created_at", "DESC"]],
    });
    return res.status(200).json({
      message: "Vouchers retrieved successfully",
      data: vouchers,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error retrieving vouchers", error: error.message });
  }
};

// Update a voucher
export const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      discount_type,
      discount_value,
      min_order_value,
      valid_from,
      valid_to,
      usage_limit,
      is_active,
    } = req.body;

    const voucher = await Voucher.findByPk(id);
    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    // Check if code is being changed and if it conflicts
    if (code && code !== voucher.code) {
      const existingVoucher = await Voucher.findOne({ where: { code } });
      if (existingVoucher) {
        return res.status(400).json({ message: "Voucher code already exists" });
      }
    }

    await voucher.update({
      code,
      discount_type,
      discount_value,
      min_order_value,
      valid_from,
      valid_to,
      usage_limit,
      is_active,
    });

    return res.status(200).json({
      message: "Voucher updated successfully",
      data: voucher,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error updating voucher", error: error.message });
  }
};

// Delete a voucher
export const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const voucher = await Voucher.findByPk(id);

    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    await voucher.destroy();

    return res.status(200).json({ message: "Voucher deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting voucher", error: error.message });
  }
};
