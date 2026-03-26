import axios from "axios";

const apiGateway = axios.create({ baseURL: "http://localhost:3000" });

export const httpClient = apiGateway;
/** Alias — same instance as `httpClient`. */
export { apiGateway };
