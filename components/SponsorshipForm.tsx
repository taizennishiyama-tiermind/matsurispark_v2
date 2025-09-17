import React, { useState } from 'react';
import type { SponsorshipTier } from '../types';
import { supabase } from '../lib/supabaseClient'; // Import supabase

interface SponsorshipFormProps {
    tier: SponsorshipTier;
    festivalId: string; // Add festivalId to link the sponsor to the festival
    festivalName: string;
    onSubmitSuccess: () => void;
}

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

export const SponsorshipForm: React.FC<SponsorshipFormProps> = ({ tier, festivalId, festivalName, onSubmitSuccess }) => {
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [logo, setLogo] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionMessage, setSubmissionMessage] = useState('');
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!logo) {
            setError('企業ロゴをアップロードしてください。');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSubmissionMessage('');

        try {
            // 1. Upload logo to Supabase Storage
            const fileExt = logo.name.split('.').pop();
            const newFileName = `${Date.now()}.${fileExt}`;
            const filePath = `logos/${newFileName}`;
            
            const { error: uploadError } = await supabase.storage
                .from('festival-logos') // Make sure this bucket exists and has correct policies
                .upload(filePath, logo);

            if (uploadError) {
                throw new Error(`ロゴのアップロードに失敗しました: ${uploadError.message}`);
            }

            // 2. Get the public URL of the uploaded file
            const { data: urlData } = supabase.storage
                .from('festival-logos')
                .getPublicUrl(filePath);
            
            if (!urlData) {
                 throw new Error('ロゴのURLの取得に失敗しました。');
            }
            const logoUrl = urlData.publicUrl;

            // 3. Insert sponsor data into the 'sponsors' table
            const { error: insertError } = await supabase.from('sponsors').insert([
                {
                    company_name: companyName,
                    logo_url: logoUrl,
                    sponsorship_tier_id: tier.id,
                    festival_id: festivalId,
                    // You might want to add email or other contact info to your DB schema
                },
            ]);

            if (insertError) {
                throw new Error(`協賛情報の保存に失敗しました: ${insertError.message}`);
            }
            
            // 4. Handle success
            setIsSubmitting(false);
            setSubmissionMessage(`${companyName}様、ご支援いただきありがとうございます。「${tier.name}」プランのお申し込みを受け付けました。今後の手続きについては、${email}宛にご連絡いたします。`);
            setCompanyName('');
            setEmail('');
            setLogo(null);
            setFileName('');
            
            setTimeout(onSubmitSuccess, 5000);

        } catch (err: any) {
            setIsSubmitting(false);
            setError(err.message);
            console.error('Submission failed:', err);
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLogo(e.target.files[0]);
            setFileName(e.target.files[0].name);
            setError(null); // Clear error on new file selection
        }
    };

    if (submissionMessage) {
        return (
            <div className="bg-green-50 dark:bg-slate-900 border border-green-500 rounded-lg p-8 text-center">
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">お申し込み完了</h3>
                <p className="text-green-800 dark:text-slate-300">{submissionMessage}</p>
            </div>
        );
    }

    const renderSubmitButtonText = () => {
        if (isSubmitting) return '送信中...';
        switch (tier.type) {
            case 'monetary':
                return `協賛を申し込む (¥${tier.amount.toLocaleString()})`;
            case 'in-kind':
            case 'service':
                return '協力の申し出を行う';
            default:
                return '申し込む';
        }
    };
    
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-8">
            <h3 className="text-3xl font-bold text-center mb-2 text-slate-800 dark:text-white">スポンサーになる</h3>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-6">「<span className="font-bold text-slate-900 dark:text-white">{festivalName}</span>」の「<span className="font-bold text-cyan-600 dark:text-cyan-400">{tier.name}</span>」プランに申し込みます。</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                 {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">エラー: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">企業・団体名</label>
                    <input
                        type="text"
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-slate-900 dark:text-white"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">ご連絡先メールアドレス</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-slate-900 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">企業ロゴ (PNG, JPG) *必須</label>
                    <label htmlFor="logo-upload" className={`relative cursor-pointer bg-slate-100 dark:bg-slate-800 rounded-md font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-offset-slate-900 focus-within:ring-cyan-500 border border-slate-300 dark:border-slate-600 flex items-center justify-center h-32 ${error && !logo ? 'border-red-500' : ''}`}>
                        <div className="text-center">
                            <UploadIcon className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
                            <span className="mt-2 block text-sm text-slate-500 dark:text-slate-400">{fileName || 'クリックしてロゴをアップロード'}</span>
                        </div>
                        <input id="logo-upload" name="logo-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".png, .jpg, .jpeg, .svg" />
                    </label>
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus-ring-offset-slate-900 focus:ring-purple-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        {renderSubmitButtonText()}
                    </button>
                    {tier.type === 'monetary' && (
                        <p className="text-center text-xs text-slate-500 mt-2">決済ページへ移動します。別途10%のプラットフォーム利用料がかかります。</p>
                    )}
                </div>
            </form>
        </div>
    );
};