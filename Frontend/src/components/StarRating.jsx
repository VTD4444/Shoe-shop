import React from 'react';
import { FiStar } from 'react-icons/fi';

const StarRating = ({ rating, size = 16, interactive = false, onRate }) => {
    return (
        <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= rating;
                return (
                    <FiStar
                        key={star}
                        size={size}
                        className={`transition-colors ${interactive ? 'cursor-pointer' : ''} 
              ${isFilled ? 'fill-black text-black' : 'text-gray-300'}`}
                        onClick={() => interactive && onRate && onRate(star)}
                    />
                );
            })}
        </div>
    );
};

export default StarRating;