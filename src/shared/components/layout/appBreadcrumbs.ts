import { ROUTES } from "@/shared/constants/routes";

export interface AppBreadcrumbItem {
	label: string;
	to?: string;
}

export function getAppBreadcrumbs(pathname: string): AppBreadcrumbItem[] {
	const path =
		pathname.length > 1 && pathname.endsWith("/")
			? pathname.slice(0, -1)
			: pathname;

	if (path === ROUTES.dashboard) {
		return [{ label: "Dashboard" }];
	}

	if (path === ROUTES.raffle) {
		return [
			{ label: "Dashboard", to: ROUTES.dashboard },
			{ label: "Raffle" },
		];
	}
	if (path === ROUTES.wheel) {
		return [
			{ label: "Dashboard", to: ROUTES.dashboard },
			{ label: "Wheel" },
		];
	}

	const leaderboardBase: AppBreadcrumbItem[] = [
		{ label: "Dashboard", to: ROUTES.dashboard },
		{ label: "Leaderboards", to: ROUTES.leaderboardList },
	];

	if (path === ROUTES.leaderboardList) {
		return [
			{ label: "Dashboard", to: ROUTES.dashboard },
			{ label: "Leaderboards" },
		];
	}

	if (path === ROUTES.leaderboardsCreate) {
		return [...leaderboardBase, { label: "Create" }];
	}

	const editMatch = /^\/leaderboards\/([^/]+)\/edit$/.exec(path);
	if (editMatch) {
		return [...leaderboardBase, { label: "Edit" }];
	}

	const detailMatch = /^\/leaderboards\/([^/]+)$/.exec(path);
	if (detailMatch?.[1] && detailMatch[1] !== "create") {
		return [...leaderboardBase, { label: "Details" }];
	}

	return [
		{ label: "Dashboard", to: ROUTES.dashboard },
		{ label: "Page not found" },
	];
}
