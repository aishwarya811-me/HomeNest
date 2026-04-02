import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, IndianRupee, Heart } from 'lucide-react';
import { imgUrl } from '../utils/api';
import { useState } from 'react';

export default function PropertyCard({ property: p, onBookmark, isBookmarked }) {
    const primaryImg = p.images?.find(i => i.is_primary) || p.images?.[0];
    const [imgLoaded, setImgLoaded] = useState(false);

    return (
        <div className="card group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            {/* Image */}
            <div className="relative h-48 bg-gray-100 overflow-hidden rounded-t-2xl">
                {primaryImg ? (
                    <>
                        {/* Blur placeholder shown until image loads */}
                        {!imgLoaded && (
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-orange-50 animate-pulse" />
                        )}
                        <img
                            src={imgUrl(primaryImg.filename)}
                            alt={p.title}
                            loading="lazy"
                            decoding="async"
                            onLoad={() => setImgLoaded(true)}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                        />
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-primary-50 to-orange-50">
                        🏠
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    {p.bachelor_friendly === 1 && (
                        <span className="badge bg-blue-600 text-white text-xs px-2 py-0.5">Bachelor OK</span>
                    )}
                    {p.pet_friendly === 1 && (
                        <span className="badge bg-green-600 text-white text-xs px-2 py-0.5">Pet OK</span>
                    )}
                    {p.near_metro === 1 && (
                        <span className="badge bg-purple-600 text-white text-xs px-2 py-0.5">Near Metro</span>
                    )}
                </div>

                {/* Bookmark */}
                {onBookmark && (
                    <button
                        onClick={e => { e.preventDefault(); onBookmark(p.id); }}
                        className={`absolute top-3 right-3 p-2 rounded-full shadow transition-all ${isBookmarked ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-500 hover:text-red-500'}`}>
                        <Heart size={15} fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                )}

                {/* Availability */}
                {!p.available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-white text-gray-800 font-semibold text-sm px-3 py-1 rounded-full">Not Available</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <Link to={`/property/${p.id}`} className="block p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 flex-1">{p.title}</h3>
                    <div className="flex items-center gap-0.5 text-primary-700 font-bold text-sm flex-shrink-0">
                        <IndianRupee size={12} />{p.rent?.toLocaleString('en-IN')}
                    </div>
                </div>

                <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
                    <MapPin size={11} />{p.city}, {p.state}
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Bed size={12} />{p.bedrooms} BHK</span>
                    <span className="flex items-center gap-1"><Bath size={12} />{p.bathrooms} Bath</span>
                    <span className="ml-auto capitalize text-xs bg-gray-100 px-2 py-0.5 rounded-full">{p.furnished}</span>
                </div>
            </Link>
        </div>
    );
}