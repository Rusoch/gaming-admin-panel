import { createTheme } from "@mui/material/styles";

export type AppPaletteMode = "light" | "dark";

const primary = {
	main: "#00e676",
	light: "#66ffa6",
	dark: "#00c853",
	contrastText: "#0d0d0d",
};

export function createAppTheme(mode: AppPaletteMode) {
	return createTheme({
		palette: {
			mode,
			primary,
			...(mode === "dark"
				? {
						background: {
							default: "#0d1117",
							paper: "#161b22",
						},
						divider: "rgba(255, 255, 255, 0.08)",
					}
				: {}),
		},
		components: {
			MuiButtonBase: {
				styleOverrides: {
					root: {
						cursor: "pointer",
						"&.Mui-disabled": {
							cursor: "not-allowed",
						},
					},
				},
			},
			MuiAppBar: {
				styleOverrides: {
					root: {
						...(mode === "dark"
							? {
									backgroundColor: "#161b22",
									backgroundImage: "none",
								}
							: {}),
					},
				},
			},
			MuiDrawer: {
				styleOverrides: {
					paper: {
						...(mode === "dark"
							? {
									backgroundColor: "#161b22",
									backgroundImage: "none",
									borderRight: "1px solid rgba(255,255,255,0.08)",
								}
							: {}),
					},
				},
			},
		},
	});
}
