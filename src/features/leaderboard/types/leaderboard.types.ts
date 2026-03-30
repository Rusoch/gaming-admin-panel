export interface LeaderboardPrize {
	id: string;
	rank: number;
	name: string;
	type: "coins" | "freeSpin" | "bonus";
	amount: number;
	imageUrl: string;
}

export interface Leaderboard {
	id: string;
	title: string;
	description: string;
	startDate: string;
	endDate: string;
	status: "draft" | "active" | "completed";
	scoringType: "points" | "wins" | "wagered";
	prizes: LeaderboardPrize[];
	maxParticipants: number;
	createdAt: string;
	updatedAt: string;
}

export type LeaderboardCreatePayload = Omit<Leaderboard, "id">;
export interface LeaderboardFilters {
	status?: "draft" | "active" | "completed";
	search?: string;
	page: number;
	limit: number;
	sort?: string;
}
export interface LeaderboardResponse {
	data: Leaderboard[];
	total: number;
}
