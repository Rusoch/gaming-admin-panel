import { Link, useParams } from "react-router-dom";
import { Alert, Box, Button, Typography } from "@mui/material";
import { RaffleForm } from "../components/RaffleForm";
import { useRaffle } from "../hooks/useRaffle";
import { PageSkeleton } from "@/shared/components/skeleton/AppSkeleton";
import { ROUTES, raffleDetailPath } from "@/shared/constants/routes";

function RaffleEditPage() {
	const { id } = useParams<{ id: string }>();
	const { data, isLoading, error } = useRaffle(id);

	if (!id) {
		return (
			<Alert severity="error">
				Missing raffle id.{" "}
				<Button component={Link} to={ROUTES.raffleList} size="small">
					Back
				</Button>
			</Alert>
		);
	}

	if (isLoading) {
		return (
			<Box sx={{ maxWidth: 720 }}>
				<PageSkeleton />
			</Box>
		);
	}

	if (error || !data) {
		return (
			<Alert severity="error">
				Unable to load this raffle.{" "}
				<Button component={Link} to={ROUTES.raffleList} size="small">
					Back to list
				</Button>
			</Alert>
		);
	}

	if (data.status === "drawn") {
		return (
			<Box sx={{ maxWidth: 560 }}>
				<Typography variant="h5" component="h1" gutterBottom>
					Edit raffle
				</Typography>
				<Alert severity="info" sx={{ mb: 2 }}>
					This raffle has already been drawn and cannot be edited.
				</Alert>
				<Button component={Link} variant="contained" to={raffleDetailPath(data.id)}>
					View details
				</Button>
				<Button component={Link} to={ROUTES.raffleList} sx={{ ml: 1 }}>
					Back to list
				</Button>
			</Box>
		);
	}

	return (
		<Box>
			<Typography variant="h5" component="h1" gutterBottom>
				Edit raffle
			</Typography>
			<RaffleForm mode="edit" raffleId={id} />
		</Box>
	);
}

export default RaffleEditPage;
