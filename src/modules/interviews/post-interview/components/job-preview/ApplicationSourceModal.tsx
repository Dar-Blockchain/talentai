import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/modules/shared/ui/shadcn/dialog';
import { Label } from '@/modules/shared/ui/shadcn/label';
import { Input } from '@/modules/shared/ui/shadcn/input';
import { Button } from '@/modules/shared/ui/shadcn/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/modules/shared/ui/shadcn/select';
import { APPLICATION_SOURCE_OPTIONS } from '@/modules/shared/constants/applicationSource';

interface ApplicationSourceModalProps {
  open: boolean;
  onClose: () => void;
  onContinue: (source: string) => void;
}

const ApplicationSourceModal: React.FC<ApplicationSourceModalProps> = ({ open, onClose, onContinue }) => {
  const [source,      setSource]      = useState('');
  const [otherText,   setOtherText]   = useState('');
  const [error,       setError]       = useState('');

  const handleContinue = () => {
    if (!source) { setError('Please tell us where you saw this job post'); return; }
    if (source === 'other' && !otherText.trim()) { setError('Please tell us where you saw this job post'); return; }
    onContinue(source === 'other' ? otherText.trim() : source);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="w-[94vw] sm:max-w-[440px] rounded-[16px]">
        <DialogHeader>
          <DialogTitle>Where did you see this job post?</DialogTitle>
          <DialogDescription>This helps the company understand where their candidates come from.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5 mt-2">
          <Label className="text-xs font-semibold text-gray-700">
            Source <span className="text-destructive">*</span>
          </Label>
          <Select
            value={source}
            onValueChange={(v) => { setSource(v); setError(''); }}
          >
            <SelectTrigger className="w-full" aria-invalid={!!error}>
              <SelectValue placeholder="Select a source" />
            </SelectTrigger>
            <SelectContent>
              {APPLICATION_SOURCE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {source === 'other' && (
            <Input
              placeholder="Please specify"
              value={otherText}
              onChange={(e) => { setOtherText(e.target.value); setError(''); }}
              aria-invalid={!!error}
              className="mt-1"
            />
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleContinue}>Continue</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationSourceModal;
