import type { ReactNode } from "react";
import {
	Controller,
	type Control,
	type FieldErrors,
	type UseFieldArrayReturn,
} from "react-hook-form";
import { Alert, Box, Button, MenuItem, TextField, Typography } from "@mui/material";
import type { WheelFormInput, WheelFormOutput } from "../validation/wheel.schema";

const PRIZE_TYPES = [
	{ value: "coins" as const, label: "Coins" },
	{ value: "freeSpin" as const, label: "Free spin" },
	{ value: "bonus" as const, label: "Bonus" },
	{ value: "nothing" as const, label: "Nothing" },
] as const;

export interface WheelSegmentFieldsProps {
	control: Control<WheelFormInput, unknown, WheelFormOutput>;
	errors: FieldErrors<WheelFormInput>;
	fieldArray: UseFieldArrayReturn<WheelFormInput, "segments", "id">;
	segmentsRootError?: string;
	disabled?: boolean;
	onAddSegment: () => void;
}

export function WheelSegmentFields({
	control,
	errors,
	fieldArray,
	segmentsRootError,
	disabled = false,
	onAddSegment,
}: WheelSegmentFieldsProps): ReactNode {
	const { fields, remove } = fieldArray;

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
			<Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
				<Typography variant="subtitle2">Segments (2–12, weights sum 100)</Typography>
				<Button
					type="button"
					size="small"
					variant="outlined"
					disabled={disabled || fields.length >= 12}
					onClick={onAddSegment}
				>
					Add segment
				</Button>
			</Box>
			{segmentsRootError ? (
				<Alert severity="error">{segmentsRootError}</Alert>
			) : null}
			{fields.map((row, index) => (
				<Box
					key={row.id}
					sx={{
						display: "flex",
						flexWrap: "wrap",
						gap: 1,
						alignItems: "flex-start",
						p: 1.5,
						border: "1px solid",
						borderColor: "divider",
						borderRadius: 1,
					}}
				>
					<Controller
						name={`segments.${index}.label`}
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								label="Label"
								size="small"
								disabled={disabled}
								sx={{ minWidth: 120 }}
								error={!!errors.segments?.[index]?.label}
								helperText={errors.segments?.[index]?.label?.message}
							/>
						)}
					/>
					<Controller
						name={`segments.${index}.color`}
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								label="Color"
								size="small"
								disabled={disabled}
								sx={{ width: 100 }}
								error={!!errors.segments?.[index]?.color}
								helperText={errors.segments?.[index]?.color?.message}
							/>
						)}
					/>
					<Controller
						name={`segments.${index}.weight`}
						control={control}
						render={({ field }) => (
							<TextField
								label="Weight"
								type="number"
								size="small"
								disabled={disabled}
								sx={{ width: 88 }}
								value={field.value === "" ? "" : field.value}
								onChange={(e) => {
									const v = e.target.value;
									field.onChange(v === "" ? "" : Number(v));
								}}
								onBlur={field.onBlur}
								name={field.name}
								inputRef={field.ref}
								inputProps={{ min: 1, max: 100 }}
								error={!!errors.segments?.[index]?.weight}
								helperText={errors.segments?.[index]?.weight?.message}
							/>
						)}
					/>
					<Controller
						name={`segments.${index}.prizeType`}
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								select
								label="Prize"
								size="small"
								disabled={disabled}
								sx={{ minWidth: 120 }}
								error={!!errors.segments?.[index]?.prizeType}
								helperText={errors.segments?.[index]?.prizeType?.message}
							>
								{PRIZE_TYPES.map((opt) => (
									<MenuItem key={opt.value} value={opt.value}>
										{opt.label}
									</MenuItem>
								))}
							</TextField>
						)}
					/>
					<Controller
						name={`segments.${index}.prizeAmount`}
						control={control}
						render={({ field }) => (
							<TextField
								label="Amount"
								type="number"
								size="small"
								disabled={disabled}
								sx={{ width: 96 }}
								value={field.value === "" ? "" : field.value}
								onChange={(e) => {
									const v = e.target.value;
									field.onChange(v === "" ? "" : Number(v));
								}}
								onBlur={field.onBlur}
								name={field.name}
								inputRef={field.ref}
								inputProps={{ min: 0 }}
								error={!!errors.segments?.[index]?.prizeAmount}
								helperText={errors.segments?.[index]?.prizeAmount?.message}
							/>
						)}
					/>
					<Controller
						name={`segments.${index}.imageUrl`}
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								label="Image URL"
								size="small"
								disabled={disabled}
								sx={{ flex: 1, minWidth: 160 }}
								error={!!errors.segments?.[index]?.imageUrl}
								helperText={errors.segments?.[index]?.imageUrl?.message}
							/>
						)}
					/>
					<Button
						type="button"
						size="small"
						color="inherit"
						disabled={disabled || fields.length <= 2}
						onClick={() => remove(index)}
					>
						Remove
					</Button>
				</Box>
			))}
		</Box>
	);
}
