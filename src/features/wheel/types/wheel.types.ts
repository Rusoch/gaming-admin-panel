export interface WheelSegment {
	id: string;
	label: string;
	color: string;
	weight: number;
	prizeType: "coins" | "freeSpin" | "bonus" | "nothing";
	prizeAmount: number;
	imageUrl: string;
}

export interface Wheel {
	id: string;
	name: string;
	description: string;
	status: "draft" | "active" | "inactive";
	segments: WheelSegment[];
	maxSpinsPerUser: number;
	spinCost: number;
	backgroundColor: string;
	borderColor: string;
	createdAt: string;
	updatedAt: string;
}

export type WheelCreatePayload = Omit<Wheel, "id">;

export interface WheelFilters {
	status?: Wheel["status"];
	search?: string;
	page: number;
	limit: number;
	sort?: string;
}

export interface WheelResponse {
	data: Wheel[];
	total: number;
}
