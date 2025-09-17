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
            if (searchTerm) query = query.ilike('name', `%${searchTerm}%`);
            if (selectedRegion) query = query.eq('region', selectedRegion);

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

            // **THE ULTIMATE FIX: A universal translator for all historical path formats**
            const festivalsWithUrls = await Promise.all(
                data.map(async (festival) => {
                    let rawPath = festival.image_url;
                    if (!rawPath) return { ...festival, signedImageUrl: '' };

                    let normalizedPath = '';

                    // Case 1: It's a full URL (oldest, broken format)
                    // e.g., https://<...>.supabase.co/storage/v1/object/public/festival-images/festival_175....png
                    if (rawPath.startsWith('https')) {
                         try {
                            const url = new URL(rawPath);
                            // Pathname is /storage/v1/object/public/festival-images/festival_175....png
                            const pathSegments = url.pathname.split('/');
                            // We need the last TWO segments: `festival-images` and `festival_175....png`
                            normalizedPath = pathSegments.slice(-2).join('/');
                        } catch (e) {
                            console.error('Could not parse legacy URL:', rawPath, e);
                            return { ...festival, signedImageUrl: '' };
                        }
                    }
                    // Case 2: It contains a path separator (the correct, new format)
                    // e.g., `festival-images/festival_175....png`
                    else if (rawPath.includes('/')) {
                        normalizedPath = rawPath;
                    }
                    // Case 3: It does NOT contain a separator (intermediate, broken format)
                    // e.g., `festival_175....png`
                    else {
                        // Reconstruct the correct path based on the known folder structure
                        normalizedPath = `festival-images/${rawPath}`;
                    }

                    // Now, with a correctly normalized path, create the signed URL
                    if (normalizedPath) {
                        // We must use the BUCKET name here, and the FULL PATH to the file inside the bucket.
                        const { data: signData, error: signError } = await supabase
                            .storage
                            .from('festival-images') // Bucket name
                            .createSignedUrl(normalizedPath, 3600); // Path inside the bucket

                        if (signError) {
                            console.error('Error creating signed URL for normalized path:', normalizedPath, signError);
                            return { ...festival, signedImageUrl: '' };
                        }
                        return { ...festival, signedImageUrl: signData.signedUrl };
                    }

                    // Fallback if no valid path could be determined
                    return { ...festival, signedImageUrl: '' };
                })
            );

            setFestivals(festivalsWithUrls as FestivalWithSignedUrl[]);
            setLoading(false);
        };

        fetchFestivals();
    }, [searchTerm, selectedRegion]);

    // --- Rendering logic (unchanged) ---
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