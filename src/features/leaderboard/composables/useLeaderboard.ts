import { useQuery } from "@tanstack/react-query";
import { getLeaderboardById } from "../api/leaderboard.api";
import { leaderboardKeys } from "../constants/leaderboard.keys";

export const useLeaderboard = (id: string | undefined) => {
	return useQuery({
		queryKey: id
			? leaderboardKeys.detail(id)
			: [...leaderboardKeys.all, "detail", "none"],
		queryFn: () => getLeaderboardById(id!),
		enabled: Boolean(id),
	});
};
