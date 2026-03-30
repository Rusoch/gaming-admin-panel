import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getRafflesPage } from "../api/raffle.api";
import { raffleKeys } from "../constants/raffle.keys";
import type { RaffleFilters } from "../types/raffle.types";

export const useRaffles = (filters: RaffleFilters) => {
	return useQuery({
		queryKey: [...raffleKeys.all, filters],
		queryFn: () => getRafflesPage(filters),
		placeholderData: keepPreviousData,
	});
};
