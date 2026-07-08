import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search as SearchOutlined, X as CloseRounded, Users as PeopleOutlineOutlined, SearchX as SearchOffOutlined } from "lucide-react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { RootState } from "@/store/store";
import type { Member } from "@/modules/company/members/types";
import { useMembersQuery } from "@/modules/company/employees/queries";
import { useStartTeamChat } from "@/modules/chat/team-chat/hooks/useStartTeamChat";
import { getRoleLabel } from '@/modules/company/employees/utils/employeeRoleI18n';
import { TEAM_MINT_UI } from "@/modules/chat/shared/constants/teamMintUi";
import { Avatar, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import { Alert, AlertDescription } from "@/modules/shared/ui/shadcn/alert";
import { cn } from "@/lib/utils";

const M = TEAM_MINT_UI;
const PAGE_SIZE = 50;

const getMemberName = (member: Member) => {
  const full = `${member.firstName || ""} ${member.lastName || ""}`.trim();
  return full || member.username || "Unnamed";
};

const ColleagueSkeleton: React.FC = () => (
  <div
    style={{
      border: `1px solid ${M.border}`,
      backgroundColor: M.bgCard,
      boxShadow: M.shadowSoft,
    }}
    className="flex h-full min-w-0 flex-col gap-1.5 rounded-xl p-2"
  >
    <div className="flex min-w-0 items-center gap-2">
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1">
        <Skeleton className="h-[13px] w-[72%] rounded-[6px]" style={{ backgroundColor: `${M.textMuted}38` }} />
        <Skeleton className="mt-1 h-[11px] w-[48%] rounded-[6px]" style={{ backgroundColor: `${M.textMuted}29` }} />
      </div>
    </div>
    <Skeleton className="h-7 rounded-[10px]" style={{ backgroundColor: `${M.primary}1A` }} />
  </div>
);

interface CompanyContactRowProps {
  name: string;
  username?: string;
  roleLabel: string;
  onMessage: () => void;
  isLoading?: boolean;
}

const CompanyContactRow: React.FC<CompanyContactRowProps> = ({
  name,
  username,
  roleLabel,
  onMessage,
  isLoading = false,
}) => {
  const initial = name[0]?.toUpperCase() || "C";

  return (
    <article
      onClick={isLoading ? undefined : onMessage}
      style={{
        border: `1px solid ${M.primary}38`,
        backgroundColor: M.primarySoft,
        boxShadow: M.shadowSoft,
        transition: M.transition,
        cursor: isLoading ? "default" : "pointer",
        opacity: isLoading ? 0.75 : 1,
        ["--company-row-hover-border" as string]: `${M.primary}59`,
        ["--company-row-hover-shadow" as string]: M.shadowLift,
        ["--company-row-hover-bg" as string]: `${M.primary}14`,
      }}
      className={cn(
        "relative flex min-w-0 flex-row items-center gap-3 overflow-hidden rounded-xl px-[10px] py-[7px]",
        !isLoading &&
          "hover:[border-color:var(--company-row-hover-border)] hover:[box-shadow:var(--company-row-hover-shadow)] hover:[background-color:var(--company-row-hover-bg)]",
      )}
    >
      <span
        aria-hidden
        className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-[4px]"
        style={{ backgroundColor: M.primary }}
      />
      <Avatar
        className="ml-1 size-[34px] shrink-0"
        style={{ boxShadow: `0 0 0 2px ${M.bgCard}` }}
      >
        <AvatarFallback
          className="text-[0.8rem] font-bold"
          style={{ backgroundColor: `${M.primary}26`, color: M.primaryHover }}
        >
          {initial}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p
          className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.8125rem] font-bold tracking-[-0.02em]"
          style={{ color: M.textPrimary }}
        >
          {name}
        </p>
        <p
          className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.6875rem]"
          style={{ color: M.textSecondary }}
        >
          {username ? `@${username} · ${roleLabel}` : roleLabel}
        </p>
      </div>
      {isLoading && <Spinner className="size-[18px] shrink-0" style={{ color: M.primary }} />}
    </article>
  );
};

interface ColleagueRowProps {
  member: Member;
  roleLabel: string;
  onMessage: (userId: string) => void;
  isLoading?: boolean;
}

const ColleagueRow: React.FC<ColleagueRowProps> = ({
  member,
  roleLabel,
  onMessage,
  isLoading = false,
}) => {
  const name = getMemberName(member);
  const initial = name[0]?.toUpperCase() || "U";

  return (
    <article
      onClick={isLoading ? undefined : () => { onMessage(member.userId); }}
      style={{
        border: `1px solid ${M.border}`,
        backgroundColor: M.bgCard,
        boxShadow: M.shadowSoft,
        transition: M.transition,
        cursor: isLoading ? "default" : "pointer",
        opacity: isLoading ? 0.75 : 1,
        ["--colleague-row-hover-border" as string]: `${M.primary}66`,
        ["--colleague-row-hover-shadow" as string]: M.shadowLift,
        ["--colleague-row-hover-bg" as string]: `${M.primary}1F`,
      }}
      className={cn(
        "flex min-w-0 flex-row items-center gap-3 rounded-xl px-[10px] py-[7px]",
        !isLoading &&
          "hover:[border-color:var(--colleague-row-hover-border)] hover:[box-shadow:var(--colleague-row-hover-shadow)] hover:[background-color:var(--colleague-row-hover-bg)]",
      )}
    >
      <Avatar
        className="size-[34px] shrink-0"
        style={{ boxShadow: `0 0 0 2px ${M.bgCard}` }}
      >
        <AvatarFallback
          className="text-[0.8rem] font-bold"
          style={{ backgroundColor: `${M.textPrimary}0F`, color: M.textSecondary }}
        >
          {initial}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p
          className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.8125rem] font-bold tracking-[-0.02em]"
          style={{ color: M.textPrimary }}
        >
          {name}
        </p>
        <p
          className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.6875rem]"
          style={{ color: M.textSecondary }}
        >
          {member.username ? `@${member.username} · ${roleLabel}` : roleLabel}
        </p>
      </div>
      {isLoading && <Spinner className="size-[18px] shrink-0" style={{ color: M.primary }} />}
    </article>
  );
};

const EmptyState: React.FC<{ title: string; subtitle?: string; icon: "people" | "search" }> = ({
  title,
  subtitle,
  icon,
}) => {
  const Icon = icon === "search" ? SearchOffOutlined : PeopleOutlineOutlined;

  return (
    <div className="mx-auto max-w-[380px] px-4 py-12 text-center sm:py-16">
      <div
        className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center"
        style={{
          borderRadius: M.radiusOuter,
          backgroundColor: M.primarySoft,
          border: `1px solid ${M.primary}26`,
          boxShadow: M.shadowSoft,
        }}
      >
        <Icon size={34} color={M.primaryHover} />
      </div>
      <p className="text-base font-bold tracking-[-0.02em]" style={{ color: M.textPrimary }}>
        {title}
      </p>
      {subtitle ? (
        <p className="mt-[10px] text-sm leading-[1.6]" style={{ color: M.textSecondary }}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
};

interface TeamChatColleaguesPanelProps {
  onClose?: () => void;
}

const TeamChatColleaguesPanel: React.FC<TeamChatColleaguesPanelProps> = ({ onClose }) => {
  const startTeamChat = useStartTeamChat();
  const { t } = useTranslation("modules/company/teamChat");
  const { t: tDashboard } = useTranslation("dashboard");

  const currentUserId = useSelector((state: RootState) => state.user.connectedUser.user?._id);
  const userRole = useSelector((state: RootState) => state.user.connectedUser.user?.role);
  const companyMembership = useSelector((state: RootState) => state.user.connectedUser.companyMembership);

  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: membersData, isLoading: loading, error: membersError } = useMembersQuery({
    search: debouncedSearch || undefined,
    sortBy: "name",
    order: "asc",
    page: 1,
    limit: PAGE_SIZE,
  });
  const members = membersData?.members ?? [];
  const error   = membersError ? (membersError as Error).message : null;

  const handleStartChat = useCallback(async (userId: string) => {
    if (loadingUserId) return;
    setLoadingUserId(userId);
    try {
      await startTeamChat(userId);
      onClose?.();
    } finally {
      setLoadingUserId(null);
    }
  }, [loadingUserId, startTeamChat, onClose]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value.trim()), 300);
  }, []);

  const clearSearch = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const companyContact = useMemo(() => {
    if (userRole !== "Employee") return null;

    const company = companyMembership?.company;
    const companyUserId = company?._id || companyMembership?.company;
    if (!companyUserId || String(companyUserId) === String(currentUserId)) return null;

    const name = company?.profile?.companyDetails?.name
      || company?.username
      || t("colleagues.company_default");

    return {
      id: String(companyUserId),
      name,
      username: company?.username || "",
    };
  }, [companyMembership, currentUserId, t, userRole]);

  const colleagues = useMemo(
    () => members.filter((member) => {
      if (member.status !== "active" || member.userId === currentUserId) return false;
      if (companyContact && String(member.userId) === companyContact.id) return false;
      return true;
    }),
    [companyContact, currentUserId, members],
  );

  const matchesSearch = useCallback((value: string) => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return true;
    return value.toLowerCase().includes(query);
  }, [debouncedSearch]);

  const showCompanyContact = !!companyContact && (
    !debouncedSearch.trim()
    || matchesSearch(companyContact.name)
    || (companyContact.username ? matchesSearch(companyContact.username) : false)
  );

  const visibleCount = colleagues.length + (showCompanyContact ? 1 : 0);
  const isInitialLoading = loading && visibleCount === 0;
  const isSearchEmpty = debouncedSearch.length > 0 && visibleCount === 0 && !loading;

  return (
    <div className="flex flex-1 flex-col" style={{ minHeight: 0, backgroundColor: M.bgMain }}>
      <div
        className="mx-3 my-3 flex flex-1 flex-col overflow-hidden rounded-[20px] sm:mx-4 sm:my-4"
        style={{
          minHeight: 0,
          borderRadius: M.radiusOuter,
          border: `1px solid ${M.border}`,
          backgroundColor: M.bgCard,
          boxShadow: M.shadowSoft,
        }}
      >
        <div
          className="shrink-0 px-4 pb-3 pt-4 sm:px-5"
          style={{ borderBottom: `1px solid ${M.border}` }}
        >
          <div className="mb-[10px] flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p
                className="text-[1.05rem] font-extrabold leading-[1.25] tracking-[-0.03em] sm:text-[1.125rem]"
                style={{ color: M.textPrimary }}
              >
                {t("colleagues.title")}
              </p>
            </div>
            {!isInitialLoading && visibleCount > 0 && (
              <span
                className="flex h-[26px] shrink-0 items-center rounded-full px-[10px] text-[0.6875rem] font-bold"
                style={{
                  backgroundColor: M.primarySoft,
                  color: M.primaryHover,
                  border: `1px solid ${M.primary}33`,
                }}
              >
                {t("colleagues.count", { count: visibleCount })}
              </span>
            )}
          </div>

          <div className="relative">
            <SearchOutlined
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: M.textMuted }}
            />
            <input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t("colleagues.search_placeholder")}
              className={cn(
                "w-full rounded-[14px] border py-[6px] pl-9 text-[0.8125rem] outline-none placeholder:text-[0.8125rem]",
                search ? "pr-9" : "pr-3",
                "hover:[background-color:var(--search-hover-bg)] hover:[border-color:var(--search-hover-border)]",
                "focus:[background-color:var(--search-focus-bg)] focus:[border-color:var(--search-focus-border)] focus:[box-shadow:var(--search-focus-shadow)]",
              )}
              style={{
                minHeight: 34,
                backgroundColor: M.bgMain,
                borderColor: M.border,
                transition: M.transition,
                color: M.textPrimary,
                ["--search-hover-bg" as string]: "#fff",
                ["--search-hover-border" as string]: `${M.textPrimary}1F`,
                ["--search-focus-bg" as string]: "#fff",
                ["--search-focus-border" as string]: M.primary,
                ["--search-focus-shadow" as string]: `0 0 0 2px ${M.primary}29`,
              }}
            />
            {search ? (
              <button
                type="button"
                onClick={clearSearch}
                aria-label={t("colleagues.clear_search")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-[#F3F4F6]"
                style={{ color: M.textMuted }}
              >
                <CloseRounded size={18} />
              </button>
            ) : null}
          </div>
        </div>

        <div
          className={cn(
            "flex-1 overflow-y-auto px-3 py-3 sm:px-4",
            "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#1118271F] hover:[&::-webkit-scrollbar-thumb]:bg-[#11182738]",
          )}
          style={{
            minHeight: 0,
            WebkitOverflowScrolling: "touch",
            backgroundColor: M.bgMain,
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(17, 24, 39, 0.22) transparent",
          }}
        >
          {error && (
            <Alert variant="destructive" className="mb-3 rounded-2xl" style={{ borderColor: M.border }}>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isInitialLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <ColleagueSkeleton key={index} />
              ))}
            </div>
          ) : isSearchEmpty ? (
            <EmptyState icon="search" title={t("colleagues.no_results")} subtitle={t("colleagues.no_results_hint")} />
          ) : visibleCount === 0 ? (
            <EmptyState icon="people" title={t("colleagues.empty")} />
          ) : (
            <div className="flex flex-col gap-2">
              {showCompanyContact && companyContact && (
                <CompanyContactRow
                  name={companyContact.name}
                  username={companyContact.username}
                  roleLabel={t("colleagues.company_role")}
                  onMessage={() => { void handleStartChat(companyContact.id); }}
                  isLoading={loadingUserId === companyContact.id}
                />
              )}
              {colleagues.map((member) => (
                <ColleagueRow
                  key={member._id}
                  member={member}
                  roleLabel={getRoleLabel(member.role, tDashboard)}
                  onMessage={(userId) => { void handleStartChat(userId); }}
                  isLoading={loadingUserId === member.userId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamChatColleaguesPanel;
