import SvgIcon, { type SvgIconProps } from "@mui/material/SvgIcon";

export function LeaderboardPodiumIcon(props: SvgIconProps) {
	return (
		<SvgIcon {...props} viewBox="0 0 24 24">
			<g
				fill="none"
				stroke="currentColor"
				strokeWidth="1.35"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M12 3.2l1.35 2.75 3.02.44-2.19 2.13.52 3-2.7-1.42-2.7 1.42.52-3-2.19-2.13 3.02-.44z" />
				<rect x="8.25" y="10.25" width="7.5" height="10.75" rx="1.35" />
				<rect x="2.75" y="14.5" width="5.75" height="6.5" rx="1.2" />
				<rect x="15.5" y="16.25" width="5.75" height="4.75" rx="1.2" />
			</g>
		</SvgIcon>
	);
}
