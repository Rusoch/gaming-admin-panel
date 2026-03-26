import type { Leaderboard } from "@/features/leaderboard/types/leaderboard.types";
import type { LeaderboardCreateFormInput } from "@/features/leaderboard/validation/leaderboardCreateForm.schema";

export interface LeaderboardSelectOption<T extends string> {
	value: T;
	label: string;
}

export const LEADERBOARD_STATUS_OPTIONS: LeaderboardSelectOption<
	Leaderboard["status"]
>[] = [
	{ value: "draft", label: "Draft" },
	{ value: "active", label: "Active" },
	{ value: "completed", label: "Completed" },
];

export const LEADERBOARD_SCORING_OPTIONS: LeaderboardSelectOption<
	Leaderboard["scoringType"]
>[] = [
	{ value: "points", label: "Points" },
	{ value: "wins", label: "Wins" },
	{ value: "wagered", label: "Wagered" },
];

export const LEADERBOARD_PRIZE_TYPE_OPTIONS: LeaderboardSelectOption<
	"coins" | "freeSpin" | "bonus"
>[] = [
	{ value: "coins", label: "Coins" },
	{ value: "freeSpin", label: "Free spin" },
	{ value: "bonus", label: "Bonus" },
];

export function createEmptyLeaderboardPrize(rank: number) {
	return {
		id: crypto.randomUUID(),
		rank,
		name: "",
		type: "coins" as const,
		amount: 0,
		imageUrl: "",
	};
}

export function getLeaderboardCreateFormDefaults(): LeaderboardCreateFormInput {
	return {
		title: "",
		description: "",
		status: "draft",
		startDate: "",
		endDate: "",
		scoringType: "points",
		maxParticipants: 10,
		prizes: [createEmptyLeaderboardPrize(1)],
	};
}
