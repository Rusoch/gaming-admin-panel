import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteLeaderboard as deleteLeaderboardApi } from "../api/leaderboard.api";
import { leaderboardKeys } from "../constants/leaderboard.keys";

export const useDeleteLeaderboard = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteLeaderboardApi(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: leaderboardKeys.all });
		},
	});
};
