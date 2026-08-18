"use client";

import { useEffect, useState } from "react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

export function useDashboardListState() {
  const [searchParam, setSearchParam] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({ shallow: true }),
  );
  const [pageParam, setPageParam] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true }),
  );
  const [inputState, setInputState] = useState({
    value: searchParam,
    source: searchParam,
  });
  const inputValue = inputState.source === searchParam ? inputState.value : searchParam;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== searchParam) {
        setSearchParam(inputValue ? inputValue : null);
        setPageParam(1);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [inputValue, searchParam, setSearchParam, setPageParam]);

  return {
    searchParam,
    pageParam,
    inputValue,
    setPageParam,
    onSearchChange: (value: string) => setInputState({ value, source: searchParam }),
  };
}
