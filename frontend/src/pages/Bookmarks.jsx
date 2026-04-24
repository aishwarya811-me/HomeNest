import { useState, useEffect } from 'react';
import api from '../utils/api';
import PropertyCard from '../components/PropertyCard';
import Pagination from '../components/Pagination';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const LIMIT = 9;

export default function Bookmarks() {
    const [properties, setProperties] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const fetchBookmarks = async (currentPage = 1) => {
        setLoading(true);
        try {
            const { data } = await api.get('/properties/renter/bookmarks', {
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

    useEffect(() => { fetchBookmarks(page); }, [page]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleUnbookmark = async (id) => {
        await api.post(`/properties/${id}/bookmark`);
        // If last item on page, go to previous page
        if (properties.length === 1 && page > 1) {
            setPage(p => p - 1);
        } else {
            fetchBookmarks(page);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    <Heart size={20} className="text-red-500" />
                </div>
                <div>
                    <h1 className="font-display text-3xl font-bold">Saved Properties</h1>
                    {pagination && (
                        <p className="text-gray-500 text-sm">{pagination.total} saved</p>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(LIMIT)].map((_, i) => (
                        <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : properties.length === 0 ? (
                <div className="text-center py-20">
                    <Heart size={52} className="mx-auto mb-4 text-gray-200" />
                    <h3 className="font-display text-xl font-bold mb-2">No saved properties yet</h3>
                    <p className="text-gray-500 mb-6">
                        Browse properties and tap the heart icon to save them here.
                    </p>
                    <Link to="/browse" className="btn-primary">Browse Properties</Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {properties.map(p => (
                            <PropertyCard
                                key={p.id}
                                property={p}
                                onBookmark={handleUnbookmark}
                                isBookmarked={true} />
                        ))}
                    </div>

                    <Pagination
                        pagination={pagination}
                        onPageChange={handlePageChange}
                        className="pt-6 border-t border-gray-100" />
                </>
            )}
        </div>
    );
}