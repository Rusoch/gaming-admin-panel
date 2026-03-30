import type { ReactNode } from "react";
import {
	Controller,
	type Control,
	type FieldErrors,
	type UseFieldArrayReturn,
} from "react-hook-form";
import { Alert, Box, Button, MenuItem, TextField } from "@mui/material";
import type {
	RaffleFormInput,
	RaffleFormOutput,
} from "../validation/raffle.schema";

const PRIZE_TYPE_OPTIONS = [
	{ value: "coins" as const, label: "Coins" },
	{ value: "freeSpin" as const, label: "Free spin" },
	{ value: "bonus" as const, label: "Bonus" },
];

export interface RafflePrizeFieldsProps {
	control: Control<RaffleFormInput, unknown, RaffleFormOutput>;
	errors: FieldErrors<RaffleFormInput>;
	fieldArray: UseFieldArrayReturn<RaffleFormInput, "prizes", "id">;
	prizesListError?: string;
	disabled?: boolean;
	onAddPrize: () => void;
}

export function RafflePrizeFields({
	control,
	errors,
	fieldArray,
	prizesListError,
	disabled = false,
	onAddPrize,
}: RafflePrizeFieldsProps): ReactNode {
	const { fields, remove } = fieldArray;

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
			{prizesListError ? (
				<Alert severity="error">{prizesListError}</Alert>
			) : null}
			<Button
				type="button"
				variant="outlined"
				disabled={disabled}
				onClick={onAddPrize}
			>
				+ Add prize
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
						name={`prizes.${index}.name`}
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								label="Prize name"
								size="small"
								disabled={disabled}
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
								label="Type"
								size="small"
								sx={{ minWidth: 130 }}
								disabled={disabled}
								error={!!errors.prizes?.[index]?.type}
								helperText={errors.prizes?.[index]?.type?.message}
							>
								{PRIZE_TYPE_OPTIONS.map((opt) => (
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
								disabled={disabled}
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
						name={`prizes.${index}.quantity`}
						control={control}
						render={({ field }) => (
							<TextField
								label="Quantity"
								type="number"
								size="small"
								disabled={disabled}
								value={field.value === "" ? "" : field.value}
								onChange={(e) => {
									const v = e.target.value;
									field.onChange(v === "" ? "" : Number(v));
								}}
								onBlur={field.onBlur}
								name={field.name}
								inputRef={field.ref}
								inputProps={{ min: 1 }}
								error={!!errors.prizes?.[index]?.quantity}
								helperText={errors.prizes?.[index]?.quantity?.message}
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
								disabled={disabled}
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
						disabled={disabled || fields.length <= 1}
						onClick={() => remove(index)}
					>
						Remove
					</Button>
				</Box>
			))}
		</Box>
	);
}
