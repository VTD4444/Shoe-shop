import db from '../models/index.js'; // Import db để dùng db.Order
import asyncHandler from '../utils/asyncHandler.js'; // Import asyncHandler (SỬA LỖI CHÍNH)
import { Op } from 'sequelize'; // Import Op để dùng trong câu query

export const sepayWebhook = asyncHandler(async (req, res) => {
  try {
    const { content, transferAmount, referenceCode } = req.body; // referenceCode là mã tham chiếu ngân hàng

    if (!content || !transferAmount) return res.json({ success: false });

    // 1. Logic tìm đơn hàng (như cũ)
    const pendingOrders = await db.Order.findAll({
       where: { payment_status: ['unpaid', 'partially_paid'] } 
    });

    let foundOrder = null;
    // Chuẩn hóa content để tìm kiếm tốt hơn
    const cleanContent = content.toLowerCase().replace(/[^a-z0-9]/g, ''); 

    for (const order of pendingOrders) {
       const cleanOrderId = order.order_id.toLowerCase().replace(/[^a-z0-9]/g, '');
       if (cleanContent.includes(cleanOrderId)) {
         foundOrder = order;
         break;
       }
    }

    // --- TRƯỜNG HỢP: KHÁCH SỬA NỘI DUNG (Không tìm thấy đơn) ---
    if (!foundOrder) {
      console.log(`🚨 GIAO DỊCH LẠC TRÔI: Nhận ${transferAmount} nhưng không tìm thấy Order ID trong content: "${content}"`);
      return res.json({ success: true, message: "Transaction received but no Order ID match" });
    }

    // --- TRƯỜNG HỢP: TÌM THẤY ĐƠN ---
    const receivedAmount = parseFloat(transferAmount);
    const orderTotal = parseFloat(foundOrder.total_amount);

    // --- TRƯỜNG HỢP: KHÁCH CHUYỂN THIẾU TIỀN ---
    if (receivedAmount < orderTotal) {
       console.log(`⚠️ THANH TOÁN THIẾU: Đơn ${foundOrder.order_id}. Cần ${orderTotal}, Nhận ${receivedAmount}`);
       
       // Update Note để Admin biết
       foundOrder.note = `${foundOrder.note || ''} | [Sepay] Khách chuyển thiếu: ${receivedAmount}. Ref: ${referenceCode}`;
       foundOrder.payment_status = 'partially_paid'; // Trạng thái: Thanh toán 1 phần
       await foundOrder.save();

       return res.json({ success: true, message: "Payment incomplete" });
    }

    // --- TRƯỜNG HỢP: ĐỦ TIỀN (HAPPY CASE) ---
    foundOrder.payment_status = 'paid';
    foundOrder.note = `${foundOrder.note || ''} | [Sepay] Đã thanh toán đủ. Ref: ${referenceCode}`;
    await foundOrder.save();
    
    console.log(`✅ THANH TOÁN THÀNH CÔNG: Đơn ${foundOrder.order_id}`);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(200).json({ success: false });
  }
});