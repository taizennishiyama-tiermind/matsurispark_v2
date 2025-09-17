import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FestivalGrid } from './components/FestivalGrid';
import { FestivalDetail } from './components/FestivalDetail';
import { FilterBar } from './components/FilterBar';
import { CreateEventPage } from './components/CreateEventPage';
// import { festivals as mockFestivals } from './data/mockData'; // No longer needed
import type { Festival } from './types';
import { supabase } from './lib/supabaseClient'; // Import supabase

type Page = 'list' | 'detail' | 'create';

const App: React.FC = () => {
    const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('list');
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedTheme = window.localStorage.getItem('theme');
            return (storedTheme === 'dark' || storedTheme === 'light') ? storedTheme : 'light';
        }
        return 'light';
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [regions, setRegions] = useState<string[]>([]);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Fetch unique regions from the database
    useEffect(() => {
        const fetchRegions = async () => {
            const { data, error } = await supabase
                .from('festivals')
                .select('region');
            
            if (error) {
                console.error('Error fetching regions:', error);
            } else {
                const uniqueRegions = [...new Set(data.map(f => f.region).filter(Boolean))].sort();
                setRegions(uniqueRegions);
            }
        };
        fetchRegions();
    }, []);

    const handleToggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const handleSelectFestival = (festival: Festival) => {
        setSelectedFestival(festival);
        setCurrentPage('detail');
        window.scrollTo(0, 0);
    };

    const handleGoBack = () => {
        setSelectedFestival(null);
        setCurrentPage('list');
    };
    
    const handleNavigate = (page: Page) => {
        setCurrentPage(page);
        setSelectedFestival(null);
        window.scrollTo(0, 0);
    }
    
    const handleEventCreated = () => {
        // After a new event is created in the DB, just navigate back to the list.
        // FestivalGrid will automatically fetch the updated list.
        handleNavigate('list');
    }

    const renderContent = () => {
        switch (currentPage) {
            case 'detail':
                return selectedFestival ? <FestivalDetail festival={selectedFestival} onBack={handleGoBack} /> : null;
            case 'create':
                return <CreateEventPage onEventCreated={handleEventCreated} onBack={() => handleNavigate('list')} />;
            case 'list':
            default:
                return (
                    <>
                        <div className="text-center mb-12">
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600 dark:from-cyan-400 dark:to-purple-500 mb-4">
                                日本の祭りを、共に盛り上げる。
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                                スポンサーと活気あふれる文化イベントをつなぐプラットフォーム。あなたの支援が、地域の未来を灯します。
                            </p>
                        </div>
                        <FilterBar 
                            searchTerm={searchTerm}
                            selectedRegion={selectedRegion}
                            regions={regions} // Use regions from state
                            onSearchChange={setSearchTerm}
                            onRegionChange={setSelectedRegion}
                        />
                        {/* Pass filter states to FestivalGrid */}
                        <FestivalGrid 
                            onSelectFestival={handleSelectFestival} 
                            searchTerm={searchTerm}
                            selectedRegion={selectedRegion}
                        />
                    </>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans flex flex-col">
            <Header theme={theme} onToggleTheme={handleToggleTheme} onNavigate={handleNavigate} />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {renderContent()}
            </main>
            <Footer />
        </div>
    );
};

export default App;
