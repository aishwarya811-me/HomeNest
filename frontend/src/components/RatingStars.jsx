import { Star } from 'lucide-react';

export default function RatingStars({ rating, size = 16, interactive = false, onRate }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button"
                    onClick={() => interactive && onRate && onRate(star)}
                    className={`transition-transform ${interactive ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}`}>
                    <Star size={size} className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                </button>
            ))}
        </div>
    );
}