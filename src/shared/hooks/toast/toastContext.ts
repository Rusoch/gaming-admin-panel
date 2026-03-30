import { createContext } from "react";

export type ToastSeverity = "success" | "error" | "info" | "warning";

export type ToastContextValue = {
	showToast: (msg: string, sev?: ToastSeverity) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);
