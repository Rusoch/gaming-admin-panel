import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRaffle as createRaffleApi } from "../api/raffle.api";
import { raffleKeys } from "../constants/raffle.keys";
import type { RaffleCreatePayload } from "../types/raffle.types";

export const useCreateRaffle = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: RaffleCreatePayload) => createRaffleApi(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: raffleKeys.all });
		},
	});
};
