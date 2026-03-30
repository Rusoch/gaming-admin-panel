import { Chip } from "@mui/material";
import type { Wheel } from "../types/wheel.types";

export interface WheelStatusChipProps {
	status: Wheel["status"];
}

const STATUS_COLOR: Record<
	Wheel["status"],
	"default" | "primary" | "success" | "warning" | "error"
> = {
	draft: "default",
	active: "success",
	inactive: "warning",
};

export function WheelStatusChip({ status }: WheelStatusChipProps) {
	return (
		<Chip
			size="small"
			label={status}
			color={STATUS_COLOR[status]}
			variant={status === "draft" ? "outlined" : "filled"}
		/>
	);
}
