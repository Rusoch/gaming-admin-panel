import { z } from "zod";

const HEX_COLOR = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;

export const wheelSegmentFormSchema = z
	.object({
		id: z.string(),
		label: z.string().trim().min(1, "Label is required"),
		color: z
			.string()
			.trim()
			.regex(HEX_COLOR, "Use a valid hex color (e.g. #FF5733 or #f00)"),
		weight: z.coerce
			.number({ error: "Weight must be a number" })
			.int()
			.min(1, "Weight 1–100")
			.max(100, "Weight 1–100"),
		prizeType: z.enum(["coins", "freeSpin", "bonus", "nothing"]),
		prizeAmount: z.coerce.number().int().nonnegative(),
		imageUrl: z.string(),
	})
	.superRefine((seg, ctx) => {
		if (seg.prizeType === "nothing" && seg.prizeAmount !== 0) {
			ctx.addIssue({
				code: "custom",
				message: 'Amount must be 0 when type is "nothing"',
				path: ["prizeAmount"],
			});
		}
		if (seg.prizeType !== "nothing" && seg.prizeAmount <= 0) {
			ctx.addIssue({
				code: "custom",
				message: "Amount must be greater than 0",
				path: ["prizeAmount"],
			});
		}
	});

export const wheelFormSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(3, "Name must be 3–80 characters")
			.max(80, "Name must be 3–80 characters"),
		description: z.string(),
		status: z.enum(["draft", "active", "inactive"]),
		maxSpinsPerUser: z.coerce
			.number({ error: "Must be a number" })
			.int()
			.min(1, "At least 1 spin per user"),
		spinCost: z.coerce
			.number({ error: "Must be a number" })
			.nonnegative("Spin cost cannot be negative"),
		backgroundColor: z
			.string()
			.trim()
			.regex(HEX_COLOR, "Valid hex background color required"),
		borderColor: z
			.string()
			.trim()
			.regex(HEX_COLOR, "Valid hex border color required"),
		segments: z
			.array(wheelSegmentFormSchema)
			.min(2, "At least 2 segments")
			.max(12, "At most 12 segments"),
	})
	.superRefine((data, ctx) => {
		const sum = data.segments.reduce((s, seg) => s + seg.weight, 0);
		if (sum !== 100) {
			ctx.addIssue({
				code: "custom",
				message: "Segment weights must sum to exactly 100",
				path: ["segments"],
			});
		}
	});

export type WheelFormInput = z.input<typeof wheelFormSchema>;
export type WheelFormOutput = z.output<typeof wheelFormSchema>;
