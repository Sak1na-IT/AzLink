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
  /* Kartda göstərilən kateqoriya adı, məs. "Dırnaq" */
  service: string;
  area: string;
  /* Backend hələ hesablamır (null); mock-da rəqəmdir */
  distance?: number | null;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  verified: boolean;
  image?: string;

  /* Backend-dən gələnlər */
  ownerId?: string;
  categories?: string[];

  services: ProviderService[];
}