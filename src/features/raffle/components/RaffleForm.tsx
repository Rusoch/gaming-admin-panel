import { useCallback, useEffect, useRef } from "react";
import { useFieldArray, Controller, useForm } from "react-hook-form";
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
	TextField,
} from "@mui/material";
import { isAxiosError } from "axios";
import {
	buildRaffleCreatePayload,
	buildRaffleUpdatePayload,
	raffleToFormInput,
} from "../api/raffle.api";
import { useCreateRaffle } from "../hooks/useCreateRaffle";
import { useRaffle } from "../hooks/useRaffle";
import { useUpdateRaffle } from "../hooks/useUpdateRaffle";
import {
	raffleFormSchema,
	type RaffleFormInput,
	type RaffleFormOutput,
} from "../validation/raffle.schema";
import { SkeletonBlock, SkeletonLines } from "@/shared/components/skeleton/AppSkeleton";
import { useToast } from "@/shared/hooks/toast";
import { ROUTES } from "@/shared/constants/routes";
import { RafflePrizeFields } from "./RafflePrizeFields";

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

const RAFFLE_STATUS_OPTIONS: {
	value: RaffleFormInput["status"];
	label: string;
}[] = [
	{ value: "draft", label: "Draft" },
	{ value: "active", label: "Active" },
	{ value: "drawn", label: "Drawn" },
	{ value: "cancelled", label: "Cancelled" },
];

function createEmptyRafflePrize(): RaffleFormInput["prizes"][number] {
	return {
		id: crypto.randomUUID(),
		name: "",
		type: "coins",
		amount: 0,
		quantity: 1,
		imageUrl: "",
	};
}

function getRaffleFormDefaults(): RaffleFormInput {
	return {
		name: "",
		description: "",
		status: "draft",
		startDate: "",
		endDate: "",
		drawDate: "",
		ticketPrice: 1,
		maxTicketsPerUser: 1,
		totalTicketLimit: "",
		prizes: [createEmptyRafflePrize()],
	};
}

export interface RaffleFormProps {
	mode: "create" | "edit";
	raffleId?: string;
}

export function RaffleForm({ mode, raffleId }: RaffleFormProps) {
	const isEdit = mode === "edit";
	const navigate = useNavigate();
	const { showToast } = useToast();
	const { data: existing, isLoading, error } = useRaffle(
		isEdit ? raffleId : undefined,
	);
	const createMutation = useCreateRaffle();
	const updateMutation = useUpdateRaffle();
	const allowNavigationRef = useRef(false);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting, isDirty },
	} = useForm<RaffleFormInput, unknown, RaffleFormOutput>({
		resolver: zodResolver(raffleFormSchema),
		defaultValues: getRaffleFormDefaults(),
		mode: "onBlur",
	});

	const fieldArray = useFieldArray({ control, name: "prizes" });
	const { append } = fieldArray;

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
			reset(raffleToFormInput(existing));
		}
	}, [existing, reset]);

	const prizesListError =
		errors.prizes &&
		typeof errors.prizes === "object" &&
		"message" in errors.prizes &&
		typeof errors.prizes.message === "string"
			? errors.prizes.message
			: undefined;

	const onValid = async (data: RaffleFormOutput) => {
		if (isEdit) {
			if (!existing) return;
			updateMutation.reset();
			try {
				const body = buildRaffleUpdatePayload(existing, data);
				await updateMutation.mutateAsync({ id: existing.id, body });
				showToast("Raffle updated successfully", "success");
				allowNavigationRef.current = true;
				navigate(ROUTES.raffleList);
			} catch {
				showToast("Failed to update raffle", "error");
			}
			return;
		}

		createMutation.reset();
		try {
			await createMutation.mutateAsync(buildRaffleCreatePayload(data));
			showToast("Raffle created successfully", "success");
			allowNavigationRef.current = true;
			navigate(ROUTES.raffleList);
		} catch {
			showToast("Failed to create raffle", "error");
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
				<Box>
					<Alert severity="error">
						Unable to load this raffle. It may have been removed.
					</Alert>
					<Button component={Link} to={ROUTES.raffleList} sx={{ mt: 2 }}>
						Back to raffles
					</Button>
				</Box>
				<UnsavedLeaveDialog blocker={blocker} />
			</>
		);
	}

	return (
		<>
			<Box
				component="form"
				onSubmit={(e) => {
					void handleSubmit(onValid)(e);
				}}
				noValidate
				sx={{
					border: "1px solid",
					borderColor: "divider",
					p: 2,
					display: "flex",
					flexDirection: "column",
					gap: 2,
					maxWidth: 720,
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
							{RAFFLE_STATUS_OPTIONS.map((opt) => (
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
							<label htmlFor="raffle-description">Description</label>
							<TextField
								{...field}
								id="raffle-description"
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
					name="drawDate"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="Draw date"
							type="date"
							required
							InputLabelProps={{ shrink: true }}
							error={!!errors.drawDate}
							helperText={errors.drawDate?.message}
						/>
					)}
				/>

				<Controller
					name="ticketPrice"
					control={control}
					render={({ field }) => (
						<TextField
							label="Ticket price"
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
							inputProps={{ min: 0, step: 0.01 }}
							error={!!errors.ticketPrice}
							helperText={errors.ticketPrice?.message}
						/>
					)}
				/>

				<Controller
					name="maxTicketsPerUser"
					control={control}
					render={({ field }) => (
						<TextField
							label="Max tickets per user"
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
							inputProps={{ min: 1 }}
							error={!!errors.maxTicketsPerUser}
							helperText={errors.maxTicketsPerUser?.message}
						/>
					)}
				/>

				<Controller
					name="totalTicketLimit"
					control={control}
					render={({ field }) => (
						<TextField
							label="Total ticket limit (empty = unlimited)"
							type="number"
							value={field.value === "" || field.value === null ? "" : field.value}
							onChange={(e) => {
								const v = e.target.value;
								field.onChange(v === "" ? "" : Number(v));
							}}
							onBlur={field.onBlur}
							name={field.name}
							inputRef={field.ref}
							inputProps={{ min: 1 }}
							error={!!errors.totalTicketLimit}
							helperText={
								errors.totalTicketLimit?.message ??
								"Leave blank for no overall cap."
							}
						/>
					)}
				/>

				<RafflePrizeFields
					control={control}
					errors={errors}
					fieldArray={fieldArray}
					prizesListError={prizesListError}
					onAddPrize={() => append(createEmptyRafflePrize())}
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
						to={ROUTES.raffleList}
					>
						Cancel
					</Button>
				</Box>
			</Box>
			<UnsavedLeaveDialog blocker={blocker} />
		</>
	);
}
