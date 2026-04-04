import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { imgUrl } from '../utils/api';
import { Clock, IndianRupee } from 'lucide-react';

const STORAGE_KEY = 'hn_recently_viewed';

export const addRecentlyViewed = (property) => {
    try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const filtered = existing.filter(p => p.id !== property.id);
        const updated = [{
            id: property.id, title: property.title,
            city: property.city, state: property.state,
            rent: property.rent, images: property.images
        }, ...filtered].slice(0, 5);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch { }
};

export default function RecentlyViewed() {
    const [items, setItems] = useState([]);
    const [visible, setVisible] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { rootMargin: '150px' }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!visible) return;
        try {
            setItems(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
        } catch { }
    }, [visible]);

    if (visible && !items.length) return null;

    return (
        <div ref={ref} className="max-w-7xl mx-auto px-4 py-8 border-t border-gray-100">
            {visible && items.length > 0 && (
                <>
                    <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                        <Clock size={18} className="text-primary-600" /> Recently Viewed
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {items.map(p => {
                            const img = p.images?.find(i => i.is_primary) || p.images?.[0];
                            return (
                                <Link key={p.id} to={`/property/${p.id}`}
                                    className="flex-shrink-0 w-52 bg-white rounded-2xl border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all overflow-hidden group">
                                    <div className="h-28 bg-gray-100 overflow-hidden">
                                        {img
                                            ? <img
                                                src={imgUrl(img.filename)}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                alt=""
                                                loading="lazy"
                                                decoding="async"
                                            />
                                            : <div className="w-full h-full flex items-center justify-center text-3xl">🏠</div>}
                                    </div>
                                    <div className="p-3">
                                        <p className="text-sm font-semibold truncate">{p.title}</p>
                                        <p className="text-xs text-gray-400">{p.city}</p>
                                        <div className="flex items-center gap-0.5 text-primary-600 font-bold text-sm mt-1">
                                            <IndianRupee size={11} />{p.rent?.toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </>
            )}
            {!visible && <div className="h-20" />}
        </div>
    );
}