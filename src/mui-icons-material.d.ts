/** Fallback typings when @mui/icons-material .d.ts files are missing from node_modules. */
declare module "@mui/icons-material/*" {
	import type { SvgIconProps } from "@mui/material/SvgIcon";
	import type { FC } from "react";
	const Icon: FC<SvgIconProps>;
	export default Icon;
}
