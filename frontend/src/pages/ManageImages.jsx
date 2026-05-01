import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api, { imgUrl } from '../utils/api';
import { Upload, X, Star, ChevronLeft, CheckCircle2, Camera, Image as ImageIcon } from 'lucide-react';

export default function ManageImages() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const isNew = searchParams.get('new') === '1';
    const [images, setImages] = useState([]);
    const [property, setProperty] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [success, setSuccess] = useState('');
    const fileRef = useRef();
    const cameraRef = useRef();

    useEffect(() => {
        api.get(`/properties/${id}`).then(({ data }) => { setProperty(data); setImages(data.images || []); });
    }, [id]);

    const uploadFiles = async (files) => {
        if (!files?.length) return;
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const valid = [...files].filter(f => validTypes.includes(f.type));
        if (!valid.length) return alert('Please select valid image files (JPG, PNG, WebP)');
        const form = new FormData();
        valid.forEach(f => form.append('images', f));
        setUploading(true);
        try {
            const { data } = await api.post(`/properties/${id}/images`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
            setImages(prev => [...prev, ...data]);
            setSuccess(`${data.length} photo(s) uploaded!`);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) { alert(err.response?.data?.error || 'Upload failed'); }
        finally { setUploading(false); }
    };

    const handleDelete = async (imageId) => {
        if (!confirm('Delete this photo?')) return;
        await api.delete(`/properties/${id}/images/${imageId}`);
        setImages(prev => prev.filter(i => i.id !== imageId));
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link to="/owner/dashboard" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors">
                <ChevronLeft size={16} />Dashboard
            </Link>

            {isNew && (
                <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
                    <div><p className="font-semibold text-green-800">Property created!</p><p className="text-sm text-green-600">Now upload photos to attract renters.</p></div>
                </div>
            )}

            <div className="mb-6">
                <h1 className="font-display text-3xl font-bold">Manage Photos</h1>
                {property && <p className="text-gray-500 mt-1">{property.title}</p>}
            </div>

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2">
                    <CheckCircle2 size={15} />{success}
                </div>
            )}

            {/* Upload Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Gallery / File Upload */}
                <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); uploadFiles(e.dataTransfer.files) }}
                    onClick={() => fileRef.current.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}`}>
                    <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={e => uploadFiles(e.target.files)} />
                    <ImageIcon size={30} className={`mx-auto mb-3 ${dragOver ? 'text-primary-600' : 'text-gray-400'}`} />
                    <p className="font-semibold text-gray-700 text-sm">{uploading ? 'Uploading...' : 'Choose from Gallery'}</p>
                    <p className="text-xs text-gray-400 mt-1">Or drag & drop photos here</p>
                </div>

                {/* Camera Capture */}
                <div
                    onClick={() => cameraRef.current.click()}
                    className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-gray-50 transition-all">
                    <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => uploadFiles(e.target.files)} />
                    <Camera size={30} className="mx-auto mb-3 text-gray-400" />
                    <p className="font-semibold text-gray-700 text-sm">Take Photo</p>
                    <p className="text-xs text-gray-400 mt-1">Use your device camera</p>
                </div>
            </div>

            <p className="text-xs text-gray-400 text-center mb-8">JPG, PNG, WebP · Max 5MB per photo · Up to 10 photos total</p>

            {images.length > 0 && (
                <div>
                    <h2 className="font-semibold mb-4">Uploaded Photos ({images.length})</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map(img => (
                            <div key={img.id} className="relative group aspect-video rounded-xl overflow-hidden bg-gray-100">
                                <img src={imgUrl(img.filename)} className="w-full h-full object-cover" alt="" />
                                {img.is_primary === 1 && (
                                    <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Star size={10} />Main
                                    </div>
                                )}
                                <button onClick={() => handleDelete(img.id)}
                                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X size={13} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-3 mt-8">
                <Link to={`/property/${id}`} className="btn-outline">Preview Listing</Link>
                <Link to="/owner/dashboard" className="btn-primary">Done</Link>
            </div>
        </div>
    );
}