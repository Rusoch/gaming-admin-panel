import { Outlet } from "react-router-dom";
import { RaffleErrorBoundary } from "./RaffleErrorBoundary";

export function RaffleRoutesLayout() {
	return (
		<RaffleErrorBoundary>
			<Outlet />
		</RaffleErrorBoundary>
	);
}
