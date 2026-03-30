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

	const raffleBase: AppBreadcrumbItem[] = [
		{ label: "Dashboard", to: ROUTES.dashboard },
		{ label: "Raffles", to: ROUTES.raffleList },
	];

	if (path === ROUTES.raffleList) {
		return [...raffleBase.slice(0, -1), { label: "Raffles" }];
	}

	if (path === ROUTES.rafflesCreate) {
		return [...raffleBase, { label: "Create" }];
	}

	const raffleEditMatch = /^\/raffles\/([^/]+)\/edit$/.exec(path);
	if (raffleEditMatch) {
		return [...raffleBase, { label: "Edit" }];
	}

	const raffleDetailMatch = /^\/raffles\/([^/]+)$/.exec(path);
	if (raffleDetailMatch?.[1] && raffleDetailMatch[1] !== "create") {
		return [...raffleBase, { label: "Details" }];
	}

	const wheelBase: AppBreadcrumbItem[] = [
		{ label: "Dashboard", to: ROUTES.dashboard },
		{ label: "Wheels", to: ROUTES.wheelList },
	];

	if (path === ROUTES.wheelList) {
		return [...wheelBase.slice(0, -1), { label: "Wheels" }];
	}

	if (path === ROUTES.wheelsCreate) {
		return [...wheelBase, { label: "Create" }];
	}

	const wheelEditMatch = /^\/wheels\/([^/]+)\/edit$/.exec(path);
	if (wheelEditMatch) {
		return [...wheelBase, { label: "Edit" }];
	}

	const wheelDetailMatch = /^\/wheels\/([^/]+)$/.exec(path);
	if (wheelDetailMatch?.[1] && wheelDetailMatch[1] !== "create") {
		return [...wheelBase, { label: "Details" }];
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
