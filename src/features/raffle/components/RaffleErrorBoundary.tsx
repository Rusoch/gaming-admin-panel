import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Alert, Box, Button, Typography } from "@mui/material";
import { ROUTES } from "@/shared/constants/routes";

interface RaffleErrorBoundaryProps {
	children: ReactNode;
}

interface RaffleErrorBoundaryState {
	error: Error | null;
}

export class RaffleErrorBoundary extends Component<
	RaffleErrorBoundaryProps,
	RaffleErrorBoundaryState
> {
	state: RaffleErrorBoundaryState = { error: null };

	static getDerivedStateFromError(error: Error): RaffleErrorBoundaryState {
		return { error };
	}

	componentDidCatch(error: Error, info: ErrorInfo): void {
		console.error("[raffle]", error, info.componentStack);
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
						to={ROUTES.raffleList}
						sx={{ mr: 1 }}
					>
						Back to raffles
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
