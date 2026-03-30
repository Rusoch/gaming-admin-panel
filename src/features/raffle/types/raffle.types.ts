export interface RafflePrize {
	id: string;
	name: string;
	type: "coins" | "freeSpin" | "bonus";
	amount: number;
	quantity: number;
	imageUrl: string;
}

export interface Raffle {
	id: string;
	name: string;
	description: string;
	startDate: string;
	endDate: string;
	drawDate: string;
	status: "draft" | "active" | "drawn" | "cancelled";
	ticketPrice: number;
	maxTicketsPerUser: number;
	prizes: RafflePrize[];
	totalTicketLimit: number | null;
	createdAt: string;
	updatedAt: string;
}

export type RaffleCreatePayload = Omit<Raffle, "id">;

export interface RaffleFilters {
	status?: Raffle["status"];
	dateFrom?: string;
	dateTo?: string;
	search?: string;
	page: number;
	limit: number;
	sort?: string;
}

export interface RaffleResponse {
	data: Raffle[];
	total: number;
}
