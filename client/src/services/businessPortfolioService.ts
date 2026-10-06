import { apiRequest } from "./api";

export interface PortfolioImage {
  id: string;
  dataUrl: string;
  caption: string;
}

export const getPortfolio = () =>
  apiRequest<PortfolioImage[]>("/business/portfolio");

export const addPortfolioImage = (input: {
  dataUrl: string;
  caption: string;
}) =>
  apiRequest<PortfolioImage>("/business/portfolio", {
    method: "POST",
    body: input,
  });

export const deletePortfolioImage = (imageId: string) =>
  apiRequest<{ message: string }>(`/business/portfolio/${imageId}`, {
    method: "DELETE",
  });