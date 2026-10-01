import { apiRequest } from "./api";

export interface Area {
  id: string;
  name: string;
  type: string;
}

export const getAreas = () => apiRequest<Area[]>("/areas", { auth: false });