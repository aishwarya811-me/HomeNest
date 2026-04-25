import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import PropertyCard from '../components/PropertyCard';
import RecentlyViewed from '../components/RecentlyViewed';
import Pagination from '../components/Pagination';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LIMIT = 12;

export default function Browse() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [properties, setProperties] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookmarks, setBookmarks] = useState(new Set());
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        city: searchParams.get('city') || '',
        state: '',
        min_rent: '',
        max_rent: '',
        bedrooms: '',
        property_type: '',
        furnished: '',
        bachelor_friendly: '',
        pet_friendly: '',
        near_metro: '',
    });

    const [page, setPage] = useState(1);

    const fetchProperties = useCallback(async (currentPage = 1) => {
        setLoading(true);
        try {
            const params = {
                ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
                page: currentPage,
                limit: LIMIT,
            };
            const { data } = await api.get('/properties', { params });
            setProperties(data.properties);
            setPagination(data.pagination);
        } catch {
            setProperties([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Refetch when filters change — reset to page 1
    useEffect(() => {
        setPage(1);
        fetchProperties(1);
    }, [filters]);

    // Fetch when page changes
    useEffect(() => {
        fetchProperties(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [page]);

    const handlePageChange = (newPage) => setPage(newPage);

    const handleBookmark = async (id) => {
        if (!user) return;
        const { data } = await api.post(`/properties/${id}/bookmark`);
        setBookmarks(prev => {
            const n = new Set(prev);
            data.bookmarked ? n.add(id) : n.delete(id);
            return n;
        });
    };

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    const clearAll = () => setFilters({
        city: '', state: '', min_rent: '', max_rent: '',
        bedrooms: '', property_type: '', furnished: '',
        bachelor_friendly: '', pet_friendly: '', near_metro: '',
    });

    return (
        <div>
            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div>
                        <h1 className="font-display text-3xl font-bold">Browse Properties</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {loading
                                ? 'Searching...'
                                : pagination
                                    ? `${pagination.total} properties found`
                                    : '0 properties found'}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'}`}>
                        <SlidersHorizontal size={15} />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${showFilters ? 'bg-white text-primary-700' : 'bg-primary-600 text-white'}`}>
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Search bar */}
                <div className="flex gap-3 mb-4">
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={filters.city}
                            onChange={e => setFilters({ ...filters, city: e.target.value })}
                            placeholder="Search by city..."
                            className="input pl-10" />
                    </div>
                    {activeFilterCount > 0 && (
                        <button onClick={clearAll} className="btn-outline gap-1.5">
                            <X size={14} /> Clear
                        </button>
                    )}
                </div>

                {/* Filters panel */}
                {showFilters && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="label text-xs uppercase tracking-wider text-gray-500">State</label>
                                <input value={filters.state} onChange={e => setFilters({ ...filters, state: e.target.value })} className="input text-sm" placeholder="e.g. Maharashtra" />
                            </div>
                            <div>
                                <label className="label text-xs uppercase tracking-wider text-gray-500">Min Rent</label>
                                <input type="number" value={filters.min_rent} onChange={e => setFilters({ ...filters, min_rent: e.target.value })} className="input text-sm" placeholder="₹ Min" />
                            </div>
                            <div>
                                <label className="label text-xs uppercase tracking-wider text-gray-500">Max Rent</label>
                                <input type="number" value={filters.max_rent} onChange={e => setFilters({ ...filters, max_rent: e.target.value })} className="input text-sm" placeholder="₹ Max" />
                            </div>
                            <div>
                                <label className="label text-xs uppercase tracking-wider text-gray-500">BHK</label>
                                <select value={filters.bedrooms} onChange={e => setFilters({ ...filters, bedrooms: e.target.value })} className="input text-sm">
                                    <option value="">Any</option>
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} BHK</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label text-xs uppercase tracking-wider text-gray-500">Type</label>
                                <select value={filters.property_type} onChange={e => setFilters({ ...filters, property_type: e.target.value })} className="input text-sm">
                                    <option value="">Any</option>
                                    {['apartment', 'house', 'villa', 'studio', 'pg', 'commercial'].map(t => (
                                        <option key={t} value={t} className="capitalize">{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label text-xs uppercase tracking-wider text-gray-500">Furnished</label>
                                <select value={filters.furnished} onChange={e => setFilters({ ...filters, furnished: e.target.value })} className="input text-sm">
                                    <option value="">Any</option>
                                    <option value="fully">Fully Furnished</option>
                                    <option value="semi">Semi Furnished</option>
                                    <option value="unfurnished">Unfurnished</option>
                                </select>
                            </div>
                        </div>

                        {/* Advanced toggle filters */}
                        <div className="border-t border-gray-100 pt-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Special Filters
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { key: 'bachelor_friendly', label: '👨‍💼 Bachelor Friendly' },
                                    { key: 'pet_friendly', label: '🐾 Pet Friendly' },
                                    { key: 'near_metro', label: '🚇 Near Metro' },
                                ].map(f => (
                                    <button
                                        key={f.key}
                                        type="button"
                                        onClick={() => setFilters({ ...filters, [f.key]: filters[f.key] === '1' ? '' : '1' })}
                                        className={`px-4 py-2 rounded-full text-sm border-2 transition-all font-medium ${filters[f.key] === '1'
                                                ? 'bg-primary-600 text-white border-primary-600'
                                                : 'border-gray-200 text-gray-600 hover:border-primary-300'
                                            }`}>
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Results */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(LIMIT)].map((_, i) => (
                            <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-72" />
                        ))}
                    </div>
                ) : properties.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🏠</div>
                        <h3 className="font-display text-xl font-bold mb-2">No properties found</h3>
                        <p className="text-gray-500 mb-4">Try adjusting your search filters.</p>
                        {activeFilterCount > 0 && (
                            <button onClick={clearAll} className="btn-primary">Clear All Filters</button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {properties.map(p => (
                                <PropertyCard
                                    key={p.id}
                                    property={p}
                                    onBookmark={user?.role === 'renter' ? handleBookmark : null}
                                    isBookmarked={bookmarks.has(p.id)} />
                            ))}
                        </div>

                        {/* Pagination */}
                        <Pagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            className="mt-4 pt-6 border-t border-gray-100" />
                    </>
                )}
            </div>

            <RecentlyViewed />
        </div>
    );
}