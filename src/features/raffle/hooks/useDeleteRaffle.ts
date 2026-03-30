import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRaffle as deleteRaffleApi } from "../api/raffle.api";
import { raffleKeys } from "../constants/raffle.keys";

export const useDeleteRaffle = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteRaffleApi(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: raffleKeys.all });
		},
	});
};
