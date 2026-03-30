import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Alert, Box, Button, Typography } from "@mui/material";
import { ROUTES } from "@/shared/constants/routes";

interface Props {
	children: ReactNode;
}

interface State {
	error: Error | null;
}

export class WheelErrorBoundary extends Component<Props, State> {
	state: State = { error: null };

	static getDerivedStateFromError(error: Error): State {
		return { error };
	}

	componentDidCatch(error: Error, info: ErrorInfo): void {
		console.error("[wheel]", error, info.componentStack);
	}

	handleReset = (): void => {
		this.setState({ error: null });
	};

	render(): ReactNode {
		if (this.state.error) {
			return (
				<Box sx={{ maxWidth: 560, py: 2 }}>
					<Typography variant="h5" component="h1" gutterBottom>
						Something went wrong
					</Typography>
					<Alert severity="error" sx={{ mb: 2 }}>
						{this.state.error.message}
					</Alert>
					<Button
						variant="contained"
						component={Link}
						to={ROUTES.wheelList}
						sx={{ mr: 1 }}
					>
						Back to wheels
					</Button>
					<Button type="button" variant="outlined" onClick={this.handleReset}>
						Try again
					</Button>
				</Box>
			);
		}
		return this.props.children;
	}
}
