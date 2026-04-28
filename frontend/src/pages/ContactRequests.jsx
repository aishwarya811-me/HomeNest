import { useState, useEffect } from 'react';
import api from '../utils/api';
import Pagination from '../components/Pagination';
import { MessageSquare, Phone, Mail, Calendar, Filter } from 'lucide-react';

const LIMIT = 10;

const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

export default function ContactRequests() {
    const [requests, setRequests] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchRequests = async (currentPage = 1) => {
        setLoading(true);
        try {
            const params = { page: currentPage, limit: LIMIT };
            if (statusFilter) params.status = statusFilter;
            const { data } = await api.get('/properties/owner/contacts', { params });
            setRequests(data.requests);
            setPagination(data.pagination);
        } catch {
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchRequests(1);
    }, [statusFilter]);

    useEffect(() => { fetchRequests(page); }, [page]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const updateStatus = async (id, status) => {
        await api.put(`/properties/contacts/${id}/status`, { status });
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <MessageSquare size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <h1 className="font-display text-3xl font-bold">Contact Requests</h1>
                        {pagination && (
                            <p className="text-gray-500 text-sm">{pagination.total} total requests</p>
                        )}
                    </div>
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-2">
                    <Filter size={15} className="text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="input py-2 text-sm w-36">
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl">
                    <MessageSquare size={48} className="mx-auto mb-4 text-gray-200" />
                    <h3 className="font-display text-xl font-bold mb-2">No requests yet</h3>
                    <p className="text-gray-500">
                        {statusFilter ? `No ${statusFilter} requests found.` : 'Contact requests from renters will appear here.'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="space-y-4 mb-8">
                        {requests.map(r => (
                            <div key={r.id}
                                className={`bg-white rounded-2xl border p-5 transition-all ${!r.is_read ? 'border-primary-200 bg-primary-50/30' : 'border-gray-200'}`}>
                                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold flex-shrink-0">
                                            {r.renter_name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{r.renter_name}</p>
                                            <p className="text-xs text-gray-400">
                                                Interested in: <span className="font-medium text-gray-600">{r.property_title}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {!r.is_read && (
                                            <span className="badge bg-primary-100 text-primary-700 text-xs px-2 py-0.5">New</span>
                                        )}
                                        <span className={`badge text-xs px-2.5 py-1 capitalize ${STATUS_COLORS[r.status] || STATUS_COLORS.pending}`}>
                                            {r.status}
                                        </span>
                                    </div>
                                </div>

                                {r.message && (
                                    <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-3 mb-3 leading-relaxed">
                                        "{r.message}"
                                    </p>
                                )}

                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        {r.renter_email && (
                                            <a href={`mailto:${r.renter_email}`}
                                                className="flex items-center gap-1 hover:text-primary-600 transition-colors">
                                                <Mail size={12} />{r.renter_email}
                                            </a>
                                        )}
                                        {r.renter_phone && (
                                            <a href={`tel:${r.renter_phone}`}
                                                className="flex items-center gap-1 hover:text-primary-600 transition-colors">
                                                <Phone size={12} />{r.renter_phone}
                                            </a>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(r.created_at).toLocaleDateString('en-IN')}
                                        </span>
                                    </div>

                                    {r.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => updateStatus(r.id, 'accepted')}
                                                className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors">
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => updateStatus(r.id, 'rejected')}
                                                className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg hover:bg-red-200 transition-colors">
                                                Decline
                                            </button>
                                        </div>
                                    )}
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
    );
}