import type { ReactNode } from "react";
import { useMemo } from "react";
import { BaseTable } from "@/shared/components/table/BaseTable";
import type { Raffle } from "../types/raffle.types";
import { RaffleStatusChip } from "./RaffleStatusChip";

const DATA_COLUMNS: {
	key: keyof Raffle | string;
	label: string;
	sortable?: boolean;
	render?: (row: Raffle) => ReactNode;
}[] = [
	{ key: "name", label: "Name", sortable: true },
	{
		key: "ticketPrice",
		label: "Ticket",
		sortable: true,
		render: (row) => row.ticketPrice.toFixed(2),
	},
	{
		key: "status",
		label: "Status",
		render: (row) => <RaffleStatusChip status={row.status} />,
	},
	{
		key: "startDate",
		label: "Start",
		sortable: true,
		render: (row) => new Date(row.startDate).toLocaleDateString(),
	},
	{
		key: "endDate",
		label: "End",
		sortable: true,
		render: (row) => new Date(row.endDate).toLocaleDateString(),
	},
	{
		key: "drawDate",
		label: "Draw",
		sortable: true,
		render: (row) => new Date(row.drawDate).toLocaleDateString(),
	},
	{
		key: "createdAt",
		label: "Created",
		sortable: true,
		render: (row) => new Date(row.createdAt).toLocaleDateString(),
	},
];

export interface RaffleListProps {
	rows: Raffle[];
	sort: string;
	onColumnSort: (columnKey: string) => void;
	emptyMessage?: string;
	renderActions: (row: Raffle) => ReactNode;
}

export function RaffleList({
	rows,
	sort,
	onColumnSort,
	emptyMessage = "No raffles match your filters",
	renderActions,
}: RaffleListProps) {
	const columns = useMemo(
		() => [
			...DATA_COLUMNS,
			{
				key: "actions",
				label: "Actions",
				isActions: true,
				render: renderActions,
			},
		],
		[renderActions],
	);

	return (
		<BaseTable
			data={rows}
			columns={columns}
			emptyMessage={emptyMessage}
			sort={sort}
			onColumnSort={onColumnSort}
		/>
	);
}
