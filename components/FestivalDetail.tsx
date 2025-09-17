import React, { useState, useEffect } from 'react';
import type { Festival, SponsorshipTier, Sponsor } from '../types';
import { SponsorshipForm } from './SponsorshipForm';
import { supabase } from '../lib/supabaseClient';

interface FestivalDetailProps {
    festival: Festival;
    onBack: () => void;
}

// ... (rest of the icon and sub-components remain the same)
const BackIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
    </svg>
);

const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const GiftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
);

const TruckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17H6V6h10v4l4 4H13zM6 6L3 9h3v8h12v-3l-4-4z" />
    </svg>
);


const ProgressBar: React.FC<{ current: number, goal: number }> = ({ current, goal }) => {
    const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
    return (
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 my-2 shadow-inner">
            <div className="bg-gradient-to-r from-cyan-400 to-purple-500 h-4 rounded-full text-center text-white text-xs font-bold flex items-center justify-center transition-all duration-500" style={{ width: `${percentage}%` }}>
                {percentage > 10 && `${Math.floor(percentage)}%`}
            </div>
        </div>
    );
};

const SponsorList: React.FC<{ sponsors: Sponsor[] }> = ({ sponsors }) => (
    <div>
        <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600 dark:from-cyan-400 dark:to-purple-500 mb-8">ご支援いただいた皆様</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 text-center">
            {sponsors.map(sponsor => (
                <div key={sponsor.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 transition-transform transform hover:scale-105">
                    <img src={sponsor.logo_url} alt={`${sponsor.company_name} logo`} className="h-20 w-20 rounded-full object-cover mb-3 shadow-md" />
                    <p className="font-bold text-sm text-slate-800 dark:text-white">{sponsor.company_name}</p>
                    {/* You might need to join with sponsorship_tiers to get the tier name */}
                    {/* <p className="text-xs text-slate-500 dark:text-slate-400">{sponsor.tierName}</p> */}
                </div>
            ))}
        </div>
    </div>
);


const SponsorshipTierCard: React.FC<{ tier: SponsorshipTier; onSelect: (tier: SponsorshipTier) => void; }> = ({ tier, onSelect }) => {
    const renderHeader = () => {
        switch(tier.type) {
            case 'in-kind':
                return (
                    <div className="text-center">
                        <GiftIcon className="h-12 w-12 mx-auto text-purple-500 mb-2" />
                        <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">{tier.name}</h3>
                        <p className="font-semibold text-slate-700 dark:text-slate-200 mt-2">{tier.description}</p>
                        {tier.value && <p className="text-sm text-slate-500">(想定価値: ¥{tier.value.toLocaleString()})</p>}
                    </div>
                );
            case 'service':
                return (
                    <div className="text-center">
                         <TruckIcon className="h-12 w-12 mx-auto text-orange-500 mb-2" />
                        <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400">{tier.name}</h3>
                        <p className="font-semibold text-slate-700 dark:text-slate-200 mt-2">{tier.description}</p>
                        {tier.value && <p className="text-sm text-slate-500">(想定価値: ¥{tier.value.toLocaleString()})</p>}
                    </div>
                );
            case 'monetary':
            default:
                return (
                    <div>
                        <h3 className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{tier.name}</h3>
                        <p className="text-4xl font-extrabold my-4 text-slate-800 dark:text-white">¥{tier.amount.toLocaleString()}</p>
                    </div>
                );
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col hover:border-cyan-500 transition-colors">
            {renderHeader()}
            <ul className="space-y-3 text-slate-600 dark:text-slate-300 flex-grow my-6">
                {(tier.perks as any[]).map((perk: any, index: number) => (
                    <li key={index} className="flex items-start">
                        <CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                        <span>{perk}</span>
                    </li>
                ))}
            </ul>
            <button
                onClick={() => onSelect(tier)}
                className="mt-auto w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105"
            >
                {tier.type === 'monetary' ? 'このプランで協賛' : '協力する'}
            </button>
        </div>
    );
};


export const FestivalDetail: React.FC<FestivalDetailProps> = ({ festival, onBack }) => {
    const [sponsorshipTiers, setSponsorshipTiers] = useState<SponsorshipTier[]>([]);
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [selectedTier, setSelectedTier] = useState<SponsorshipTier | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dataKey, setDataKey] = useState(0); // Add a key to force re-fetch

    const isGoalBased = festival.fundingType === 'goal-based';

    const fetchFestivalData = async () => {
        try {
            setError(null);
            const [tiersRes, sponsorsRes] = await Promise.all([
                supabase.from('sponsorship_tiers').select('*').eq('festival_id', festival.id),
                // Join sponsors with sponsorship_tiers to get tier name
                supabase.from('sponsors')
                        .select(`
                            id,
                            company_name,
                            logo_url,
                            sponsorship_tier_id,
                            sponsorship_tiers ( name )
                        `)
                        .eq('festival_id', festival.id)
            ]);

            if (tiersRes.error) throw tiersRes.error;
            if (sponsorsRes.error) throw sponsorsRes.error;

            setSponsorshipTiers(tiersRes.data as SponsorshipTier[]);
            setSponsors(sponsorsRes.data as any[]); // Data will have nested tier info

        } catch (err: any) {
            console.error('Error fetching festival data:', err);
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchFestivalData();
    }, [festival.id, dataKey]); // Re-fetch when festival id or dataKey changes

    const handleSelectTier = (tier: SponsorshipTier) => {
        setSelectedTier(tier);
        setTimeout(() => {
            document.getElementById('sponsorship-form')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleFormSubmit = () => {
        setSelectedTier(null); 
        setDataKey(prev => prev + 1); // Increment key to trigger re-fetch
    };
    
    return (
        <div className="animate-fade-in">
            <button
                onClick={onBack}
                className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 mb-6 transition-colors font-semibold"
            >
                <BackIcon className="h-5 w-5" />
                <span>祭り一覧へ戻る</span>
            </button>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl overflow-hidden">
                <img src={festival.image_url} alt={festival.name} className="w-full h-64 md:h-96 object-cover" />
                <div className="p-6 md:p-10">
                    {isGoalBased && (
                         <div className="mb-8 p-6 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                             <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-orange-500 mb-4">
                                {festival.name}
                            </h2>
                            <ProgressBar current={festival.current_funding || 0} goal={festival.funding_goal || 1} />
                            <div className="flex justify-between items-end mt-2 text-slate-700 dark:text-slate-300">
                                <div>
                                    <p className="font-bold text-2xl text-cyan-500">¥{(festival.current_funding || 0).toLocaleString()}</p>
                                    <p className="text-sm">現在の支援総額</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">目標金額: ¥{(festival.funding_goal || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isGoalBased && <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">{festival.name}</h1>}

                    <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8 text-slate-600 dark:text-slate-300 mb-6">
                        <div className="flex items-center"><UsersIcon className="h-6 w-6 mr-2 text-purple-500" /> 想定来場者数: {festival.attendance.toLocaleString()}人</div>
                        <div className="flex items-center"><span className="text-purple-500 mr-2 text-xl font-bold">●</span> {festival.location}</div>
                        <div className="flex items-center"><span className="text-purple-500 mr-2 text-xl font-bold">●</span> {festival.date}</div>
                    </div>
                    
                    <p className="text-slate-700 dark:text-slate-400 text-lg leading-relaxed whitespace-pre-wrap">{festival.long_description}</p>

                    {error && <div className="text-red-500 text-center py-4">データの読み込みに失敗しました: {error}</div>}

                    {sponsors && sponsors.length > 0 && (
                        <>
                            <div className="my-10 border-t border-slate-200 dark:border-slate-700"></div>
                            <SponsorList sponsors={sponsors} />
                        </>
                    )}

                    <div className="my-10 border-t border-slate-200 dark:border-slate-700"></div>

                    <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600 dark:from-cyan-400 dark:to-purple-500 mb-8">協賛プラン</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {sponsorshipTiers.map(tier => (
                           <SponsorshipTierCard key={tier.id} tier={tier} onSelect={handleSelectTier} />
                        ))}
                    </div>

                    {selectedTier && (
                        <div id="sponsorship-form" className="mt-12">
                           <SponsorshipForm 
                                tier={selectedTier} 
                                festivalId={festival.id} // Pass the festival ID
                                festivalName={festival.name} 
                                onSubmitSuccess={handleFormSubmit} 
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};