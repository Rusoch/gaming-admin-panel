export const leaderboardKeys = {
  all: ["leaderboards"] as const,
  list: () => [...leaderboardKeys.all, "list"] as const,
  detail: (id: string) => [...leaderboardKeys.all, id] as const,
};