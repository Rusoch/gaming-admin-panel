import { Box, Typography } from "@mui/material";
import { RaffleForm } from "../components/RaffleForm";

function RaffleCreatePage() {
	return (
		<Box>
			<Typography variant="h5" component="h1" gutterBottom>
				Create raffle
			</Typography>
			<RaffleForm mode="create" />
		</Box>
	);
}

export default RaffleCreatePage;
