import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getLeaderboardsPage } from "../api/leaderboard.api";
import { leaderboardKeys } from "../constants/leaderboard.keys";
import type { LeaderboardFilters } from "../types/leaderboard.types";

export const useLeaderboards = (filters: LeaderboardFilters) => {
	return useQuery({
		queryKey: [...leaderboardKeys.all, filters],
		queryFn: () => getLeaderboardsPage(filters),
		placeholderData: keepPreviousData,
	});
};
