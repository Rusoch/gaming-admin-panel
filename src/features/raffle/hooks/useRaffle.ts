import { useQuery } from "@tanstack/react-query";
import { getRaffleById } from "../api/raffle.api";
import { raffleKeys } from "../constants/raffle.keys";

export const useRaffle = (id: string | undefined) => {
	return useQuery({
		queryKey: id
			? raffleKeys.detail(id)
			: [...raffleKeys.all, "detail", "none"],
		queryFn: () => getRaffleById(id!),
		enabled: Boolean(id),
	});
};
