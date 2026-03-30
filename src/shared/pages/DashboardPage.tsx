import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
	Box,
	Card,
	CardActionArea,
	CardContent,
	Typography,
} from "@mui/material";
import { DASHBOARD_FEATURE_CARD_ITEMS } from "@/shared/constants/appNavConfig";

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
						<Typography variant="h6" component="h2" color="primary">
							{title}
						</Typography>
					</Box>
					<Typography
						variant="body1"
						color="text.secondary"
						sx={{
							fontSize: "1.0625rem",
							lineHeight: 1.75,
						}}
					>
						{description}
					</Typography>
				</CardContent>
			</CardActionArea>
		</Card>
	);
}

const FEATURES: readonly DashboardFeatureDefinition[] =
	DASHBOARD_FEATURE_CARD_ITEMS.map(
		({ to, title, description, Icon, cardIconSx }) => ({
			to,
			title,
			description,
			icon: <Icon sx={cardIconSx} />,
		}),
	);

function DashboardPage() {
	return (
		<Box>
			<Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
				Dashboard
			</Typography>
			<Typography color="text.secondary" sx={{ mb: 3, maxWidth: 640 }}>
				Choose a gaming feature to configure. Each area is independent. Open a
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
