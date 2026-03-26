/**
 * Client-side route paths for `<Route path>`, `Link`, and `navigate`.
 * API URLs stay in feature API modules.
 */
export const ROUTES = {
	/** Landing dashboard (feature hub). */
	dashboard: "/",
	leaderboardList: "/leaderboard",
	leaderboardsCreate: "/leaderboards/create",
	/** Use with `<Route>` — not for `Link`/`navigate`. */
	leaderboardDetailPattern: "/leaderboards/:id",
	leaderboardEditPattern: "/leaderboards/:id/edit",
	raffle: "/raffle",
	wheel: "/wheel",
} as const;

export function leaderboardDetailPath(id: string): string {
	return `/leaderboards/${encodeURIComponent(id)}`;
}

export function leaderboardEditPath(id: string): string {
	return `/leaderboards/${encodeURIComponent(id)}/edit`;
}
