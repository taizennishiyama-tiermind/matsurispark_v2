import React from 'react';

interface FilterBarProps {
  searchTerm: string;
  selectedRegion: string;
  regions: string[];
  onSearchChange: (term: string) => void;
  onRegionChange: (region: string) => void;
}

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

export const FilterBar: React.FC<FilterBarProps> = ({ searchTerm, selectedRegion, regions, onSearchChange, onRegionChange }) => {
    return (
        <div className="mb-10 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="search-festival" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        祭り名で検索
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            id="search-festival"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="例: 祇園祭"
                            className="w-full pl-10 pr-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:text-white"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="region-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        地域で絞り込み
                    </label>
                    <select
                        id="region-filter"
                        value={selectedRegion}
                        onChange={(e) => onRegionChange(e.target.value)}
                        className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:text-white"
                    >
                        <option value="">すべての地域</option>
                        {regions.map(region => (
                            <option key={region} value={region}>{region}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};