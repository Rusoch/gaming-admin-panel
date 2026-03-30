import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWheel as createWheelApi } from "../api/wheel.api";
import { wheelKeys } from "../constants/wheel.keys";
import type { WheelCreatePayload } from "../types/wheel.types";

export const useCreateWheel = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: WheelCreatePayload) => createWheelApi(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: wheelKeys.all });
		},
	});
};
