import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import type { AppPaletteMode } from "@/shared/theme/appTheme";
import { ColorModeContext } from "./colorModeContext";

const STORAGE_KEY = "gamifyhub-color-mode";

function readStoredMode(): AppPaletteMode | null {
	if (typeof window === "undefined") return null;
	try {
		const v = localStorage.getItem(STORAGE_KEY);
		if (v === "dark" || v === "light") return v;
	} catch {
		void 0;
	}
	return null;
}

function systemPrefersDark(): boolean {
	if (typeof window === "undefined") return false;
	return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getInitialMode(): AppPaletteMode {
	return readStoredMode() ?? (systemPrefersDark() ? "dark" : "light");
}

export function ColorModeProvider({ children }: { children: ReactNode }) {
	const [mode, setMode] = useState<AppPaletteMode>(getInitialMode);

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, mode);
		} catch {
			void 0;
		}
		document.documentElement.style.colorScheme = mode;
	}, [mode]);

	const toggleColorMode = useCallback(() => {
		setMode((m: AppPaletteMode) => (m === "light" ? "dark" : "light"));
	}, []);

	const value = useMemo(
		() => ({ mode, toggleColorMode }),
		[mode, toggleColorMode],
	);

	return (
		<ColorModeContext.Provider value={value}>
			{children}
		</ColorModeContext.Provider>
	);
}
