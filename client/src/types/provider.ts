export interface ProviderService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}

export interface Provider {
  id: string;
  name: string;
  service: string;
  area: string;
  distance: number;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  verified: boolean;
  image?: string;

  services: ProviderService[];
}