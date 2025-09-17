import React, { useState, useEffect } from 'react';
import { FestivalCard } from './FestivalCard';
import type { Festival } from '../types';
import { supabase } from '../lib/supabaseClient';

interface FestivalGridProps {
    onSelectFestival: (festival: Festival) => void;
    searchTerm: string;
    selectedRegion: string;
}

interface FestivalWithSignedUrl extends Festival {
    signedImageUrl: string;
}

export const FestivalGrid: React.FC<FestivalGridProps> = ({ onSelectFestival, searchTerm, selectedRegion }) => {
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

            // **FIX:** This logic now correctly handles both old (full URL) and new (path only) data formats.
            const festivalsWithUrls = await Promise.all(
                data.map(async (festival) => {
                    let imagePath = festival.image_url;

                    if (!imagePath) {
                        return { ...festival, signedImageUrl: '' };
                    }

                    // If it's a full URL (the old, incorrect format), extract the path from it.
                    if (imagePath.startsWith('https')) {
                        try {
                            // Example URL: https://<project-ref>.supabase.co/storage/v1/object/public/festival-images/festival_16...jpg
                            const urlParts = imagePath.split('/');
                            // The actual path within the bucket is the last part of the URL.
                            const fileName = urlParts[urlParts.length - 1];
                            if (fileName) {
                                imagePath = fileName;
                            } else {
                                throw new Error('Could not extract file name from URL');
                            }
                        } catch (e) {
                            console.error('Failed to parse old image URL:', festival.image_url, e);
                            imagePath = null; // Mark as invalid
                        }
                    }

                    // If we have a valid path (either new format or extracted from old), create a signed URL.
                    if (imagePath) {
                        const { data: signData, error: signError } = await supabase
                            .storage
                            .from('festival-images')
                            .createSignedUrl(imagePath, 3600); // URL valid for 1 hour

                        if (signError) {
                            console.error('Error creating signed URL for path:', imagePath, signError);
                            return { ...festival, signedImageUrl: '' }; // Fail gracefully
                        }
                        
                        return { ...festival, signedImageUrl: signData.signedUrl };
                    } 
                    
                    // Fallback for any items that couldn't be processed
                    return { ...festival, signedImageUrl: '' };
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
                <FestivalCard 
                    key={festival.id} 
                    festival={{...festival, image_url: festival.signedImageUrl}} 
                    onSelect={onSelectFestival} 
                />
            ))}
        </div>
    );
};
