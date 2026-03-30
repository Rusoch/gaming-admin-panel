import { useMemo } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppRouter from "./app/routes/AppRouter";
import { AppErrorBoundary } from "@/shared/components/AppErrorBoundary";
import { ColorModeProvider, useColorMode } from "@/shared/hooks/colorMode";
import { ToastProvider } from "@/shared/hooks/toast";
import { createAppTheme } from "@/shared/theme/appTheme";

const queryClient = new QueryClient();

function ThemedShell() {
	const { mode } = useColorMode();
	const theme = useMemo(() => createAppTheme(mode), [mode]);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline enableColorScheme />
			<ToastProvider>
				<AppErrorBoundary>
					<AppRouter />
				</AppErrorBoundary>
			</ToastProvider>
		</ThemeProvider>
	);
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<ColorModeProvider>
				<ThemedShell />
			</ColorModeProvider>
		</QueryClientProvider>
	);
}

export default App;
