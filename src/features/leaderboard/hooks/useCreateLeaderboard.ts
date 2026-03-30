import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLeaderboard as createLeaderboardApi } from "../api/leaderboard.api";
import { leaderboardKeys } from "../constants/leaderboard.keys";
import type { LeaderboardCreatePayload } from "../types/leaderboard.types";

export const useCreateLeaderboard = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: LeaderboardCreatePayload) =>
			createLeaderboardApi(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: leaderboardKeys.all });
		},
	});
};
