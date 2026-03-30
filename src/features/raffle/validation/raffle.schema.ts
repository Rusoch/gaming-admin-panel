import { z } from "zod";

export const rafflePrizeFormSchema = z.object({
	id: z.string(),
	name: z.string().trim().min(1, "Prize name is required"),
	type: z.enum(["coins", "freeSpin", "bonus"]),
	amount: z.coerce.number().nonnegative(),
	quantity: z.coerce
		.number({ error: "Quantity must be a number" })
		.int()
		.min(1, "Quantity must be at least 1"),
	imageUrl: z.string(),
});

export const raffleFormSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(3, "Name must be 3–80 characters")
			.max(80, "Name must be 3–80 characters"),
		description: z.string(),
		status: z.enum(["draft", "active", "drawn", "cancelled"]),
		startDate: z.string().min(1, "Start date is required"),
		endDate: z.string().min(1, "End date is required"),
		drawDate: z.string().min(1, "Draw date is required"),
		ticketPrice: z.coerce
			.number({ error: "Ticket price must be a number" })
			.positive("Ticket price must be positive"),
		maxTicketsPerUser: z.coerce
			.number({ error: "Max tickets per user must be a number" })
			.int()
			.min(1, "Max tickets per user must be at least 1"),
		totalTicketLimit: z
			.union([z.literal(""), z.coerce.number().int().positive()])
			.transform((v) => (v === "" ? null : v)),
		prizes: z.array(rafflePrizeFormSchema).min(1, "Add at least one prize"),
	})
	.superRefine((data, ctx) => {
		const start = new Date(data.startDate);
		const end = new Date(data.endDate);
		const draw = new Date(data.drawDate);
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
		if (
			!Number.isNaN(end.getTime()) &&
			!Number.isNaN(draw.getTime()) &&
			draw <= end
		) {
			ctx.addIssue({
				code: "custom",
				message: "Draw date must be after end date",
				path: ["drawDate"],
			});
		}
	});

export type RaffleFormInput = z.input<typeof raffleFormSchema>;
export type RaffleFormOutput = z.output<typeof raffleFormSchema>;
