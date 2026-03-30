import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { RaffleList } from "../components/RaffleList";
import { useDeleteRaffle } from "../hooks/useDeleteRaffle";
import { useRaffles } from "../hooks/useRaffles";
import type { Raffle, RaffleFilters } from "../types/raffle.types";
import { ListPageSkeleton } from "@/shared/components/skeleton/AppSkeleton";
import { useToast } from "@/shared/hooks/toast";
import { useTableSort } from "@/shared/hooks/useTableSort";
import {
	ROUTES,
	raffleDetailPath,
	raffleEditPath,
} from "@/shared/constants/routes";
import { FeatureListIntro } from "@/shared/components/layout/FeatureListIntro";
import {
	RAFFLE_FEATURE_DESCRIPTION,
	RAFFLE_LIST_TITLE,
} from "@/shared/constants/featureCopy";

const STATUS_OPTIONS = ["draft", "active", "drawn", "cancelled"] as const;

function useRaffleListState() {
	const [filters, setFilters] = useState({
		page: 1,
		limit: 10,
		status: undefined as Raffle["status"] | undefined,
		dateFrom: "",
		dateTo: "",
		search: "",
	});
	const [searchText, setSearchText] = useState("");
	const t = useRef<ReturnType<typeof setTimeout> | null>(null);

	const onSearchChange = useCallback((value: string) => {
		setSearchText(value);
		if (t.current) clearTimeout(t.current);
		t.current = setTimeout(() => {
			t.current = null;
			setFilters((p) => ({ ...p, search: value, page: 1 }));
		}, 500);
	}, []);

	useEffect(
		() => () => {
			if (t.current) clearTimeout(t.current);
		},
		[],
	);

	return { filters, setFilters, searchText, onSearchChange };
}

function RafflePage() {
	const { filters, setFilters, searchText, onSearchChange } =
		useRaffleListState();
	const { sort, handleSort } = useTableSort("-createdAt");

	useEffect(() => {
		setFilters((f) => ({ ...f, page: 1 }));
	}, [sort, setFilters]);

	const listFilters: RaffleFilters = useMemo(
		() => ({
			page: filters.page,
			limit: filters.limit,
			sort,
			status: filters.status,
			dateFrom: filters.dateFrom.trim() || undefined,
			dateTo: filters.dateTo.trim() || undefined,
			search: filters.search.trim() || undefined,
		}),
		[filters, sort],
	);

	const { data, isLoading, error } = useRaffles(listFilters);
	const deleteMutation = useDeleteRaffle();
	const { showToast } = useToast();
	const [pendingDelete, setPendingDelete] = useState<Raffle | null>(null);

	const rows = data?.data ?? [];

	useEffect(() => {
		const total = data?.total ?? 0;
		setFilters((f) => {
			const totalPages = Math.max(1, Math.ceil(total / f.limit));
			const clamped = Math.min(f.page, totalPages);
			return clamped === f.page ? f : { ...f, page: clamped };
		});
	}, [data?.total, filters.limit, setFilters]);

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
			<Box>
				<Alert severity="error">
					Unable to fetch raffles. Please refresh or check that the API is
					running.
				</Alert>
			</Box>
		);
	}

	if (isLoading || !data) {
		return <ListPageSkeleton />;
	}

	return (
		<Box>
			<FeatureListIntro
				title={RAFFLE_LIST_TITLE}
				description={RAFFLE_FEATURE_DESCRIPTION}
				action={
					<Button
						variant="contained"
						color="primary"
						component={Link}
						to={ROUTES.rafflesCreate}
					>
						Create raffle
					</Button>
				}
			/>

			{deleteErrorMessage ? (
				<Alert severity="error" sx={{ mb: 2 }}>
					{deleteErrorMessage}
				</Alert>
			) : null}

			<Stack
				direction={{ xs: "column", lg: "row" }}
				spacing={2}
				alignItems={{ xs: "stretch", lg: "flex-start" }}
				sx={{ mb: 2 }}
			>
				<TextField
					label="Search by name"
					value={searchText}
					onChange={(e) => onSearchChange(e.target.value)}
					sx={{ flex: "1 1 220px", minWidth: 0 }}
				/>
				<Box sx={{ flex: "1 1 280px", minWidth: 0 }}>
					<Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75 }}>
						Filter by status
					</Typography>
					<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
						<Chip
							label="All"
							color={filters.status === undefined ? "primary" : "default"}
							clickable
							onClick={() =>
								setFilters((prev) => ({ ...prev, status: undefined, page: 1 }))
							}
						/>
						{STATUS_OPTIONS.map((status) => (
							<Chip
								key={status}
								label={status}
								color={filters.status === status ? "primary" : "default"}
								clickable
								onClick={() =>
									setFilters((prev) => ({ ...prev, status, page: 1 }))
								}
							/>
						))}
					</Stack>
				</Box>
				<TextField
					label="Period from"
					type="date"
					value={filters.dateFrom}
					onChange={(e) =>
						setFilters((prev) => ({
							...prev,
							dateFrom: e.target.value,
							page: 1,
						}))
					}
					InputLabelProps={{ shrink: true }}
					sx={{ flex: "0 1 160px" }}
				/>
				<TextField
					label="Period to"
					type="date"
					value={filters.dateTo}
					onChange={(e) =>
						setFilters((prev) => ({
							...prev,
							dateTo: e.target.value,
							page: 1,
						}))
					}
					InputLabelProps={{ shrink: true }}
					sx={{ flex: "0 1 160px" }}
				/>
			</Stack>

			<RaffleList
				rows={rows}
				sort={sort}
				onColumnSort={handleSort}
				emptyMessage="No raffles match your filters"
				renderActions={(row) => (
					<Stack direction="row" spacing={0.5} alignItems="center">
						<Tooltip title="View">
							<IconButton
								component={Link}
								to={raffleDetailPath(row.id)}
								color="primary"
								size="small"
								aria-label={`View ${row.name}`}
							>
								<VisibilityIcon fontSize="small" />
							</IconButton>
						</Tooltip>
						<Tooltip title={row.status === "drawn" ? "Cannot edit drawn raffle" : "Edit"}>
							<span>
								<IconButton
									component={Link}
									to={raffleEditPath(row.id)}
									color="primary"
									size="small"
									disabled={row.status === "drawn"}
									aria-label={`Edit ${row.name}`}
								>
									<EditIcon fontSize="small" />
								</IconButton>
							</span>
						</Tooltip>
						<Tooltip title="Delete">
							<span>
								<IconButton
									color="error"
									size="small"
									disabled={deleteMutation.isPending}
									onClick={() => setPendingDelete(row)}
									aria-label={`Delete ${row.name}`}
								>
									<RecyclingOutlinedIcon fontSize="small" />
								</IconButton>
							</span>
						</Tooltip>
					</Stack>
				)}
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
					Delete raffle?
					<IconButton
						aria-label="Close"
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
						Delete &quot;{pendingDelete?.name}&quot;? This cannot be undone.
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
								showToast("Raffle deleted", "success");
							} catch {
								showToast("Failed to delete raffle", "error");
							}
						}}
					>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}

export default RafflePage;
