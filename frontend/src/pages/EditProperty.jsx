import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import PropertyForm from './PropertyForm';

export default function EditProperty() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => { api.get(`/properties/${id}`).then(({ data }) => setProperty(data)); }, [id]);

    const handleSubmit = async (data) => {
        setSubmitting(true); setError('');
        try { await api.put(`/properties/${id}`, data); navigate('/owner/dashboard'); }
        catch (err) { setError(err.response?.data?.error || 'Failed'); setSubmitting(false); }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link to="/owner/dashboard" className="text-sm text-gray-500 hover:text-primary-600 mb-6 block">← Back to Dashboard</Link>
            <h1 className="font-display text-3xl font-bold text-dark mb-1">Edit Property</h1>
            <p className="text-gray-500 mb-8">Update your listing details</p>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}
            {property && <PropertyForm initial={property} onSubmit={handleSubmit} submitting={submitting} />}
        </div>
    );
}