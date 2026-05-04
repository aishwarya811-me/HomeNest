import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { imgUrl } from '../utils/api';
import {
    Heart, MessageSquare, Search, Calculator, MapPin,
    Home as HomeIcon, TrendingUp, Eye, ArrowRight, Star,
    Clock, Building2, Bed, IndianRupee, ChevronRight
} from 'lucide-react';

/* ── Real Unsplash photos ──────────────────────────────────────────── */
const CITY_PHOTOS = [
    {
        city: 'Mumbai',
        state: 'Maharashtra',
        photo: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
        tag: '1,200+ listings',
    },
    {
        city: 'Bangalore',
        state: 'Karnataka',
        photo: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
        tag: '980+ listings',
    },
    {
        city: 'Delhi',
        state: 'Delhi',
        photo: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
        tag: '870+ listings',
    },
    {
        city: 'Hyderabad',
        state: 'Telangana',
        photo: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
        tag: '650+ listings',
    },
];

const PROPERTY_FALLBACKS = [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
];

/* ── Helpers ─────────────────────────────────────────────────────────*/
function getPropertyPhoto(property, index) {
    const primary = property.images?.find(i => i.is_primary) || property.images?.[0];
    if (primary?.filename) return imgUrl(primary.filename);
    return PROPERTY_FALLBACKS[index % PROPERTY_FALLBACKS.length];
}

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

/* ── Stat Card ───────────────────────────────────────────────────────*/
function StatCard({ icon, label, value, color, bg }) {
    return (
        <div className={`rounded-2xl p-5 flex items-center gap-4 ${bg} border border-white/60 shadow-sm`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-bold font-display leading-none">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
        </div>
    );
}

/* ── Main Component ──────────────────────────────────────────────────*/
export default function RenterDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [bookmarks, setBookmarks] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [stats, setStats] = useState({ saved: 0, inquiries: 0, viewed: 0 });
    const [loading, setLoading] = useState(true);
    const [searchCity, setSearchCity] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [bkRes, ctRes] = await Promise.allSettled([
                    api.get('/properties/renter/bookmarks', { params: { page: 1, limit: 3 } }),
                    api.get('/contacts/renter', { params: { page: 1, limit: 5 } }),
                ]);

                const bk = bkRes.status === 'fulfilled' ? bkRes.value.data : { properties: [], pagination: { total: 0 } };
                const ct = ctRes.status === 'fulfilled' ? ctRes.value.data : { contacts: [], pagination: { total: 0 } };

                setBookmarks(bk.properties || []);
                setContacts(ct.contacts || []);
                setStats({
                    saved: bk.pagination?.total || 0,
                    inquiries: ct.pagination?.total || 0,
                    viewed: parseInt(localStorage.getItem('hn_viewed') || '0', 10),
                });
            } catch {
                /* silently degrade */
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const statCards = [
        { icon: <Heart size={20} className="text-rose-600" />, label: 'Saved Properties', value: loading ? '—' : stats.saved, color: 'bg-rose-100', bg: 'bg-rose-50' },
        { icon: <MessageSquare size={20} className="text-blue-600" />, label: 'Inquiries Sent', value: loading ? '—' : stats.inquiries, color: 'bg-blue-100', bg: 'bg-blue-50' },
        { icon: <Eye size={20} className="text-violet-600" />, label: 'Properties Viewed', value: loading ? '—' : stats.viewed, color: 'bg-violet-100', bg: 'bg-violet-50' },
        { icon: <Building2 size={20} className="text-emerald-600" />, label: 'Cities Explored', value: 4, color: 'bg-emerald-100', bg: 'bg-emerald-50' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Hero Banner ─────────────────────────────────────── */}
            <div className="relative h-52">
                <img
                    src="https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1600&q=80"
                    alt="Modern living room"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-800/60 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16">
                    <p className="text-primary-300 text-sm font-medium mb-1">Welcome back 👋</p>
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                        {user?.name?.split(' ')[0]}'s Dashboard
                    </h1>
                    <p className="text-gray-300 text-sm">Find, save and track your perfect rental home.</p>
                </div>

                {/* Quick search inside banner */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-full max-w-lg px-4 z-10">
                    <div className="bg-white rounded-2xl shadow-xl flex gap-2 p-2">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                value={searchCity}
                                onChange={e => setSearchCity(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && navigate(`/browse?city=${searchCity}`)}
                                placeholder="Search by city..."
                                className="w-full pl-9 pr-3 py-2 text-sm outline-none rounded-xl"
                            />
                        </div>
                        <button
                            onClick={() => navigate(`/browse?city=${searchCity}`)}
                            className="btn-primary text-sm px-5 py-2 whitespace-nowrap"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 pt-16 pb-12 space-y-10">

                {/* ── Stats Row ───────────────────────────────────── */}
                <div>
                    <h2 className="font-display text-lg font-semibold text-gray-800 mb-4">Your Activity</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {statCards.map(s => (
                            <StatCard key={s.label} {...s} />
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* ── Left Column (2/3) ───────────────────────── */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Saved Properties Preview */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-display text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <Heart size={18} className="text-rose-500" /> Saved Properties
                                </h2>
                                <Link to="/bookmarks" className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:underline">
                                    View all <ChevronRight size={14} />
                                </Link>
                            </div>

                            {loading ? (
                                <div className="grid md:grid-cols-3 gap-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-52 bg-gray-200 rounded-2xl animate-pulse" />)}
                                </div>
                            ) : bookmarks.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
                                    <Heart size={36} className="mx-auto mb-3 text-gray-300" />
                                    <p className="font-semibold text-gray-700 mb-1">No saved properties yet</p>
                                    <p className="text-sm text-gray-400 mb-4">Browse and tap the heart to save listings here.</p>
                                    <Link to="/browse" className="btn-primary text-sm">Browse Now</Link>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-3 gap-4">
                                    {bookmarks.map((p, idx) => (
                                        <Link
                                            key={p.id}
                                            to={`/property/${p.id}`}
                                            className="group block bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                                        >
                                            <div className="relative h-36 overflow-hidden">
                                                <img
                                                    src={getPropertyPhoto(p, idx)}
                                                    alt={p.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                                <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs font-semibold">
                                                    <IndianRupee size={11} />
                                                    {p.rent?.toLocaleString('en-IN')}/mo
                                                </div>
                                            </div>
                                            <div className="p-3">
                                                <p className="text-sm font-semibold text-gray-900 line-clamp-1">{p.title}</p>
                                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                    <MapPin size={10} />{p.city}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    <Bed size={10} />{p.bedrooms} BHK
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Inquiries */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-display text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <MessageSquare size={18} className="text-blue-500" /> Recent Inquiries
                                </h2>
                            </div>

                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}
                                </div>
                            ) : contacts.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center">
                                    <MessageSquare size={32} className="mx-auto mb-3 text-gray-300" />
                                    <p className="text-gray-500 text-sm">No inquiries yet. Contact an owner from any property page.</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden shadow-sm">
                                    {contacts.map((c, idx) => (
                                        <Link
                                            key={c.id || idx}
                                            to={`/property/${c.property_id}`}
                                            className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                                                <img
                                                    src={PROPERTY_FALLBACKS[idx % PROPERTY_FALLBACKS.length]}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{c.property_title || 'Property Inquiry'}</p>
                                                <p className="text-xs text-gray-400 truncate">{c.message?.slice(0, 60)}…</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === 'read' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {c.status === 'read' ? 'Seen' : 'Pending'}
                                                </span>
                                                <span className="text-xs text-gray-400 flex items-center gap-0.5">
                                                    <Clock size={9} /> {timeAgo(c.created_at)}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Right Column (1/3) ──────────────────────── */}
                    <div className="space-y-6">

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h3 className="font-display font-semibold text-gray-800 mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                {[
                                    { to: '/browse', icon: <Search size={16} className="text-primary-600" />, label: 'Browse Properties', bg: 'bg-primary-50' },
                                    { to: '/bookmarks', icon: <Heart size={16} className="text-rose-500" />, label: 'My Saved List', bg: 'bg-rose-50' },
                                    { to: '/calculator', icon: <Calculator size={16} className="text-violet-600" />, label: 'Rent Calculator', bg: 'bg-violet-50' },
                                    { to: '/profile', icon: <HomeIcon size={16} className="text-emerald-600" />, label: 'My Profile', bg: 'bg-emerald-50' },
                                ].map(a => (
                                    <Link
                                        key={a.to}
                                        to={a.to}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                                    >
                                        <div className={`w-8 h-8 ${a.bg} rounded-lg flex items-center justify-center`}>{a.icon}</div>
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{a.label}</span>
                                        <ArrowRight size={13} className="ml-auto text-gray-300 group-hover:text-primary-500 transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Tip Card */}
                        <div className="relative rounded-2xl overflow-hidden h-44">
                            <img
                                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80"
                                alt="Modern home interior"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-800/40 to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Star size={12} className="text-amber-400 fill-amber-400" />
                                    <p className="text-amber-300 text-xs font-semibold">Pro Tip</p>
                                </div>
                                <p className="text-white text-sm font-medium leading-snug">
                                    Use filters to find pet-friendly or bachelor-friendly homes faster!
                                </p>
                                <Link to="/browse" className="text-primary-300 text-xs mt-2 inline-flex items-center gap-1 hover:text-white transition-colors">
                                    Try filters <ArrowRight size={11} />
                                </Link>
                            </div>
                        </div>

                        {/* Market Insight */}
                        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-5 text-white">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp size={18} className="text-primary-200" />
                                <h3 className="font-semibold text-sm">Market Insight</h3>
                            </div>
                            <p className="text-xs text-primary-200 leading-relaxed mb-3">
                                Bangalore & Mumbai have the highest demand this month. Book early for best rates!
                            </p>
                            <div className="space-y-2">
                                {[['Mumbai', '₹18,000 avg/mo'], ['Bangalore', '₹15,500 avg/mo'], ['Delhi', '₹12,000 avg/mo']].map(([city, rent]) => (
                                    <div key={city} className="flex justify-between text-xs">
                                        <span className="text-primary-100">{city}</span>
                                        <span className="font-semibold">{rent}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Explore Cities ──────────────────────────────── */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-display text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <MapPin size={18} className="text-primary-600" /> Explore Cities
                        </h2>
                        <Link to="/browse" className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:underline">
                            All cities <ChevronRight size={14} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {CITY_PHOTOS.map(c => (
                            <Link
                                key={c.city}
                                to={`/browse?city=${c.city}`}
                                className="group relative h-40 rounded-2xl overflow-hidden cursor-pointer"
                            >
                                <img
                                    src={c.photo}
                                    alt={c.city}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                <div className="absolute bottom-3 left-3">
                                    <p className="text-white font-bold text-sm font-display">{c.city}</p>
                                    <p className="text-gray-300 text-xs">{c.tag}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
