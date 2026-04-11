import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import PropertyForm from './PropertyForm';

export default function AddProperty() {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (data) => {
        setSubmitting(true); setError('');
        try {
            const { data: p } = await api.post('/properties', data);
            navigate(`/owner/images/${p.id}?new=1`);
        } catch (err) { setError(err.response?.data?.error || 'Failed'); setSubmitting(false); }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link to="/owner/dashboard" className="text-sm text-gray-500 hover:text-primary-600 mb-6 block">← Back to Dashboard</Link>
            <h1 className="font-display text-3xl font-bold text-dark mb-1">Add New Property</h1>
            <p className="text-gray-500 mb-8">Fill in the details to list your property</p>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}
            <PropertyForm onSubmit={handleSubmit} submitting={submitting} />
        </div>
    );
}
