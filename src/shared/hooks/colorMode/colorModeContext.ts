import { createContext } from "react";
import type { AppPaletteMode } from "@/shared/theme/appTheme";

export type ColorModeContextValue = {
	mode: AppPaletteMode;
	toggleColorMode: () => void;
};

export const ColorModeContext = createContext<ColorModeContextValue | null>(
	null,
);
