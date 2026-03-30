import SvgIcon, { type SvgIconProps } from "@mui/material/SvgIcon";

const SALMON = "#ef9a9a";
const LAVENDER = "#ce93d8";
const POINTER = "#66bb6a";
const RIM = "#ffffff";
const HUB = "#42a5f5";

function wedge(
	cx: number,
	cy: number,
	r: number,
	a0: number,
	a1: number,
): string {
	const x0 = cx + r * Math.cos(a0);
	const y0 = cy + r * Math.sin(a0);
	const x1 = cx + r * Math.cos(a1);
	const y1 = cy + r * Math.sin(a1);
	const large = a1 - a0 > Math.PI ? 1 : 0;
	return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
}

export function SpinWheelNavIcon(props: SvgIconProps) {
	const cx = 12;
	const cy = 12;
	const r = 9;
	const n = 10;
	const step = (2 * Math.PI) / n;
	const start = -Math.PI / 2 - step / 2;
	const wedgePaths: string[] = [];
	for (let i = 0; i < n; i++) {
		const a0 = start + i * step;
		const a1 = a0 + step;
		wedgePaths.push(wedge(cx, cy, r, a0, a1));
	}
	const dots = [];
	for (let i = 0; i < n; i++) {
		const a = start + i * step;
		const rd = r + 0.85;
		dots.push(
			<circle
				key={`d-${i}`}
				cx={cx + rd * Math.cos(a)}
				cy={cy + rd * Math.sin(a)}
				r={0.45}
				fill="#5c5c5c"
				opacity={0.55}
			/>,
		);
	}
	return (
		<SvgIcon {...props} viewBox="0 0 24 24">
			<circle cx={cx} cy={cy} r={r + 1.15} fill={RIM} opacity={0.95} />
			{wedgePaths.map((d, i) => (
				<path
					key={`w-${i}`}
					d={d}
					fill={i % 2 === 0 ? SALMON : LAVENDER}
					stroke="#fff"
					strokeWidth={0.35}
				/>
			))}
			<circle cx={cx} cy={cy} r={r + 1.15} fill="none" stroke="#e0e0e0" strokeWidth={0.6} />
			{dots}
			<polygon
				points="21.2,11.3 21.2,12.7 17.4,12"
				fill={POINTER}
				stroke="#2e7d32"
				strokeWidth={0.2}
			/>
			<circle cx={cx} cy={cy} r={3.2} fill={HUB} stroke="#fff" strokeWidth={0.45} />
			<text
				x={cx}
				y={cy + 1.1}
				textAnchor="middle"
				fontSize="3.2"
				fontWeight={700}
				fill="#fff"
				style={{ fontFamily: "system-ui, sans-serif" }}
			>
				↻
			</text>
		</SvgIcon>
	);
}
