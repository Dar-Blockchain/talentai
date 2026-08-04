import React, { useState, useCallback } from 'react';
import { Eye, EyeOff, Copy, ExternalLink, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/modules/settings/shared/components';
import { Switch } from '@/modules/shared/ui/shadcn/switch';
import { Button } from '@/modules/shared/ui/shadcn/button';

interface ProfileVisibilityTabProps {
  userId:                    string;
  effectiveIsPublicProfile:  boolean;
  onToggleVisibility:        (effectiveIsPublic: boolean) => Promise<void>;
  hasMembership?:            boolean;
}

const ProfileVisibilityTab: React.FC<ProfileVisibilityTabProps> = ({
  userId, effectiveIsPublicProfile, onToggleVisibility, hasMembership = false,
}) => {
  const { showToast } = useToast();
  const { t } = useTranslation('dashboard');
  const s = (k: string) => t(`candidate_settings.visibility.${k}`);

  const effectiveIsPublic = hasMembership ? false : effectiveIsPublicProfile;

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied,  setCopied]  = useState(false);

  const publicProfileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/profile/candidate/${userId}`
    : '';

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
    } finally {
      setLoading(false);
    }
  }, [effectiveIsPublic, onToggleVisibility, showToast]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(publicProfileUrl);
    setCopied(true);
    showToast({ message: s('copied_toast'), severity: 'success' });
    setTimeout(() => setCopied(false), 2000);
  }, [publicProfileUrl, showToast]);

  const handleViewProfile = useCallback(() => {
    window.open(publicProfileUrl, '_blank');
  }, [publicProfileUrl]);

  const privacyItems = [s('privacy_item_1'), s('privacy_item_2'), s('privacy_item_3'), s('privacy_item_4')];

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <p className="font-bold text-sm text-foreground">{s('title')}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{s('subtitle')}</p>
      </div>

      <div className="p-5 flex flex-col gap-5">

        {/* Membership notice */}
        {hasMembership && (
          <div className="rounded-xl px-3 py-2.5 bg-primary-light border border-primary-border">
            <p className="font-semibold text-sm text-foreground">{s('membership_title')}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s('membership_subtitle')}</p>
          </div>
        )}

        {/* Error / success */}
        {error && (
          <div className="flex items-center justify-between rounded-xl bg-danger-light border border-danger-border px-3 py-2 text-sm text-danger">
            <span>{error}</span>
            <Button variant="ghost" onClick={() => setError(null)} className="ml-2 p-0 h-auto text-danger/60 hover:bg-transparent hover:text-danger">×</Button>
          </div>
        )}
        {success && (
          <div className="flex items-center justify-between rounded-xl bg-primary-light border border-primary-border px-3 py-2 text-sm text-primary-dark">
            <span>{success}</span>
            <Button variant="ghost" onClick={() => setSuccess(null)} className="ml-2 p-0 h-auto text-primary-dark/60 hover:bg-transparent hover:text-primary-dark">×</Button>
          </div>
        )}

        {/* Visibility toggle card */}
        <div className={cn(
          "p-4 rounded-xl flex items-center gap-4 border transition-colors",
          effectiveIsPublic ? "bg-primary-light border-primary-border" : "bg-muted border-border",
        )}>
          <div className={cn(
            "size-11 rounded-xl shrink-0 flex items-center justify-center",
            effectiveIsPublic ? "bg-primary-dark" : "bg-muted-foreground",
          )}>
            {effectiveIsPublic
              ? <Eye size={20} className="text-white" />
              : <EyeOff size={20} className="text-white" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-foreground">
              {effectiveIsPublic ? s('status_public') : s('status_private')}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {effectiveIsPublic ? s('desc_public') : s('desc_private')}
            </p>
            {loading && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Spinner size={12} />
                <span className="text-xs text-muted-foreground">{s('updating')}</span>
              </div>
            )}
          </div>
          <Switch
            checked={effectiveIsPublic}
            disabled={loading || hasMembership}
            onCheckedChange={handleToggleVisibility}
          />
        </div>

        <hr className="border-border" />

        {/* Profile URL */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-sm text-foreground">{s('url_title')}</p>
            <span title={s('url_tooltip')}>
              <Info size={14} className="text-muted-foreground/40" />
            </span>
          </div>
          <div className="p-3 rounded-xl bg-muted border border-border">
            <p className={cn(
              "text-xs font-mono break-all",
              effectiveIsPublic ? "text-foreground" : "text-muted-foreground/40",
            )}>
              {publicProfileUrl}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              disabled={!effectiveIsPublic}
              className="gap-1.5 text-xs"
            >
              <Copy size={13} />
              {copied ? s('copied') : s('copy_link')}
            </Button>
            <Button
              size="sm"
              onClick={handleViewProfile}
              disabled={!effectiveIsPublic}
              className="gap-1.5 text-xs bg-primary-dark hover:bg-primary-dark/90 text-white"
            >
              <ExternalLink size={13} />
              {s('view_profile')}
            </Button>
          </div>
        </div>

        <hr className="border-border" />

        {/* Privacy notice */}
        <div className="p-4 rounded-xl bg-warning-light border border-warning-border">
          <p className="font-bold text-sm text-warning mb-1.5">{s('privacy_title')}</p>
          <p className="text-xs text-warning/80 mb-2 leading-relaxed">{s('privacy_intro')}</p>
          <ul className="list-disc pl-4 flex flex-col gap-1">
            {privacyItems.map(item => (
              <li key={item} className="text-xs text-warning/80">{item}</li>
            ))}
          </ul>
          <p className="text-xs text-warning/80 mt-2 font-semibold">{s('privacy_footer')}</p>
        </div>

      </div>
    </div>
  );
};

export default React.memo(ProfileVisibilityTab);
