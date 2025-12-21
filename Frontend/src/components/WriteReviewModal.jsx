import React, { useState } from "react";
import { useForm } from "react-hook-form";
import productService from "../services/productService";
import StarRating from "./StarRating";
import { toast } from "react-toastify";
import { FiX, FiAlertTriangle } from "react-icons/fi";

const WriteReviewModal = ({ isOpen, onClose, product, orderId, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        order_id: orderId, // Bắt buộc để chứng minh đã mua
        rating: rating,
        content: data.content,
      };

      await productService.submitReview(product.product_id, payload);

      toast.success("Đánh giá đã được đăng thành công!");
      if (onSuccess) onSuccess(); // Callback để reload lại list nếu cần
      onClose();
    } catch (error) {
      const errorCode = error.response?.data?.error_code;
      const errorMsg = error.response?.data?.message;

      // Xử lý lỗi AI Filter riêng biệt
      if (errorCode === "INAPPROPRIATE_CONTENT") {
        toast.error("Nội dung không phù hợp! Vui lòng chỉnh sửa.");
      } else if (errorCode === "NOT_VERIFIED_PURCHASE") {
        toast.error("Bạn chưa hoàn thành đơn hàng này.");
      } else {
        toast.error(errorMsg || "Lỗi khi gửi đánh giá");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg p-6 relative shadow-2xl border border-black">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          <FiX size={24} />
        </button>

        <h3 className="text-xl font-black uppercase mb-2">Đánh giá sản phẩm</h3>
        <div className="flex items-center gap-3 mb-6 bg-gray-50 p-3">
          <img
            src={product.thumbnail}
            alt="prod"
            className="w-12 h-12 object-cover border"
          />
          <span className="font-bold text-sm uppercase">
            {product.product_name}
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Rating Input */}
          <div className="mb-6 flex flex-col items-center">
            <p className="mb-2 font-bold text-sm">
              Chất lượng sản phẩm thế nào?
            </p>
            <StarRating
              rating={rating}
              size={32}
              interactive={true}
              onRate={(val) => setRating(val)}
            />
            <p className="text-xs text-gray-500 mt-2">
              {rating === 5
                ? "Tuyệt vời"
                : rating === 4
                ? "Hài lòng"
                : rating === 3
                ? "Bình thường"
                : rating === 2
                ? "Không hài lòng"
                : "Tệ"}
            </p>
          </div>

          {/* Content Input */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">
              Chia sẻ cảm nhận của bạn
            </label>
            <textarea
              {...register("content", {
                minLength: {
                  value: 10,
                  message: "Vui lòng nhập tối thiểu 10 ký tự",
                },
              })}
              placeholder="Chất liệu vải, độ vừa vặn, form dáng..."
              className="w-full border border-gray-300 p-3 text-sm focus:outline-black min-h-[120px]"
            ></textarea>
            {errors.content && (
              <p className="text-red-500 text-xs mt-1">
                {errors.content.message}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
              <FiAlertTriangle />
              <span>Nội dung sẽ được kiểm duyệt bởi AI.</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white py-3 font-bold uppercase hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
          >
            {isSubmitting ? "Đang gửi..." : "GỬI ĐÁNH GIÁ"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WriteReviewModal;
