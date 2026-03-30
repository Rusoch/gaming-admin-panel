import {
	Box,
	Drawer,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from "@mui/material";
import { Link, Outlet } from "react-router-dom";
import { APP_SIDEBAR_NAV_ITEMS } from "@/shared/constants/appNavConfig";
import AppTopBar from "./AppTopBar";

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
					{APP_SIDEBAR_NAV_ITEMS.map(({ to, label, Icon, iconSx }) => (
						<ListItem key={to} disablePadding>
							<ListItemButton component={Link} to={to}>
								<ListItemIcon
									sx={{
										minWidth: 40,
										...iconSx,
									}}
								>
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
