import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteWheel as deleteWheelApi } from "../api/wheel.api";
import { wheelKeys } from "../constants/wheel.keys";

export const useDeleteWheel = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteWheelApi(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: wheelKeys.all });
		},
	});
};
