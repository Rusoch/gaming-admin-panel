export const wheelKeys = {
	all: ["wheel"] as const,
	list: () => [...wheelKeys.all, "list"] as const,
	detail: (id: string) => [...wheelKeys.all, id] as const,
};
