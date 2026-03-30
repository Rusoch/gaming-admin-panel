import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchUpdateLeaderboardStatus } from "../api/leaderboard.api";
import { leaderboardKeys } from "../constants/leaderboard.keys";
import type { Leaderboard } from "../types/leaderboard.types";

export const useBatchUpdateLeaderboardStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			ids,
			status,
		}: {
			ids: string[];
			status: Leaderboard["status"];
		}) => batchUpdateLeaderboardStatus(ids, status),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: leaderboardKeys.all });
		},
	});
};
