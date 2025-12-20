import { useState, useEffect } from 'react';
import api from '@/api/axios';

// Custom hook to fetch and filter exhibition data from the backend
export const useExhibitionData = (categoryMatchers = []) => {
    const [exhibitions, setExhibitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExhibitions = async () => {
            setLoading(true);
            try {
                // Fetch using Axios instance
                const response = await api.get('/api/exhibitions');

                if (response.data) {
                    const data = response.data;

                    // Filter if matchers are provided
                    const filtered = categoryMatchers.length > 0
                        ? data.filter(item => categoryMatchers.includes(item.category))
                        : data;

                    const transformed = filtered.map(item => ({
                        ...item,
                        id: item._id,
                        theme: item.category,
                        // Robust Image Handling
                        coverImage: item.coverImage && item.coverImage.startsWith('http')
                            ? item.coverImage
                            : "", // No fallback, just empty
                        startDate: item.createdAt ? new Date(item.createdAt).getFullYear() : "2024",
                        exhibitor: item.createdBy?.name || "Curator", // Real Author
                        isForSale: item.isForSale,
                        price: item.price || 0
                    }));
                    setExhibitions(transformed);
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchExhibitions();
    }, [JSON.stringify(categoryMatchers)]); // Depend on the array content

    return { exhibitions, loading, error };
};
