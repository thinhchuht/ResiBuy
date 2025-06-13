import React from 'react';
import { cn } from "@/lib/utils"; // Tailwind helper for conditional classNames
import { Begin } from '@/lib/by/Div';
import { ChevronRight } from 'lucide-react';

interface CirclePaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

const CirclePagination: React.FC<CirclePaginationProps> = ({
  pagination,
  onPageChange,
}) => {
  const pages = Array.from({ length: pagination.totalPages }, (_, i) => i + 1);
  const {page, totalPages} = pagination

  return (
    <Begin className="w-max rounded-full bg-white mx-auto flex-grow-0 flex items-center gap-3 p-2 mb-2 shadow-sm justify-center">
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            "w-9 h-9 rounded-full flex items-center font-semibold justify-center text-sm transition",
            page === pagination.page ? "bg-primary text-white" : "text-primary bg-white hover:bg-gray-100"
          )}
        >
          {page}
        </button>
      ))}

      {/* Next Arrow */}
      <button
        onClick={() => {
          if (page < totalPages) onPageChange(page + 1);
        }}
        className="w-6 h-6 rounded-full flex items-center justify-center text-primary bg-white hover:bg-gray-100"
      >
        <ChevronRight size={16}/>
      </button>
    </Begin>
  );
};

export default CirclePagination;
