import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateLeaderboard as updateLeaderboardApi } from "../api/leaderboard.api";
import { leaderboardKeys } from "../constants/leaderboard.keys";
import type { Leaderboard } from "../types/leaderboard.types";

export const useUpdateLeaderboard = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: Leaderboard }) =>
			updateLeaderboardApi(id, body),
		onSuccess: (_data, { id }) => {
			queryClient.invalidateQueries({ queryKey: leaderboardKeys.all });
			queryClient.invalidateQueries({ queryKey: leaderboardKeys.detail(id) });
		},
	});
};
