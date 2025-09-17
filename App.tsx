import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FestivalGrid } from './components/FestivalGrid';
import { FestivalDetail } from './components/FestivalDetail';
import { FilterBar } from './components/FilterBar';
import { CreateEventPage } from './components/CreateEventPage';
import { festivals as mockFestivals } from './data/mockData';
import type { Festival } from './types';

type Page = 'list' | 'detail' | 'create';

const App: React.FC = () => {
    const [festivals, setFestivals] = useState<Festival[]>([]);
    const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
    const [isLoading, setIsLoading] = useState(true);
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

    useEffect(() => {
        setTimeout(() => {
            setFestivals(mockFestivals);
            setIsLoading(false);
        }, 1000);
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

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
    
    const handleEventCreated = (newEvent: Festival) => {
        // 新しいイベントをリストの先頭に追加
        setFestivals(prev => [newEvent, ...prev]);
        handleNavigate('list');
    }

    const uniqueRegions = [...new Set(mockFestivals.map(f => f.region))].sort();

    const filteredFestivals = festivals.filter(festival => {
        return (
            festival.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedRegion === '' || festival.region === selectedRegion)
        );
    });

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
                </div>
            );
        }

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
                            regions={uniqueRegions}
                            onSearchChange={setSearchTerm}
                            onRegionChange={setSelectedRegion}
                        />
                        <FestivalGrid festivals={filteredFestivals} onSelectFestival={handleSelectFestival} />
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