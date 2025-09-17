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
            setError(null); // Reset error state on new fetch

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
                // Set a user-friendly error message
                setError('データの読み込みに失敗しました。時間をおいて再度お試しください。');
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
        // Display the user-friendly error in a styled box
        return (
            <div className="text-center py-10 px-4 bg-yellow-50 text-yellow-700 rounded-lg shadow-md">
                <p className="font-semibold">お知らせ</p>
                <p>{error}</p>
            </div>
        );
    }
    
    // This message is shown when there are no festivals that match the filter, or if there are none at all.
    if (festivals.length === 0) {
        return (
             <div className="text-center py-10 px-4 bg-slate-50 text-slate-600 rounded-lg shadow-md">
                <p className="font-semibold">まだ投稿がありません</p>
                <p>現在、表示できるお祭りの投稿がありません。新しいお祭りが登録されるのをお待ちください。</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
            {festivals.map((festival) => (
                <FestivalCard key={festival.id} festival={festival} onSelect={onSelectFestival} />
            ))}
        </div>
    );
};
