import { Star, Trash2, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

interface Review {
    id: number;
    rating: number;
    comment: string | null;
    created_at: string;
    customer: {
        id: number;
        name: string;
        avatar: string | null;
    };
}

interface ReviewSectionProps {
    menuId: number;
}

export default function ReviewSection({ menuId }: ReviewSectionProps) {
    const { user: customer, isAuthenticated } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [reviewsCount, setReviewsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const [hasReviewed, setHasReviewed] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [menuId]);

    const fetchReviews = async () => {
        try {
            const response = await api.get(`/menus/${menuId}/reviews`);
            setReviews(response.data.reviews.data || []);
            setAverageRating(response.data.average_rating);
            setReviewsCount(response.data.reviews_count);

            // Check if current user has already reviewed
            if (customer) {
                const userReview = (response.data.reviews.data || []).find(
                    (r: Review) => r.customer.id === customer.id,
                );
                setHasReviewed(!!userReview);
            }
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) return;

        setSubmitting(true);
        try {
            await api.post(`/menus/${menuId}/reviews`, {
                rating,
                comment: comment.trim() || null,
            });
            setComment('');
            setRating(5);
            fetchReviews();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menambahkan review');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reviewId: number) => {
        if (!confirm('Hapus review ini?')) return;

        try {
            await api.delete(`/reviews/${reviewId}`);
            fetchReviews();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menghapus review');
        }
    };

    const renderStars = (
        count: number,
        interactive = false,
        size = 'w-5 h-5',
    ) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type={interactive ? 'button' : undefined}
                        disabled={!interactive}
                        onClick={() => interactive && setRating(star)}
                        onMouseEnter={() => interactive && setHoverRating(star)}
                        onMouseLeave={() => interactive && setHoverRating(0)}
                        className={`${interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}`}
                    >
                        <Star
                            className={`${size} ${
                                star <=
                                (interactive ? hoverRating || rating : count)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-gray-300'
                            }`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-6 w-32 rounded bg-gray-200"></div>
                <div className="h-20 rounded bg-gray-200"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                    Ulasan ({reviewsCount})
                </h3>
                <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-gray-900">
                        {averageRating}
                    </span>
                    <span className="text-sm text-gray-500">/ 5</span>
                </div>
            </div>

            {/* Review Form */}
            {isAuthenticated && !hasReviewed && (
                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 rounded-xl bg-gray-50 p-4"
                >
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Rating Anda
                        </label>
                        {renderStars(rating, true, 'w-8 h-8')}
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Komentar (Opsional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                            maxLength={1000}
                            placeholder="Bagikan pengalaman Anda dengan menu ini..."
                            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                    >
                        {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
                    </button>
                </form>
            )}

            {!isAuthenticated && (
                <div className="rounded-xl bg-gray-50 p-4 text-center">
                    <p className="text-gray-600">
                        <a
                            href="/login"
                            className="font-semibold text-blue-600 hover:underline"
                        >
                            Login
                        </a>{' '}
                        untuk memberikan ulasan
                    </p>
                </div>
            )}

            {hasReviewed && (
                <div className="rounded-xl bg-green-50 p-4 text-center">
                    <p className="font-medium text-green-700">
                        ✓ Anda sudah memberikan ulasan untuk menu ini
                    </p>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <p className="py-8 text-center text-gray-500">
                        Belum ada ulasan untuk menu ini.
                    </p>
                ) : (
                    reviews.map((review) => (
                        <div
                            key={review.id}
                            className="rounded-xl border border-gray-100 bg-white p-4"
                        >
                            <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className="shrink-0">
                                    {review.customer.avatar ? (
                                        <img
                                            src={review.customer.avatar}
                                            alt={review.customer.name}
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                                            <User className="h-5 w-5 text-gray-500" />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className="truncate font-semibold text-gray-900">
                                            {review.customer.name}
                                        </h4>
                                        {customer?.id ==
                                            review.customer.id && (
                                            <button
                                                onClick={() =>
                                                    handleDelete(review.id)
                                                }
                                                className="shrink-0 rounded-lg p-1 text-red-500 transition-colors hover:bg-red-50"
                                                title="Hapus ulasan"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="mt-0.5 flex items-center gap-2">
                                        {renderStars(
                                            review.rating,
                                            false,
                                            'w-4 h-4',
                                        )}
                                        <span className="text-xs text-gray-400">
                                            {formatDate(review.created_at)}
                                        </span>
                                    </div>
                                    {review.comment && (
                                        <p className="mt-2 text-sm text-gray-600">
                                            {review.comment}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
