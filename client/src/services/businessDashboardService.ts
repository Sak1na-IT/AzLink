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

export interface CustomerSummary {
  customerId: string;
  customerName: string;
  bookingCount: number;
  activeCount: number;
  completedCount: number;
  cancelledCount: number;
  totalSpent: number;
  lastBookingDate: string;
  lastStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
}

export const getCustomers = () =>
  apiRequest<CustomerSummary[]>("/business/customers");