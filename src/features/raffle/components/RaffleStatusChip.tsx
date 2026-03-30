import { Chip } from "@mui/material";
import type { Raffle } from "../types/raffle.types";

export interface RaffleStatusChipProps {
	status: Raffle["status"];
}

const STATUS_COLOR: Record<
	Raffle["status"],
	"default" | "primary" | "success" | "info" | "warning" | "error"
> = {
	draft: "default",
	active: "success",
	drawn: "info",
	cancelled: "error",
};

export function RaffleStatusChip({ status }: RaffleStatusChipProps) {
	return (
		<Chip
			size="small"
			label={status}
			color={STATUS_COLOR[status]}
			variant={status === "draft" ? "outlined" : "filled"}
		/>
	);
}
