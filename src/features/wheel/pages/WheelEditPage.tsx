import { Link, useParams } from "react-router-dom";
import { Alert, Box, Button, Typography } from "@mui/material";
import { WheelForm } from "../components/WheelForm";
import { ROUTES } from "@/shared/constants/routes";

function WheelEditPage() {
	const { id } = useParams<{ id: string }>();

	if (!id) {
		return (
			<Alert severity="error">
				Missing wheel id.{" "}
				<Button component={Link} to={ROUTES.wheelList} size="small">
					Back
				</Button>
			</Alert>
		);
	}

	return (
		<Box>
			<Typography variant="h5" component="h1" gutterBottom>
				Edit wheel
			</Typography>
			<WheelForm mode="edit" wheelId={id} />
		</Box>
	);
}

export default WheelEditPage;
