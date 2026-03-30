import { Link, useParams } from "react-router-dom";
import {
	Box,
	Button,
	Paper,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from "@mui/material";
import { PageSkeleton } from "@/shared/components/skeleton/AppSkeleton";
import { ROUTES, wheelEditPath } from "@/shared/constants/routes";
import { WheelPreview } from "../components/WheelPreview";
import { WheelStatusChip } from "../components/WheelStatusChip";
import { useWheel } from "../hooks/useWheel";

function WheelDetailPage() {
	const { id } = useParams<{ id: string }>();
	const { data: wheel, isLoading, error } = useWheel(id);

	if (!id) {
		return (
			<Box>
				<Typography color="error">Missing wheel id.</Typography>
				<Button component={Link} to={ROUTES.wheelList} sx={{ mt: 2 }}>
					Back to wheels
				</Button>
			</Box>
		);
	}

	if (isLoading) {
		return (
			<Box sx={{ maxWidth: 960 }}>
				<PageSkeleton />
			</Box>
		);
	}

	if (error || !wheel) {
		return (
			<Box>
				<Typography color="error" gutterBottom>
					Unable to load this wheel.
				</Typography>
				<Button component={Link} to={ROUTES.wheelList}>
					Back to wheels
				</Button>
			</Box>
		);
	}

	return (
		<Box sx={{ maxWidth: 960 }}>
			<Box
				sx={{
					display: "flex",
					flexWrap: "wrap",
					alignItems: "center",
					gap: 1,
					mb: 2,
				}}
			>
				<Typography variant="h5" component="h1" sx={{ flex: 1 }}>
					{wheel.name}
				</Typography>
				<WheelStatusChip status={wheel.status} />
				<Button variant="outlined" component={Link} to={ROUTES.wheelList}>
					Back
				</Button>
				<Button
					variant="contained"
					component={Link}
					to={wheelEditPath(wheel.id)}
				>
					Edit
				</Button>
			</Box>

			<Stack
				direction={{ xs: "column", md: "row" }}
				spacing={3}
				alignItems="flex-start"
				sx={{ mb: 3 }}
			>
				<WheelPreview
					segments={wheel.segments}
					size={280}
					backgroundColor={wheel.backgroundColor}
					borderColor={wheel.borderColor}
					title="Wheel"
				/>
			</Stack>

			<Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
				<Typography variant="body2" color="text.secondary" gutterBottom>
					Description
				</Typography>
				<Typography paragraph sx={{ whiteSpace: "pre-wrap" }}>
					{wheel.description || "—"}
				</Typography>
				<Box
					sx={{
						display: "grid",
						gap: 1,
						gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
					}}
				>
					<div>
						<Typography variant="caption" color="text.secondary">
							Spin cost
						</Typography>
						<Typography>{wheel.spinCost}</Typography>
					</div>
					<div>
						<Typography variant="caption" color="text.secondary">
							Max spins / user
						</Typography>
						<Typography>{wheel.maxSpinsPerUser}</Typography>
					</div>
					<div>
						<Typography variant="caption" color="text.secondary">
							Background
						</Typography>
						<Typography>{wheel.backgroundColor}</Typography>
					</div>
					<div>
						<Typography variant="caption" color="text.secondary">
							Border
						</Typography>
						<Typography>{wheel.borderColor}</Typography>
					</div>
					<div>
						<Typography variant="caption" color="text.secondary">
							Created
						</Typography>
						<Typography>
							{new Date(wheel.createdAt).toLocaleString()}
						</Typography>
					</div>
					<div>
						<Typography variant="caption" color="text.secondary">
							Updated
						</Typography>
						<Typography>
							{new Date(wheel.updatedAt).toLocaleString()}
						</Typography>
					</div>
				</Box>
			</Paper>

			<Typography variant="subtitle1" gutterBottom>
				Segments
			</Typography>
			<TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>Label</TableCell>
							<TableCell>Color</TableCell>
							<TableCell align="right">Weight</TableCell>
							<TableCell>Prize</TableCell>
							<TableCell align="right">Amount</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{wheel.segments.map((s) => (
							<TableRow key={s.id}>
								<TableCell>{s.label}</TableCell>
								<TableCell>
									<Box
										sx={{
											display: "inline-block",
											width: 24,
											height: 24,
											borderRadius: 0.5,
											bgcolor: s.color,
											border: "1px solid",
											borderColor: "divider",
											verticalAlign: "middle",
											mr: 1,
										}}
									/>
									{s.color}
								</TableCell>
								<TableCell align="right">{s.weight}</TableCell>
								<TableCell>{s.prizeType}</TableCell>
								<TableCell align="right">{s.prizeAmount}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
}

export default WheelDetailPage;
