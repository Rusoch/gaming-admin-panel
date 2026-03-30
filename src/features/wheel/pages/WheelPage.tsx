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
} from "@mui/material";
import TablePagination from "@mui/material/TablePagination";
import { isAxiosError } from "axios";
import { WheelTable } from "../components/WheelTable";
import { useDeleteWheel } from "../hooks/useDeleteWheel";
import { useWheels } from "../hooks/useWheels";
import type { Wheel, WheelFilters } from "../types/wheel.types";
import { FeatureListIntro } from "@/shared/components/layout/FeatureListIntro";
import { ListPageSkeleton } from "@/shared/components/skeleton/AppSkeleton";
import {
	WHEEL_FEATURE_DESCRIPTION,
	WHEEL_LIST_TITLE,
} from "@/shared/constants/featureCopy";
import { useToast } from "@/shared/hooks/toast";
import { useTableSort } from "@/shared/hooks/useTableSort";
import {
	ROUTES,
	wheelDetailPath,
	wheelEditPath,
} from "@/shared/constants/routes";

const STATUS_OPTIONS = ["draft", "active", "inactive"] as const;

function useWheelListState() {
	const [filters, setFilters] = useState({
		page: 1,
		limit: 10,
		status: undefined as Wheel["status"] | undefined,
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

function WheelPage() {
	const { filters, setFilters, searchText, onSearchChange } =
		useWheelListState();
	const { sort, handleSort } = useTableSort("-createdAt");

	useEffect(() => {
		setFilters((f) => ({ ...f, page: 1 }));
	}, [sort, setFilters]);

	const listFilters: WheelFilters = useMemo(
		() => ({
			page: filters.page,
			limit: filters.limit,
			sort,
			status: filters.status,
			search: filters.search.trim() || undefined,
		}),
		[filters, sort],
	);

	const { data, isLoading, error } = useWheels(listFilters);
	const deleteMutation = useDeleteWheel();
	const { showToast } = useToast();
	const [pendingDelete, setPendingDelete] = useState<Wheel | null>(null);

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
					Unable to fetch wheels. Check that the API is running.
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
				title={WHEEL_LIST_TITLE}
				description={WHEEL_FEATURE_DESCRIPTION}
				action={
					<Button
						variant="contained"
						color="primary"
						component={Link}
						to={ROUTES.wheelsCreate}
					>
						Create wheel
					</Button>
				}
			/>

			{deleteErrorMessage ? (
				<Alert severity="error" sx={{ mb: 2 }}>
					{deleteErrorMessage}
				</Alert>
			) : null}

			<Stack
				direction={{ xs: "column", sm: "row" }}
				spacing={2}
				alignItems={{ xs: "stretch", sm: "flex-start" }}
				sx={{ mb: 2 }}
			>
				<TextField
					label="Search by name"
					value={searchText}
					onChange={(e) => onSearchChange(e.target.value)}
					sx={{ flex: "1 1 220px", minWidth: 0 }}
				/>
				<Box sx={{ flex: "0 1 auto", minWidth: 0 }}>
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
			</Stack>

			<WheelTable
				rows={rows}
				sort={sort}
				onColumnSort={handleSort}
				emptyMessage="No wheels match your filters"
				renderActions={(row) => (
					<Stack direction="row" spacing={0.5} alignItems="center">
						<Tooltip title="View">
							<IconButton
								component={Link}
								to={wheelDetailPath(row.id)}
								color="primary"
								size="small"
								aria-label={`View ${row.name}`}
							>
								<VisibilityIcon fontSize="small" />
							</IconButton>
						</Tooltip>
						<Tooltip title="Edit">
							<IconButton
								component={Link}
								to={wheelEditPath(row.id)}
								color="primary"
								size="small"
								aria-label={`Edit ${row.name}`}
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
					Delete wheel?
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
								showToast("Wheel deleted", "success");
							} catch {
								showToast("Failed to delete wheel", "error");
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

export default WheelPage;
