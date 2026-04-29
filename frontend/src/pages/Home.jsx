import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Shield, Phone, Star, Home as HomeIcon, Building2, MapPin, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import api, { imgUrl } from '../utils/api';

/* ── Popular cities with Unsplash photos ───────────────────────── */
const CITIES = [
    { city: 'Mumbai', photo: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=75', listings: '1,200+' },
    { city: 'Bangalore', photo: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=75', listings: '980+' },
    { city: 'Delhi', photo: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=75', listings: '870+' },
    { city: 'Hyderabad', photo: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=75', listings: '650+' },
    { city: 'Pune', photo: 'https://images.unsplash.com/photo-1625566744040-7c9356e397dd?auto=format&fit=crop&w=600&q=75', listings: '540+' },
    { city: 'Chennai', photo: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=75', listings: '430+' },
];

/* ── Fallback photos for featured properties ────────────────────── */
const PROPERTY_PHOTOS = [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=75',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=75',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=75',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=600&q=75',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600&q=75',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=75',
];

function getPhoto(p, idx) {
    const primary = p.images?.find(i => i.is_primary) || p.images?.[0];
    if (primary?.filename) return imgUrl(primary.filename);
    return PROPERTY_PHOTOS[idx % PROPERTY_PHOTOS.length];
}

/* ── Testimonials ───────────────────────────────────────────────── */
const TESTIMONIALS = [
    {
        name: 'Priya Sharma', city: 'Bangalore', role: 'Software Engineer',
        text: 'Found my dream apartment in 3 days! The filters made it so easy to find exactly what I needed.',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5b4?auto=format&fit=crop&w=100&q=80',
        rating: 5,
    },
    {
        name: 'Rahul Mehta', city: 'Mumbai', role: 'Property Owner',
        text: 'Listed my flat and got 8 genuine enquiries within a week. No agents, no hassle!',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
        rating: 5,
    },
    {
        name: 'Ananya Patel', city: 'Hyderabad', role: 'MBA Student',
        text: 'Bachelor-friendly filter saved me so much time. Moved in within 2 weeks of signing up!',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
        rating: 5,
    },
];

export default function Home() {
    const [city, setCity] = useState('');
    const navigate = useNavigate();

    const [featured, setFeatured] = useState([]);
    const [featLoading, setFeatLoading] = useState(true);

    useEffect(() => {
        api.get('/properties', { params: { limit: 6, page: 1 } })
            .then(({ data }) => setFeatured(data.properties || []))
            .catch(() => setFeatured([]))
            .finally(() => setFeatLoading(false));
    }, []);

    return (
        <div>
            {/* ── Hero ──────────────────────────────────────────── */}
            <section className="relative bg-dark overflow-hidden">
                {/* Background: real photo + overlay */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1600&q=80"
                        alt="Modern home interior"
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark/90 to-primary-900/50" />
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl" />
                </div>
                <div className="relative max-w-5xl mx-auto px-4 py-28 text-center text-white">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-sm mb-6">
                        <Star size={13} className="text-yellow-400" /> India's Trusted Rental Platform
                    </div>
                    <h1 className="font-display text-6xl md:text-7xl font-bold mb-4 leading-tight">
                        Find Your <span className="text-primary-400">Dream</span> Home
                    </h1>
                    <p className="text-gray-300 text-lg max-w-xl mx-auto mb-10">
                        Browse thousands of verified rental properties. Connect directly with owners — no middlemen.
                    </p>
                    <div className="flex gap-3 max-w-md mx-auto">
                        <div className="relative flex-1">
                            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input value={city} onChange={e => setCity(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && navigate(`/browse?city=${city}`)}
                                placeholder="Search by city..." className="input pl-10 py-3" />
                        </div>
                        <button onClick={() => navigate(`/browse?city=${city}`)} className="btn-primary px-6 py-3">Search</button>
                    </div>

                    {/* Quick city pills */}
                    <div className="flex flex-wrap justify-center gap-2 mt-6">
                        {['Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Pune'].map(c => (
                            <button
                                key={c}
                                onClick={() => navigate(`/browse?city=${c}`)}
                                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 rounded-full text-xs text-white transition-all"
                            >
                                <MapPin size={10} /> {c}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Stats ─────────────────────────────────────────── */}
            <section className="bg-primary-600 text-white">
                <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {[['2,400+', 'Properties'], ['120+', 'Cities'], ['8,100+', 'Happy Renters'], ['1,900+', 'Owners']].map(([v, l]) => (
                        <div key={l}><div className="font-display text-3xl font-bold">{v}</div><div className="text-sm text-primary-100 mt-1">{l}</div></div>
                    ))}
                </div>
            </section>

            {/* ── Featured Properties ────────────────────────────── */}
            <section className="section bg-gray-50">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles size={16} className="text-primary-600" />
                            <span className="text-primary-600 text-sm font-semibold uppercase tracking-wide">Fresh Listings</span>
                        </div>
                        <h2 className="font-display text-4xl font-bold text-dark">Featured Properties</h2>
                    </div>
                    <Link to="/browse" className="hidden md:flex items-center gap-1.5 text-primary-600 font-semibold text-sm hover:underline">
                        Browse all <ChevronRight size={15} />
                    </Link>
                </div>

                {featLoading ? (
                    <div className="grid md:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-72 bg-gray-200 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : featured.length === 0 ? (
                    /* Fallback showcase using real photos */
                    <div className="grid md:grid-cols-3 gap-6">
                        {PROPERTY_PHOTOS.map((photo, i) => (
                            <Link to="/browse" key={i} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-gray-100">
                                <div className="relative h-48 overflow-hidden">
                                    <img src={photo} alt="Property" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                    <div className="absolute bottom-2 left-3 text-white text-sm font-bold">₹{(12 + i * 3)}k/mo</div>
                                </div>
                                <div className="p-4">
                                    <p className="font-semibold text-gray-800">{['Studio Apartment', 'Modern 1BHK', 'Spacious 2BHK', 'Cozy Flat', '3BHK Family Home', 'Premium Suite'][i]}</p>
                                    <p className="text-sm text-gray-400 flex items-center gap-1 mt-1"><MapPin size={11} />{CITIES[i]?.city}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {featured.map((p, idx) => (
                            <Link
                                key={p.id}
                                to={`/property/${p.id}`}
                                className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-gray-100"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={getPhoto(p, idx)}
                                        alt={p.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                    <div className="absolute bottom-2 left-3 text-white font-bold text-sm">
                                        ₹{p.rent?.toLocaleString('en-IN')}/mo
                                    </div>
                                    {p.available === 0 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="bg-white text-gray-800 font-semibold text-xs px-3 py-1 rounded-full">Not Available</span>
                                        </div>
                                    )}
                                    {p.near_metro === 1 && (
                                        <div className="absolute top-2 left-2">
                                            <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">Near Metro</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <p className="font-semibold text-gray-900 line-clamp-1">{p.title}</p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><MapPin size={11} />{p.city}, {p.state}</p>
                                    <div className="flex gap-3 text-xs text-gray-500 mt-2">
                                        <span>{p.bedrooms} BHK</span>
                                        <span>{p.bathrooms} Bath</span>
                                        <span className="ml-auto capitalize bg-gray-100 px-2 py-0.5 rounded-full">{p.furnished}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                <div className="text-center mt-8">
                    <Link to="/browse" className="btn-outline inline-flex gap-2">
                        View All Properties <ArrowRight size={15} />
                    </Link>
                </div>
            </section>

            {/* ── Popular Cities ─────────────────────────────────── */}
            <section className="section">
                <div className="text-center mb-10">
                    <h2 className="font-display text-4xl font-bold text-dark mb-3">Explore by City</h2>
                    <p className="text-gray-500 max-w-lg mx-auto">Find rentals in India's most popular cities with thousands of verified listings.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {CITIES.map(c => (
                        <Link
                            key={c.city}
                            to={`/browse?city=${c.city}`}
                            className="group relative rounded-2xl overflow-hidden cursor-pointer"
                            style={{ height: '160px' }}
                        >
                            <img
                                src={c.photo}
                                alt={c.city}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                            <div className="absolute bottom-4 left-4">
                                <p className="text-white font-bold text-lg font-display">{c.city}</p>
                                <p className="text-gray-300 text-xs">{c.listings} listings</p>
                            </div>
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full border border-white/30">
                                    Explore →
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── Features ──────────────────────────────────────── */}
            <section className="section bg-gray-50">
                <div className="text-center mb-12">
                    <h2 className="font-display text-4xl font-bold text-dark mb-3">Why HomeNest?</h2>
                    <p className="text-gray-500 max-w-lg mx-auto">Everything you need to find your next home or list your property — simple, fast, and free.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { icon: <Search size={24} className="text-primary-600" />, title: 'Smart Search', desc: 'Filter by city, rent, BHK, type, and furnishing to find exactly what you need.' },
                        { icon: <Shield size={24} className="text-primary-600" />, title: 'Verified Listings', desc: 'All properties posted by registered owners with real photos and complete details.' },
                        { icon: <Phone size={24} className="text-primary-600" />, title: 'Direct Contact', desc: 'Message the owner directly from any listing — no agent fees, no delays.' },
                    ].map(f => (
                        <div key={f.title} className="bg-white rounded-2xl p-8 text-center hover:shadow-md transition-all group border border-orange-100">
                            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:shadow">{f.icon}</div>
                            <h3 className="font-display text-xl font-semibold mb-2">{f.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Testimonials ──────────────────────────────────── */}
            <section className="section">
                <div className="text-center mb-10">
                    <h2 className="font-display text-4xl font-bold text-dark mb-3">What Our Users Say</h2>
                    <p className="text-gray-500">Trusted by thousands of renters and owners across India.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {TESTIMONIALS.map(t => (
                        <div key={t.name} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(t.rating)].map((_, i) => (
                                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                                ))}
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed mb-5">"{t.text}"</p>
                            <div className="flex items-center gap-3">
                                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                                <div>
                                    <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                                    <p className="text-xs text-gray-400">{t.role} · {t.city}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA ───────────────────────────────────────────── */}
            <section className="section pt-0">
                <div className="grid md:grid-cols-2 gap-5">
                    <div className="relative bg-primary-600 rounded-3xl p-8 text-white overflow-hidden">
                        <div className="absolute inset-0 opacity-20">
                            <img src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=60" alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="relative">
                            <Building2 size={32} className="mb-3 text-primary-200" />
                            <h3 className="font-display text-2xl font-bold mb-2">Own a Property?</h3>
                            <p className="text-primary-100 text-sm mb-6">List it for free and connect with thousands of verified renters instantly.</p>
                            <Link to="/register" className="inline-block bg-white text-primary-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-50 transition text-sm">List Property →</Link>
                        </div>
                    </div>
                    <div className="relative bg-dark rounded-3xl p-8 text-white overflow-hidden">
                        <div className="absolute inset-0 opacity-20">
                            <img src="https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=60" alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="relative">
                            <HomeIcon size={32} className="mb-3 text-gray-500" />
                            <h3 className="font-display text-2xl font-bold mb-2">Looking to Rent?</h3>
                            <p className="text-gray-400 text-sm mb-6">Browse hundreds of verified listings with photos, rules, and direct owner contact.</p>
                            <Link to="/browse" className="inline-block bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition text-sm">Browse Now →</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}