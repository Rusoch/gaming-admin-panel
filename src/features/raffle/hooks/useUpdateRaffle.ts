import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRaffle as updateRaffleApi } from "../api/raffle.api";
import { raffleKeys } from "../constants/raffle.keys";
import type { Raffle } from "../types/raffle.types";

export const useUpdateRaffle = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: Raffle }) =>
			updateRaffleApi(id, body),
		onSuccess: (_data, { id }) => {
			queryClient.invalidateQueries({ queryKey: raffleKeys.all });
			queryClient.invalidateQueries({ queryKey: raffleKeys.detail(id) });
		},
	});
};
