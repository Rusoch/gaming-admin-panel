import { useCallback, useEffect, useRef, useState } from "react";
import type { LeaderboardFilters } from "../types/leaderboard.types";

const defaults: LeaderboardFilters = {
	search: "",
	page: 1,
	limit: 10,
	status: undefined,
};

export function useLeaderboardListState(initial?: Partial<LeaderboardFilters>) {
	const [filters, setFilters] = useState<LeaderboardFilters>({
		...defaults,
		...initial,
	});
	const [searchText, setSearchText] = useState(() => filters.search ?? "");
	const t = useRef<ReturnType<typeof setTimeout> | null>(null);

	const onSearchChange = useCallback((value: string) => {
		setSearchText(value);
		if (t.current) clearTimeout(t.current);
		t.current = setTimeout(() => {
			t.current = null;
			setFilters((p) => ({ ...p, search: value, page: 1 }));
		}, 500);
	}, []);

	useEffect(
		() => () => {
			if (t.current) clearTimeout(t.current);
		},
		[],
	);

	return { filters, setFilters, searchText, onSearchChange };
}
