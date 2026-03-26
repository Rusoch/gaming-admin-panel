import type { ReactNode } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	TableSortLabel,
} from "@mui/material";

type Column<T> = {
	key: keyof T | string;
	label: string;
	render?: (row: T) => ReactNode;
	/** When set, replaces `label` in the header cell (e.g. select-all checkbox). */
	renderHeader?: () => ReactNode;
	isActions?: boolean;
	/** When set with `sort` + `onColumnSort`, header toggles server-side sort for this field. */
	sortable?: boolean;
};

type Props<T> = {
	data: T[];
	columns: Column<T>[];
	emptyMessage?: string;
	/** Active sort string, e.g. `-createdAt` or `title` (json-server `_sort`). */
	sort?: string;
	onColumnSort?: (columnKey: string) => void;
};

export function BaseTable<T extends { id: string }>({
	data,
	columns,
	emptyMessage,
	sort,
	onColumnSort,
}: Props<T>) {
	const sortKey =
		sort && sort.startsWith("-") ? sort.slice(1) : sort ?? undefined;

	return (
		<TableContainer component={Paper}>
			<Table>
				<TableHead>
					<TableRow>
						{columns.map((col) => {
							const keyStr = String(col.key);
							const canSort = Boolean(col.sortable && onColumnSort);
							const active =
								canSort &&
								sort !== undefined &&
								sortKey === keyStr;

							return (
								<TableCell key={keyStr}>
									{col.renderHeader ? (
										col.renderHeader()
									) : canSort ? (
										<TableSortLabel
											active={active}
											direction={
												active && sort?.startsWith("-") ? "desc" : "asc"
											}
											hideSortIcon={false}
											onClick={() => onColumnSort?.(keyStr)}
											sx={{
												"& .MuiTableSortLabel-icon": {
													opacity: 1,
												},
											}}
										>
											{col.label}
										</TableSortLabel>
									) : (
										col.label
									)}
								</TableCell>
							);
						})}
					</TableRow>
				</TableHead>

				<TableBody>
					{data.length === 0 && emptyMessage ? (
						<TableRow>
							<TableCell colSpan={columns.length} align="center">
								{emptyMessage}
							</TableCell>
						</TableRow>
					) : (
						data.map((row) => (
							<TableRow key={row.id}>
								{columns.map((col) => (
									<TableCell key={String(col.key)}>
										{col.isActions && col.render ? (
											col.render(row)
										) : col.isActions ? (
											<div style={{ display: "flex", gap: "8px" }}>
												<button type="button">View</button>
												<button type="button">Edit</button>
												<button type="button">Delete</button>
											</div>
										) : col.render ? (
											col.render(row)
										) : col.key in row ? (
											String(row[col.key as keyof T])
										) : (
											"-"
										)}
									</TableCell>
								))}
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
