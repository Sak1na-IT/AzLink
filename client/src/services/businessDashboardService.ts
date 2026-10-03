import { apiRequest } from "./api";

export interface BusinessDashboardStats {
  serviceCount: number;
  activeCount: number;
  pendingCount: number;
  confirmedCount: number;
  completedCount: number;
  revenue: number;
  uniqueCustomerCount: number;
  profileCompletion: number;
}

export const getDashboardStats = () =>
  apiRequest<BusinessDashboardStats>("/business/dashboard");

export interface BusinessServicePreview {
  id: string;
  name: string;
  price: number;
}

export const getServicesPreview = () =>
  apiRequest<BusinessServicePreview[]>("/business/services");