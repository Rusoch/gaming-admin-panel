import { apiClient } from "@/shared/api/apiClient";
import type {
	RaffleFormInput,
	RaffleFormOutput,
} from "../validation/raffle.schema";
import type {
	Raffle,
	RaffleCreatePayload,
	RaffleFilters,
	RaffleResponse,
} from "../types/raffle.types";

type JsonServerPaginated<T> = {
	data: T[];
	items: number;
	total?: number;
};

function sortRaffleRows(rows: Raffle[], sort: string): Raffle[] {
	const desc = sort.startsWith("-");
	const key = (desc ? sort.slice(1) : sort) as keyof Raffle;
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

function periodOverlapsFilter(
	raffle: Raffle,
	dateFrom?: string,
	dateTo?: string,
): boolean {
	if (!dateFrom && !dateTo) return true;
	const rs = new Date(raffle.startDate).getTime();
	const re = new Date(raffle.endDate).getTime();
	const fromT = dateFrom
		? new Date(`${dateFrom}T00:00:00.000Z`).getTime()
		: -Infinity;
	const toT = dateTo
		? new Date(`${dateTo}T23:59:59.999Z`).getTime()
		: Infinity;
	if (Number.isNaN(rs) || Number.isNaN(re)) return false;
	return rs <= toT && re >= fromT;
}

export const getRafflesPage = async (
	filters: RaffleFilters,
): Promise<RaffleResponse> => {
	const sortKey = filters.sort ?? "-createdAt";
	const hasDateRange = Boolean(filters.dateFrom) || Boolean(filters.dateTo);

	if (!hasDateRange) {
		const params: Record<string, string | number> = {
			_page: filters.page,
			_per_page: filters.limit,
			_sort: sortKey,
		};
		if (filters.status) params.status = filters.status;
		const q = filters.search?.trim();
		if (q) params.name_contains = q;

		const res = await apiClient.get<JsonServerPaginated<Raffle> | Raffle[]>(
			"/raffles",
			{ params },
		);

		const body = res.data;
		if (Array.isArray(body)) {
			let rows = body;
			if (filters.status)
				rows = rows.filter((r) => r.status === filters.status);
			const qlow = filters.search?.trim().toLowerCase();
			if (qlow)
				rows = rows.filter((r) => r.name.toLowerCase().includes(qlow));
			const sorted = sortRaffleRows(rows, sortKey);
			return { data: sorted, total: sorted.length };
		}
		const total = body.items ?? body.total ?? body.data?.length ?? 0;
		return { data: body.data ?? [], total };
	}

	const res = await apiClient.get<JsonServerPaginated<Raffle> | Raffle[]>(
		"/raffles",
		{
			params: {
				_sort: sortKey,
				_per_page: 5000,
				_page: 1,
				...(filters.status ? { status: filters.status } : {}),
				...(filters.search?.trim()
					? { name_contains: filters.search.trim() }
					: {}),
			},
		},
	);

	let rows: Raffle[] = Array.isArray(res.data)
		? res.data
		: (res.data.data ?? []);

	if (filters.status)
		rows = rows.filter((r) => r.status === filters.status);
	const qlow = filters.search?.trim().toLowerCase();
	if (qlow) rows = rows.filter((r) => r.name.toLowerCase().includes(qlow));

	rows = rows.filter((r) =>
		periodOverlapsFilter(r, filters.dateFrom, filters.dateTo),
	);
	rows = sortRaffleRows(rows, sortKey);

	const total = rows.length;
	const start = (filters.page - 1) * filters.limit;
	const data = rows.slice(start, start + filters.limit);
	return { data, total };
};

export const getRaffleById = async (id: string): Promise<Raffle> => {
	const res = await apiClient.get(`/raffles/${id}`);
	return res.data;
};

export function buildRaffleCreatePayload(data: RaffleFormOutput): RaffleCreatePayload {
	const now = new Date().toISOString();
	return {
		name: data.name,
		description: data.description,
		startDate: `${data.startDate}T00:00:00.000Z`,
		endDate: `${data.endDate}T23:59:59.999Z`,
		drawDate: `${data.drawDate}T12:00:00.000Z`,
		status: data.status,
		ticketPrice: data.ticketPrice,
		maxTicketsPerUser: data.maxTicketsPerUser,
		prizes: data.prizes,
		totalTicketLimit: data.totalTicketLimit,
		createdAt: now,
		updatedAt: now,
	};
}

export const createRaffle = async (
	payload: RaffleCreatePayload,
): Promise<Raffle> => {
	const res = await apiClient.post("/raffles", payload);
	return res.data;
};

export function raffleToFormInput(raffle: Raffle): RaffleFormInput {
	const datePart = (iso: string) => (iso.length >= 10 ? iso.slice(0, 10) : iso);
	return {
		name: raffle.name,
		description: raffle.description,
		status: raffle.status,
		startDate: datePart(raffle.startDate),
		endDate: datePart(raffle.endDate),
		drawDate: datePart(raffle.drawDate),
		ticketPrice: raffle.ticketPrice,
		maxTicketsPerUser: raffle.maxTicketsPerUser,
		totalTicketLimit:
			raffle.totalTicketLimit == null ? "" : raffle.totalTicketLimit,
		prizes: raffle.prizes.map((p) => ({
			id: p.id,
			name: p.name,
			type: p.type,
			amount: p.amount,
			quantity: p.quantity,
			imageUrl: p.imageUrl,
		})),
	};
}

export function buildRaffleUpdatePayload(
	existing: Raffle,
	data: RaffleFormOutput,
): Raffle {
	const now = new Date().toISOString();
	return {
		id: existing.id,
		name: data.name,
		description: data.description,
		startDate: `${data.startDate}T00:00:00.000Z`,
		endDate: `${data.endDate}T23:59:59.999Z`,
		drawDate: `${data.drawDate}T12:00:00.000Z`,
		status: data.status,
		ticketPrice: data.ticketPrice,
		maxTicketsPerUser: data.maxTicketsPerUser,
		prizes: data.prizes,
		totalTicketLimit: data.totalTicketLimit,
		createdAt: existing.createdAt,
		updatedAt: now,
	};
}

export const updateRaffle = async (
	id: string,
	body: Raffle,
): Promise<Raffle> => {
	const res = await apiClient.put(`/raffles/${id}`, body);
	return res.data;
};

export const deleteRaffle = async (id: string): Promise<void> => {
	await apiClient.delete(`/raffles/${id}`);
};
