import type { Leaderboard } from "../types/leaderboard.types";

export const LEADERBOARD_STATUS_FILTER_LABEL: Record<
	Leaderboard["status"],
	string
> = {
	draft: "Inactive",
	active: "Active",
	completed: "Completed",
};

export const LEADERBOARD_BULK_STATUS_LABEL: Record<
	Leaderboard["status"],
	string
> = {
	draft: "Mark inactive",
	active: "Mark active",
	completed: "Mark completed",
};
