import type { ReactNode } from "react";
import { useMemo } from "react";
import { BaseTable } from "@/shared/components/table/BaseTable";
import type { Wheel } from "../types/wheel.types";
import { WheelStatusChip } from "./WheelStatusChip";

const DATA_COLUMNS: {
	key: keyof Wheel | string;
	label: string;
	sortable?: boolean;
	render?: (row: Wheel) => ReactNode;
}[] = [
	{ key: "name", label: "Name", sortable: true },
	{
		key: "status",
		label: "Status",
		render: (row) => <WheelStatusChip status={row.status} />,
	},
	{
		key: "segments",
		label: "Segments",
		render: (row) => row.segments.length,
	},
	{
		key: "spinCost",
		label: "Spin cost",
		sortable: true,
		render: (row) => row.spinCost.toFixed(2),
	},
	{
		key: "maxSpinsPerUser",
		label: "Max / user",
		sortable: true,
	},
	{
		key: "createdAt",
		label: "Created",
		sortable: true,
		render: (row) => new Date(row.createdAt).toLocaleDateString(),
	},
];

export interface WheelTableProps {
	rows: Wheel[];
	sort: string;
	onColumnSort: (columnKey: string) => void;
	emptyMessage?: string;
	renderActions: (row: Wheel) => ReactNode;
}

export function WheelTable({
	rows,
	sort,
	onColumnSort,
	emptyMessage = "No wheels match your filters",
	renderActions,
}: WheelTableProps) {
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
