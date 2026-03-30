import { Outlet } from "react-router-dom";
import { WheelErrorBoundary } from "./WheelErrorBoundary";

export function WheelRoutesLayout() {
	return (
		<WheelErrorBoundary>
			<Outlet />
		</WheelErrorBoundary>
	);
}
