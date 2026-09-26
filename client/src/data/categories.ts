import {
  CarFront,
  Dumbbell,
  GraduationCap,
  Camera,
  House,
  PawPrint,
  Sparkles,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

export interface ServiceCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  /*
   * providers.ts-dəki provider.service dəyərləri ilə dəqiq
   * üst-üstə düşməlidir. Yeni xidmət növü əlavə edəndə
   * (providers.ts-də) bura da əlavə edilməlidir.
   */
  services: string[];
}

export const categories: ServiceCategory[] = [
  {
    id: "beauty",
    name: "Gözəllik",
    icon: Sparkles,
    services: ["Dırnaq", "Saç", "Makiyaj"],
  },
  {
    id: "home",
    name: "Ev və məişət",
    icon: House,
    services: ["Təmizlik", "Santexnik"],
  },
  {
    id: "auto",
    name: "Avtomobil",
    icon: CarFront,
    services: ["Avtoyuma", "Avtoservis"],
  },
  {
    id: "education",
    name: "Təhsil",
    icon: GraduationCap,
    services: ["Repetitor"],
  },
  {
    id: "events",
    name: "Foto və tədbir",
    icon: Camera,
    services: ["Fotoqraf"],
  },
  {
    id: "pets",
    name: "Heyvanlar",
    icon: PawPrint,
    services: ["Grooming"],
  },
  {
    id: "tech",
    name: "Texnologiya",
    icon: Smartphone,
    services: ["Telefon təmiri"],
  },
  {
    id: "fitness",
    name: "İdman",
    icon: Dumbbell,
    services: ["Trainer", "Yoga"],
  },
];