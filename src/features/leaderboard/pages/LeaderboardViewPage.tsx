import { Link, useParams } from "react-router-dom";
import {
	Box,
	Button,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from "@mui/material";
import { PageSkeleton } from "@/shared/components/skeleton/AppSkeleton";
import { LEADERBOARD_STATUS_FILTER_LABEL } from "../config/leaderboardStatusLabels";
import { useLeaderboard } from "../hooks/useLeaderboard";
import {
	ROUTES,
	leaderboardEditPath,
} from "@/shared/constants/routes";

function LeaderboardViewPage() {
	const { id } = useParams<{ id: string }>();
	const { data: lb, isLoading, error } = useLeaderboard(id);

	if (!id) {
		return (
			<Box>
				<Typography color="error">Missing leaderboard id.</Typography>
				<Button component={Link} to={ROUTES.leaderboardList} sx={{ mt: 2 }}>
					Back to leaderboards
				</Button>
			</Box>
		);
	}

	if (isLoading) {
		return (
			<Box sx={{ maxWidth: 800 }}>
				<PageSkeleton />
			</Box>
		);
	}

	if (error || !lb) {
		return (
			<Box>
				<Typography color="error" gutterBottom>
					Unable to load this leaderboard.
				</Typography>
				<Button component={Link} to={ROUTES.leaderboardList}>
					Back to leaderboards
				</Button>
			</Box>
		);
	}

	return (
		<Box sx={{ maxWidth: 800 }}>
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
					{lb.title}
				</Typography>
				<Button variant="outlined" component={Link} to={ROUTES.leaderboardList}>
					Back
				</Button>
				<Button
					variant="contained"
					component={Link}
					to={leaderboardEditPath(lb.id)}
				>
					Edit
				</Button>
			</Box>

			<Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
				<Typography variant="body2" color="text.secondary" gutterBottom>
					Description
				</Typography>
				<Typography paragraph sx={{ whiteSpace: "pre-wrap" }}>
					{lb.description || "—"}
				</Typography>
				<Box sx={{ display: "grid", gap: 1, gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
					<div>
						<Typography variant="caption" color="text.secondary">
							Status
						</Typography>
						<Typography>{LEADERBOARD_STATUS_FILTER_LABEL[lb.status]}</Typography>
					</div>
					<div>
						<Typography variant="caption" color="text.secondary">
							Scoring
						</Typography>
						<Typography>{lb.scoringType}</Typography>
					</div>
					<div>
						<Typography variant="caption" color="text.secondary">
							Max participants
						</Typography>
						<Typography>{lb.maxParticipants}</Typography>
					</div>
					<div>
						<Typography variant="caption" color="text.secondary">
							Start
						</Typography>
						<Typography>{new Date(lb.startDate).toLocaleString()}</Typography>
					</div>
					<div>
						<Typography variant="caption" color="text.secondary">
							End
						</Typography>
						<Typography>{new Date(lb.endDate).toLocaleString()}</Typography>
					</div>
					<div>
						<Typography variant="caption" color="text.secondary">
							Created
						</Typography>
						<Typography>{new Date(lb.createdAt).toLocaleString()}</Typography>
					</div>
					<div>
						<Typography variant="caption" color="text.secondary">
							Updated
						</Typography>
						<Typography>{new Date(lb.updatedAt).toLocaleString()}</Typography>
					</div>
				</Box>
			</Paper>

			<Typography variant="subtitle1" gutterBottom>
				Prizes
			</Typography>
			<TableContainer component={Paper} variant="outlined">
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>Rank</TableCell>
							<TableCell>Name</TableCell>
							<TableCell>Type</TableCell>
							<TableCell align="right">Amount</TableCell>
							<TableCell>Image</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{lb.prizes.map((p) => (
							<TableRow key={p.id}>
								<TableCell>{p.rank}</TableCell>
								<TableCell>{p.name}</TableCell>
								<TableCell>{p.type}</TableCell>
								<TableCell align="right">{p.amount}</TableCell>
								<TableCell>
									{p.imageUrl ? (
										<Box
											component="a"
											href={p.imageUrl}
											target="_blank"
											rel="noopener noreferrer"
											sx={{
												display: "inline-block",
												lineHeight: 0,
												borderRadius: 1,
												overflow: "hidden",
											}}
										>
											<Box
												component="img"
												src={p.imageUrl}
												alt={p.name ? `${p.name} prize` : `Prize rank ${p.rank}`}
												loading="lazy"
												sx={{
													display: "block",
													width: 72,
													height: 72,
													objectFit: "cover",
													bgcolor: "action.hover",
												}}
											/>
										</Box>
									) : (
										"—"
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
}

export default LeaderboardViewPage;
