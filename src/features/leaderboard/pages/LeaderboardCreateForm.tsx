import { useCallback, useEffect, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	type Blocker,
	type BlockerFunction,
	Link,
	useBlocker,
	useNavigate,
	useParams,
} from "react-router-dom";
import {
	Alert,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	MenuItem,
	TextField,
} from "@mui/material";
import { isAxiosError } from "axios";
import {
	buildLeaderboardCreatePayload,
	buildLeaderboardUpdatePayload,
	leaderboardToFormInput,
} from "@/features/leaderboard/api/leaderboard.api";
import { useCreateLeaderboard } from "@/features/leaderboard/hooks/useCreateLeaderboard";
import { useLeaderboard } from "@/features/leaderboard/hooks/useLeaderboard";
import { useUpdateLeaderboard } from "@/features/leaderboard/hooks/useUpdateLeaderboard";
import {
	LEADERBOARD_PRIZE_TYPE_OPTIONS,
	LEADERBOARD_SCORING_OPTIONS,
	LEADERBOARD_STATUS_OPTIONS,
	createEmptyLeaderboardPrize,
	getLeaderboardCreateFormDefaults,
} from "@/features/leaderboard/config/leaderboardCreateForm.config";
import {
	leaderboardCreateFormSchema,
	type LeaderboardCreateFormInput,
	type LeaderboardCreateFormOutput,
} from "@/features/leaderboard/validation/leaderboardCreateForm.schema";
import { SkeletonBlock, SkeletonLines } from "@/shared/components/skeleton/AppSkeleton";
import { useToast } from "@/shared/hooks/toast";
import { ROUTES } from "@/shared/constants/routes";

function UnsavedLeaveDialog({ blocker }: { blocker: Blocker }) {
	const blocked = blocker.state === "blocked";
	return (
		<Dialog
			open={blocked}
			onClose={(_, reason) => {
				if (
					blocker.state === "blocked" &&
					(reason === "backdropClick" || reason === "escapeKeyDown")
				) {
					blocker.reset();
				}
			}}
		>
			<DialogTitle>Unsaved changes</DialogTitle>
			<DialogContent>
				<DialogContentText>
					You have unsaved changes. Leave this page without saving?
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button
					type="button"
					onClick={() => blocker.state === "blocked" && blocker.reset()}
				>
					Stay
				</Button>
				<Button
					type="button"
					color="warning"
					variant="contained"
					onClick={() => blocker.state === "blocked" && blocker.proceed()}
				>
					Leave
				</Button>
			</DialogActions>
		</Dialog>
	);
}

function LeaderboardCreateForm() {
	const { id } = useParams<{ id: string }>();
	const isEdit = Boolean(id);
	const navigate = useNavigate();
	const { showToast } = useToast();
	const { data: existing, isLoading, error } = useLeaderboard(id);
	const createLeaderboardMutation = useCreateLeaderboard();
	const updateLeaderboardMutation = useUpdateLeaderboard();

	const allowNavigationRef = useRef(false);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting, isDirty },
		getValues,
		setValue,
	} = useForm<
		LeaderboardCreateFormInput,
		unknown,
		LeaderboardCreateFormOutput
	>({
		resolver: zodResolver(leaderboardCreateFormSchema),
		defaultValues: getLeaderboardCreateFormDefaults(),
		mode: "onBlur",
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "prizes",
	});

	const shouldBlockNavigation = useCallback<BlockerFunction>(
		({ currentLocation, nextLocation }) => {
			if (allowNavigationRef.current) return false;
			if (!isDirty) return false;
			return (
				currentLocation.pathname !== nextLocation.pathname ||
				currentLocation.search !== nextLocation.search ||
				currentLocation.hash !== nextLocation.hash
			);
		},
		[isDirty],
	);

	const blocker = useBlocker(shouldBlockNavigation);

	useEffect(() => {
		if (!isDirty) return;
		const onBeforeUnload = (e: BeforeUnloadEvent) => {
			if (allowNavigationRef.current) return;
			e.preventDefault();
			e.returnValue = "";
		};
		window.addEventListener("beforeunload", onBeforeUnload);
		return () => window.removeEventListener("beforeunload", onBeforeUnload);
	}, [isDirty]);

	useEffect(() => {
		if (existing) {
			reset(leaderboardToFormInput(existing));
		}
	}, [existing, reset]);

	const removePrizeAt = (index: number) => {
		remove(index);
		queueMicrotask(() => {
			const rows = getValues("prizes");
			rows.forEach((_, i) => {
				setValue(`prizes.${i}.rank`, i + 1, {
					shouldValidate: true,
					shouldDirty: true,
				});
			});
		});
	};

	const prizesListError =
		errors.prizes &&
		typeof errors.prizes === "object" &&
		"message" in errors.prizes &&
		typeof errors.prizes.message === "string"
			? errors.prizes.message
			: undefined;

	const onValid = async (data: LeaderboardCreateFormOutput) => {
		if (isEdit) {
			if (!existing) return;
			updateLeaderboardMutation.reset();
			try {
				const body = buildLeaderboardUpdatePayload(existing, data);
				await updateLeaderboardMutation.mutateAsync({
					id: existing.id,
					body,
				});
				showToast("Leaderboard updated successfully", "success");
				allowNavigationRef.current = true;
				navigate(ROUTES.leaderboardList);
			} catch {
				showToast("Failed to update leaderboard", "error");
			}
			return;
		}

		createLeaderboardMutation.reset();
		const payload = buildLeaderboardCreatePayload(data);
		try {
			await createLeaderboardMutation.mutateAsync(payload);
			showToast("Leaderboard created successfully", "success");
			allowNavigationRef.current = true;
			navigate(ROUTES.leaderboardList);
		} catch {
			showToast("Failed to create leaderboard", "error");
		}
	};

	const submitErrorMessage = (() => {
		const err =
			createLeaderboardMutation.error ?? updateLeaderboardMutation.error;
		if (!err) return null;
		if (isAxiosError(err)) {
			const data = err.response?.data;
			if (typeof data === "string") return data;
			if (data && typeof data === "object" && "message" in data) {
				const m = (data as { message: unknown }).message;
				if (typeof m === "string") return m;
			}
			return err.message;
		}
		return err instanceof Error ? err.message : "Something went wrong";
	})();

	if (isEdit && isLoading) {
		return (
			<>
				<Box component="div">
					<SkeletonBlock variant="text" width={260} height={40} sx={{ mb: 1 }} />
					<SkeletonLines count={7} />
				</Box>
				<UnsavedLeaveDialog blocker={blocker} />
			</>
		);
	}

	if (isEdit && (error || !existing)) {
		return (
			<>
				<Box component="div">
					<h2>Edit Leaderboard</h2>
					<Alert severity="error">
						Unable to load this leaderboard. It may have been removed.
					</Alert>
					<Button component={Link} to={ROUTES.leaderboardList} sx={{ mt: 2 }}>
						Back to leaderboards
					</Button>
				</Box>
				<UnsavedLeaveDialog blocker={blocker} />
			</>
		);
	}

	return (
		<>
		<Box component="div">
			<h2>{isEdit ? "Edit Leaderboard" : "Create Leaderboard"}</h2>
			<Box
				component="form"
				onSubmit={(e) => {
					void handleSubmit(onValid)(e);
				}}
				noValidate
				sx={{
					border: "1px solid #ccc",
					p: 2,
					display: "flex",
					flexDirection: "column",
					gap: 2,
					maxWidth: 720,
				}}
			>
				<Controller
					name="title"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="Title"
							required
							error={!!errors.title}
							helperText={errors.title?.message}
						/>
					)}
				/>

				<Controller
					name="status"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							select
							label="Status"
							required
							error={!!errors.status}
							helperText={errors.status?.message}
						>
							{LEADERBOARD_STATUS_OPTIONS.map((opt) => (
								<MenuItem key={opt.value} value={opt.value}>
									{opt.label}
								</MenuItem>
							))}
						</TextField>
					)}
				/>

				<Controller
					name="description"
					control={control}
					render={({ field }) => (
						<Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
							<label htmlFor="leaderboard-description">Description</label>
							<TextField
								{...field}
								id="leaderboard-description"
								multiline
								minRows={4}
								error={!!errors.description}
								helperText={errors.description?.message}
							/>
						</Box>
					)}
				/>

				<Controller
					name="startDate"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="Start date"
							type="date"
							required
							InputLabelProps={{ shrink: true }}
							error={!!errors.startDate}
							helperText={errors.startDate?.message}
						/>
					)}
				/>

				<Controller
					name="endDate"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="End date"
							type="date"
							required
							InputLabelProps={{ shrink: true }}
							error={!!errors.endDate}
							helperText={errors.endDate?.message}
						/>
					)}
				/>

				<Controller
					name="scoringType"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							select
							label="Scoring"
							required
							error={!!errors.scoringType}
							helperText={errors.scoringType?.message}
						>
							{LEADERBOARD_SCORING_OPTIONS.map((opt) => (
								<MenuItem key={opt.value} value={opt.value}>
									{opt.label}
								</MenuItem>
							))}
						</TextField>
					)}
				/>

				<Controller
					name="maxParticipants"
					control={control}
					render={({ field }) => (
						<TextField
							label="Max participants"
							type="number"
							required
							value={field.value === "" ? "" : field.value}
							onChange={(e) => {
								const v = e.target.value;
								field.onChange(v === "" ? "" : Number(v));
							}}
							onBlur={field.onBlur}
							name={field.name}
							inputRef={field.ref}
							inputProps={{ min: 2 }}
							error={!!errors.maxParticipants}
							helperText={errors.maxParticipants?.message}
						/>
					)}
				/>

				<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
					{prizesListError ? (
						<Alert severity="error">{prizesListError}</Alert>
					) : null}
					<Button
						type="button"
						variant="outlined"
						onClick={() =>
							append(createEmptyLeaderboardPrize(fields.length + 1))
						}
					>
						+ Add Prize
					</Button>
					{fields.map((row, index) => (
						<Box
							key={row.id}
							sx={{
								display: "flex",
								flexWrap: "wrap",
								gap: 1,
								alignItems: "flex-start",
							}}
						>
							<Controller
								name={`prizes.${index}.rank`}
								control={control}
								render={({ field }) => (
									<TextField
										label="Rank"
										type="number"
										size="small"
										value={field.value === "" ? "" : field.value}
										onChange={(e) => {
											const v = e.target.value;
											field.onChange(v === "" ? "" : Number(v));
										}}
										onBlur={field.onBlur}
										name={field.name}
										inputRef={field.ref}
										error={!!errors.prizes?.[index]?.rank}
										helperText={errors.prizes?.[index]?.rank?.message}
									/>
								)}
							/>
							<Controller
								name={`prizes.${index}.name`}
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Name"
										size="small"
										error={!!errors.prizes?.[index]?.name}
										helperText={errors.prizes?.[index]?.name?.message}
									/>
								)}
							/>
							<Controller
								name={`prizes.${index}.type`}
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										select
										label="Reward type"
										size="small"
										sx={{ minWidth: 130 }}
										error={!!errors.prizes?.[index]?.type}
										helperText={errors.prizes?.[index]?.type?.message}
									>
										{LEADERBOARD_PRIZE_TYPE_OPTIONS.map((opt) => (
											<MenuItem key={opt.value} value={opt.value}>
												{opt.label}
											</MenuItem>
										))}
									</TextField>
								)}
							/>
							<Controller
								name={`prizes.${index}.amount`}
								control={control}
								render={({ field }) => (
									<TextField
										label="Amount"
										type="number"
										size="small"
										value={field.value === "" ? "" : field.value}
										onChange={(e) => {
											const v = e.target.value;
											field.onChange(v === "" ? "" : Number(v));
										}}
										onBlur={field.onBlur}
										name={field.name}
										inputRef={field.ref}
										error={!!errors.prizes?.[index]?.amount}
										helperText={errors.prizes?.[index]?.amount?.message}
									/>
								)}
							/>
							<Controller
								name={`prizes.${index}.imageUrl`}
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Image URL"
										size="small"
										sx={{ flex: 1, minWidth: 180 }}
										error={!!errors.prizes?.[index]?.imageUrl}
										helperText={errors.prizes?.[index]?.imageUrl?.message}
									/>
								)}
							/>
							<Button
								type="button"
								size="small"
								color="inherit"
								disabled={fields.length <= 1}
								onClick={() => removePrizeAt(index)}
							>
								Remove
							</Button>
						</Box>
					))}
				</Box>

				{submitErrorMessage ? (
					<Alert severity="error">{submitErrorMessage}</Alert>
				) : null}

				<Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
					<Button
						type="submit"
						variant="contained"
						color="primary"
						disabled={
							isSubmitting ||
							createLeaderboardMutation.isPending ||
							updateLeaderboardMutation.isPending ||
							!isDirty
						}
					>
						{isEdit ? "Save changes" : "Create"}
					</Button>
					<Button
						type="button"
						variant="outlined"
						component={Link}
						to={ROUTES.leaderboardList}
					>
						Cancel
					</Button>
				</Box>
			</Box>
		</Box>
		<UnsavedLeaveDialog blocker={blocker} />
		</>
	);
}

export default LeaderboardCreateForm;
