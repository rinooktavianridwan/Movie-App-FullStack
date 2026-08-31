import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between gap-2 py-3 px-5 border-t border-brand-700/30 bg-brand-800/60">
      <span className="text-sm text-gray-500">
        Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-brand-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {getPageNumbers().map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[32px] px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? 'bg-brand-primary text-brand-900 font-bold'
                : 'text-gray-300 hover:text-white hover:bg-brand-700/60'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-brand-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
