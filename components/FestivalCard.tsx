import React from 'react';
import type { Festival } from '../types';

interface FestivalCardProps {
    festival: Festival;
    onSelect: (festival: Festival) => void;
}

const LocationIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const ProgressBar: React.FC<{ current: number, goal: number }> = ({ current, goal }) => {
    const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
    return (
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 my-2">
            <div className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
    );
};


export const FestivalCard: React.FC<FestivalCardProps> = ({ festival, onSelect }) => {
    const minSponsorship = Math.min(...festival.sponsorshipTiers.filter(t => t.type === 'monetary' && t.amount > 0).map(t => t.amount));
    const isGoalBased = festival.fundingType === 'goal-based';
    const progress = isGoalBased && festival.fundingGoal ? (festival.currentFunding || 0) / festival.fundingGoal * 100 : 0;

    return (
        <div 
            className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl border border-slate-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group flex flex-col"
            onClick={() => onSelect(festival)}
            role="button"
            tabIndex={0}
            aria-label={`${festival.name}の詳細を見る`}
        >
            <div className="relative">
                <img className="w-full h-56 object-cover" src={festival.imageUrl} alt={festival.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/40 transition-all duration-300"></div>
                 <div className="absolute bottom-0 left-0 p-4">
                   <h3 className="text-2xl font-bold text-white">{festival.name}</h3>
                </div>
                {isGoalBased && (
                    <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">目標達成型</div>
                )}
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <p className="text-slate-600 dark:text-slate-400 mb-4 h-12 overflow-hidden">{festival.description}</p>
                
                <div className="flex items-center text-slate-600 dark:text-slate-400 mb-2">
                    <LocationIcon className="h-5 w-5 mr-2 text-cyan-500" />
                    <span>{festival.location}</span>
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-400 mb-4">
                    <CalendarIcon className="h-5 w-5 mr-2 text-cyan-500" />
                    <span>{festival.date}</span>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-auto">
                    {isGoalBased ? (
                         <div>
                            <div className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-400">
                                <span>現在 <span className="text-slate-800 dark:text-white font-bold">{Math.floor(progress)}%</span></span>
                                <span>目標 ¥{(festival.fundingGoal || 0).toLocaleString()}</span>
                            </div>
                            <ProgressBar current={festival.currentFunding || 0} goal={festival.fundingGoal || 1} />
                            <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400 text-right">¥{(festival.currentFunding || 0).toLocaleString()}</p>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-slate-500">協賛金額</p>
                                <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
                                    {minSponsorship !== Infinity ? `¥${minSponsorship.toLocaleString()}〜` : '受付中'}
                                </p>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white px-4 py-2 rounded-md group-hover:bg-cyan-500 group-hover:text-white dark:group-hover:bg-cyan-500 transition-colors duration-200">
                                詳細を見る
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};