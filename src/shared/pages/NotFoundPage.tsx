import { Box, Button, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";

const NotFoundPage = () => {
	return (
		<Box sx={{ py: 4 }}>
			<Typography variant="h4" component="h1" gutterBottom>
				Page not found
			</Typography>
			<Typography color="text.secondary" sx={{ mb: 2 }}>
				This path does not match any page in the app.
			</Typography>
			<Button component={RouterLink} to={ROUTES.dashboard} variant="contained">
				Go to dashboard
			</Button>
		</Box>
	);
};

export default NotFoundPage;
