import { useState, useEffect, useRef } from 'react';
import { fetchMySkills } from '../api/skills.api';
import type { Skill, SkillsPagination, SkillKind } from '../types/skill.types';

interface UseSkillsOptions {
  kind: SkillKind;
  limit?: number;
}

export interface UseSkillsReturn {
  skills: Skill[];
  pagination: SkillsPagination | null;
  loading: boolean;
  loadingMore: boolean;
  search: string;
  setSearch: (val: string) => void;
  loadMore: () => void;
  refetch: () => void;
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
}

export function useSkills({ kind, limit = 8 }: UseSkillsOptions): UseSkillsReturn {
  const [skills, setSkills]           = useState<Skill[]>([]);
  const [pagination, setPagination]   = useState<SkillsPagination | null>(null);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage]               = useState(0);
  const [search, setSearchState]      = useState('');

  const kindRef   = useRef(kind);
  const searchRef = useRef('');
  const pageRef   = useRef(0);
  const debounce  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  kindRef.current = kind;

  const doFetch = async (q: string, p: number, append: boolean) => {
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const data = await fetchMySkills({
        kind:   kindRef.current,
        search: q || undefined,
        page:   p,
        limit,
      });
      setSkills(prev => append ? [...prev, ...data.skills] : data.skills);
      setPagination(data.pagination);
      setPage(p);
      pageRef.current = p;
    } catch {
      // non-critical — leave previous state intact
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    searchRef.current = '';
    pageRef.current   = 0;
    setSearchState('');
    setPage(0);
    doFetch('', 0, false);
  }, [kind]); // eslint-disable-line react-hooks/exhaustive-deps

  const setSearch = (val: string) => {
    setSearchState(val);
    searchRef.current = val;
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => doFetch(val, 0, false), 350);
  };

  const loadMore = () => {
    if (pagination?.hasNext && !loadingMore) {
      doFetch(searchRef.current, pageRef.current + 1, true);
    }
  };

  const refetch = () => doFetch(searchRef.current, pageRef.current, false);

  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / limit)) : 1;

  const goToPage = (p: number) => {
    if (!loading) doFetch(searchRef.current, p - 1, false);
  };

  return {
    skills, pagination, loading, loadingMore, search, setSearch, loadMore, refetch,
    currentPage: page + 1,
    totalPages,
    goToPage,
  };
}
