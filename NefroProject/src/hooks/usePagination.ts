// hooks/usePagination.ts
import { useState } from 'react';

interface UsePaginationProps {
    totalItems: number;
    itemsPerPage?: number;
    initialPage?: number;
}

export const usePagination = ({
    totalItems,
    itemsPerPage = 10,
    initialPage = 0
}: UsePaginationProps) => {
    const [currentPage, setCurrentPage] = useState(initialPage);

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const goToPage = (page: number) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
        }
    };

    const nextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const getVisibleItems = (allItems: any[]) => {
        const startIndex = currentPage * itemsPerPage;
        return allItems.slice(startIndex, startIndex + itemsPerPage);
    };

    return {
        currentPage,
        totalPages,
        itemsPerPage,
        goToPage,
        nextPage,
        prevPage,
        getVisibleItems
    };
};