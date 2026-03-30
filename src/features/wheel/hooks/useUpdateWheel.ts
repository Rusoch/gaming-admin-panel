import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateWheel as updateWheelApi } from "../api/wheel.api";
import { wheelKeys } from "../constants/wheel.keys";
import type { Wheel } from "../types/wheel.types";

export const useUpdateWheel = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: Wheel }) =>
			updateWheelApi(id, body),
		onSuccess: (_data, { id }) => {
			queryClient.invalidateQueries({ queryKey: wheelKeys.all });
			queryClient.invalidateQueries({ queryKey: wheelKeys.detail(id) });
		},
	});
};
