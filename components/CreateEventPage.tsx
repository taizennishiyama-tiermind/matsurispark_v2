import React, { useState } from 'react';
import type { Festival, SponsorshipTier, SponsorshipType, FundingType } from '../types';

interface CreateEventPageProps {
    onEventCreated: (newEvent: Festival) => void;
    onBack: () => void;
}

const BackIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
    </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const initialTier: Omit<SponsorshipTier, 'id'> = { name: '', type: 'monetary', amount: 0, perks: [], description: '', value: 0 };

export const CreateEventPage: React.FC<CreateEventPageProps> = ({ onEventCreated, onBack }) => {
    const [festivalName, setFestivalName] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [region, setRegion] = useState('北海道');
    const [attendance, setAttendance] = useState(0);
    const [description, setDescription] = useState('');
    const [longDescription, setLongDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('https://picsum.photos/seed/new-event/800/600');
    const [sponsorshipTiers, setSponsorshipTiers] = useState<Omit<SponsorshipTier, 'id'>[]>([initialTier]);
    const [fundingType, setFundingType] = useState<FundingType>('open');
    const [fundingGoal, setFundingGoal] = useState(0);

    const inputFieldClasses = "w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500";

    const handleTierChange = (index: number, field: keyof Omit<SponsorshipTier, 'id'>, value: any) => {
        const newTiers = [...sponsorshipTiers];
        (newTiers[index] as any)[field] = value;
        setSponsorshipTiers(newTiers);
    };

    const addTier = () => {
        setSponsorshipTiers([...sponsorshipTiers, { ...initialTier }]);
    };
    
    const removeTier = (index: number) => {
        if (sponsorshipTiers.length > 1) {
            const newTiers = sponsorshipTiers.filter((_, i) => i !== index);
            setSponsorshipTiers(newTiers);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newEvent: Festival = {
            id: new Date().toISOString(),
            name: festivalName,
            location,
            date,
            region,
            attendance,
            description,
            longDescription,
            imageUrl,
            fundingType,
            fundingGoal: fundingType === 'goal-based' ? fundingGoal : undefined,
            currentFunding: fundingType === 'goal-based' ? 0 : undefined,
            sponsorshipTiers: sponsorshipTiers.map((tier, index) => ({
                ...tier,
                id: `new-tier-${index}`,
                amount: tier.type === 'monetary' ? tier.amount : 0,
                perks: Array.isArray(tier.perks) ? tier.perks : String(tier.perks).split('\n'),
            })),
        };
        alert('イベントが登録されました！');
        onEventCreated(newEvent);
    };

    return (
        <div className="animate-fade-in">
             <button
                onClick={onBack}
                className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 mb-6 transition-colors font-semibold"
            >
                <BackIcon className="h-5 w-5" />
                <span>トップページへ戻る</span>
            </button>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 md:p-10">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white">イベントを掲載する</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">あなたの祭りを登録して、全国のサポーターから協賛を募りましょう。</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-8">
                        <h2 className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-4">基本情報</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <input type="text" placeholder="祭り名" value={festivalName} onChange={e => setFestivalName(e.target.value)} required className={inputFieldClasses} />
                           <input type="text" placeholder="開催地 (例: 京都府京都市)" value={location} onChange={e => setLocation(e.target.value)} required className={inputFieldClasses} />
                           <input type="text" placeholder="開催時期 (例: 7月1日～31日)" value={date} onChange={e => setDate(e.target.value)} required className={inputFieldClasses} />
                           <input type="number" placeholder="想定来場者数" value={attendance > 0 ? attendance : ''} onChange={e => setAttendance(Number(e.target.value))} required className={inputFieldClasses} />
                            <select value={region} onChange={e => setRegion(e.target.value)} className={inputFieldClasses}>
                                <option>北海道</option> <option>東北</option> <option>関東</option> <option>中部</option> <option>関西</option> <option>中国</option> <option>四国</option> <option>九州</option>
                            </select>
                        </div>
                         <textarea placeholder="祭りの簡単な説明 (80字以内)" value={description} onChange={e => setDescription(e.target.value)} required className={`${inputFieldClasses} mt-6 h-24`} maxLength={80}></textarea>
                         <textarea placeholder="祭りの詳細な説明" value={longDescription} onChange={e => setLongDescription(e.target.value)} required className={`${inputFieldClasses} mt-6 h-40`}></textarea>
                    </div>

                    {/* Funding Type */}
                     <div className="border-b border-slate-200 dark:border-slate-700 pb-8">
                        <h2 className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-4">募集タイプ</h2>
                        <div className="flex space-x-4">
                            <label className={`flex-1 p-4 border rounded-lg cursor-pointer text-center ${fundingType === 'open' ? 'border-cyan-500 ring-2 ring-cyan-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                <input type="radio" name="fundingType" value="open" checked={fundingType === 'open'} onChange={() => setFundingType('open')} className="sr-only" />
                                <span className="text-lg font-bold block">通常募集</span>
                                <span className="text-sm text-slate-500">いつでも協賛を受け付けます</span>
                            </label>
                            <label className={`flex-1 p-4 border rounded-lg cursor-pointer text-center ${fundingType === 'goal-based' ? 'border-cyan-500 ring-2 ring-cyan-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                <input type="radio" name="fundingType" value="goal-based" checked={fundingType === 'goal-based'} onChange={() => setFundingType('goal-based')} className="sr-only" />
                                <span className="text-lg font-bold block">目標達成型</span>
                                <span className="text-sm text-slate-500">目標金額達成を目指します</span>
                            </label>
                        </div>
                        {fundingType === 'goal-based' && (
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">目標金額</label>
                                <input type="number" placeholder="目標金額 (円)" value={fundingGoal > 0 ? fundingGoal : ''} onChange={e => setFundingGoal(Number(e.target.value))} required className={inputFieldClasses} />
                            </div>
                        )}
                    </div>

                    {/* Sponsorship Tiers */}
                    <div>
                        <h2 className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-4">協賛プラン</h2>
                        <div className="space-y-6">
                            {sponsorshipTiers.map((tier, index) => (
                                <div key={index} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 relative">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input type="text" placeholder="プラン名 (例: ゴールドプラン)" value={tier.name} onChange={e => handleTierChange(index, 'name', e.target.value)} required className={inputFieldClasses} />
                                         <select value={tier.type} onChange={e => handleTierChange(index, 'type', e.target.value)} className={inputFieldClasses}>
                                            <option value="monetary">金銭支援</option>
                                            <option value="in-kind">物品提供</option>
                                            <option value="service">サービス提供</option>
                                        </select>
                                    </div>
                                    {tier.type === 'monetary' ? (
                                        <input type="number" placeholder="協賛金額 (円)" value={tier.amount > 0 ? tier.amount : ''} onChange={e => handleTierChange(index, 'amount', Number(e.target.value))} required className={`${inputFieldClasses} mt-4`} />
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <input type="text" placeholder="提供内容 (例: 飲料水500本)" value={tier.description} onChange={e => handleTierChange(index, 'description', e.target.value)} required className={inputFieldClasses} />
                                            <input type="number" placeholder="想定価値 (円)" value={tier.value > 0 ? tier.value : ''} onChange={e => handleTierChange(index, 'value', Number(e.target.value))} className={inputFieldClasses} />
                                        </div>
                                    )}
                                    <textarea placeholder="特典内容 (改行で区切ってください)" value={Array.isArray(tier.perks) ? tier.perks.join('\n') : tier.perks} onChange={e => handleTierChange(index, 'perks', e.target.value.split('\n'))} required className={`${inputFieldClasses} mt-4 h-28`}></textarea>
                                    {sponsorshipTiers.length > 1 && (
                                        <button type="button" onClick={() => removeTier(index)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600">
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                         <button type="button" onClick={addTier} className="mt-6 flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 font-semibold hover:text-cyan-700">
                            <PlusIcon className="h-5 w-5" />
                            <span>協賛プランを追加</span>
                        </button>
                    </div>

                    <div className="text-center pt-6">
                         <button type="submit" className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-12 rounded-lg transition-transform transform hover:scale-105">
                            イベントを登録する
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};