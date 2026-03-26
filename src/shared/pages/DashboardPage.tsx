import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
	Box,
	Card,
	CardActionArea,
	CardContent,
	Typography,
} from "@mui/material";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import CasinoOutlinedIcon from "@mui/icons-material/CasinoOutlined";
import { ROUTES } from "@/shared/constants/routes";

interface DashboardFeatureDefinition {
	title: string;
	description: string;
	to: string;
	icon: ReactNode;
}

function DashboardFeatureCard({
	title,
	description,
	to,
	icon,
}: DashboardFeatureDefinition) {
	return (
		<Card
			variant="outlined"
			sx={{
				height: "100%",
				transition: "box-shadow 0.2s ease, border-color 0.2s ease",
				"&:hover": {
					boxShadow: 2,
					borderColor: "primary.light",
				},
			}}
		>
			<CardActionArea
				component={RouterLink}
				to={to}
				sx={{
					height: "100%",
					alignItems: "stretch",
					display: "flex",
					flexDirection: "column",
					justifyContent: "flex-start",
				}}
			>
				<CardContent sx={{ flex: 1, width: "100%" }}>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 1.5,
							mb: 1.5,
							color: "primary.main",
						}}
					>
						<Box
							aria-hidden
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								width: 48,
								height: 48,
								borderRadius: 1,
								bgcolor: "action.hover",
							}}
						>
							{icon}
						</Box>
						<Typography variant="h6" component="h2">
							{title}
						</Typography>
					</Box>
					<Typography variant="body2" color="text.secondary">
						{description}
					</Typography>
				</CardContent>
			</CardActionArea>
		</Card>
	);
}

const FEATURES: readonly DashboardFeatureDefinition[] = [
		{
			title: "Leaderboards",
			description:
				"Create and manage competitive leaderboards, prizes, and participant limits.",
			to: ROUTES.leaderboardList,
			icon: <EmojiEventsOutlinedIcon fontSize="large" />,
		},
		{
			title: "Raffles",
			description:
				"Configure ticket-based raffles, prize tiers, and draw schedules.",
			to: ROUTES.raffle,
			icon: <ConfirmationNumberOutlinedIcon fontSize="large" />,
		},
		{
			title: "Spin wheels",
			description:
				"Build weighted wheel segments, costs, and spin limits for players.",
			to: ROUTES.wheel,
			icon: <CasinoOutlinedIcon fontSize="large" />,
		},
	];

function DashboardPage() {
	return (
		<Box>
			<Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
				Dashboard
			</Typography>
			<Typography color="text.secondary" sx={{ mb: 3, maxWidth: 640 }}>
				Choose a gaming feature to configure. Each area is independent—open the
				card to go straight to that module.
			</Typography>
			<Box
				sx={{
					display: "grid",
					gap: 3,
					gridTemplateColumns: {
						xs: "1fr",
						sm: "repeat(2, 1fr)",
						lg: "repeat(3, 1fr)",
					},
					maxWidth: 1200,
				}}
			>
				{FEATURES.map((f) => (
					<DashboardFeatureCard
						key={f.to}
						title={f.title}
						description={f.description}
						to={f.to}
						icon={f.icon}
					/>
				))}
			</Box>
		</Box>
	);
}

export default DashboardPage;
