import { useEffect, useState } from "react";
import { useMyPostsPickerQuery } from "../queries";

const PAGE_SIZE = 8;

export function usePostPicker(open: boolean) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");
  const [page, setPage]               = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset on close
  useEffect(() => {
    if (!open) { setSearchInput(""); setSearch(""); setPage(1); }
  }, [open]);

  const { data, isLoading } = useMyPostsPickerQuery(
    { search: search || undefined, page, limit: PAGE_SIZE },
    open,
  );

  return {
    searchInput, setSearchInput,
    page, setPage,
    posts:      data?.posts      ?? [],
    totalPages: data?.totalPages ?? 1,
    isLoading,
  };
}
