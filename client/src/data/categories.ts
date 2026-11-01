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
   * Sahənin xidmətləri (axtarışdakı kateqoriya menyusunda göstərilir).
   * Biznesin provider.service dəyəri bunlardan biri ilə dəqiq
   * üst-üstə düşəndə həmin sahəyə aid sayılır.
   */
  services: string[];
}

export const categories: ServiceCategory[] = [
  {
    id: "beauty",
    name: "Gözəllik",
    icon: Sparkles,
    services: [
      "Dırnaq",
      "Saç",
      "Makiyaj",
      "Qaş və kirpik",
      "Dəriyə qulluq",
      "Masaj",
    ],
  },
  {
    id: "home",
    name: "Ev və məişət",
    icon: House,
    services: [
      "Təmizlik",
      "Santexnik",
      "Elektrik",
      "Təmir",
      "Daşıma",
      "Kondisioner",
    ],
  },
  {
    id: "auto",
    name: "Avtomobil",
    icon: CarFront,
    services: [
      "Avtoyuma",
      "Avtoservis",
      "Detaylinq",
      "Təkər xidməti",
      "Açar xidməti",
    ],
  },
  {
    id: "education",
    name: "Təhsil",
    icon: GraduationCap,
    services: [
      "Repetitor",
      "Dil dərsləri",
      "Proqramlaşdırma",
      "İmtahan hazırlığı",
      "Musiqi",
    ],
  },
  {
    id: "events",
    name: "Foto və tədbir",
    icon: Camera,
    services: [
      "Fotoqraf",
      "Videoqraf",
      "Dekor",
      "Tort",
      "Gül",
      "DJ",
    ],
  },
  {
    id: "pets",
    name: "Heyvanlar",
    icon: PawPrint,
    services: [
      "Grooming",
      "Baytar",
      "Pet sitter",
      "İt gəzdirilməsi",
    ],
  },
  {
    id: "tech",
    name: "Texnologiya",
    icon: Smartphone,
    services: [
      "Telefon təmiri",
      "Kompüter təmiri",
    ],
  },
  {
    id: "fitness",
    name: "İdman",
    icon: Dumbbell,
    services: [
      "Trainer",
      "Yoga",
      "Fitness",
      "Pilates",
      "Boks",
    ],
  },
];