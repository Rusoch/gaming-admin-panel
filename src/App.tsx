import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppRouter from "./app/routes/AppRouter";
import { ToastProvider } from "@/shared/composables/toast";
import { appTheme } from "@/shared/theme/appTheme";

const queryClient = new QueryClient();

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider theme={appTheme}>
				<CssBaseline />
				<ToastProvider>
					<AppRouter />
				</ToastProvider>
			</ThemeProvider>
		</QueryClientProvider>
	);
}

export default App;
