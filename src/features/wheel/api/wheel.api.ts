import { apiClient } from "@/shared/api/apiClient";
import type { WheelFormInput, WheelFormOutput } from "../validation/wheel.schema";
import type {
	Wheel,
	WheelCreatePayload,
	WheelFilters,
	WheelResponse,
} from "../types/wheel.types";

type JsonServerPaginated<T> = {
	data: T[];
	items: number;
	total?: number;
};

function sortWheelRows(rows: Wheel[], sort: string): Wheel[] {
	const desc = sort.startsWith("-");
	const key = (desc ? sort.slice(1) : sort) as keyof Wheel;
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

export const getWheelsPage = async (
	filters: WheelFilters,
): Promise<WheelResponse> => {
	const sortKey = filters.sort ?? "-createdAt";
	const params: Record<string, string | number> = {
		_page: filters.page,
		_per_page: filters.limit,
		_sort: sortKey,
	};
	if (filters.status) params.status = filters.status;
	const q = filters.search?.trim();
	if (q) params.name_contains = q;

	const res = await apiClient.get<JsonServerPaginated<Wheel> | Wheel[]>(
		"/wheel",
		{ params },
	);

	const body = res.data;
	if (Array.isArray(body)) {
		let rows = body;
		if (filters.status) rows = rows.filter((w) => w.status === filters.status);
		const qlow = filters.search?.trim().toLowerCase();
		if (qlow)
			rows = rows.filter((w) => w.name.toLowerCase().includes(qlow));
		const sorted = sortWheelRows(rows, sortKey);
		return { data: sorted, total: sorted.length };
	}
	const total = body.items ?? body.total ?? body.data?.length ?? 0;
	return { data: body.data ?? [], total };
};

export const getWheelById = async (id: string): Promise<Wheel> => {
	const res = await apiClient.get(`/wheel/${id}`);
	return res.data;
};

export function buildWheelCreatePayload(data: WheelFormOutput): WheelCreatePayload {
	const now = new Date().toISOString();
	return {
		name: data.name,
		description: data.description,
		status: data.status,
		segments: data.segments,
		maxSpinsPerUser: data.maxSpinsPerUser,
		spinCost: data.spinCost,
		backgroundColor: data.backgroundColor,
		borderColor: data.borderColor,
		createdAt: now,
		updatedAt: now,
	};
}

export const createWheel = async (
	payload: WheelCreatePayload,
): Promise<Wheel> => {
	const res = await apiClient.post("/wheel", payload);
	return res.data;
};

export function wheelToFormInput(wheel: Wheel): WheelFormInput {
	return {
		name: wheel.name,
		description: wheel.description,
		status: wheel.status,
		maxSpinsPerUser: wheel.maxSpinsPerUser,
		spinCost: wheel.spinCost,
		backgroundColor: wheel.backgroundColor,
		borderColor: wheel.borderColor,
		segments: wheel.segments.map((s) => ({
			id: s.id,
			label: s.label,
			color: s.color,
			weight: s.weight,
			prizeType: s.prizeType,
			prizeAmount: s.prizeAmount,
			imageUrl: s.imageUrl,
		})),
	};
}

export function buildWheelUpdatePayload(
	existing: Wheel,
	data: WheelFormOutput,
): Wheel {
	const now = new Date().toISOString();
	return {
		id: existing.id,
		name: data.name,
		description: data.description,
		status: data.status,
		segments: data.segments,
		maxSpinsPerUser: data.maxSpinsPerUser,
		spinCost: data.spinCost,
		backgroundColor: data.backgroundColor,
		borderColor: data.borderColor,
		createdAt: existing.createdAt,
		updatedAt: now,
	};
}

export const updateWheel = async (
	id: string,
	body: Wheel,
): Promise<Wheel> => {
	const res = await apiClient.put(`/wheel/${id}`, body);
	return res.data;
};

export const deleteWheel = async (id: string): Promise<void> => {
	await apiClient.delete(`/wheel/${id}`);
};
