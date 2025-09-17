import React from 'react';

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m1-12a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-6a1 1 0 01-1-1V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 3v4m-2-2h4m-1 12a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z" />
    </svg>
);

const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

interface HeaderProps {
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    onNavigate: (page: 'list' | 'create') => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme, onNavigate }) => {
    return (
        <header className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 border-b border-slate-200 dark:border-slate-700">
                    <button onClick={() => onNavigate('list')} className="flex items-center space-x-3 group">
                         <SparklesIcon className="h-8 w-8 text-cyan-500 group-hover:animate-pulse"/>
                        <span className="text-2xl font-bold text-slate-800 dark:text-white tracking-wider">
                            祭り<span className="text-cyan-500">スパーク</span>
                        </span>
                    </button>
                    <div className="flex items-center space-x-4">
                        <nav className="hidden md:flex items-center space-x-4">
                            <button onClick={() => onNavigate('list')} className="px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200">祭りを探す</button>
                            <button onClick={() => onNavigate('create')} className="px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200">主催者の方へ</button>
                            <button onClick={() => onNavigate('create')} className="px-3 py-2 rounded-md text-sm font-medium bg-cyan-500 text-white hover:bg-cyan-600 transition-colors">
                                イベントを掲載
                            </button>
                        </nav>
                        <button 
                            onClick={onToggleTheme}
                            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-cyan-500 transition-colors"
                            aria-label="テーマ切り替え"
                        >
                            {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};