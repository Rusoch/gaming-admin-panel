import { useQuery } from "@tanstack/react-query";
import { getWheelById } from "../api/wheel.api";
import { wheelKeys } from "../constants/wheel.keys";

export const useWheel = (id: string | undefined) => {
	return useQuery({
		queryKey: id
			? wheelKeys.detail(id)
			: [...wheelKeys.all, "detail", "none"],
		queryFn: () => getWheelById(id!),
		enabled: Boolean(id),
	});
};
