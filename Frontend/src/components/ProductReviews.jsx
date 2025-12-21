import React, { useEffect, useState } from "react";
import productService from "../services/productService";
import StarRating from "./StarRating";
import { formatDate } from "../utils/format";

const ProductReviews = ({ productId }) => {
  const [reviewsData, setReviewsData] = useState(null);
  const [filterStar, setFilterStar] = useState(null); // Null = All
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // Gọi API với params filter
        const res = await productService.getReviews(productId, {
          limit: 5,
          star: filterStar,
        });
        setReviewsData(res);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchReviews();
  }, [productId, filterStar]);

  if (!reviewsData && loading)
    return <div className="py-10 text-center">Đang tải đánh giá...</div>;
  if (!reviewsData) return null;

  return (
    <div className="border-t border-gray-200 pt-12 mt-12 animate-fade-in w-full">
      <h2 className="text-2xl font-black uppercase mb-8">
        Đánh giá khách hàng
      </h2>

      <div className="flex flex-col md:flex-row gap-12">
        {/* LEFT: SUMMARY & FILTER */}
        <div className="w-full md:w-2/3">
          <div className="bg-gray-50 p-6 border text-center mb-6">
            <div className="text-5xl font-black text-black mb-2">
              {reviewsData.average_rating}{" "}
              <span className="text-xl text-gray-400">/ 5</span>
            </div>
            <div className="flex justify-center mb-2">
              <StarRating
                rating={Math.round(reviewsData.average_rating)}
                size={24}
              />
            </div>
            <p className="text-sm text-gray-500">
              {reviewsData.total_reviews} đánh giá
            </p>
          </div>

          {/* Filter Bars */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviewsData.rating_counts?.[star] || 0;
              const percent =
                reviewsData.total_reviews > 0
                  ? (count / reviewsData.total_reviews) * 100
                  : 0;
              return (
                <button
                  key={star}
                  onClick={() =>
                    setFilterStar(filterStar === star ? null : star)
                  } // Click lại để bỏ filter
                  className={`flex items-center w-full gap-3 text-sm hover:opacity-70 ${
                    filterStar === star
                      ? "font-bold text-black"
                      : "text-gray-600"
                  }`}
                >
                  <span className="w-8">{star} sao</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <span className="w-8 text-right">{count}</span>
                </button>
              );
            })}
          </div>

          {filterStar && (
            <button
              onClick={() => setFilterStar(null)}
              className="text-xs underline mt-4 text-gray-500"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* RIGHT: LIST REVIEWS */}
        <div className="flex-1 space-y-8">
          {reviewsData.reviews.length === 0 ? (
            <p className="text-gray-500 italic">
              Chưa có đánh giá nào {filterStar ? `cho ${filterStar} sao` : ""}.
            </p>
          ) : (
            reviewsData.reviews.map((review) => (
              <div
                key={review.review_id}
                className="border-b pb-6 last:border-0"
              >
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={review.avatar_url || "https://via.placeholder.com/40"}
                    className="w-10 h-10 rounded-full object-cover bg-gray-200"
                    alt="avt"
                  />
                  <div>
                    <p className="font-bold text-sm">{review.user_name}</p>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} size={12} />
                      <span className="text-xs text-gray-400">
                        | {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Variant Info */}
                <p className="text-xs text-gray-500 mb-3 bg-gray-50 inline-block px-2 py-1">
                  Phân loại: {review.variant_info}
                </p>

                <p className="text-gray-700 text-sm leading-relaxed">
                  {review.content}
                </p>
              </div>
            ))
          )}

          {/* Pagination (Đơn giản) */}
          {/* Bạn có thể thêm nút "Xem thêm" để tăng limit hoặc load page tiếp theo */}
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;
