import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-slate-500 dark:text-slate-500">
                <p>&copy; {new Date().getFullYear()} Matsuri Spark. All rights reserved.</p>
                <p className="text-sm mt-1">祭りで、コミュニティと企業をつなぐ。</p>
            </div>
        </footer>
    );
};