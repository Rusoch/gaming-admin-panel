import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { Snackbar, Alert } from "@mui/material";

type Severity = "success" | "error" | "info" | "warning";

type ToastContextValue = {
	showToast: (msg: string, sev?: Severity) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_HIDE_MS = 6000;

export function ToastProvider({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);
	const [message, setMessage] = useState("");
	const [severity, setSeverity] = useState<Severity>("info");

	const showToast = useCallback((msg: string, sev: Severity = "info") => {
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

export function useToast(): ToastContextValue {
	const ctx = useContext(ToastContext);
	if (!ctx) {
		throw new Error("useToast must be used within ToastProvider");
	}
	return ctx;
}
