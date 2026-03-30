import { Box, Typography } from "@mui/material";
import { WheelForm } from "../components/WheelForm";

function WheelCreatePage() {
	return (
		<Box>
			<Typography variant="h5" component="h1" gutterBottom>
				Create wheel
			</Typography>
			<WheelForm mode="create" />
		</Box>
	);
}

export default WheelCreatePage;
