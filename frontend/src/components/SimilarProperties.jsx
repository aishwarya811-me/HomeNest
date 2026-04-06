import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import PropertyCard from './PropertyCard';

export default function SimilarProperties({ currentId, city, propertyType }) {
    const [properties, setProperties] = useState([]);
    const [visible, setVisible] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const ref = useRef();

    // Only become visible when user scrolls near this section
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { rootMargin: '200px' }   // start loading 200px before it enters viewport
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    // Fetch only when visible
    useEffect(() => {
        if (!visible || loaded) return;
        api.get('/properties', { params: { city, property_type: propertyType } })
            .then(({ data }) => {
                setProperties(data.filter(p => p.id !== currentId).slice(0, 3));
                setLoaded(true);
            })
            .catch(() => setLoaded(true));
    }, [visible, loaded, currentId, city, propertyType]);

    return (
        <div ref={ref} className="mt-12">
            {!visible && (
                // Placeholder keeps page height stable before load
                <div className="h-64" />
            )}
            {visible && properties.length > 0 && (
                <>
                    <h2 className="font-display text-2xl font-bold mb-6">Similar Properties in {city}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {properties.map(p => <PropertyCard key={p.id} property={p} />)}
                    </div>
                </>
            )}
        </div>
    );
}