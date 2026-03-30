import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Snackbar, Alert } from "@mui/material";
import { ToastContext, type ToastSeverity } from "./toastContext";

const AUTO_HIDE_MS = 6000;

export function ToastProvider({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);
	const [message, setMessage] = useState("");
	const [severity, setSeverity] = useState<ToastSeverity>("info");

	const showToast = useCallback((msg: string, sev: ToastSeverity = "info") => {
		setMessage(msg);
		setSeverity(sev);
		setOpen(true);
	}, []);

	const handleClose = useCallback(() => setOpen(false), []);

	const value = useMemo(() => ({ showToast }), [showToast]);

	return (
		<ToastContext.Provider value={value}>
			{children}
			<Snackbar
				open={open}
				autoHideDuration={AUTO_HIDE_MS}
				onClose={handleClose}
				anchorOrigin={{ vertical: "top", horizontal: "right" }}
			>
				<Alert severity={severity} onClose={handleClose} sx={{ width: "100%" }}>
					{message}
				</Alert>
			</Snackbar>
		</ToastContext.Provider>
	);
}
