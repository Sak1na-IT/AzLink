import {
  Sparkles,
  Camera,
  Home,
  Smartphone,
  Car,
  Scissors,
  GraduationCap,
  Dog,
  Dumbbell,
  type LucideIcon,
} from "lucide-react";

export interface CategoryVisual {
  icon: LucideIcon;
  gradient: string;
}

const CATEGORY_VISUALS: Record<string, CategoryVisual> = {
  "Dırnaq": { icon: Sparkles, gradient: "gradient-teal" },
  "Makiyaj": { icon: Sparkles, gradient: "gradient-teal" },
  "Saç": { icon: Scissors, gradient: "gradient-teal" },
  "Fotoqraf": { icon: Camera, gradient: "gradient-pink" },
  "Grooming": { icon: Dog, gradient: "gradient-pink" },
  "Təmizlik": { icon: Home, gradient: "gradient-blue" },
  "Santexnik": { icon: Home, gradient: "gradient-blue" },
  "Trainer": { icon: Dumbbell, gradient: "gradient-blue" },
  "Yoga": { icon: Dumbbell, gradient: "gradient-blue" },
  "Avtoyuma": { icon: Car, gradient: "gradient-purple" },
  "Avtoservis": { icon: Car, gradient: "gradient-purple" },
  "Telefon təmiri": { icon: Smartphone, gradient: "gradient-purple" },
  "Repetitor": { icon: GraduationCap, gradient: "gradient-purple" },
};

const DEFAULT_VISUAL: CategoryVisual = {
  icon: Sparkles,
  gradient: "gradient-teal",
};

export function getCategoryVisual(service: string): CategoryVisual {
  return CATEGORY_VISUALS[service] ?? DEFAULT_VISUAL;
}