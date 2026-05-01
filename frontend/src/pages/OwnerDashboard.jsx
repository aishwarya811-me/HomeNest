import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { imgUrl } from '../utils/api';
import Pagination from '../components/Pagination';
import {
    Plus, Edit3, Trash2, Image, Eye, MessageSquare,
    Star, ToggleLeft, ToggleRight, LayoutDashboard,
    TrendingUp, Home as HomeIcon, CheckCircle, IndianRupee
} from 'lucide-react';

const LIMIT = 8;

/* ── Unsplash fallbacks for property thumbnails ─────────────────── */
const PHOTO_FALLBACKS = [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=75',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=75',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=75',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=400&q=75',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=400&q=75',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&q=75',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=400&q=75',
    'https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&w=400&q=75',
];

function getThumb(p, idx) {
    const primary = p.images?.find(i => i.is_primary) || p.images?.[0];
    if (primary?.filename) return imgUrl(primary.filename);
    return PHOTO_FALLBACKS[idx % PHOTO_FALLBACKS.length];
}

/* ── Analytics Stat Card ────────────────────────────────────────── */
function AnalyticCard({ icon, label, value, sub, gradient }) {
    return (
        <div className={`rounded-2xl p-5 text-white relative overflow-hidden ${gradient}`}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-6 translate-x-6" />
            <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                    {icon}
                </div>
                <p className="font-display text-3xl font-bold mb-0.5">{value}</p>
                <p className="text-sm opacity-80">{label}</p>
                {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
            </div>
        </div>
    );
}

export default function OwnerDashboard() {
    const { user } = useAuth();
    const [properties, setProperties] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);

    /* Aggregate analytics derived from loaded batch */
    const analytics = {
        total: pagination?.total ?? 0,
        available: properties.filter(p => p.available).length,
        totalInquiries: properties.reduce((s, p) => s + (p.total_contacts || 0), 0),
        avgRating: (() => {
            const rated = properties.filter(p => p.avg_rating > 0);
            if (!rated.length) return '—';
            return (rated.reduce((s, p) => s + p.avg_rating, 0) / rated.length).toFixed(1);
        })(),
    };

    const fetchProperties = async (currentPage = 1) => {
        setLoading(true);
        try {
            const { data } = await api.get('/properties/owner/mine', {
                params: { page: currentPage, limit: LIMIT }
            });
            setProperties(data.properties);
            setPagination(data.pagination);
        } catch {
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProperties(page); }, [page]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleAvailability = async (id, current) => {
        await api.put(`/properties/${id}`, { available: !current });
        setProperties(prev =>
            prev.map(p => p.id === id ? { ...p, available: current ? 0 : 1 } : p)
        );
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this property? This cannot be undone.')) return;
        setDeleting(id);
        try {
            await api.delete(`/properties/${id}`);
            if (properties.length === 1 && page > 1) {
                setPage(p => p - 1);
            } else {
                fetchProperties(page);
            }
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Hero Banner ─────────────────────────────────────── */}
            <div className="relative h-44 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1600&q=80"
                    alt="Property management"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-800/60 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16">
                    <p className="text-primary-300 text-sm font-medium mb-1">Owner Portal</p>
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
                        {user?.name?.split(' ')[0]}'s Dashboard
                    </h1>
                    <p className="text-gray-300 text-sm mt-1">Manage your properties, track inquiries, and grow your rental income.</p>
                </div>
                {/* Action buttons overlay */}
                <div className="absolute bottom-4 right-6 flex gap-2">
                    <Link to="/owner/contacts" className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white border border-white/30 px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-white/30 transition">
                        <MessageSquare size={14} /> Requests
                    </Link>
                    <Link to="/owner/add" className="flex items-center gap-1.5 bg-primary-600 text-white px-4 py-1.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition shadow-lg">
                        <Plus size={14} /> Add Property
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

                {/* ── Analytics Cards ─────────────────────────────── */}
                <div>
                    <h2 className="font-display text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-primary-600" /> Analytics Overview
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <AnalyticCard
                            icon={<HomeIcon size={18} className="text-white" />}
                            label="Total Listed"
                            value={loading ? '—' : analytics.total}
                            sub="across all pages"
                            gradient="bg-gradient-to-br from-primary-600 to-primary-800"
                        />
                        <AnalyticCard
                            icon={<CheckCircle size={18} className="text-white" />}
                            label="Available Now"
                            value={loading ? '—' : analytics.available}
                            sub="on this page"
                            gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
                        />
                        <AnalyticCard
                            icon={<MessageSquare size={18} className="text-white" />}
                            label="Total Inquiries"
                            value={loading ? '—' : analytics.totalInquiries}
                            sub="on this page"
                            gradient="bg-gradient-to-br from-blue-500 to-blue-700"
                        />
                        <AnalyticCard
                            icon={<Star size={18} className="text-white" />}
                            label="Avg. Rating"
                            value={loading ? '—' : analytics.avgRating}
                            sub="from reviews"
                            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                        />
                    </div>
                </div>

                {/* ── Properties List ──────────────────────────────── */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-display text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <LayoutDashboard size={18} className="text-primary-600" /> My Properties
                            {pagination && (
                                <span className="text-sm text-gray-400 font-normal">({pagination.total} total)</span>
                            )}
                        </h2>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(LIMIT)].map((_, i) => (
                                <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-gray-100" />
                            ))}
                        </div>
                    ) : properties.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                            <div className="relative w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=200&q=80"
                                    alt="Property"
                                    className="w-full h-full object-cover opacity-40"
                                />
                                <div className="absolute inset-0 flex items-center justify-center text-4xl">🏠</div>
                            </div>
                            <h3 className="font-display text-xl font-bold mb-2">No properties yet</h3>
                            <p className="text-gray-500 mb-6">Add your first property to start receiving enquiries.</p>
                            <Link to="/owner/add" className="btn-primary inline-flex">
                                <Plus size={16} /> Add Your First Property
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3 mb-8">
                                {properties.map((p, idx) => (
                                    <div
                                        key={p.id}
                                        className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 hover:shadow-md transition-all duration-200 group"
                                    >
                                        {/* Thumbnail */}
                                        <div className="w-24 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                            <img
                                                src={getThumb(p, idx)}
                                                alt={p.title}
                                                loading="lazy"
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 flex-wrap">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 truncate">{p.title}</h3>
                                                    <p className="text-sm text-gray-400">{p.city}, {p.state}</p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="font-bold text-primary-700 flex items-center gap-0.5">
                                                        <IndianRupee size={13} />{p.rent?.toLocaleString('en-IN')}/mo
                                                    </p>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {p.available ? '● Available' : '● Unavailable'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Stats + Actions */}
                                            <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <MessageSquare size={12} />
                                                        {p.total_contacts || 0} enquiries
                                                        {p.unread_contacts > 0 && (
                                                            <span className="bg-red-500 text-white rounded-full px-1.5 font-bold">
                                                                {p.unread_contacts} new
                                                            </span>
                                                        )}
                                                    </span>
                                                    {p.avg_rating > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <Star size={12} className="text-amber-400 fill-amber-400" />
                                                            {p.avg_rating} ({p.review_count})
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => toggleAvailability(p.id, p.available)}
                                                        title={p.available ? 'Mark unavailable' : 'Mark available'}
                                                        className={`p-2 rounded-lg transition-colors ${p.available ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}>
                                                        {p.available ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                                    </button>
                                                    <Link to={`/property/${p.id}`}
                                                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors" title="Preview">
                                                        <Eye size={16} />
                                                    </Link>
                                                    <Link to={`/owner/images/${p.id}`}
                                                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors" title="Manage photos">
                                                        <Image size={16} />
                                                    </Link>
                                                    <Link to={`/owner/edit/${p.id}`}
                                                        className="p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Edit">
                                                        <Edit3 size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(p.id)}
                                                        disabled={deleting === p.id}
                                                        className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50" title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Pagination
                                pagination={pagination}
                                onPageChange={handlePageChange}
                                className="pt-6 border-t border-gray-100" />
                        </>
                    )}
                </div>

                {/* ── Tips for Owners ─────────────────────────────── */}
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        {
                            img: 'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?auto=format&fit=crop&w=600&q=75',
                            tip: 'High-quality photos get 3× more inquiries. Upload bright, angle shots.',
                            cta: 'Manage Photos',
                            link: '#',
                        },
                        {
                            img: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=600&q=75',
                            tip: 'Keep your listing updated with accurate rent and availability to rank higher.',
                            cta: 'Edit Listings',
                            link: '#',
                        },
                        {
                            img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=75',
                            tip: 'Respond to inquiries within 24 hours to improve your response rate.',
                            cta: 'View Requests',
                            link: '/owner/contacts',
                        },
                    ].map((t, i) => (
                        <div key={i} className="relative rounded-2xl overflow-hidden h-40 group cursor-pointer">
                            <img
                                src={t.img}
                                alt="Tip"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            <div className="absolute bottom-3 left-3 right-3">
                                <p className="text-white text-xs leading-snug mb-2">{t.tip}</p>
                                <Link to={t.link} className="text-primary-300 text-xs font-semibold hover:text-white transition-colors">
                                    {t.cta} →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}