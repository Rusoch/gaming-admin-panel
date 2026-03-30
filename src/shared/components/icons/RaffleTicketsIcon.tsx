import SvgIcon, { type SvgIconProps } from "@mui/material/SvgIcon";

export function RaffleTicketsIcon(props: SvgIconProps) {
	return (
		<SvgIcon {...props} viewBox="0 0 24 24">
			<g
				fill="none"
				stroke="currentColor"
				strokeWidth="1.25"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<rect
					x="3.5"
					y="8.5"
					width="10.5"
					height="7.5"
					rx="1.25"
					transform="rotate(-11 8.75 12.25)"
				/>
				<line
					x1="4.8"
					y1="12.25"
					x2="12.7"
					y2="12.25"
					strokeDasharray="1.5 2"
					transform="rotate(-11 8.75 12.25)"
				/>
				<rect
					x="9"
					y="6"
					width="10.5"
					height="7.5"
					rx="1.25"
					transform="rotate(10 14.25 9.75)"
				/>
				<line
					x1="10.2"
					y1="9.75"
					x2="18.2"
					y2="9.75"
					strokeDasharray="1.5 2"
					transform="rotate(10 14.25 9.75)"
				/>
			</g>
		</SvgIcon>
	);
}
