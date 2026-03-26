import { Box, Skeleton, Stack } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

const busy = {
	"aria-busy": true as const,
	"aria-label": "Loading",
};

type SkeletonBlockProps = {
	variant?: "text" | "rounded" | "rectangular";
	width?: string | number;
	height?: number;
	sx?: SxProps<Theme>;
};

export function SkeletonBlock({
	variant = "rounded",
	width = "100%",
	height = 20,
	sx,
}: SkeletonBlockProps) {
	return (
		<Skeleton
			variant={variant}
			width={width}
			height={height}
			animation="wave"
			sx={sx}
		/>
	);
}

export function SkeletonLines({ count = 5 }: { count?: number }) {
	return (
		<Stack spacing={1.5} {...busy}>
			{Array.from({ length: count }, (_, i) => (
				<SkeletonBlock
					key={i}
					height={i === count - 1 ? 16 : 22}
					width={i === count - 1 ? "55%" : "100%"}
				/>
			))}
		</Stack>
	);
}

export function PageSkeleton() {
	return (
		<Stack spacing={2} sx={{ width: "100%", py: 0.5 }} {...busy}>
			<SkeletonBlock variant="text" width="45%" height={38} />
			<SkeletonBlock height={140} />
			<SkeletonBlock variant="text" width="22%" height={26} />
			<SkeletonBlock height={200} />
		</Stack>
	);
}

export function ListPageSkeleton() {
	return (
		<Stack spacing={2} {...busy}>
			<SkeletonBlock variant="text" width="40%" height={36} />
			<Box display="flex" justifyContent="flex-end">
				<SkeletonBlock width={220} height={40} />
			</Box>
			<SkeletonBlock variant="text" width="30%" height={32} />
			<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
				<SkeletonBlock height={56} sx={{ flex: 1, maxWidth: 400 }} />
				<SkeletonBlock height={72} sx={{ flex: 1, maxWidth: 280 }} />
			</Stack>
			<SkeletonBlock height={300} />
		</Stack>
	);
}
