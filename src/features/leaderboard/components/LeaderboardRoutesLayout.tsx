import { Outlet } from "react-router-dom";
import { LeaderboardFeatureErrorBoundary } from "./LeaderboardFeatureErrorBoundary";

/** Pathless layout: wraps all leaderboard routes in a feature error boundary. */
export function LeaderboardRoutesLayout() {
	return (
		<LeaderboardFeatureErrorBoundary>
			<Outlet />
		</LeaderboardFeatureErrorBoundary>
	);
}
