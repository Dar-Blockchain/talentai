import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Search as SearchIcon, Check as CheckIcon, Building2 as AddBusinessIcon } from 'lucide-react';
import { Card } from '@/modules/shared/ui/shadcn/card';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { Button } from '@/modules/shared/ui/shadcn/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/modules/shared/ui/shadcn/select';
import { adminSubscriptionApi } from '../api';
import { useCompanySearchQuery } from '../queries';
import { CompanyOption, PlanLimit } from '../types';
import { ADMIN_ACCENT, ADMIN_NEUTRAL, ADMIN_NEUTRAL_BG } from '@/modules/admin/shared';

interface SubscribeCompanyCardProps {
  plans: PlanLimit[];
  onSubscribed: (companyName: string, planName: string) => void;
  onError: (message: string) => void;
}

const SubscribeCompanyCard: React.FC<SubscribeCompanyCardProps> = ({ plans, onSubscribed, onError }) => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const queryClient = useQueryClient();

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const { data: companies = [], isFetching: searching } = useCompanySearchQuery(debouncedSearch);

  const { mutate: subscribe, isPending: subscribing } = useMutation({
    mutationFn: () =>
      adminSubscriptionApi.create({ companyProfileId: selectedCompany!.profileId, planId: selectedPlanId }),
    onSuccess: () => {
      const plan = plans.find((p) => p._id === selectedPlanId);
      onSubscribed(selectedCompany!.name, plan?.name || 'plan');
      setSelectedCompany(null);
      setSelectedPlanId('');
      setSearchInput('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] });
    },
    onError: (err: any) => onError(err?.message || 'Failed to create subscription.'),
  });

  const canSubmit = !!selectedCompany && !!selectedPlanId && !subscribing;

  return (
    <Card className="p-6 mb-6 rounded-2xl shadow-none transition-shadow hover:shadow-sm">
      <div className="flex items-center gap-3 mb-1">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: ADMIN_NEUTRAL_BG }}
        >
          <AddBusinessIcon size={18} color={ADMIN_NEUTRAL} />
        </div>
        <h2 className="text-[15px] font-semibold text-slate-900">Subscribe a Company</h2>
        <Badge variant="outline" className="border-transparent font-semibold bg-slate-100 text-slate-600">
          Manual grant
        </Badge>
      </div>
      <p className="text-[13px] text-slate-500 mb-4 ml-12">
        Manually assign a plan to a company without going through checkout.
      </p>

      <div className="h-px bg-slate-200 mb-4" />

      <div className="flex flex-wrap gap-4">
        {/* Company search */}
        <div className="flex-[2_1_260px] relative">
          <label className="text-[12px] font-semibold text-slate-600 mb-1.5 block">Company</label>
          {selectedCompany ? (
            <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5">
              <div>
                <div className="text-[13px] font-semibold text-slate-900">{selectedCompany.name}</div>
                <div className="text-[11px] text-slate-500">{selectedCompany.email}</div>
              </div>
              <button
                onClick={() => { setSelectedCompany(null); setSearchInput(''); }}
                className="text-[12px] font-medium text-slate-600 hover:underline"
              >
                Change
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5">
                <SearchIcon size={18} className="text-slate-400 shrink-0" />
                <input
                  value={searchInput}
                  onChange={(e) => { setSearchInput(e.target.value); setDropdownOpen(true); }}
                  onFocus={() => setDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                  placeholder="Search by company name or email..."
                  className="w-full text-[13px] outline-none placeholder:text-slate-400"
                />
              </div>
              {dropdownOpen && debouncedSearch.trim().length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg max-h-60 overflow-y-auto">
                  {searching ? (
                    <div className="px-3 py-2.5 text-[13px] text-slate-400">Searching…</div>
                  ) : companies.length === 0 ? (
                    <div className="px-3 py-2.5 text-[13px] text-slate-400">No companies found</div>
                  ) : (
                    companies.map((c) => (
                      <button
                        key={c.profileId}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSelectedCompany(c);
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-slate-50 transition-colors"
                      >
                        <div className="text-[13px] font-semibold text-slate-900">{c.name}</div>
                        <div className="text-[11px] text-slate-500">{c.email}</div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Plan select */}
        <div className="flex-[1_1_180px]">
          <label className="text-[12px] font-semibold text-slate-600 mb-1.5 block">Plan</label>
          <Select value={selectedPlanId || undefined} onValueChange={setSelectedPlanId}>
            <SelectTrigger className="w-full text-[13px] bg-white">
              <SelectValue placeholder="Select a plan…" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((p) => (
                <SelectItem key={p._id} value={p._id}>{p.name} ({p.postsLimit} posts / {p.monthlyInterviewLimit} interviews)</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Submit */}
        <div className="flex items-end">
          <Button
            variant="ghost"
            onClick={() => subscribe()}
            disabled={!canSubmit}
            className="rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white hover:text-white"
            style={{ backgroundColor: ADMIN_ACCENT }}
          >
            <CheckIcon size={16} />
            {subscribing ? 'Subscribing…' : 'Subscribe Company'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SubscribeCompanyCard;
