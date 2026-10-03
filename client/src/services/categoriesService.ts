import { apiRequest } from "./api";

export interface CategoryOption {
  id: string;
  name: string;
  parentId?: string | null;
}

export const getCategories = () =>
  apiRequest<CategoryOption[]>("/categories");