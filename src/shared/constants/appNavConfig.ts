import type { ComponentType } from "react";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import { DashboardOutlined as DashboardOutlinedIcon } from "@mui/icons-material";
import { LeaderboardPodiumIcon } from "@/shared/components/icons/LeaderboardPodiumIcon";
import { RaffleTicketsIcon } from "@/shared/components/icons/RaffleTicketsIcon";
import { SpinWheelNavIcon } from "@/shared/components/icons/SpinWheelNavIcon";
import {
	LEADERBOARD_FEATURE_DESCRIPTION,
	RAFFLE_FEATURE_DESCRIPTION,
	WHEEL_FEATURE_DESCRIPTION,
} from "@/shared/constants/featureCopy";
import { ROUTES } from "@/shared/constants/routes";

export const APP_NAV_LEADERBOARD_COLOR = "#ff6b35";

interface GamingFeatureNavDefinition {
	readonly to: string;
	readonly sidebarLabel: string;
	readonly dashboardTitle: string;
	readonly description: string;
	readonly Icon: ComponentType<SvgIconProps>;
	readonly sidebarIconSx: object;
	readonly dashboardCardIconSx: object;
}

const GAMING_FEATURES: readonly GamingFeatureNavDefinition[] = [
	{
		to: ROUTES.leaderboardList,
		sidebarLabel: "Leaderboard",
		dashboardTitle: "Leaderboards",
		description: LEADERBOARD_FEATURE_DESCRIPTION,
		Icon: LeaderboardPodiumIcon,
		sidebarIconSx: { color: APP_NAV_LEADERBOARD_COLOR },
		dashboardCardIconSx: { fontSize: 36, color: APP_NAV_LEADERBOARD_COLOR },
	},
	{
		to: ROUTES.raffleList,
		sidebarLabel: "Raffle",
		dashboardTitle: "Raffles",
		description: RAFFLE_FEATURE_DESCRIPTION,
		Icon: RaffleTicketsIcon,
		sidebarIconSx: { color: "primary.main" },
		dashboardCardIconSx: { fontSize: 36, color: "primary.main" },
	},
	{
		to: ROUTES.wheelList,
		sidebarLabel: "Wheel",
		dashboardTitle: "Spin wheels",
		description: WHEEL_FEATURE_DESCRIPTION,
		Icon: SpinWheelNavIcon,
		sidebarIconSx: { minWidth: 40 },
		dashboardCardIconSx: { fontSize: 40 },
	},
] as const;

export interface AppSidebarNavItem {
	readonly to: string;
	readonly label: string;
	readonly Icon: ComponentType<SvgIconProps>;
	readonly iconSx?: object;
}

export const APP_SIDEBAR_NAV_ITEMS: readonly AppSidebarNavItem[] = [
	{
		to: ROUTES.dashboard,
		label: "Dashboard",
		Icon: DashboardOutlinedIcon,
		iconSx: { color: "primary.main" },
	},
	...GAMING_FEATURES.map((f) => ({
		to: f.to,
		label: f.sidebarLabel,
		Icon: f.Icon,
		iconSx: f.sidebarIconSx,
	})),
];

export interface DashboardFeatureCardDefinition {
	readonly to: string;
	readonly title: string;
	readonly description: string;
	readonly Icon: ComponentType<SvgIconProps>;
	readonly cardIconSx: object;
}

export const DASHBOARD_FEATURE_CARD_ITEMS: readonly DashboardFeatureCardDefinition[] =
	GAMING_FEATURES.map((f) => ({
		to: f.to,
		title: f.dashboardTitle,
		description: f.description,
		Icon: f.Icon,
		cardIconSx: f.dashboardCardIconSx,
	}));
