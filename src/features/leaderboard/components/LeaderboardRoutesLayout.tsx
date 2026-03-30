import { Outlet } from "react-router-dom";
import { LeaderboardFeatureErrorBoundary } from "./LeaderboardFeatureErrorBoundary";

export function LeaderboardRoutesLayout() {
	return (
		<LeaderboardFeatureErrorBoundary>
			<Outlet />
		</LeaderboardFeatureErrorBoundary>
	);
}
