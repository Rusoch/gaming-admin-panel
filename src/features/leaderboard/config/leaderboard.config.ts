import type { Leaderboard } from "@/features/leaderboard/types/leaderboard.types";
import { LEADERBOARD_STATUS_FILTER_LABEL } from "./leaderboardStatusLabels";

export const leaderboardTableColumns = [
	{
		key: "title",
		label: "Title",
	},
	{
		key: "description",
		label: "Description",
	},
	{
		key: "status",
		label: "Status",
		render: (row: Leaderboard) =>
			LEADERBOARD_STATUS_FILTER_LABEL[row.status],
	},
	{
		key: "scoringType",
		label: "Scoring",
	},
	{
		key: "maxParticipants",
		label: "Participants",
		sortable: true,
	},
	{
		key: "startDate",
		label: "Start",
		sortable: true,
		render: (row: Leaderboard) => new Date(row.startDate).toLocaleDateString(),
	},
	{
		key: "endDate",
		label: "End",
		sortable: true,
		render: (row: Leaderboard) => new Date(row.endDate).toLocaleDateString(),
	},
	{
		key: "createdAt",
		label: "Created",
		sortable: true,
		render: (row: Leaderboard) => new Date(row.createdAt).toLocaleDateString(),
	},
];
