import { Box, Typography } from "@mui/material";
import {
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
	type KeyboardEvent,
} from "react";
import type { WheelSegment } from "../types/wheel.types";

export interface WheelPreviewProps {
	segments: Pick<WheelSegment, "label" | "color" | "weight">[];
	size?: number;
	backgroundColor?: string;
	borderColor?: string;
	title?: string;
}

const VB = 200;
const CX = 100;
const CY = 100;
const R_PIE = 78;
const R_RIM = 88;
const RIM_STROKE = 15;
const R_BULBS = 88;
const N_BULBS = 42;
const R_HUB_OUT = 13;
const R_HUB_IN = 5;

const SPIN_MS_MIN = 3800;
const SPIN_MS_MAX = 5200;
const FULL_SPINS_MIN = 4;
const FULL_SPINS_MAX = 7;

function easeOutCubic(t: number): number {
	return 1 - (1 - t) ** 3;
}

function pickWeightedIndex(weights: readonly number[]): number {
	const total = weights.reduce((a, b) => a + b, 0);
	if (total <= 0) return 0;
	let u = Math.random() * total;
	for (let i = 0; i < weights.length; i++) {
		u -= weights[i]!;
		if (u < 0) return i;
	}
	return weights.length - 1;
}

function slicePath(
	cx: number,
	cy: number,
	r: number,
	t0: number,
	t1: number,
): string {
	const rad = (t: number) => t * 2 * Math.PI - Math.PI / 2;
	const a0 = rad(t0);
	const a1 = rad(t1);
	const x0 = cx + r * Math.cos(a0);
	const y0 = cy + r * Math.sin(a0);
	const x1 = cx + r * Math.cos(a1);
	const y1 = cy + r * Math.sin(a1);
	const largeArc = t1 - t0 > 0.5 ? 1 : 0;
	return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${largeArc} 1 ${x1} ${y1} Z`;
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
	const h = hex.trim().replace(/^#/, "");
	if (h.length === 3) {
		const r = parseInt(h[0] + h[0], 16);
		const g = parseInt(h[1] + h[1], 16);
		const b = parseInt(h[2] + h[2], 16);
		return { r, g, b };
	}
	if (h.length === 6 && /^[a-f\d]+$/i.test(h)) {
		return {
			r: parseInt(h.slice(0, 2), 16),
			g: parseInt(h.slice(2, 4), 16),
			b: parseInt(h.slice(4, 6), 16),
		};
	}
	return null;
}

function rgbToHex(r: number, g: number, b: number): string {
	const c = (n: number) =>
		Math.max(0, Math.min(255, Math.round(n)))
			.toString(16)
			.padStart(2, "0");
	return `#${c(r)}${c(g)}${c(b)}`;
}

function mix(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

function shade(hex: string, t: number): string {
	const rgb = parseHex(hex);
	if (!rgb) return "#888888";
	const f = (c: number) =>
		t >= 0 ? mix(c, 255, t) : mix(c, 0, -t);
	return rgbToHex(f(rgb.r), f(rgb.g), f(rgb.b));
}

function labelFillForSegment(hex: string): string {
	const rgb = parseHex(hex);
	if (!rgb) return "#2a1508";
	const L = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
	return L > 165 ? "#3d2814" : "#f4d03f";
}

function labelStrokeForSegment(hex: string): string {
	const rgb = parseHex(hex);
	if (!rgb) return "rgba(0,0,0,0.35)";
	const L = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
	return L > 165 ? "rgba(255,255,255,0.5)" : "rgba(60,30,10,0.65)";
}

export function WheelPreview({
	segments,
	size = 280,
	backgroundColor = "#1a0a0c",
	borderColor = "#8b1538",
	title = "Preview",
}: WheelPreviewProps) {
	const uid = useId().replace(/:/g, "");
	const [rotationDeg, setRotationDeg] = useState(0);
	const [isSpinning, setIsSpinning] = useState(false);
	const [lastWinner, setLastWinner] = useState<string | null>(null);
	const [hubHover, setHubHover] = useState(false);
	const rafRef = useRef<number>(0);
	const rotationRef = useRef(0);

	useEffect(() => {
		rotationRef.current = rotationDeg;
	}, [rotationDeg]);

	useEffect(
		() => () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		},
		[],
	);

	const { prefix, totalW } = useMemo(() => {
		if (segments.length === 0) {
			return { prefix: [] as number[], totalW: 1 };
		}
		const tw = segments.reduce((s, x) => s + x.weight, 0) || 1;
		const pref: number[] = [];
		let s = 0;
		for (const seg of segments) {
			pref.push(s);
			s += seg.weight;
		}
		return { prefix: pref, totalW: tw };
	}, [segments]);

	const angleAt = (t: number) => t * 2 * Math.PI - Math.PI / 2;

	const startSpin = useCallback(() => {
		if (isSpinning || segments.length === 0) return;
		if (rafRef.current) cancelAnimationFrame(rafRef.current);

		const weights = segments.map((s) => s.weight);
		const winIdx = pickWeightedIndex(weights);
		const tMid =
			(prefix[winIdx]! + weights[winIdx]! / 2) / totalW;
		const S = tMid * 360;
		const RAligned = (360 - (S % 360)) % 360;

		const from = rotationRef.current;
		const rCur = ((from % 360) + 360) % 360;
		const delta = (RAligned - rCur + 360) % 360;
		const fullSpins =
			FULL_SPINS_MIN +
			Math.floor(Math.random() * (FULL_SPINS_MAX - FULL_SPINS_MIN + 1));
		const to = from + fullSpins * 360 + delta;

		const duration =
			SPIN_MS_MIN + Math.random() * (SPIN_MS_MAX - SPIN_MS_MIN);
		const start = performance.now();

		setIsSpinning(true);
		setLastWinner(null);

		const tick = (now: number) => {
			const t = Math.min(1, (now - start) / duration);
			const eased = easeOutCubic(t);
			const next = from + (to - from) * eased;
			setRotationDeg(next);
			if (t < 1) {
				rafRef.current = requestAnimationFrame(tick);
			} else {
				rafRef.current = 0;
				setIsSpinning(false);
				setLastWinner(segments[winIdx]!.label);
			}
		};
		rafRef.current = requestAnimationFrame(tick);
	}, [isSpinning, segments, prefix, totalW]);

	if (segments.length === 0) {
		return (
			<Box sx={{ textAlign: "center", p: 2 }}>
				{title ? (
					<Typography variant="subtitle2" color="text.secondary" gutterBottom>
						{title}
					</Typography>
				) : null}
				<Typography variant="body2" color="text.secondary">
					Add segments to see the wheel.
				</Typography>
			</Box>
		);
	}

	const onHubKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			startSpin();
		}
	};

	return (
		<Box
			sx={{
				textAlign: "center",
				display: "inline-block",
				p: 2,
				borderRadius: 3,
				background: `radial-gradient(ellipse 85% 75% at 50% 45%, ${shade(backgroundColor, 0.12)} 0%, ${shade(backgroundColor, -0.55)} 72%, ${shade(backgroundColor, -0.72)} 100%)`,
				boxShadow: `inset 0 0 60px rgba(0,0,0,0.45), 0 12px 40px rgba(0,0,0,0.35)`,
			}}
		>
			{title ? (
				<Typography
					variant="subtitle2"
					sx={{
						mb: 1.5,
						color: "rgba(255,228,180,0.92)",
						fontWeight: 700,
						letterSpacing: "0.06em",
						textTransform: "uppercase",
						fontSize: "0.7rem",
					}}
				>
					{title}
				</Typography>
			) : null}

			<Box
				component="svg"
				viewBox={`0 0 ${VB} ${VB}`}
				width={size}
				height={size}
				role="img"
				aria-label="Spin wheel: the triangle at the top shows the winning segment after a spin."
				sx={{
					display: "block",
					mx: "auto",
					filter: "drop-shadow(0 10px 24px rgba(220, 60, 40, 0.35))",
				}}
			>
				<defs>
					<filter id={`${uid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
						<feGaussianBlur stdDeviation="2.5" result="b" />
						<feMerge>
							<feMergeNode in="b" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
					<filter id={`${uid}-bulb`} x="-100%" y="-100%" width="300%" height="300%">
						<feGaussianBlur stdDeviation="1.2" result="blur" />
						<feMerge>
							<feMergeNode in="blur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
					<radialGradient id={`${uid}-hub`} cx="35%" cy="30%" r="65%">
						<stop offset="0%" stopColor="#fff8e7" />
						<stop offset="35%" stopColor="#d4af37" />
						<stop offset="70%" stopColor="#8b6914" />
						<stop offset="100%" stopColor="#3d2a0a" />
					</radialGradient>
					<radialGradient id={`${uid}-hub-hover`} cx="35%" cy="30%" r="65%">
						<stop offset="0%" stopColor="#fffef5" />
						<stop offset="35%" stopColor="#e8c547" />
						<stop offset="70%" stopColor="#9a7418" />
						<stop offset="100%" stopColor="#4a320c" />
					</radialGradient>
					<linearGradient id={`${uid}-pointer`} x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stopColor="#fff8dc" />
						<stop offset="45%" stopColor="#f4d03f" />
						<stop offset="100%" stopColor="#b8860b" />
					</linearGradient>
					{segments.map((seg, i) => {
						const t0 = prefix[i]! / totalW;
						const t1 = (prefix[i]! + seg.weight) / totalW;
						const mid = ((t0 + t1) / 2) * 2 * Math.PI - Math.PI / 2;
						const gx = CX + R_PIE * 0.38 * Math.cos(mid);
						const gy = CY + R_PIE * 0.38 * Math.sin(mid);
						const light = shade(seg.color, 0.42);
						const dark = shade(seg.color, -0.38);
						return (
							<radialGradient
								key={`g-${i}`}
								id={`${uid}-seg-${i}`}
								gradientUnits="userSpaceOnUse"
								cx={gx}
								cy={gy}
								r={R_PIE * 1.05}
								fx={gx}
								fy={gy}
							>
								<stop offset="0%" stopColor={light} stopOpacity={0.95} />
								<stop offset="45%" stopColor={seg.color} />
								<stop offset="100%" stopColor={dark} />
							</radialGradient>
						);
					})}
				</defs>

				<g
					transform={`rotate(${rotationDeg} ${CX} ${CY})`}
					style={{ pointerEvents: "none" }}
				>
					<ellipse
						cx={CX}
						cy={CY}
						rx={R_RIM + 10}
						ry={R_RIM + 10}
						fill="rgba(255, 80, 40, 0.12)"
					/>

					<g filter={`url(#${uid}-glow)`}>
						{segments.map((seg, i) => {
							const t0 = prefix[i]! / totalW;
							const t1 = (prefix[i]! + seg.weight) / totalW;
							const d = slicePath(CX, CY, R_PIE, t0, t1);
							return (
								<path
									key={`p-${i}`}
									d={d}
									fill={`url(#${uid}-seg-${i})`}
									stroke="rgba(255,255,255,0.22)"
									strokeWidth={0.85}
									strokeLinejoin="round"
								/>
							);
						})}
					</g>

					<g>
						{segments.map((_, i) => {
							const t0 = prefix[i]! / totalW;
							const a = angleAt(t0);
							const x2 = CX + R_PIE * Math.cos(a);
							const y2 = CY + R_PIE * Math.sin(a);
							return (
								<line
									key={`d-${i}`}
									x1={CX}
									y1={CY}
									x2={x2}
									y2={y2}
									stroke="rgba(255,255,255,0.35)"
									strokeWidth={0.9}
								/>
							);
						})}
					</g>

					<circle
						cx={CX}
						cy={CY}
						r={R_RIM}
						fill="none"
						stroke={shade(borderColor, -0.35)}
						strokeWidth={RIM_STROKE}
						opacity={0.98}
					/>
					<circle
						cx={CX}
						cy={CY}
						r={R_RIM}
						fill="none"
						stroke="rgba(255,255,255,0.15)"
						strokeWidth={2}
						opacity={0.7}
					/>

					<g filter={`url(#${uid}-bulb)`}>
						{Array.from({ length: N_BULBS }, (_, b) => {
							const ang = (b / N_BULBS) * 2 * Math.PI - Math.PI / 2;
							const bx = CX + R_BULBS * Math.cos(ang);
							const by = CY + R_BULBS * Math.sin(ang);
							return (
								<circle
									key={`bulb-${b}`}
									cx={bx}
									cy={by}
									r={2.4}
									fill="#fffef0"
									stroke="#f5e6a3"
									strokeWidth={0.35}
								/>
							);
						})}
					</g>

					<g style={{ pointerEvents: "none" }}>
						{segments.map((seg, i) => {
							const t0 = prefix[i]! / totalW;
							const t1 = (prefix[i]! + seg.weight) / totalW;
							const mid = (t0 + t1) / 2;
							const midRad = mid * 2 * Math.PI - Math.PI / 2;
							const tr = R_PIE * 0.56;
							const tx = CX + tr * Math.cos(midRad);
							const ty = CY + tr * Math.sin(midRad);
							const span = t1 - t0;
							const angleDeg = mid * 360;
							const raw =
								seg.label.length > 12
									? `${seg.label.slice(0, 11)}…`
									: seg.label;
							const short = raw.toUpperCase();
							const fs = Math.max(
								7.5,
								Math.min(13, VB / (segments.length + 5)),
							);
							const fill = labelFillForSegment(seg.color);
							const stroke = labelStrokeForSegment(seg.color);
							return (
								<text
									key={`t-${i}`}
									x={tx}
									y={ty}
									textAnchor="middle"
									dominantBaseline="middle"
									fill={fill}
									stroke={stroke}
									strokeWidth={0.28}
									paintOrder="stroke fill"
									fontSize={fs * (span < 0.08 ? 0.88 : 1)}
									fontWeight={700}
									fontFamily="'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
									transform={`rotate(${angleDeg + 90}, ${tx}, ${ty})`}
								>
									{short}
								</text>
							);
						})}
					</g>
				</g>

				<g pointerEvents="none">
					<polygon
						points={`${CX},${6} ${CX - 7},${22} ${CX + 7},${22}`}
						fill={`url(#${uid}-pointer)`}
						stroke="#5c4010"
						strokeWidth={0.6}
						strokeLinejoin="round"
					/>
					<line
						x1={CX}
						y1={22}
						x2={CX}
						y2={CY - R_HUB_OUT - 1}
						stroke="rgba(0,0,0,0.25)"
						strokeWidth={1.2}
					/>
				</g>

				<g
					role="button"
					tabIndex={isSpinning ? -1 : 0}
					aria-label={
						isSpinning
							? "Spinning…"
							: "Spin the wheel. The triangle at the top shows where it stops."
					}
					aria-busy={isSpinning}
					style={{ cursor: isSpinning ? "wait" : "pointer" }}
					onClick={startSpin}
					onKeyDown={onHubKeyDown}
					onMouseEnter={() => setHubHover(true)}
					onMouseLeave={() => setHubHover(false)}
				>
					<circle
						cx={CX}
						cy={CY}
						r={R_HUB_OUT + 2}
						fill="transparent"
						stroke="transparent"
					/>
					<circle
						cx={CX}
						cy={CY}
						r={R_HUB_OUT}
						fill={`url(#${uid}-${hubHover && !isSpinning ? "hub-hover" : "hub"})`}
						stroke={hubHover && !isSpinning ? "#f4d03f" : "#2a1a05"}
						strokeWidth={hubHover && !isSpinning ? 1.2 : 0.85}
						style={{
							transition: "stroke 0.15s ease, filter 0.15s ease",
							filter:
								hubHover && !isSpinning
									? "brightness(1.08)"
									: "brightness(1)",
						}}
					/>
					<circle
						cx={CX}
						cy={CY}
						r={R_HUB_IN}
						fill="rgba(255,255,255,0.35)"
						stroke="rgba(0,0,0,0.2)"
						strokeWidth={0.35}
						style={{ pointerEvents: "none" }}
					/>
					<text
						x={CX}
						y={CY + 0.5}
						textAnchor="middle"
						dominantBaseline="middle"
						fill={isSpinning ? "rgba(255,255,255,0.65)" : "#2a1a05"}
						fontSize={5.8}
						fontWeight={800}
						fontFamily="system-ui, sans-serif"
						style={{ pointerEvents: "none" }}
					>
						{isSpinning ? "…" : "SPIN"}
					</text>
				</g>
			</Box>

			<Typography
				variant="caption"
				component="p"
				sx={{
					mt: 1.5,
					color: "rgba(255,228,180,0.75)",
					maxWidth: size,
					mx: "auto",
					lineHeight: 1.4,
				}}
			>
				{isSpinning
					? "Spinning…"
					: "Tap the center to spin. The gold triangle shows the winner."}
			</Typography>

			<Typography
				variant="body2"
				aria-live="polite"
				sx={{
					mt: 0.75,
					minHeight: "1.5em",
					color: "primary.main",
					fontWeight: 600,
				}}
			>
				{lastWinner ? `Result: ${lastWinner}` : "\u00a0"}
			</Typography>
		</Box>
	);
}
