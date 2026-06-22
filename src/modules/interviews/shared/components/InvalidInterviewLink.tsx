import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { Link2Off, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/modules/shared/ui/shadcn/button';

export default function InvalidInterviewLink() {
  const router = useRouter();
  const { t } = useTranslation('modules/interview/interview');

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center flex flex-col items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center">
          <Link2Off size={28} className="text-muted-foreground" />
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-foreground font-bold text-lg">{t('invalid_link.title')}</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t('invalid_link.desc')}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-1.5">
            <ArrowLeft size={14} />
            {t('invalid_link.back')}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => router.reload()} className="gap-1.5 text-muted-foreground">
            <RefreshCw size={14} />
            {t('invalid_link.retry')}
          </Button>
        </div>
      </div>
    </div>
  );
}
