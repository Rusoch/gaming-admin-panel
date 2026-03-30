import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Alert, Box, Button, Typography } from "@mui/material";
import { ROUTES } from "@/shared/constants/routes";

interface AppErrorBoundaryProps {
	children: ReactNode;
}

interface AppErrorBoundaryState {
	error: Error | null;
}

export class AppErrorBoundary extends Component<
	AppErrorBoundaryProps,
	AppErrorBoundaryState
> {
	state: AppErrorBoundaryState = { error: null };

	static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
		return { error };
	}

	componentDidCatch(error: Error, info: ErrorInfo): void {
		console.error("[app]", error, info.componentStack);
	}

	handleReset = (): void => {
		this.setState({ error: null });
	};

	render(): ReactNode {
		if (this.state.error) {
			return (
				<Box
					sx={{
						minHeight: "100vh",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						p: 2,
					}}
				>
					<Box sx={{ maxWidth: 480 }}>
						<Typography variant="h5" component="h1" gutterBottom>
							Something went wrong
						</Typography>
						<Alert severity="error" sx={{ mb: 2 }}>
							{this.state.error.message}
						</Alert>
						<Button
							variant="contained"
							component={Link}
							to={ROUTES.dashboard}
							sx={{ mr: 1 }}
						>
							Back to dashboard
						</Button>
						<Button type="button" variant="outlined" onClick={this.handleReset}>
							Try again
						</Button>
					</Box>
				</Box>
			);
		}
		return this.props.children;
	}
}
