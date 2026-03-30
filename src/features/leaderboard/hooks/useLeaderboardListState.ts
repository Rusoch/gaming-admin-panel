import { useCallback, useEffect, useRef, useState } from "react";
import type { LeaderboardFilters } from "../types/leaderboard.types";

const defaults: LeaderboardFilters = {
	search: "",
	page: 1,
	limit: 10,
	status: undefined,
};

export type LeaderboardListStateOptions = {
	initial?: Partial<LeaderboardFilters>;
	onPageChange?: () => void;
};

export function useLeaderboardListState(options?: LeaderboardListStateOptions) {
	const initial = options?.initial;
	const onPageChange = options?.onPageChange;
	const [filters, setFiltersInner] = useState<LeaderboardFilters>({
		...defaults,
		...initial,
	});
	const [searchText, setSearchText] = useState(() => filters.search ?? "");
	const t = useRef<ReturnType<typeof setTimeout> | null>(null);

	const setFilters = useCallback(
		(action: React.SetStateAction<LeaderboardFilters>) => {
			setFiltersInner((prev) => {
				const next =
					typeof action === "function"
						? (action as (p: LeaderboardFilters) => LeaderboardFilters)(prev)
						: action;
				if (next.page !== prev.page) {
					onPageChange?.();
				}
				return next;
			});
		},
		[onPageChange],
	);

	const onSearchChange = useCallback(
		(value: string) => {
			setSearchText(value);
			if (t.current) clearTimeout(t.current);
			t.current = setTimeout(() => {
				t.current = null;
				setFilters((p) => ({ ...p, search: value, page: 1 }));
			}, 500);
		},
		[setFilters],
	);

	useEffect(
		() => () => {
			if (t.current) clearTimeout(t.current);
		},
		[],
	);

	return { filters, setFilters, searchText, onSearchChange };
}
