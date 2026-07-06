import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Card } from '@/modules/shared/ui/shadcn/card';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { Button } from '@/modules/shared/ui/shadcn/button';
import { cn } from '@/lib/utils';
import { ADMIN_TABLE_HEAD_CELL_SX, ADMIN_TABLE_ROW_SX, AdminTableErrorRow } from '@/modules/admin/shared';
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

const CompanySubscriptionsTable: React.FC = () => {
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading, isError, refetch } = useCompanySubscriptionsQuery({ search, page: page + 1, limit: rowsPerPage });
  const companies = data?.data ?? [];
  const total = data?.total ?? 0;

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };

  return (
    <div>
      <Card className="mb-4 overflow-hidden py-0 gap-0">
        <div className="p-4 flex flex-wrap gap-3 items-center">
          <div className="flex-[1_1_240px] flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
            <SearchIcon style={{ fontSize: 18 }} className="text-slate-400 shrink-0" />
            <input
              placeholder="Search by company name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full text-[13px] outline-none placeholder:text-slate-400"
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
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Company</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Plan</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Status</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Posts</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Interviews</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Renews / Ended</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isError ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <AdminTableErrorRow message="Failed to load companies." onRetry={() => refetch()} />
                  </TableCell>
                </TableRow>
              ) : isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <span className="text-[13px] text-slate-500">Loading…</span>
                  </TableCell>
                </TableRow>
              ) : companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <span className="text-[13px] text-slate-500">No subscribed companies found</span>
                  </TableCell>
                </TableRow>
              ) : (
                companies.map((c) => (
                  <TableRow key={c.profileId} hover sx={ADMIN_TABLE_ROW_SX}>
                    <TableCell>
                      <div className="text-[13px] font-semibold text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-slate-400">{c.email}</div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[13px] text-slate-700">{c.subscription.planName}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("border-transparent font-semibold capitalize", statusBadgeClass(c.subscription.status, c.subscription.isActive))}
                      >
                        {c.subscription.isActive ? 'Active' : c.subscription.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-[13px] text-slate-700">
                        {usageLabel(c.subscription.postsUsed, c.subscription.postsLimit)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[13px] text-slate-700">
                        {usageLabel(c.subscription.monthlyInterviewsUsed, c.subscription.monthlyInterviewLimit)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[13px] text-slate-500">{fmtDate(c.subscription.endDate)}</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 20, 50]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          />
        </TableContainer>
      </Card>
    </div>
  );
};

export default CompanySubscriptionsTable;
