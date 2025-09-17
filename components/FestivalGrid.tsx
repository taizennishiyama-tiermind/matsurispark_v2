
import React from 'react';
import { FestivalCard } from './FestivalCard';
import type { Festival } from '../types';

interface FestivalGridProps {
    festivals: Festival[];
    onSelectFestival: (festival: Festival) => void;
}

export const FestivalGrid: React.FC<FestivalGridProps> = ({ festivals, onSelectFestival }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {festivals.map((festival) => (
                <FestivalCard key={festival.id} festival={festival} onSelect={onSelectFestival} />
            ))}
        </div>
    );
};
