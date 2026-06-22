import React, { useState, useCallback } from 'react';
import { Eye, EyeOff, Copy, ExternalLink, Info } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/modules/settings/shared/components';
import { Switch } from '@/modules/shared/ui/shadcn/switch';
import { TEAL as T, TEAL_BG as TBG, TEAL_BORDER as TBRD } from '@/modules/settings/shared/constants';

const NAVY = "#0D1B2A";

interface ProfileVisibilityTabProps {
  userId: string;
  effectiveIsPublicProfile: boolean;
  onToggleVisibility: (effectiveIsPublic: boolean) => Promise<void>;
  hasMembership?: boolean;
}

const ProfileVisibilityTab: React.FC<ProfileVisibilityTabProps> = ({ userId, effectiveIsPublicProfile, onToggleVisibility, hasMembership = false }) => {
  const { showToast } = useToast();
  const { t } = useTranslation('dashboard');
  const s = (k: string) => t(`candidate_settings.visibility.${k}`);

  const effectiveIsPublic = hasMembership ? false : effectiveIsPublicProfile;

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied,  setCopied]  = useState(false);

  const publicProfileUrl = typeof window !== 'undefined' ? `${window.location.origin}/profile/candidate/${userId}` : '';

  const handleToggleVisibility = useCallback(async () => {
    setLoading(true); setError(null); setSuccess(null);
    try {
      const newVisibility = !effectiveIsPublic;
      await onToggleVisibility(newVisibility);
      const msg = newVisibility ? s('success_public') : s('success_private');
      setSuccess(msg);
      showToast({ message: msg, severity: 'success' });
    } catch (err: any) {
      const msg = err.message || 'Failed to update profile visibility';
      setError(msg);
      showToast({ message: msg, severity: 'error' });
    } finally { setLoading(false); }
  }, [effectiveIsPublic, onToggleVisibility, showToast]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(publicProfileUrl);
    setCopied(true);
    showToast({ message: s('copied_toast'), severity: 'success' });
    setTimeout(() => setCopied(false), 2000);
  }, [publicProfileUrl, showToast]);

  const handleViewProfile = useCallback(() => { window.open(publicProfileUrl, '_blank'); }, [publicProfileUrl]);

  const privacyItems = [s('privacy_item_1'), s('privacy_item_2'), s('privacy_item_3'), s('privacy_item_4')];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="font-bold text-[0.95rem]" style={{ color: NAVY }}>{s('title')}</p>
        <p className="text-[0.72rem] text-gray-400 mt-1">{s('subtitle')}</p>
      </div>
      <div className="p-5">
        {hasMembership && (
          <div className="mb-5 rounded-[10px] px-3 py-2.5 text-[0.8rem] bg-teal-50 border border-teal-200">
            <p className="font-semibold text-[0.82rem]" style={{ color: NAVY }}>{s('membership_title')}</p>
            <p className="text-[0.78rem] text-gray-500 mt-1">{s('membership_subtitle')}</p>
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-center justify-between rounded-[10px] bg-red-50 border border-red-200 px-3 py-2 text-[0.8rem] text-red-700">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="text-red-500 hover:text-red-700">×</button>
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-center justify-between rounded-[10px] bg-green-50 border border-green-200 px-3 py-2 text-[0.8rem] text-green-700">
            <span>{success}</span>
            <button type="button" onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700">×</button>
          </div>
        )}

        <div
          className="p-4 mb-5 rounded-xl flex items-center gap-4"
          style={{ border: `1px solid ${effectiveIsPublic ? TBRD : "#E5E7EB"}`, backgroundColor: effectiveIsPublic ? TBG : "#F9FAFB" }}
        >
          <div
            className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center"
            style={{ backgroundColor: effectiveIsPublic ? T : "#94A3B8" }}
          >
            {effectiveIsPublic ? <Eye size={22} className="text-white" /> : <EyeOff size={22} className="text-white" />}
          </div>
          <div className="flex-1">
            <p className="font-bold text-[0.88rem]" style={{ color: NAVY }}>{effectiveIsPublic ? s('status_public') : s('status_private')}</p>
            <p className="text-[0.75rem] text-gray-500 mt-1">{effectiveIsPublic ? s('desc_public') : s('desc_private')}</p>
            {loading && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Spinner size={12} />
                <span className="text-[0.72rem] text-gray-500">{s('updating')}</span>
              </div>
            )}
          </div>
          <Switch
            checked={effectiveIsPublic}
            disabled={loading || hasMembership}
            onCheckedChange={handleToggleVisibility}
          />
        </div>

        <hr className="mb-5 border-gray-200" />

        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-3">
            <p className="font-bold text-[0.88rem]" style={{ color: NAVY }}>{s('url_title')}</p>
            <span title={s('url_tooltip')}>
              <Info size={15} className="text-gray-300" />
            </span>
          </div>
          <div className="p-3 rounded-[10px] bg-gray-50 border border-gray-200 mb-3">
            <p className={`text-[0.78rem] font-mono break-all ${effectiveIsPublic ? "" : "text-gray-300"}`} style={effectiveIsPublic ? { color: NAVY } : undefined}>
              {publicProfileUrl}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCopyLink}
              disabled={!effectiveIsPublic}
              className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold rounded-lg px-3 py-1.5 border border-gray-200 text-gray-500 hover:border-teal-600 hover:bg-teal-50 hover:text-teal-600 disabled:border-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent disabled:hover:border-gray-100 transition-colors"
            >
              <Copy size={14} />
              {copied ? s('copied') : s('copy_link')}
            </button>
            <button
              type="button"
              onClick={handleViewProfile}
              disabled={!effectiveIsPublic}
              className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold rounded-lg px-3 py-1.5 bg-teal-600 text-white hover:bg-teal-700 disabled:bg-gray-100 disabled:text-gray-300 transition-colors"
            >
              <ExternalLink size={14} />
              {s('view_profile')}
            </button>
          </div>
        </div>

        <hr className="mb-5 border-gray-200" />

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="font-bold text-[0.82rem] text-amber-800 mb-2">{s('privacy_title')}</p>
          <p className="text-[0.78rem] text-amber-900 mb-2 leading-relaxed">{s('privacy_intro')}</p>
          <ul className="m-0 pl-5 text-amber-900 list-disc">
            {privacyItems.map(item => <li key={item} className="text-[0.78rem] mb-1">{item}</li>)}
          </ul>
          <p className="text-[0.78rem] text-amber-900 mt-2 font-semibold">{s('privacy_footer')}</p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProfileVisibilityTab);
