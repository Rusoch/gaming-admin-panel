import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
	Close as CloseIcon,
	Edit as EditIcon,
	RecyclingOutlined as RecyclingOutlinedIcon,
	Visibility as VisibilityIcon,
} from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	Checkbox,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	Stack,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import TablePagination from "@mui/material/TablePagination";
import { isAxiosError } from "axios";
import { ListPageSkeleton } from "@/shared/components/skeleton/AppSkeleton";
import { BaseTable } from "@/shared/components/table/BaseTable";
import { useToast } from "@/shared/hooks/toast";
import { useBatchUpdateLeaderboardStatus } from "../hooks/useBatchUpdateLeaderboardStatus";
import { useDeleteLeaderboard } from "../hooks/useDeleteLeaderboard";
import { useLeaderboardListState } from "../hooks/useLeaderboardListState";
import { useLeaderboards } from "../hooks/useLeaderboards";
import { leaderboardTableColumns } from "../config/leaderboard.config";
import {
	LEADERBOARD_BULK_STATUS_LABEL,
	LEADERBOARD_STATUS_FILTER_LABEL,
} from "../config/leaderboardStatusLabels";
import type { Leaderboard } from "../types/leaderboard.types";
import { useTableSort } from "@/shared/hooks/useTableSort";
import {
	ROUTES,
	leaderboardDetailPath,
	leaderboardEditPath,
} from "@/shared/constants/routes";
import { FeatureListIntro } from "@/shared/components/layout/FeatureListIntro";
import {
	LEADERBOARD_FEATURE_DESCRIPTION,
	LEADERBOARD_LIST_TITLE,
} from "@/shared/constants/featureCopy";

const STATUS_OPTIONS = ["draft", "active", "completed"] as const;

const LeaderboardPage = () => {
	const [pendingDelete, setPendingDelete] = useState<Leaderboard | null>(null);
	const [clearSelectionDialogOpen, setClearSelectionDialogOpen] = useState(false);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

	const clearRowSelection = useCallback(() => {
		setSelectedIds(new Set());
		setClearSelectionDialogOpen(false);
	}, []);

	const { filters, setFilters, searchText, onSearchChange } =
		useLeaderboardListState({ onPageChange: clearRowSelection });
	const { sort, handleSort } = useTableSort("-createdAt");

	useEffect(() => {
		setFilters((f) => ({ ...f, page: 1 }));
	}, [sort, setFilters]);

	const listFilters = useMemo(
		() => ({ ...filters, sort }),
		[filters, sort],
	);
	const { data, isLoading, error } = useLeaderboards(listFilters);
	const deleteMutation = useDeleteLeaderboard();
	const batchStatusMutation = useBatchUpdateLeaderboardStatus();
	const { showToast } = useToast();

	const rows = useMemo(() => data?.data ?? [], [data?.data]);

	useEffect(() => {
		const total = data?.total ?? 0;
		setFilters((f) => {
			const totalPages = Math.max(1, Math.ceil(total / f.limit));
			const clamped = Math.min(f.page, totalPages);
			return clamped === f.page ? f : { ...f, page: clamped };
		});
	}, [data?.total, filters.limit, setFilters]);

	const allOnPageSelected =
		rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
	const someOnPageSelected = rows.some((r) => selectedIds.has(r.id));

	const columns = useMemo(
		() => [
			{
				key: "__select",
				label: "",
				renderHeader: () => (
					<Checkbox
						size="small"
						checked={allOnPageSelected}
						indeterminate={someOnPageSelected && !allOnPageSelected}
						onChange={() => {
							setSelectedIds((prev) => {
								const next = new Set(prev);
								if (allOnPageSelected) {
									for (const r of rows) next.delete(r.id);
								} else {
									for (const r of rows) next.add(r.id);
								}
								return next;
							});
						}}
						inputProps={{
							"aria-label": "Select all leaderboards on this page",
						}}
					/>
				),
				render: (row: Leaderboard) => (
					<Checkbox
						size="small"
						checked={selectedIds.has(row.id)}
						onChange={() => {
							setSelectedIds((prev) => {
								const next = new Set(prev);
								if (next.has(row.id)) next.delete(row.id);
								else next.add(row.id);
								return next;
							});
						}}
						inputProps={{
							"aria-label": `Select ${row.title}`,
						}}
					/>
				),
			},
			...leaderboardTableColumns,
			{
				key: "actions",
				label: "Actions",
				isActions: true,
				render: (row: Leaderboard) => (
					<Stack direction="row" spacing={0.5} alignItems="center">
						<Tooltip title="View">
							<IconButton
								component={Link}
								to={leaderboardDetailPath(row.id)}
								color="primary"
								size="small"
								aria-label={`View ${row.title}`}
							>
								<VisibilityIcon fontSize="small" />
							</IconButton>
						</Tooltip>
						<Tooltip title="Edit">
							<IconButton
								component={Link}
								to={leaderboardEditPath(row.id)}
								color="primary"
								size="small"
								aria-label={`Edit ${row.title}`}
							>
								<EditIcon fontSize="small" />
							</IconButton>
						</Tooltip>
						<Tooltip title="Delete">
							<span>
								<IconButton
									color="error"
									size="small"
									disabled={deleteMutation.isPending}
									onClick={() => setPendingDelete(row)}
									aria-label={`Delete ${row.title}`}
								>
									<RecyclingOutlinedIcon fontSize="small" />
								</IconButton>
							</span>
						</Tooltip>
					</Stack>
				),
			},
		],
		[
			deleteMutation.isPending,
			rows,
			selectedIds,
			allOnPageSelected,
			someOnPageSelected,
		],
	);

	const deleteErrorMessage = (() => {
		const err = deleteMutation.error;
		if (!err) return null;
		if (isAxiosError(err)) {
			const d = err.response?.data;
			if (typeof d === "string") return d;
			if (d && typeof d === "object" && "message" in d) {
				const m = (d as { message: unknown }).message;
				if (typeof m === "string") return m;
			}
			return err.message;
		}
		return err instanceof Error ? err.message : "Delete failed";
	})();

	if (error) {
		return (
			<div>Unable to fetch leaderboard data. Please refresh the page.</div>
		);
	}
	if (isLoading || !data) {
		return <ListPageSkeleton />;
	}

	return (
		<Box>
			<FeatureListIntro
				title={LEADERBOARD_LIST_TITLE}
				description={LEADERBOARD_FEATURE_DESCRIPTION}
				descriptionVariant="body2"
				descriptionSx={{ fontSize: "0.8125rem", lineHeight: 1.55 }}
				action={
					<Button
						variant="contained"
						color="primary"
						component={Link}
						to={ROUTES.leaderboardsCreate}
					>
						Create leaderboard
					</Button>
				}
			/>
			{deleteErrorMessage ? (
				<Alert severity="error" sx={{ mb: 2 }}>
					{deleteErrorMessage}
				</Alert>
			) : null}
			{batchStatusMutation.error ? (
				<Alert severity="error" sx={{ mb: 2 }}>
					{batchStatusMutation.error instanceof Error
						? batchStatusMutation.error.message
						: "Bulk status update failed"}
				</Alert>
			) : null}
			<Box>
				<Stack
					direction={{ xs: "column", sm: "row" }}
					spacing={2}
					alignItems={{ xs: "stretch", sm: "flex-start" }}
					sx={{ mb: 2 }}
				>
					<TextField
						label="Search by title"
						placeholder="Type part of the leaderboard title…"
						value={searchText}
						onChange={(e) => onSearchChange(e.target.value)}
						inputProps={{ "aria-label": "Search leaderboards by title" }}
						sx={{ flex: "1 1 220px", minWidth: 0 }}
					/>
					<Box sx={{ flex: "0 1 auto", minWidth: 0 }}>
						<Typography
							component="p"
							variant="caption"
							color="text.secondary"
							sx={{ display: "block", mb: 0.75 }}
						>
							Filter by status
						</Typography>
						<Stack
							direction="row"
							spacing={1}
							flexWrap="wrap"
							useFlexGap
							role="group"
							aria-label="Filter by status"
						>
							<Chip
								label="All"
								color={filters.status === undefined ? "primary" : "default"}
								clickable
								onClick={() =>
									setFilters((prev) => ({
										...prev,
										status: undefined,
										page: 1,
									}))
								}
							/>
							{STATUS_OPTIONS.map((status) => (
								<Chip
									key={status}
									label={LEADERBOARD_STATUS_FILTER_LABEL[status]}
									color={filters.status === status ? "primary" : "default"}
									clickable
									onClick={() =>
										setFilters((prev) => ({ ...prev, status, page: 1 }))
									}
								/>
							))}
						</Stack>
					</Box>
				</Stack>
				{selectedIds.size > 0 ? (
					<Stack
						direction={{ xs: "column", sm: "row" }}
						spacing={1.5}
						alignItems={{ xs: "stretch", sm: "center" }}
						sx={{
							mb: 2,
							p: 1.5,
							borderRadius: 1,
							bgcolor: "action.hover",
						}}
						role="toolbar"
						aria-label="Bulk status: mark active, inactive, or completed"
					>
						<Typography variant="body2" sx={{ fontWeight: 600 }}>
							{selectedIds.size} selected
						</Typography>
						<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
							{STATUS_OPTIONS.map((status) => (
								<Button
									key={status}
									size="small"
									variant="outlined"
									disabled={batchStatusMutation.isPending}
									onClick={async () => {
										const ids = [...selectedIds];
										try {
											await batchStatusMutation.mutateAsync({
												ids,
												status,
											});
											setSelectedIds(new Set());
											const action = LEADERBOARD_BULK_STATUS_LABEL[status];
											showToast(
												`${action}: ${ids.length} leaderboard(s)`,
												"success",
											);
										} catch {
											showToast("Bulk status update failed", "error");
										}
									}}
								>
									{LEADERBOARD_BULK_STATUS_LABEL[status]}
								</Button>
							))}
						</Stack>
						<Button
							size="small"
							disabled={batchStatusMutation.isPending}
							onClick={() => setClearSelectionDialogOpen(true)}
						>
							Clear selection
						</Button>
					</Stack>
				) : null}
				<BaseTable
					data={rows}
					columns={columns}
					emptyMessage="No records found"
					sort={sort}
					onColumnSort={handleSort}
				/>
				<Box display="flex" justifyContent="center" mt={2}>
					<TablePagination
						component="div"
						count={data.total ?? 0}
						page={filters.page - 1}
						rowsPerPage={filters.limit}
						onPageChange={(_e, newPage) =>
							setFilters((prev) => ({ ...prev, page: newPage + 1 }))
						}
						onRowsPerPageChange={(event) =>
							setFilters((prev) => ({
								...prev,
								limit: parseInt(event.target.value, 10),
								page: 1,
							}))
						}
						rowsPerPageOptions={[5, 10, 25, 50]}
					/>
				</Box>
			</Box>

			<Dialog
				open={Boolean(pendingDelete)}
				onClose={() =>
					deleteMutation.isPending ? undefined : setPendingDelete(null)
				}
			>
				<DialogTitle
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 1,
						pr: 1,
					}}
				>
					Are you sure?
					<IconButton
						aria-label="Close dialog"
						disabled={deleteMutation.isPending}
						onClick={() => setPendingDelete(null)}
						edge="end"
						size="small"
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to delete &quot;{pendingDelete?.title}&quot;?
						This cannot be undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => setPendingDelete(null)}
						disabled={deleteMutation.isPending}
					>
						Cancel
					</Button>
					<Button
						color="error"
						variant="contained"
						disabled={deleteMutation.isPending}
						onClick={async () => {
							if (!pendingDelete) return;
							try {
								await deleteMutation.mutateAsync(pendingDelete.id);
								setPendingDelete(null);
								showToast("Leaderboard deleted successfully", "success");
							} catch {
								showToast("Failed to delete leaderboard", "error");
							}
						}}
					>
						Delete
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={clearSelectionDialogOpen && selectedIds.size > 0}
				onClose={() =>
					batchStatusMutation.isPending
						? undefined
						: setClearSelectionDialogOpen(false)
				}
			>
				<DialogTitle
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 1,
						pr: 1,
					}}
				>
					Are you sure?
					<IconButton
						aria-label="Close dialog"
						disabled={batchStatusMutation.isPending}
						onClick={() => setClearSelectionDialogOpen(false)}
						edge="end"
						size="small"
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to clear the selection?{" "}
						{selectedIds.size} leaderboard
						{selectedIds.size === 1 ? " is" : "s are"} currently selected.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => setClearSelectionDialogOpen(false)}
						disabled={batchStatusMutation.isPending}
					>
						Cancel
					</Button>
					<Button
						color="error"
						variant="contained"
						disabled={batchStatusMutation.isPending}
						onClick={() => {
							setSelectedIds(new Set());
							setClearSelectionDialogOpen(false);
						}}
					>
						Clear selection
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};
export default LeaderboardPage;
