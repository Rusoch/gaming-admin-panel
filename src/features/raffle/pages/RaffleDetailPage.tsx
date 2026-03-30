import { Link, useParams } from "react-router-dom";
import {
	Box,
	Button,
	ImageList,
	ImageListItem,
	ImageListItemBar,
	Paper,
	Typography,
} from "@mui/material";
import { PageSkeleton } from "@/shared/components/skeleton/AppSkeleton";
import { useRaffle } from "../hooks/useRaffle";
import { RaffleStatusChip } from "../components/RaffleStatusChip";
import {
	ROUTES,
	raffleEditPath,
} from "@/shared/constants/routes";

function RaffleDetailPage() {
	const { id } = useParams<{ id: string }>();
	const { data: raffle, isLoading, error } = useRaffle(id);

	if (!id) {
		return (
			<Box>
				<Typography color="error">Missing raffle id.</Typography>
				<Button component={Link} to={ROUTES.raffleList} sx={{ mt: 2 }}>
					Back to raffles
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

	if (error || !raffle) {
		return (
			<Box>
				<Typography color="error" gutterBottom>
					Unable to load this raffle.
				</Typography>
				<Button component={Link} to={ROUTES.raffleList}>
					Back to raffles
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
					{raffle.name}
				</Typography>
				<RaffleStatusChip status={raffle.status} />
				<Button variant="outlined" component={Link} to={ROUTES.raffleList}>
					Back
				</Button>
				<Button
					variant="contained"
					component={Link}
					to={raffleEditPath(raffle.id)}
					disabled={raffle.status === "drawn"}
				>
					Edit
				</Button>
			</Box>

			<Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
				<Typography variant="body2" color="text.secondary" gutterBottom>
					Description
				</Typography>
				<Typography paragraph sx={{ whiteSpace: "pre-wrap" }}>
					{raffle.description || "—"}
				</Typography>
				<Box
					sx={{
						display: "grid",
						gap: 1,
						gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
					}}
				>
					<div>
						<Typography variant="caption" color="text.secondary">
							Ticket price
						</Typography>
						<Typography>{raffle.ticketPrice.toFixed(2)}</Typography>
					</div>
					<div>
						<Typography variant="caption" color="text.secondary">
							Max tickets / user
						</Typography>
						<Typography>{raffle.maxTicketsPerUser}</Typography>
					</div>
					<div>
						<Typography variant="caption" color="text.secondary">
							Total ticket limit
						</Typography>
						<Typography>
							{raffle.totalTicketLimit == null
								? "Unlimited"
								: raffle.totalTicketLimit}
						</Typography>
					</div>
					<div>
						<Typography variant="caption" color="text.secondary">
							Start
						</Typography>
						<Typography>
							{new Date(raffle.startDate).toLocaleString()}
						</Typography>
					</div>
					<div>
						<Typography variant="caption" color="text.secondary">
							End
						</Typography>
						<Typography>{new Date(raffle.endDate).toLocaleString()}</Typography>
					</div>
					<div>
						<Typography variant="caption" color="text.secondary">
							Draw
						</Typography>
						<Typography>{new Date(raffle.drawDate).toLocaleString()}</Typography>
					</div>
					<div>
						<Typography variant="caption" color="text.secondary">
							Created
						</Typography>
						<Typography>
							{new Date(raffle.createdAt).toLocaleString()}
						</Typography>
					</div>
					<div>
						<Typography variant="caption" color="text.secondary">
							Updated
						</Typography>
						<Typography>
							{new Date(raffle.updatedAt).toLocaleString()}
						</Typography>
					</div>
				</Box>
			</Paper>

			<Typography variant="subtitle1" gutterBottom>
				Prize gallery
			</Typography>
			{raffle.prizes.length === 0 ? (
				<Typography color="text.secondary">No prizes configured.</Typography>
			) : (
				<ImageList
					variant="masonry"
					cols={3}
					gap={12}
					sx={{ width: "100%", mb: 2 }}
				>
					{raffle.prizes.map((p) => (
						<ImageListItem key={p.id}>
							<Box
								component="img"
								src={p.imageUrl || "https://placehold.co/320x200?text=Prize"}
								alt={p.name}
								loading="lazy"
								sx={{
									width: "100%",
									height: "auto",
									display: "block",
									borderRadius: 1,
									bgcolor: "action.hover",
									objectFit: "cover",
									maxHeight: 220,
								}}
							/>
							<ImageListItemBar
								title={p.name}
								subtitle={`${p.type} ×${p.quantity} · ${p.amount}`}
							/>
						</ImageListItem>
					))}
				</ImageList>
			)}
		</Box>
	);
}

export default RaffleDetailPage;
