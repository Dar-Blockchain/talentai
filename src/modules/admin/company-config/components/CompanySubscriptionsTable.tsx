import React, { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Card } from '@/modules/shared/ui/shadcn/card';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { Button } from '@/modules/shared/ui/shadcn/button';
import { Input } from '@/modules/shared/ui/shadcn/input';
import { Pagination } from '@/modules/shared/ui/shadcn/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/modules/shared/ui/shadcn/select';
import { cn } from '@/lib/utils';
import { AdminTableErrorRow } from '@/modules/admin/shared';
import { useCompanySubscriptionsQuery } from '../queries';

const statusBadgeClass = (status: string, isActive: boolean) => {
  if (isActive) return 'bg-emerald-50 text-emerald-600';
  switch (status) {
    case 'expired':   return 'bg-slate-100 text-slate-500';
    case 'cancelled': return 'bg-amber-50 text-amber-600';
    case 'suspended': return 'bg-red-50 text-red-600';
    default:          return 'bg-slate-100 text-slate-500';
  }
};

const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString() : '—');

const usageLabel = (used: number, limit: number | null) => {
  if (limit == null) return `${used}`;
  if (limit === -1) return `${used} / ∞`;
  return `${used} / ${limit}`;
};

const TH = 'px-4 py-3 text-left text-[11px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50 border-b border-teal-100 sticky top-0';
const TD = 'px-4 py-3 text-[13px] text-slate-700 border-b border-slate-100';

const CompanySubscriptionsTable: React.FC = () => {
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading, isError, refetch } = useCompanySubscriptionsQuery({ search, page: page + 1, limit: rowsPerPage });
  const companies = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(Math.ceil(total / rowsPerPage), 1);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };

  return (
    <div>
      <Card className="mb-4 overflow-hidden py-0 gap-0">
        <div className="p-4 flex flex-wrap gap-3 items-center">
          <div className="flex-[1_1_240px] flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
            <SearchIcon size={18} className="text-slate-400 shrink-0" />
            <Input
              placeholder="Search by company name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="h-auto border-0 bg-transparent p-0 shadow-none text-[13px] focus-visible:ring-0"
            />
          </div>
          <Button
            variant="ghost"
            onClick={handleSearch}
            className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 hover:text-white"
          >
            Search
          </Button>
          <div className="flex-1" />
          <span className="text-[13px] text-slate-500">{total.toLocaleString()} subscribed companies</span>
        </div>
      </Card>

      <Card className="overflow-hidden py-0 gap-0">
        <div className="max-h-[600px] overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={TH}>Company</th>
                <th className={TH}>Plan</th>
                <th className={TH}>Status</th>
                <th className={TH}>Posts</th>
                <th className={TH}>Interviews</th>
                <th className={TH}>Renews / Ended</th>
              </tr>
            </thead>
            <tbody>
              {isError ? (
                <tr><td colSpan={6} className="py-4 text-center"><AdminTableErrorRow message="Failed to load companies." onRetry={() => refetch()} /></td></tr>
              ) : isLoading ? (
                <tr><td colSpan={6} className="py-4 text-center"><span className="text-[13px] text-slate-500">Loading…</span></td></tr>
              ) : companies.length === 0 ? (
                <tr><td colSpan={6} className="py-4 text-center"><span className="text-[13px] text-slate-500">No subscribed companies found</span></td></tr>
              ) : (
                companies.map((c) => (
                  <tr key={c.profileId} className="hover:bg-teal-50/40 transition-colors">
                    <td className={TD}>
                      <div className="text-[13px] font-semibold text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-slate-400">{c.email}</div>
                    </td>
                    <td className={TD}>
                      <span className="text-[13px] text-slate-700">{c.subscription.planName}</span>
                    </td>
                    <td className={TD}>
                      <Badge
                        variant="outline"
                        className={cn("border-transparent font-semibold capitalize", statusBadgeClass(c.subscription.status, c.subscription.isActive))}
                      >
                        {c.subscription.isActive ? 'Active' : c.subscription.status}
                      </Badge>
                    </td>
                    <td className={TD}>
                      <span className="text-[13px] text-slate-700">
                        {usageLabel(c.subscription.postsUsed, c.subscription.postsLimit)}
                      </span>
                    </td>
                    <td className={TD}>
                      <span className="text-[13px] text-slate-700">
                        {usageLabel(c.subscription.monthlyInterviewsUsed, c.subscription.monthlyInterviewLimit)}
                      </span>
                    </td>
                    <td className={TD}>
                      <span className="text-[13px] text-slate-500">{fmtDate(c.subscription.endDate)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-slate-500">Rows per page:</span>
            <Select
              value={String(rowsPerPage)}
              onValueChange={(v) => { setRowsPerPage(parseInt(v, 10)); setPage(0); }}
            >
              <SelectTrigger size="sm" className="text-[12px] text-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Pagination page={page + 1} totalPages={totalPages} onPageChange={(p) => setPage(p - 1)} size="sm" />
        </div>
      </Card>
    </div>
  );
};

export default CompanySubscriptionsTable;
