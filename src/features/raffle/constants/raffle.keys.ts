export const raffleKeys = {
	all: ["raffles"] as const,
	list: () => [...raffleKeys.all, "list"] as const,
	detail: (id: string) => [...raffleKeys.all, id] as const,
};
