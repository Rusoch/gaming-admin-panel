import { apiClient } from "@/shared/api/apiClient";
import type {
	LeaderboardCreateFormInput,
	LeaderboardCreateFormOutput,
} from "../validation/leaderboardCreateForm.schema";
import type {
	Leaderboard,
	LeaderboardCreatePayload,
	LeaderboardFilters,
	LeaderboardResponse,
} from "../types/leaderboard.types";

type JsonServerPaginated<T> = {
	data: T[];
	items: number;
	total?: number;
};

function sortLeaderboardRows(rows: Leaderboard[], sort: string): Leaderboard[] {
	const desc = sort.startsWith("-");
	const key = (desc ? sort.slice(1) : sort) as keyof Leaderboard;
	return [...rows].sort((a, b) => {
		const va = a[key];
		const vb = b[key];
		let cmp = 0;
		if (va == null && vb == null) cmp = 0;
		else if (va == null) cmp = 1;
		else if (vb == null) cmp = -1;
		else if (typeof va === "number" && typeof vb === "number")
			cmp = va - vb;
		else cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
		return desc ? -cmp : cmp;
	});
}

export const getLeaderboardsPage = async (
	filters: LeaderboardFilters,
): Promise<LeaderboardResponse> => {
	const params: Record<string, string | number> = {
		_page: filters.page,
		_per_page: filters.limit,
		_sort: filters.sort ?? "-createdAt",
	};
	if (filters.status) params.status = filters.status;
	const q = filters.search?.trim();
	if (q) params.title_contains = q;

	const res = await apiClient.get<
		JsonServerPaginated<Leaderboard> | Leaderboard[]
	>("/leaderboards", { params });

	const body = res.data;
	if (Array.isArray(body)) {
		const sortKey = filters.sort ?? "-createdAt";
		const sorted = sortLeaderboardRows(body, sortKey);
		return { data: sorted, total: sorted.length };
	}
	const total = body.items ?? body.total ?? body.data?.length ?? 0;
	return { data: body.data ?? [], total };
};

export const getLeaderboardById = async (id: string): Promise<Leaderboard> => {
	const res = await apiClient.get(`/leaderboards/${id}`);
	return res.data;
};

export function buildLeaderboardCreatePayload(
	data: LeaderboardCreateFormOutput,
): LeaderboardCreatePayload {
	const now = new Date().toISOString();
	return {
		title: data.title,
		description: data.description,
		startDate: `${data.startDate}T00:00:00.000Z`,
		endDate: `${data.endDate}T23:59:59.999Z`,
		status: data.status,
		scoringType: data.scoringType,
		maxParticipants: data.maxParticipants,
		prizes: data.prizes,
		createdAt: now,
		updatedAt: now,
	};
}

export const createLeaderboard = async (
	data: LeaderboardCreatePayload,
): Promise<Leaderboard> => {
	const res = await apiClient.post("/leaderboards", data);
	return res.data;
};

export function leaderboardToFormInput(
	lb: Leaderboard,
): LeaderboardCreateFormInput {
	const datePart = (iso: string) => (iso.length >= 10 ? iso.slice(0, 10) : iso);
	return {
		title: lb.title,
		description: lb.description,
		status: lb.status,
		startDate: datePart(lb.startDate),
		endDate: datePart(lb.endDate),
		scoringType: lb.scoringType,
		maxParticipants: lb.maxParticipants,
		prizes: lb.prizes.map((p) => ({
			id: p.id,
			rank: p.rank,
			name: p.name,
			type: p.type,
			amount: p.amount,
			imageUrl: p.imageUrl,
		})),
	};
}

export function buildLeaderboardUpdatePayload(
	existing: Leaderboard,
	data: LeaderboardCreateFormOutput,
): Leaderboard {
	const now = new Date().toISOString();
	return {
		id: existing.id,
		title: data.title,
		description: data.description,
		startDate: `${data.startDate}T00:00:00.000Z`,
		endDate: `${data.endDate}T23:59:59.999Z`,
		status: data.status,
		scoringType: data.scoringType,
		maxParticipants: data.maxParticipants,
		prizes: data.prizes,
		createdAt: existing.createdAt,
		updatedAt: now,
	};
}

export const updateLeaderboard = async (
	id: string,
	body: Leaderboard,
): Promise<Leaderboard> => {
	const res = await apiClient.put(`/leaderboards/${id}`, body);
	return res.data;
};

export const deleteLeaderboard = async (id: string): Promise<void> => {
	await apiClient.delete(`/leaderboards/${id}`);
};

export const patchLeaderboardStatus = async (
	id: string,
	status: Leaderboard["status"],
): Promise<Leaderboard> => {
	const res = await apiClient.patch<Leaderboard>(`/leaderboards/${id}`, {
		status,
		updatedAt: new Date().toISOString(),
	});
	return res.data;
};

export const batchUpdateLeaderboardStatus = async (
	ids: string[],
	status: Leaderboard["status"],
): Promise<void> => {
	await Promise.all(ids.map((id) => patchLeaderboardStatus(id, status)));
};
