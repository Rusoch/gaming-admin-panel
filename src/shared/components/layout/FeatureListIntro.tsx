import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import type { SxProps, Theme, TypographyProps } from "@mui/material";

export interface FeatureListIntroProps {
	title: string;
	description: string;
	action?: ReactNode;
	descriptionVariant?: TypographyProps["variant"];
	descriptionSx?: SxProps<Theme>;
}

export function FeatureListIntro({
	title,
	description,
	action,
	descriptionVariant = "body1",
	descriptionSx,
}: FeatureListIntroProps) {
	return (
		<Box
			sx={{
				display: "flex",
				flexWrap: "wrap",
				alignItems: "flex-start",
				justifyContent: "space-between",
				gap: 2,
				mb: 3,
			}}
		>
			<Box sx={{ flex: "1 1 280px", minWidth: 0 }}>
				<Box
					component="h1"
					sx={{
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						m: 0,
						px: 2.75,
						py: 1,
						borderRadius: 9999,
						bgcolor: "primary.main",
						color: "primary.contrastText",
						fontWeight: 700,
						fontSize: "0.875rem",
						lineHeight: 1.2,
						letterSpacing: "0.02em",
						fontFamily: "inherit",
					}}
				>
					{title}
				</Box>
				<Typography
					variant={descriptionVariant}
					color="text.secondary"
					sx={{
						mt: 1.75,
						maxWidth: 640,
						lineHeight: 1.65,
						...descriptionSx,
					}}
				>
					{description}
				</Typography>
			</Box>
			{action ? (
				<Box sx={{ flex: "0 0 auto", alignSelf: { xs: "stretch", sm: "flex-start" } }}>
					{action}
				</Box>
			) : null}
		</Box>
	);
}
