import React, { useState } from 'react';
import type { Festival, SponsorshipTier } from '../types';
import { supabase } from '../lib/supabaseClient';

interface CreateEventPageProps {
    onEventCreated: () => void;
    onBack: () => void;
}

// --- Icon Components (unchanged) ---
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
const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);
// --- End Icon Components ---

type NewSponsorshipTier = Omit<SponsorshipTier, 'id' | 'festival_id' | 'created_at' | 'updated_at'>;
const initialTier: NewSponsorshipTier = { name: '', type: 'monetary', amount: 0, perks: [], description: '', value: 0 };

export const CreateEventPage: React.FC<CreateEventPageProps> = ({ onEventCreated, onBack }) => {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [region, setRegion] = useState('北海道');
    const [attendance, setAttendance] = useState(0);
    const [description, setDescription] = useState('');
    const [long_description, setLongDescription] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageFileName, setImageFileName] = useState('');
    const [sponsorship_tiers, setSponsorshipTiers] = useState<NewSponsorshipTier[]>([initialTier]);
    const [funding_type, setFundingType] = useState<Festival['funding_type']>('open');
    const [funding_goal, setFundingGoal] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const inputFieldClasses = "w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500";

    const handleTierChange = (index: number, field: keyof NewSponsorshipTier, value: any) => {
        const newTiers = [...sponsorship_tiers];
        (newTiers[index] as any)[field] = value;
        setSponsorshipTiers(newTiers);
    };

    const addTier = () => setSponsorshipTiers([...sponsorship_tiers, { ...initialTier }]);
    const removeTier = (index: number) => {
        if (sponsorship_tiers.length > 1) setSponsorshipTiers(sponsorship_tiers.filter((_, i) => i !== index));
    };

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
            setImageFileName(e.target.files[0].name);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile) {
            setError('祭りのメイン画像をアップロードしてください。');
            window.scrollTo(0, 0);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // **ULTIMATE FIX 1: Standardize upload path**
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `festival_${Date.now()}.${fileExt}`;
            // Correct path format: `folder/filename` as seen in Supabase UI
            const imagePath = `festival-images/${fileName}`;

            // Upload to the correct folder
            const { error: uploadError } = await supabase.storage
                .from('festival-images') // Bucket name
                .upload(imagePath, imageFile); // FULL path within the bucket
            
            if (uploadError) throw new Error(`画像アップロードエラー: ${uploadError.message}`);

            // **ULTIMATE FIX 2: Save the standardized path to DB**
            const festivalData: Omit<Festival, 'id'> = {
                name, location, date, region, attendance, description, long_description,
                image_url: imagePath, // <-- Save the `folder/filename` path
                funding_type,
                funding_goal: funding_type === 'goal-based' ? funding_goal : 0,
                current_funding: 0,
            };

            const { data: newFestival, error: festivalInsertError } = await supabase
                .from('festivals')
                .insert(festivalData)
                .select()
                .single();

            if (festivalInsertError) throw new Error(`イベント登録エラー: ${festivalInsertError.message}`);
            if (!newFestival) throw new Error('作成されたイベントのデータが取得できませんでした。');

            const tiersToInsert = sponsorship_tiers.map(tier => ({
                ...tier,
                festival_id: newFestival.id,
                perks: Array.isArray(tier.perks) ? tier.perks : String(tier.perks).split('\n').filter(p => p.trim() !== ''),
            }));

            const { error: tiersInsertError } = await supabase
                .from('sponsorship_tiers')
                .insert(tiersToInsert);
            
            if (tiersInsertError) throw new Error(`協賛プラン登録エラー: ${tiersInsertError.message}`);
            
            alert('イベントが正常に登録されました！');
            onEventCreated();

        } catch (err: any) {
            setError(err.message);
            window.scrollTo(0, 0);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-fade-in">
             <button onClick={onBack} className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 mb-6 transition-colors font-semibold">
                <BackIcon className="h-5 w-5" />
                <span>トップページへ戻る</span>
            </button>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 md:p-10">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white">イベントを掲載する</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">あなたの祭りを登録して、全国のサポーターから協賛を募りましょう。</p>
                </div>

                 {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                        <strong className="font-bold">エラー: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-8">
                        <h2 className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-6">基本情報</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <input type="text" placeholder="祭り名" value={name} onChange={e => setName(e.target.value)} required className={inputFieldClasses} />
                           <input type="text" placeholder="開催地 (例: 京都府京都市)" value={location} onChange={e => setLocation(e.target.value)} required className={inputFieldClasses} />
                           <input type="text" placeholder="開催時期 (例: 7月1日～31日)" value={date} onChange={e => setDate(e.target.value)} required className={inputFieldClasses} />
                           <input type="number" placeholder="想定来場者数" value={attendance > 0 ? attendance : ''} onChange={e => setAttendance(Number(e.target.value))} required className={inputFieldClasses} />
                            <select value={region} onChange={e => setRegion(e.target.value)} className={inputFieldClasses}>
                                <option>北海道</option> <option>東北</option> <option>関東</option> <option>中部</option> <option>関西</option> <option>中国</option> <option>四国</option> <option>九州</option>
                            </select>
                        </div>
                         <textarea placeholder="祭りの簡単な説明 (80字以内)" value={description} onChange={e => setDescription(e.target.value)} required className={`${inputFieldClasses} mt-6 h-24`} maxLength={80}></textarea>
                         <textarea placeholder="祭りの詳細な説明" value={long_description} onChange={e => setLongDescription(e.target.value)} required className={`${inputFieldClasses} mt-6 h-40`}></textarea>
                         <div className="mt-6">
                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">メイン画像 *必須</label>
                             <label htmlFor="image-upload" className={`relative cursor-pointer bg-slate-100 dark:bg-slate-700 rounded-md font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-offset-slate-900 focus-within:ring-cyan-500 border-2 border-dashed ${error && !imageFile ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} flex items-center justify-center h-48`}>
                                 <div className="text-center">
                                     <UploadIcon className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
                                     <span className="mt-2 block text-sm text-slate-500 dark:text-slate-400">{imageFileName || 'クリックして画像をアップロード'}</span>
                                     <p className="text-xs text-slate-500">PNG, JPG, or SVG</p>
                                 </div>
                                 <input id="image-upload" type="file" className="sr-only" onChange={handleImageFileChange} accept=".png, .jpg, .jpeg, .svg" />
                             </label>
                         </div>
                    </div>

                    {/* Funding Type */}
                     <div className="border-b border-slate-200 dark:border-slate-700 pb-8">
                        <h2 className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-4">募集タイプ</h2>
                        <div className="flex space-x-4">
                            <label className={`flex-1 p-4 border rounded-lg cursor-pointer text-center ${funding_type === 'open' ? 'border-cyan-500 ring-2 ring-cyan-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                <input type="radio" name="fundingType" value="open" checked={funding_type === 'open'} onChange={() => setFundingType('open')} className="sr-only" />
                                <span className="text-lg font-bold block">通常募集</span>
                                <span className="text-sm text-slate-500">いつでも協賛を受け付けます</span>
                            </label>
                            <label className={`flex-1 p-4 border rounded-lg cursor-pointer text-center ${funding_type === 'goal-based' ? 'border-cyan-500 ring-2 ring-cyan-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                <input type="radio" name="fundingType" value="goal-based" checked={funding_type === 'goal-based'} onChange={() => setFundingType('goal-based')} className="sr-only" />
                                <span className="text-lg font-bold block">目標達成型</span>
                                <span className="text-sm text-slate-500">目標金額達成を目指します</span>
                            </label>
                        </div>
                        {funding_type === 'goal-based' && (
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">目標金額</label>
                                <input type="number" placeholder="目標金額 (円)" value={funding_goal > 0 ? funding_goal : ''} onChange={e => setFundingGoal(Number(e.target.value))} required className={inputFieldClasses} />
                            </div>
                        )}
                    </div>

                    {/* Sponsorship Tiers */}
                    <div>
                        <h2 className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-4">協賛プラン</h2>
                        <div className="space-y-6">
                            {sponsorship_tiers.map((tier, index) => (
                                <div key={index} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 relative">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input type="text" placeholder="プラン名 (例: ゴールドプラン)" value={tier.name} onChange={e => handleTierChange(index, 'name', e.target.value)} required className={inputFieldClasses} />
                                         <select value={tier.type} onChange={e => handleTierChange(index, 'type', e.target.value as SponsorshipTier['type'])} className={inputFieldClasses}>
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
                                    {sponsorship_tiers.length > 1 && (
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
                         <button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-12 rounded-lg transition-transform transform hover:scale-105 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed">
                            {isSubmitting ? '登録中...' : 'イベントを登録する'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};