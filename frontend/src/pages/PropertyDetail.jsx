import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { imgUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
    MapPin, Bed, Bath, Square, IndianRupee, Car, Layers,
    Phone, Mail, Heart, ChevronLeft, ChevronRight,
    CheckCircle2, XCircle, Info, Calendar, Flag
} from 'lucide-react';
import RatingStars from '../components/RatingStars';
import ShareButton from '../components/ShareButton';
import Pagination from '../components/Pagination';
import { addRecentlyViewed } from '../components/RecentlyViewed';

// ── Lazy loaded below-the-fold ─────────────────────────────
const SimilarProperties = lazy(() => import('../components/SimilarProperties'));

const REVIEW_LIMIT = 5;

export default function PropertyDetail() {
    const { id } = useParams();
    const { user } = useAuth();

    // ── Property state ─────────────────────────────────────
    const [p, setP] = useState(null);
    const [loading, setLoading] = useState(true);

    // ── Gallery state ──────────────────────────────────────
    const [activeImg, setActiveImg] = useState(0);
    const [imgLoaded, setImgLoaded] = useState(false);

    // ── Bookmark state ─────────────────────────────────────
    const [bookmarked, setBookmarked] = useState(false);

    // ── Contact state ──────────────────────────────────────
    const [msg, setMsg] = useState('');
    const [contacted, setContacted] = useState(false);

    // ── Review state ───────────────────────────────────────
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [reviewPagination, setReviewPagination] = useState(null);
    const [reviewPage, setReviewPage] = useState(1);
    const [reviewsVisible, setReviewsVisible] = useState(false);
    const [myRating, setMyRating] = useState(0);
    const [myComment, setMyComment] = useState('');
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    const [replyText, setReplyText] = useState({});
    const [reviewLoading, setReviewLoading] = useState(false);

    // ── Report state ───────────────────────────────────────
    const [reportReason, setReportReason] = useState('');
    const [reportDone, setReportDone] = useState(false);
    const [showReport, setShowReport] = useState(false);

    // ── Refs ───────────────────────────────────────────────
    const reviewsRef = useRef();

    // ── Fetch property on id change ────────────────────────
    useEffect(() => {
        setLoading(true);
        setActiveImg(0);
        setImgLoaded(false);
        setReviewPage(1);
        setReviewsVisible(false);
        setReviews([]);
        setAvgRating(0);
        setTotalReviews(0);
        setReviewPagination(null);

        api.get(`/properties/${id}`)
            .then(({ data }) => {
                setP(data);
                setLoading(false);
                addRecentlyViewed(data);
            })
            .catch(() => setLoading(false));
    }, [id]);

    // ── Observe reviews section scrolling into view ────────
    useEffect(() => {
        if (!p) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setReviewsVisible(true); },
            { rootMargin: '150px' }
        );
        if (reviewsRef.current) observer.observe(reviewsRef.current);
        return () => observer.disconnect();
    }, [p]);

    // ── Fetch reviews (paginated) when visible or page changes
    useEffect(() => {
        if (!reviewsVisible || !id) return;
        setReviewLoading(true);
        api.get(`/properties/${id}/reviews`, {
            params: { page: reviewPage, limit: REVIEW_LIMIT }
        })
            .then(({ data }) => {
                setReviews(data.reviews);
                setAvgRating(data.avg_rating);
                setTotalReviews(data.total);
                setReviewPagination(data.pagination);
            })
            .catch(() => { })
            .finally(() => setReviewLoading(false));
    }, [reviewsVisible, id, reviewPage]);

    // ── Handlers ───────────────────────────────────────────
    const changeImage = (index) => {
        setImgLoaded(false);
        setActiveImg(index);
    };

    const handleBookmark = async () => {
        try {
            const { data } = await api.post(`/properties/${id}/bookmark`);
            setBookmarked(data.bookmarked);
        } catch { }
    };

    const handleContact = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/properties/${id}/contact`, { message: msg });
            setContacted(true);
        } catch { }
    };

    const handleReview = async (e) => {
        e.preventDefault();
        if (!myRating) return;
        try {
            await api.post(`/properties/${id}/reviews`, {
                rating: myRating, comment: myComment
            });
            setReviewSubmitted(true);
            setReviewPage(1);
            // Refresh reviews from page 1
            const { data } = await api.get(`/properties/${id}/reviews`, {
                params: { page: 1, limit: REVIEW_LIMIT }
            });
            setReviews(data.reviews);
            setAvgRating(data.avg_rating);
            setTotalReviews(data.total);
            setReviewPagination(data.pagination);
        } catch { }
    };

    const handleReply = async (reviewId) => {
        try {
            await api.put(`/properties/${id}/reviews/${reviewId}/reply`, {
                reply: replyText[reviewId]
            });
            // Refresh current page
            const { data } = await api.get(`/properties/${id}/reviews`, {
                params: { page: reviewPage, limit: REVIEW_LIMIT }
            });
            setReviews(data.reviews);
            setReplyText(prev => ({ ...prev, [reviewId]: '' }));
        } catch { }
    };

    const handleReport = async () => {
        try {
            await api.post(`/properties/${id}/report`, { reason: reportReason });
            setReportDone(true);
            setShowReport(false);
        } catch { }
    };

    const handleReviewPageChange = (newPage) => {
        setReviewPage(newPage);
        reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // ── Loading skeleton ───────────────────────────────────
    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
                <div className="h-5 w-48 bg-gray-100 rounded mb-6" />
                <div className="h-72 md:h-[480px] bg-gray-100 rounded-2xl mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-5">
                        <div className="h-8 w-2/3 bg-gray-100 rounded" />
                        <div className="h-4 w-1/3 bg-gray-100 rounded" />
                        <div className="grid grid-cols-4 gap-3">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="h-16 bg-gray-100 rounded-xl" />
                            ))}
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-100 rounded" />
                            <div className="h-4 bg-gray-100 rounded w-5/6" />
                            <div className="h-4 bg-gray-100 rounded w-4/6" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="h-40 bg-gray-100 rounded-2xl" />
                        <div className="h-52 bg-gray-100 rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    // ── Not found ──────────────────────────────────────────
    if (!p) {
        return (
            <div className="text-center py-20">
                <div className="text-6xl mb-4">🏚</div>
                <h2 className="font-display text-2xl font-bold mb-2">Property not found</h2>
                <p className="text-gray-500 mb-6">
                    This listing may have been removed or doesn't exist.
                </p>
                <Link to="/browse" className="btn-primary inline-flex">
                    Browse Properties
                </Link>
            </div>
        );
    }

    const images = p.images || [];
    const allowed = p.rules?.filter(r => r.rule_type === 'allowed') || [];
    const notAllowed = p.rules?.filter(r => r.rule_type === 'not_allowed') || [];
    const general = p.rules?.filter(r => r.rule_type === 'general') || [];

    // ──────────────────────────────────────────────────────
    return (
        <div className="max-w-6xl mx-auto px-4 py-8">

            {/* ── Breadcrumb + Actions ───────────────────────── */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Link to="/browse" className="hover:text-primary-600 transition-colors">
                        Browse
                    </Link>
                    <span>/</span>
                    <span className="text-gray-900 truncate max-w-xs">{p.title}</span>
                </div>
                <div className="flex items-center gap-2">
                    <ShareButton title={p.title} id={p.id} />
                    {user && !reportDone && (
                        <button
                            onClick={() => setShowReport(!showReport)}
                            className="btn-outline py-2 px-3 text-sm text-red-500 border-red-200 hover:bg-red-50">
                            <Flag size={14} /> Report
                        </button>
                    )}
                    {reportDone && (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <CheckCircle2 size={13} /> Reported
                        </span>
                    )}
                </div>
            </div>

            {/* ── Report Box ────────────────────────────────── */}
            {showReport && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                    <p className="text-sm font-semibold text-red-800 mb-2">
                        Report this listing
                    </p>
                    <input
                        value={reportReason}
                        onChange={e => setReportReason(e.target.value)}
                        className="input mb-3 text-sm"
                        placeholder="Reason (e.g. fake listing, wrong photos...)" />
                    <div className="flex gap-2">
                        <button
                            onClick={handleReport}
                            className="btn py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-xl px-4">
                            Submit Report
                        </button>
                        <button
                            onClick={() => setShowReport(false)}
                            className="btn-outline py-1.5 text-sm">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* ── Image Gallery ──────────────────────────────── */}
            <div className="relative rounded-2xl overflow-hidden mb-8 bg-gray-100">
                {images.length > 0 ? (
                    <div>
                        {/* Main image */}
                        <div className="relative h-72 md:h-[480px]">
                            {!imgLoaded && (
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
                            )}
                            <img
                                key={images[activeImg]?.filename}
                                src={imgUrl(images[activeImg]?.filename)}
                                alt={p.title}
                                loading="eager"
                                decoding="async"
                                onLoad={() => setImgLoaded(true)}
                                className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                            />

                            {/* Image counter */}
                            {images.length > 1 && (
                                <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full z-10">
                                    {activeImg + 1} / {images.length}
                                </div>
                            )}
                        </div>

                        {/* Prev / Next */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={() => changeImage((activeImg - 1 + images.length) % images.length)}
                                    className="absolute left-4 top-[45%] -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2.5 shadow-md transition-all z-10">
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={() => changeImage((activeImg + 1) % images.length)}
                                    className="absolute right-4 top-[45%] -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2.5 shadow-md transition-all z-10">
                                    <ChevronRight size={18} />
                                </button>
                            </>
                        )}

                        {/* Bookmark */}
                        {user?.role === 'renter' && (
                            <button
                                onClick={handleBookmark}
                                className={`absolute top-4 right-4 p-2.5 rounded-full shadow-md transition-all z-10 ${bookmarked
                                    ? 'bg-red-500 text-white'
                                    : 'bg-white/90 text-gray-600 hover:text-red-500'
                                    }`}>
                                <Heart size={17} fill={bookmarked ? 'currentColor' : 'none'} />
                            </button>
                        )}

                        {/* Thumbnail strip — lazy loaded */}
                        {images.length > 1 && (
                            <div className="flex gap-2 p-3 bg-gray-50 overflow-x-auto">
                                {images.map((img, i) => (
                                    <button
                                        key={img.id}
                                        onClick={() => changeImage(i)}
                                        className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg
                                            ? 'border-primary-500'
                                            : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}>
                                        <img
                                            src={imgUrl(img.filename)}
                                            alt=""
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-72 flex items-center justify-center text-7xl bg-gradient-to-br from-primary-50 to-orange-50">
                        🏠
                    </div>
                )}
            </div>

            {/* ── Main Content Grid ──────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ════ LEFT COLUMN ════════════════════════════ */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Title + Price */}
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="font-display text-3xl font-bold mb-1">{p.title}</h1>
                            <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-2">
                                <MapPin size={14} className="flex-shrink-0" />
                                <span>
                                    {p.address ? `${p.address}, ` : ''}{p.city}, {p.state}
                                </span>
                            </div>
                            {avgRating > 0 && (
                                <div className="flex items-center gap-2">
                                    <RatingStars rating={Math.round(avgRating)} size={16} />
                                    <span className="text-sm font-semibold">
                                        {(+avgRating).toFixed(1)}
                                    </span>
                                    <span className="text-sm text-gray-400">
                                        ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-0.5 text-primary-700 font-bold text-3xl">
                                <IndianRupee size={20} />
                                {p.rent.toLocaleString('en-IN')}
                            </div>
                            <p className="text-xs text-gray-400">per month</p>
                            {p.security_deposit > 0 && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Deposit: ₹{p.security_deposit.toLocaleString('en-IN')}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Special Tags */}
                    {(p.bachelor_friendly || p.pet_friendly || p.near_metro) && (
                        <div className="flex flex-wrap gap-2">
                            {p.bachelor_friendly === 1 && (
                                <span className="badge bg-blue-50 text-blue-700 px-3 py-1.5">
                                    👨‍💼 Bachelor Friendly
                                </span>
                            )}
                            {p.pet_friendly === 1 && (
                                <span className="badge bg-green-50 text-green-700 px-3 py-1.5">
                                    🐾 Pet Friendly
                                </span>
                            )}
                            {p.near_metro === 1 && (
                                <span className="badge bg-purple-50 text-purple-700 px-3 py-1.5">
                                    🚇 Near Metro
                                </span>
                            )}
                        </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { icon: <Bed size={18} className="text-primary-600" />, label: 'Bedrooms', val: `${p.bedrooms} BHK` },
                            { icon: <Bath size={18} className="text-primary-600" />, label: 'Bathrooms', val: p.bathrooms },
                            { icon: <Square size={18} className="text-primary-600" />, label: 'Area', val: p.area_sqft ? `${p.area_sqft} sqft` : 'N/A' },
                            { icon: <Car size={18} className="text-primary-600" />, label: 'Parking', val: p.parking > 0 ? `${p.parking} spot` : 'None' },
                            { icon: <Layers size={18} className="text-primary-600" />, label: 'Floor', val: p.floor ? `${p.floor}/${p.total_floors || '?'}` : 'N/A' },
                            { icon: <Info size={18} className="text-primary-600" />, label: 'Furnished', val: <span className="capitalize">{p.furnished}</span> },
                            { icon: <Info size={18} className="text-primary-600" />, label: 'Type', val: <span className="capitalize">{p.property_type}</span> },
                            { icon: <Calendar size={18} className="text-primary-600" />, label: 'Available', val: p.available_from || 'Immediately' },
                        ].map(d => (
                            <div key={d.label} className="bg-gray-50 rounded-xl p-3 flex items-start gap-2.5">
                                <div className="mt-0.5 flex-shrink-0">{d.icon}</div>
                                <div>
                                    <p className="text-xs text-gray-400">{d.label}</p>
                                    <p className="text-sm font-semibold">{d.val}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Description */}
                    {p.description && (
                        <div>
                            <h2 className="font-display text-xl font-bold mb-2">
                                About this Property
                            </h2>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {p.description}
                            </p>
                        </div>
                    )}

                    {/* Amenities */}
                    {p.amenities?.length > 0 && (
                        <div>
                            <h2 className="font-display text-xl font-bold mb-3">Amenities</h2>
                            <div className="flex flex-wrap gap-2">
                                {p.amenities.map(a => (
                                    <span
                                        key={a}
                                        className="badge bg-primary-50 text-primary-700 px-3 py-1.5 capitalize">
                                        {a}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Rules */}
                    {p.rules?.length > 0 && (
                        <div>
                            <h2 className="font-display text-xl font-bold mb-4">
                                Rules & Regulations
                            </h2>
                            <div className="space-y-4">
                                {allowed.length > 0 && (
                                    <RuleList
                                        title="Allowed"
                                        rules={allowed}
                                        icon={<CheckCircle2 size={14} className="text-green-500 flex-shrink-0 mt-0.5" />}
                                        color="text-green-700" />
                                )}
                                {notAllowed.length > 0 && (
                                    <RuleList
                                        title="Not Allowed"
                                        rules={notAllowed}
                                        icon={<XCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />}
                                        color="text-red-700" />
                                )}
                                {general.length > 0 && (
                                    <RuleList
                                        title="General"
                                        rules={general}
                                        icon={<Info size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />}
                                        color="text-gray-700" />
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Reviews Section ────────────────────────── */}
                    <div ref={reviewsRef}>
                        <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                            Reviews
                            {avgRating > 0 && (
                                <span className="text-primary-600 text-lg font-bold">
                                    {(+avgRating).toFixed(1)} ⭐
                                </span>
                            )}
                            {totalReviews > 0 && (
                                <span className="text-sm font-normal text-gray-400">
                                    ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
                                </span>
                            )}
                        </h2>

                        {/* Write a review */}
                        {user?.role === 'renter' && !reviewSubmitted && (
                            <form
                                onSubmit={handleReview}
                                className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
                                <p className="text-sm font-semibold mb-3">Write a Review</p>
                                <div className="mb-3">
                                    <p className="text-xs text-gray-500 mb-2">Your Rating</p>
                                    <RatingStars
                                        rating={myRating}
                                        size={28}
                                        interactive
                                        onRate={setMyRating} />
                                </div>
                                <textarea
                                    value={myComment}
                                    onChange={e => setMyComment(e.target.value)}
                                    rows={3}
                                    className="input resize-none text-sm mb-3"
                                    placeholder="Share your experience about this property..." />
                                <button
                                    type="submit"
                                    disabled={!myRating}
                                    className="btn-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    Submit Review
                                </button>
                            </form>
                        )}

                        {reviewSubmitted && (
                            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5 text-sm text-green-700 flex items-center gap-2">
                                <CheckCircle2 size={15} /> Review submitted successfully!
                            </div>
                        )}

                        {/* Review skeletons while loading */}
                        {!reviewsVisible && (
                            <div className="space-y-4">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-9 h-9 rounded-full bg-gray-100" />
                                            <div className="space-y-2 flex-1">
                                                <div className="h-3 w-28 bg-gray-100 rounded" />
                                                <div className="h-3 w-20 bg-gray-100 rounded" />
                                            </div>
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded w-full" />
                                        <div className="h-3 bg-gray-100 rounded w-4/5 mt-1.5" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Review loading spinner when paginating */}
                        {reviewsVisible && reviewLoading && (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                            </div>
                        )}

                        {/* Empty state */}
                        {reviewsVisible && !reviewLoading && reviews.length === 0 && !reviewSubmitted && (
                            <div className="text-center py-8 bg-gray-50 rounded-2xl">
                                <p className="text-gray-400 text-sm">
                                    No reviews yet. {user?.role === 'renter' ? 'Be the first to review!' : ''}
                                </p>
                            </div>
                        )}

                        {/* Review list */}
                        {reviewsVisible && !reviewLoading && reviews.length > 0 && (
                            <>
                                <div className="space-y-4">
                                    {reviews.map(r => (
                                        <div
                                            key={r.id}
                                            className="bg-white rounded-2xl border border-gray-200 p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                                                        {r.renter_name?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold">{r.renter_name}</p>
                                                        <RatingStars rating={r.rating} size={13} />
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-400 flex-shrink-0">
                                                    {new Date(r.created_at).toLocaleDateString('en-IN', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })}
                                                </p>
                                            </div>

                                            {r.comment && (
                                                <p className="text-sm text-gray-600 ml-12 leading-relaxed">
                                                    {r.comment}
                                                </p>
                                            )}

                                            {r.owner_reply && (
                                                <div className="bg-primary-50 rounded-xl p-3 mt-3 ml-12 border-l-4 border-primary-400">
                                                    <p className="text-xs font-semibold text-primary-700 mb-1">
                                                        Owner's Reply
                                                    </p>
                                                    <p className="text-sm text-gray-700">{r.owner_reply}</p>
                                                </div>
                                            )}

                                            {user?.role === 'owner' && !r.owner_reply && (
                                                <div className="mt-3 ml-12 flex gap-2">
                                                    <input
                                                        value={replyText[r.id] || ''}
                                                        onChange={e => setReplyText(prev => ({
                                                            ...prev, [r.id]: e.target.value
                                                        }))}
                                                        className="input flex-1 text-sm"
                                                        placeholder="Reply to this review..." />
                                                    <button
                                                        onClick={() => handleReply(r.id)}
                                                        className="btn-primary py-2 px-3 text-sm">
                                                        Reply
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Reviews Pagination */}
                                <Pagination
                                    pagination={reviewPagination}
                                    onPageChange={handleReviewPageChange}
                                    className="mt-6 pt-5 border-t border-gray-100" />
                            </>
                        )}
                    </div>
                </div>

                {/* ════ RIGHT SIDEBAR ════════════════════════════ */}
                <div className="space-y-4">

                    {/* Owner card */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5">
                        <h3 className="font-semibold mb-4">Property Owner</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg flex-shrink-0">
                                {p.owner_name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-sm">{p.owner_name}</p>
                                <p className="text-xs text-gray-400">Verified Owner</p>
                            </div>
                        </div>
                        {p.owner_phone && (
                            <a
                                href={`tel:${p.owner_phone}`}
                                className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 mb-2 transition-colors">
                                <Phone size={13} />{p.owner_phone}
                            </a>
                        )}
                        {user?.role === 'renter' && p.owner_email && (
                            <a
                                href={`mailto:${p.owner_email}`}
                                className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors">
                                <Mail size={13} />{p.owner_email}
                            </a>
                        )}
                    </div>

                    {/* Contact form */}
                    {user?.role === 'renter' && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-5">
                            <h3 className="font-semibold mb-3">Send Message</h3>
                            {contacted ? (
                                <div className="text-center py-4">
                                    <CheckCircle2 size={30} className="text-green-500 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-700">
                                        Message sent to owner!
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        They will contact you soon.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleContact} className="space-y-3">
                                    <textarea
                                        value={msg}
                                        onChange={e => setMsg(e.target.value)}
                                        rows={4}
                                        className="input resize-none text-sm"
                                        placeholder="Hi, I'm interested in this property..."
                                        required />
                                    <button type="submit" className="btn-primary w-full justify-center">
                                        Send Message
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Not logged in */}
                    {!user && (
                        <div className="bg-primary-50 rounded-2xl p-5 text-center">
                            <p className="text-sm text-primary-800 mb-3">
                                Sign in to contact the owner or save this property
                            </p>
                            <Link to="/login" className="btn-primary w-full justify-center">
                                Sign In
                            </Link>
                        </div>
                    )}

                    {/* Rent Calculator link */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-4">
                        <Link
                            to="/calculator"
                            className="flex items-center gap-2 text-sm text-primary-600 font-semibold hover:underline">
                            🧮 Calculate split rent for this property
                        </Link>
                    </div>

                    {/* Sticky summary card on desktop */}
                    <div className="hidden lg:block bg-gradient-to-br from-dark to-gray-800 rounded-2xl p-5 text-white">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
                            Quick Summary
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Monthly Rent</span>
                                <span className="font-bold text-primary-400">
                                    ₹{p.rent.toLocaleString('en-IN')}
                                </span>
                            </div>
                            {p.security_deposit > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Deposit</span>
                                    <span className="font-semibold">
                                        ₹{p.security_deposit.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-400">Move-in Cost</span>
                                <span className="font-bold text-white">
                                    ₹{(p.rent + (p.security_deposit || 0)).toLocaleString('en-IN')}
                                </span>
                            </div>
                            {avgRating > 0 && (
                                <div className="flex justify-between pt-2 border-t border-white/10">
                                    <span className="text-gray-400">Rating</span>
                                    <span className="font-semibold">
                                        {(+avgRating).toFixed(1)} ⭐ ({totalReviews})
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Similar Properties — lazy loaded ──────────── */}
            <Suspense fallback={
                <div className="mt-12">
                    <div className="h-7 w-64 bg-gray-100 rounded animate-pulse mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                </div>
            }>
                <SimilarProperties
                    currentId={p.id}
                    city={p.city}
                    propertyType={p.property_type} />
            </Suspense>

        </div>
    );
}

// ── Helper ─────────────────────────────────────────────────
function RuleList({ title, rules, icon, color }) {
    return (
        <div>
            <h4 className={`text-sm font-semibold mb-2 ${color}`}>{title}</h4>
            <ul className="space-y-1.5">
                {rules.map(r => (
                    <li key={r.id} className="flex items-start gap-2 text-sm text-gray-700">
                        {icon}{r.rule_text}
                    </li>
                ))}
            </ul>
        </div>
    );
}