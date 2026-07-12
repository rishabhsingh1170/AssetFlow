import { useEffect, useMemo, useState } from "react";

// Client-side pagination: no list endpoint on the server paginates yet.
export const usePagination = (items = [], pageSize = 10) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  return {
    page,
    setPage,
    totalPages,
    pageItems,
    reset: () => setPage(1),
  };
};

export default usePagination;
