import { z } from "zod";

export const leaderboardPrizeFormSchema = z.object({
	id: z.string(),
	rank: z.coerce.number().int().positive(),
	name: z.string(),
	type: z.enum(["coins", "freeSpin", "bonus"]),
	amount: z.coerce.number().nonnegative(),
	imageUrl: z.string(),
});

export const leaderboardCreateFormSchema = z
	.object({
		title: z
			.string()
			.trim()
			.min(3, "Title must be 3–100 characters")
			.max(100, "Title must be 3–100 characters"),
		description: z.string(),
		status: z.enum(["draft", "active", "completed"]),
		startDate: z.string().min(1, "Start date is required"),
		endDate: z.string().min(1, "End date is required"),
		scoringType: z.enum(["points", "wins", "wagered"]),
		maxParticipants: z.coerce
			.number({ error: "Max participants must be a number" })
			.int()
			.min(2, "Minimum 2 participants"),
		prizes: z
			.array(leaderboardPrizeFormSchema)
			.min(1, "Add at least one prize"),
	})
	.superRefine((data, ctx) => {
		const start = new Date(data.startDate);
		const end = new Date(data.endDate);
		if (
			!Number.isNaN(start.getTime()) &&
			!Number.isNaN(end.getTime()) &&
			end <= start
		) {
			ctx.addIssue({
				code: "custom",
				message: "End date must be after start date",
				path: ["endDate"],
			});
		}

		const n = data.prizes.length;
		const sortedRanks = [...data.prizes]
			.map((p) => p.rank)
			.sort((a, b) => a - b);
		const expected = Array.from({ length: n }, (_, i) => i + 1);
		const ranksOk =
			sortedRanks.length === n &&
			sortedRanks.every((r, i) => r === expected[i]);
		if (!ranksOk) {
			ctx.addIssue({
				code: "custom",
				message: "Prize ranks must be unique and sequential from 1",
				path: ["prizes"],
			});
		}
	});

export type LeaderboardCreateFormInput = z.input<
	typeof leaderboardCreateFormSchema
>;
export type LeaderboardCreateFormOutput = z.output<
	typeof leaderboardCreateFormSchema
>;
