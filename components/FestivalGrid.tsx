import React, { useState, useEffect } from 'react';
import { FestivalCard } from './FestivalCard';
import type { Festival } from '../types';
import { supabase } from '../lib/supabaseClient';

interface FestivalGridProps {
    onSelectFestival: (festival: Festival) => void;
    searchTerm: string;
    selectedRegion: string;
}

export const FestivalGrid: React.FC<FestivalGridProps> = ({ onSelectFestival, searchTerm, selectedRegion }) => {
    const [festivals, setFestivals] = useState<Festival[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFestivals = async () => {
            setLoading(true);
            
            let query = supabase.from('festivals').select('*');

            if (searchTerm) {
                query = query.ilike('name', `%${searchTerm}%`);
            }
            if (selectedRegion) {
                query = query.eq('region', selectedRegion);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching festivals:', error);
                setError(error.message);
            } else {
                setFestivals(data as Festival[]);
            }
            setLoading(false);
        };

        fetchFestivals();
    }, [searchTerm, selectedRegion]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center py-10">Error loading festivals: {error}</div>;
    }
    
    if (festivals.length === 0) {
        return <div className="text-center py-10 text-slate-500">条件に合う祭りが見つかりませんでした。</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {festivals.map((festival) => (
                <FestivalCard key={festival.id} festival={festival} onSelect={onSelectFestival} />
            ))}
        </div>
    );
};
