import React, { useState, useEffect } from 'react';
import { FestivalCard } from './FestivalCard';
import type { Festival } from '../types';
import { supabase } from '../lib/supabaseClient';

interface FestivalGridProps {
    onSelectFestival: (festival: Festival) => void;
    searchTerm: string;
    selectedRegion: string;
}

// New type definition for the festival with the signed URL
interface FestivalWithSignedUrl extends Festival {
    signedImageUrl: string;
}

export const FestivalGrid: React.FC<FestivalGridProps> = ({ onSelectFestival, searchTerm, selectedRegion }) => {
    // The state now holds festivals with the signed URL
    const [festivals, setFestivals] = useState<FestivalWithSignedUrl[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFestivals = async () => {
            setLoading(true);
            setError(null);

            let query = supabase.from('festivals').select('*');

            if (searchTerm) {
                query = query.ilike('name', `%${searchTerm}%`);
            }
            if (selectedRegion) {
                query = query.eq('region', selectedRegion);
            }

            const { data, error: fetchError } = await query.order('created_at', { ascending: false });

            if (fetchError) {
                console.error('Error fetching festivals:', fetchError);
                setError('データの読み込みに失敗しました。時間をおいて再度お試しください。');
                setLoading(false);
                return;
            }

            if (!data) {
                setFestivals([]);
                setLoading(false);
                return;
            }

            // For each festival, create a signed URL for its image
            const festivalsWithUrls = await Promise.all(
                data.map(async (festival) => {
                    // Default to a placeholder or an empty string if image_url is missing
                    if (!festival.image_url) {
                        return { ...festival, signedImageUrl: '' };
                    }
                    
                    // Check if image_url is already a full HTTPS URL. If so, use it directly.
                    // This maintains backward compatibility with old data.
                    if (festival.image_url.startsWith('http')) {
                        return { ...festival, signedImageUrl: festival.image_url };
                    }

                    // Otherwise, it's a file path, so create a signed URL.
                    const { data: signData, error: signError } = await supabase
                        .storage
                        .from('festival-images')
                        .createSignedUrl(festival.image_url, 3600); // URL is valid for 1 hour

                    if (signError) {
                        console.error('Error creating signed URL for', festival.image_url, signError);
                        // If signing fails, use a placeholder or empty string
                        return { ...festival, signedImageUrl: '' };
                    }
                    
                    return { ...festival, signedImageUrl: signData.signedUrl };
                })
            );

            setFestivals(festivalsWithUrls as FestivalWithSignedUrl[]);
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
        return (
            <div className="text-center py-10 px-4 bg-yellow-50 text-yellow-700 rounded-lg shadow-md">
                <p className="font-semibold">お知らせ</p>
                <p>{error}</p>
            </div>
        );
    }
    
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
                // Pass the signed URL to the FestivalCard
                <FestivalCard 
                    key={festival.id} 
                    festival={{...festival, image_url: festival.signedImageUrl}} 
                    onSelect={onSelectFestival} 
                />
            ))}
        </div>
    );
};
