import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "@/shared/components/layout/AppLayout";
import { ROUTES } from "@/shared/constants/routes";
import { LeaderboardRoutesLayout } from "@/features/leaderboard/components/LeaderboardRoutesLayout";
import LeaderboardPage from "@/features/leaderboard/pages/LeaderboardPage";
import LeaderboardCreateForm from "@/features/leaderboard/pages/LeaderboardCreateForm";
import LeaderboardViewPage from "@/features/leaderboard/pages/LeaderboardViewPage";
import RafflePAge from "@/features/raffle/pages/RafflePage";
import WheelPage from "@/features/wheel/WheelPage";
import DashboardPage from "@/shared/pages/DashboardPage";
import NotFoundPage from "@/shared/pages/NotFoundPage";

/** Child path segment(s) under `/` (dashboard uses `index: true`). */
function routePath(fullPath: string): string {
	return fullPath.replace(/^\//, "");
}

const appRouter = createBrowserRouter([
	{
		path: "/",
		element: <AppLayout />,
		children: [
			{ index: true, element: <DashboardPage /> },
			{
				element: <LeaderboardRoutesLayout />,
				children: [
					{
						path: routePath(ROUTES.leaderboardList),
						element: <LeaderboardPage />,
					},
					{
						path: routePath(ROUTES.leaderboardsCreate),
						element: <LeaderboardCreateForm />,
					},
					{
						path: routePath(ROUTES.leaderboardEditPattern),
						element: <LeaderboardCreateForm />,
					},
					{
						path: routePath(ROUTES.leaderboardDetailPattern),
						element: <LeaderboardViewPage />,
					},
				],
			},
			{ path: routePath(ROUTES.raffle), element: <RafflePAge /> },
			{ path: routePath(ROUTES.wheel), element: <WheelPage /> },
			{ path: "*", element: <NotFoundPage /> },
		],
	},
]);

const AppRouter = () => <RouterProvider router={appRouter} />;

export default AppRouter;
