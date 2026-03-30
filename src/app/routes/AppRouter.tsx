import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "@/shared/components/layout/AppLayout";
import { ROUTES } from "@/shared/constants/routes";
import { LeaderboardRoutesLayout } from "@/features/leaderboard/components/LeaderboardRoutesLayout";
import LeaderboardPage from "@/features/leaderboard/pages/LeaderboardPage";
import LeaderboardCreateForm from "@/features/leaderboard/pages/LeaderboardCreateForm";
import LeaderboardViewPage from "@/features/leaderboard/pages/LeaderboardViewPage";
import { RaffleRoutesLayout } from "@/features/raffle/components/RaffleRoutesLayout";
import RafflePage from "@/features/raffle/pages/RafflePage";
import RaffleCreatePage from "@/features/raffle/pages/RaffleCreatePage";
import RaffleEditPage from "@/features/raffle/pages/RaffleEditPage";
import RaffleDetailPage from "@/features/raffle/pages/RaffleDetailPage";
import { WheelRoutesLayout } from "@/features/wheel/components/WheelRoutesLayout";
import WheelPage from "@/features/wheel/pages/WheelPage";
import WheelCreatePage from "@/features/wheel/pages/WheelCreatePage";
import WheelEditPage from "@/features/wheel/pages/WheelEditPage";
import WheelDetailPage from "@/features/wheel/pages/WheelDetailPage";
import DashboardPage from "@/shared/pages/DashboardPage";
import NotFoundPage from "@/shared/pages/NotFoundPage";

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
			{
				element: <RaffleRoutesLayout />,
				children: [
					{
						path: routePath(ROUTES.raffleList),
						element: <RafflePage />,
					},
					{
						path: routePath(ROUTES.rafflesCreate),
						element: <RaffleCreatePage />,
					},
					{
						path: routePath(ROUTES.raffleEditPattern),
						element: <RaffleEditPage />,
					},
					{
						path: routePath(ROUTES.raffleDetailPattern),
						element: <RaffleDetailPage />,
					},
				],
			},
			{
				element: <WheelRoutesLayout />,
				children: [
					{
						path: routePath(ROUTES.wheelList),
						element: <WheelPage />,
					},
					{
						path: routePath(ROUTES.wheelsCreate),
						element: <WheelCreatePage />,
					},
					{
						path: routePath(ROUTES.wheelEditPattern),
						element: <WheelEditPage />,
					},
					{
						path: routePath(ROUTES.wheelDetailPattern),
						element: <WheelDetailPage />,
					},
				],
			},
			{ path: "*", element: <NotFoundPage /> },
		],
	},
]);

const AppRouter = () => (
	<RouterProvider
		router={appRouter}
		future={{ v7_startTransition: true }}
	/>
);

export default AppRouter;
