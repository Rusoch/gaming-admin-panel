import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
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
	},
});
