import {
	Box,
	Drawer,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from "@mui/material";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import type { ComponentType } from "react";
import CasinoOutlinedIcon from "@mui/icons-material/CasinoOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import { Link, Outlet } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";
import AppTopBar from "./AppTopBar";

interface AppNavItem {
	readonly to: string;
	readonly label: string;
	readonly Icon: ComponentType<SvgIconProps>;
}

const APP_NAV_ITEMS: readonly AppNavItem[] = [
	{ to: ROUTES.dashboard, label: "Dashboard", Icon: DashboardOutlinedIcon },
	{ to: ROUTES.leaderboardList, label: "Leaderboard", Icon: EmojiEventsOutlinedIcon },
	{ to: ROUTES.raffle, label: "Raffle", Icon: ConfirmationNumberOutlinedIcon },
	{ to: ROUTES.wheel, label: "Wheel", Icon: CasinoOutlinedIcon },
];

const navListItemIconSx = { minWidth: 40, color: "primary.main" } as const;

const AppLayout = () => {
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "stretch",
				minHeight: "100vh",
			}}
		>
			<Drawer
				variant="permanent"
				anchor="left"
				sx={{
					flexShrink: 0,
					width: "auto",
					"& .MuiDrawer-paper": {
						position: "relative",
						height: "100%",
						minHeight: "100vh",
						width: "auto",
						minWidth: 152,
						maxWidth: 280,
						boxSizing: "border-box",
						whiteSpace: "nowrap",
					},
				}}
			>
				<List dense disablePadding sx={{ py: 1.5, px: 1 }}>
					{APP_NAV_ITEMS.map(({ to, label, Icon }) => (
						<ListItem key={to} disablePadding>
							<ListItemButton component={Link} to={to}>
								<ListItemIcon sx={navListItemIconSx}>
									<Icon fontSize="small" />
								</ListItemIcon>
								<ListItemText primary={label} />
							</ListItemButton>
						</ListItem>
					))}
				</List>
			</Drawer>

			<Box
				component="main"
				sx={{
					flex: 1,
					minWidth: 0,
					display: "flex",
					flexDirection: "column",
					alignItems: "stretch",
				}}
			>
				<AppTopBar />
				<Box
					sx={{
						flex: 1,
						minWidth: 0,
						px: 2,
						py: 2,
					}}
				>
					<Outlet />
				</Box>
			</Box>
		</Box>
	);
};

export default AppLayout;
