import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
	AppBar,
	Breadcrumbs,
	Link as MuiLink,
	Toolbar,
	Typography,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { getAppBreadcrumbs } from "./appBreadcrumbs";

const AppTopBar = () => {
	const { pathname } = useLocation();
	const items = useMemo(() => getAppBreadcrumbs(pathname), [pathname]);

	return (
		<AppBar
			position="sticky"
			color="inherit"
			elevation={0}
			sx={{
				borderBottom: 1,
				borderColor: "divider",
				backgroundColor: "background.paper",
			}}
		>
			<Toolbar
				variant="dense"
				sx={{
					minHeight: { xs: 48, sm: 52 },
					gap: 2,
					flexWrap: "wrap",
					py: 1,
				}}
			>
				<Typography
					variant="subtitle1"
					component="div"
					sx={{ fontWeight: 700, letterSpacing: 0.02, flexShrink: 0 }}
				>
					GamifyHub
				</Typography>
				<Breadcrumbs
					separator={<NavigateNextIcon fontSize="small" sx={{ mx: -0.25 }} />}
					aria-label="Breadcrumb navigation"
					sx={{ flex: 1, minWidth: 0, "& .MuiBreadcrumbs-ol": { flexWrap: "wrap" } }}
				>
					{items.map((item, index) => {
						const isLast = index === items.length - 1;
						if (isLast || item.to === undefined) {
							return (
								<Typography
									key={`${item.label}-${index}`}
									variant="body2"
									color="text.primary"
									fontWeight={isLast ? 600 : 400}
								>
									{item.label}
								</Typography>
							);
						}
						return (
							<MuiLink
								key={`${item.label}-${index}`}
								component={Link}
								to={item.to}
								underline="hover"
								color="inherit"
								variant="body2"
							>
								{item.label}
							</MuiLink>
						);
					})}
				</Breadcrumbs>
			</Toolbar>
		</AppBar>
	);
};

export default AppTopBar;
