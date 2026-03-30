export const ROUTES = {
	dashboard: "/",
	leaderboardList: "/leaderboard",
	leaderboardsCreate: "/leaderboards/create",
	leaderboardDetailPattern: "/leaderboards/:id",
	leaderboardEditPattern: "/leaderboards/:id/edit",
	raffleList: "/raffles",
	rafflesCreate: "/raffles/create",
	raffleDetailPattern: "/raffles/:id",
	raffleEditPattern: "/raffles/:id/edit",
	wheelList: "/wheels",
	wheelsCreate: "/wheels/create",
	wheelDetailPattern: "/wheels/:id",
	wheelEditPattern: "/wheels/:id/edit",
} as const;

export function leaderboardDetailPath(id: string): string {
	return `/leaderboards/${encodeURIComponent(id)}`;
}

export function leaderboardEditPath(id: string): string {
	return `/leaderboards/${encodeURIComponent(id)}/edit`;
}

export function raffleDetailPath(id: string): string {
	return `/raffles/${encodeURIComponent(id)}`;
}

export function raffleEditPath(id: string): string {
	return `/raffles/${encodeURIComponent(id)}/edit`;
}

export function wheelDetailPath(id: string): string {
	return `/wheels/${encodeURIComponent(id)}`;
}

export function wheelEditPath(id: string): string {
	return `/wheels/${encodeURIComponent(id)}/edit`;
}
