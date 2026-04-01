import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ pagination, onPageChange, className = '' }) {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { page, totalPages, hasNext, hasPrev, total, limit } = pagination;

    // Build page number array with ellipsis
    const getPages = () => {
        const pages = [];
        const delta = 1; // pages shown on each side of current

        const left = Math.max(2, page - delta);
        const right = Math.min(totalPages - 1, page + delta);

        pages.push(1);
        if (left > 2) pages.push('...');
        for (let i = left; i <= right; i++) pages.push(i);
        if (right < totalPages - 1) pages.push('...');
        if (totalPages > 1) pages.push(totalPages);

        return pages;
    };

    const from = (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
            {/* Results count */}
            <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-900">{from}–{to}</span> of{' '}
                <span className="font-semibold text-gray-900">{total}</span> results
            </p>

            {/* Page controls */}
            <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={!hasPrev}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200
            hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft size={15} /> Prev
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1 mx-1">
                    {getPages().map((pg, i) =>
                        pg === '...' ? (
                            <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm select-none">
                                …
                            </span>
                        ) : (
                            <button
                                key={pg}
                                onClick={() => onPageChange(pg)}
                                className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${pg === page
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}>
                                {pg}
                            </button>
                        )
                    )}
                </div>

                {/* Next */}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={!hasNext}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200
            hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    Next <ChevronRight size={15} />
                </button>
            </div>
        </div>
    );
}