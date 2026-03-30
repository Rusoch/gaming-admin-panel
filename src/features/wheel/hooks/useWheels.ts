import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getWheelsPage } from "../api/wheel.api";
import { wheelKeys } from "../constants/wheel.keys";
import type { WheelFilters } from "../types/wheel.types";

export const useWheels = (filters: WheelFilters) => {
	return useQuery({
		queryKey: [...wheelKeys.all, filters],
		queryFn: () => getWheelsPage(filters),
		placeholderData: keepPreviousData,
	});
};
