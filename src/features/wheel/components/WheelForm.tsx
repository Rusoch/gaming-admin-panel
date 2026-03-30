import { useCallback, useEffect, useRef } from "react";
import {
	Controller,
	useFieldArray,
	useForm,
	useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	type Blocker,
	type BlockerFunction,
	Link,
	useBlocker,
	useNavigate,
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
	Stack,
	TextField,
} from "@mui/material";
import { isAxiosError } from "axios";
import {
	buildWheelCreatePayload,
	buildWheelUpdatePayload,
	wheelToFormInput,
} from "../api/wheel.api";
import { useCreateWheel } from "../hooks/useCreateWheel";
import { useUpdateWheel } from "../hooks/useUpdateWheel";
import { useWheel } from "../hooks/useWheel";
import {
	wheelFormSchema,
	type WheelFormInput,
	type WheelFormOutput,
} from "../validation/wheel.schema";
import { SkeletonBlock, SkeletonLines } from "@/shared/components/skeleton/AppSkeleton";
import { useToast } from "@/shared/hooks/toast";
import { ROUTES } from "@/shared/constants/routes";
import { WheelPreview } from "./WheelPreview";
import { WheelSegmentFields } from "./WheelSegmentFields";

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

const WHEEL_STATUS_OPTIONS: { value: WheelFormInput["status"]; label: string }[] =
	[
		{ value: "draft", label: "Draft" },
		{ value: "active", label: "Active" },
		{ value: "inactive", label: "Inactive" },
	];

function createEmptyWheelSegment(
	overrides?: Partial<WheelFormInput["segments"][number]>,
): WheelFormInput["segments"][number] {
	return {
		id: crypto.randomUUID(),
		label: "",
		color: "#00e676",
		weight: 10,
		prizeType: "coins",
		prizeAmount: 1,
		imageUrl: "",
		...overrides,
	};
}

function getWheelFormDefaults(): WheelFormInput {
	return {
		name: "",
		description: "",
		status: "draft",
		maxSpinsPerUser: 3,
		spinCost: 0,
		backgroundColor: "#ffffff",
		borderColor: "#000000",
		segments: [
			createEmptyWheelSegment({
				label: "Segment A",
				color: "#ff5733",
				weight: 50,
				prizeType: "coins",
				prizeAmount: 100,
				imageUrl: "",
			}),
			createEmptyWheelSegment({
				label: "Segment B",
				color: "#c0c0c0",
				weight: 50,
				prizeType: "nothing",
				prizeAmount: 0,
				imageUrl: "",
			}),
		],
	};
}

export interface WheelFormProps {
	mode: "create" | "edit";
	wheelId?: string;
}

export function WheelForm({ mode, wheelId }: WheelFormProps) {
	const isEdit = mode === "edit";
	const navigate = useNavigate();
	const { showToast } = useToast();
	const { data: existing, isLoading, error } = useWheel(
		isEdit ? wheelId : undefined,
	);
	const createMutation = useCreateWheel();
	const updateMutation = useUpdateWheel();
	const allowNavigationRef = useRef(false);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting, isDirty },
	} = useForm<WheelFormInput, unknown, WheelFormOutput>({
		resolver: zodResolver(wheelFormSchema),
		defaultValues: getWheelFormDefaults(),
		mode: "onBlur",
	});

	const fieldArray = useFieldArray({ control, name: "segments" });
	const { append } = fieldArray;

	const watchedSegments = useWatch({ control, name: "segments" });
	const watchedBg = useWatch({ control, name: "backgroundColor" });
	const watchedBorder = useWatch({ control, name: "borderColor" });

	const previewSegments =
		Array.isArray(watchedSegments) && watchedSegments.length > 0
			? watchedSegments.map((s) => ({
					label: s?.label ?? "",
					color: s?.color ?? "#ccc",
					weight: Number(s?.weight) || 0,
				}))
			: [];

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
			reset(wheelToFormInput(existing));
		}
	}, [existing, reset]);

	const segmentsRootError =
		errors.segments &&
		typeof errors.segments === "object" &&
		"message" in errors.segments &&
		typeof errors.segments.message === "string"
			? errors.segments.message
			: undefined;

	const onValid = async (data: WheelFormOutput) => {
		if (isEdit) {
			if (!existing) return;
			updateMutation.reset();
			try {
				const body = buildWheelUpdatePayload(existing, data);
				await updateMutation.mutateAsync({ id: existing.id, body });
				showToast("Wheel updated successfully", "success");
				allowNavigationRef.current = true;
				navigate(ROUTES.wheelList);
			} catch {
				showToast("Failed to update wheel", "error");
			}
			return;
		}

		createMutation.reset();
		try {
			await createMutation.mutateAsync(buildWheelCreatePayload(data));
			showToast("Wheel created successfully", "success");
			allowNavigationRef.current = true;
			navigate(ROUTES.wheelList);
		} catch {
			showToast("Failed to create wheel", "error");
		}
	};

	const submitErrorMessage = (() => {
		const err = createMutation.error ?? updateMutation.error;
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
				<Box>
					<SkeletonBlock variant="text" width={260} height={40} sx={{ mb: 1 }} />
					<SkeletonLines count={8} />
				</Box>
				<UnsavedLeaveDialog blocker={blocker} />
			</>
		);
	}

	if (isEdit && (error || !existing)) {
		return (
			<>
				<Alert severity="error">
					Unable to load this wheel. It may have been removed.
				</Alert>
				<Button component={Link} to={ROUTES.wheelList} sx={{ mt: 2 }}>
					Back to wheels
				</Button>
				<UnsavedLeaveDialog blocker={blocker} />
			</>
		);
	}

	return (
		<>
			<Stack
				direction={{ xs: "column", lg: "row" }}
				spacing={3}
				alignItems="flex-start"
			>
				<Box
					component="form"
					onSubmit={(e) => {
						void handleSubmit(onValid)(e);
					}}
					noValidate
					sx={{
						flex: 1,
						minWidth: 0,
						maxWidth: 720,
						border: "1px solid",
						borderColor: "divider",
						p: 2,
						display: "flex",
						flexDirection: "column",
						gap: 2,
					}}
				>
					<Controller
						name="name"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								label="Name"
								required
								error={!!errors.name}
								helperText={errors.name?.message}
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
								{WHEEL_STATUS_OPTIONS.map((opt) => (
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
							<TextField
								{...field}
								label="Description"
								multiline
								minRows={3}
								error={!!errors.description}
								helperText={errors.description?.message}
							/>
						)}
					/>

					<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
						<Controller
							name="spinCost"
							control={control}
							render={({ field }) => (
								<TextField
									label="Spin cost"
									type="number"
									required
									fullWidth
									value={field.value === "" ? "" : field.value}
									onChange={(e) => {
										const v = e.target.value;
										field.onChange(v === "" ? "" : Number(v));
									}}
									onBlur={field.onBlur}
									name={field.name}
									inputRef={field.ref}
									inputProps={{ min: 0, step: 0.01 }}
									error={!!errors.spinCost}
									helperText={errors.spinCost?.message}
								/>
							)}
						/>
						<Controller
							name="maxSpinsPerUser"
							control={control}
							render={({ field }) => (
								<TextField
									label="Max spins per user"
									type="number"
									required
									fullWidth
									value={field.value === "" ? "" : field.value}
									onChange={(e) => {
										const v = e.target.value;
										field.onChange(v === "" ? "" : Number(v));
									}}
									onBlur={field.onBlur}
									name={field.name}
									inputRef={field.ref}
									inputProps={{ min: 1 }}
									error={!!errors.maxSpinsPerUser}
									helperText={errors.maxSpinsPerUser?.message}
								/>
							)}
						/>
					</Stack>

					<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
						<Controller
							name="backgroundColor"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Background hex"
									required
									fullWidth
									error={!!errors.backgroundColor}
									helperText={errors.backgroundColor?.message}
								/>
							)}
						/>
						<Controller
							name="borderColor"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Border hex"
									required
									fullWidth
									error={!!errors.borderColor}
									helperText={errors.borderColor?.message}
								/>
							)}
						/>
					</Stack>

					<WheelSegmentFields
						control={control}
						errors={errors}
						fieldArray={fieldArray}
						segmentsRootError={segmentsRootError}
						onAddSegment={() =>
							append(
								createEmptyWheelSegment({
									weight: 10,
									label: `Segment ${fieldArray.fields.length + 1}`,
								}),
							)
						}
					/>

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
								createMutation.isPending ||
								updateMutation.isPending ||
								!isDirty
							}
						>
							{isEdit ? "Save changes" : "Create"}
						</Button>
						<Button
							type="button"
							variant="outlined"
							component={Link}
							to={ROUTES.wheelList}
						>
							Cancel
						</Button>
					</Box>
				</Box>

				<Box
					sx={{
						width: { xs: "100%", lg: 260 },
						flexShrink: 0,
						position: { lg: "sticky" },
						top: { lg: 16 },
						alignSelf: { lg: "flex-start" },
					}}
				>
					<WheelPreview
						segments={previewSegments}
						size={240}
						backgroundColor={watchedBg || "#ffffff"}
						borderColor={watchedBorder || "#000000"}
						title="Live preview"
					/>
				</Box>
			</Stack>
			<UnsavedLeaveDialog blocker={blocker} />
		</>
	);
}
