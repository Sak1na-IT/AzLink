import type { Provider } from "../types/provider";

export const providers: Provider[] = [
  {
    id: "1",
    name: "Nail by Aysel",
    service: "Dırnaq",
    area: "Nərimanov",
    distance: 1.2,
    rating: 4.9,
    reviewCount: 126,
    priceFrom: 20,
    verified: true,

    services: [
      {
        id: "1-1",
        name: "Manikür",
        description: "Klassik manikür xidməti",
        price: 20,
        duration: 45,
      },
      {
        id: "1-2",
        name: "Pedikür",
        description: "Tam pedikür xidməti",
        price: 30,
        duration: 60,
      },
      {
        id: "1-3",
        name: "Dırnaq dizaynı",
        description: "Dırnaq üçün xüsusi dizayn",
        price: 25,
        duration: 60,
      },
    ],
  },

  {
    id: "2",
    name: "Studio Nigar",
    service: "Makiyaj",
    area: "Yasamal",
    distance: 3.4,
    rating: 4.8,
    reviewCount: 94,
    priceFrom: 40,
    verified: true,

    services: [
      {
        id: "2-1",
        name: "Gündəlik makiyaj",
        description: "Gündəlik istifadə üçün makiyaj",
        price: 40,
        duration: 60,
      },
      {
        id: "2-2",
        name: "Gecə makiyajı",
        description: "Xüsusi tədbirlər üçün makiyaj",
        price: 60,
        duration: 90,
      },
      {
        id: "2-3",
        name: "Gəlin makiyajı",
        description: "Gəlin üçün xüsusi makiyaj",
        price: 100,
        duration: 120,
      },
    ],
  },

  {
    id: "3",
    name: "CleanPro",
    service: "Təmizlik",
    area: "Nəsimi",
    distance: 2.2,
    rating: 4.6,
    reviewCount: 112,
    priceFrom: 40,
    verified: true,

    services: [
      {
        id: "3-1",
        name: "Ev təmizliyi",
        description: "Standart ev təmizliyi",
        price: 40,
        duration: 120,
      },
      {
        id: "3-2",
        name: "Dərin təmizlik",
        description: "Ətraflı və dərin təmizlik",
        price: 70,
        duration: 180,
      },
    ],
  },

  {
    id: "4",
    name: "Ali Photography",
    service: "Fotoqraf",
    area: "Səbail",
    distance: 4.4,
    rating: 4.8,
    reviewCount: 89,
    priceFrom: 60,
    verified: true,

    services: [
      {
        id: "4-1",
        name: "Portret çəkilişi",
        description: "Fərdi portret fotosessiyası",
        price: 60,
        duration: 60,
      },
      {
        id: "4-2",
        name: "Tədbir çəkilişi",
        description: "Tədbirlər üçün foto çəkiliş",
        price: 150,
        duration: 180,
      },
    ],
  },

  {
    id: "5",
    name: "Vüsalə Hair",
    service: "Saç",
    area: "Nəsimi",
    distance: 2.8,
    rating: 4.7,
    reviewCount: 158,
    priceFrom: 30,
    verified: true,

    services: [
      {
        id: "5-1",
        name: "Saç kəsimi",
        description: "Qadın saç kəsimi",
        price: 30,
        duration: 45,
      },
      {
        id: "5-2",
        name: "Saç düzümü",
        description: "Gündəlik və tədbir üçün saç düzümü",
        price: 40,
        duration: 60,
      },
      {
        id: "5-3",
        name: "Saç boyama",
        description: "Peşəkar saç boyama xidməti",
        price: 70,
        duration: 120,
      },
    ],
  },

  {
    id: "6",
    name: "Kamran Santexnik",
    service: "Santexnik",
    area: "Xətai",
    distance: 4.1,
    rating: 4.7,
    reviewCount: 64,
    priceFrom: 15,
    verified: true,

    services: [
      {
        id: "6-1",
        name: "Kran təmiri",
        description: "Kran və su sızması təmiri",
        price: 15,
        duration: 45,
      },
      {
        id: "6-2",
        name: "Santexnika quraşdırılması",
        description: "Yeni santexnika avadanlığının quraşdırılması",
        price: 30,
        duration: 60,
      },
    ],
  },

  {
    id: "7",
    name: "Rəşad Auto Wash",
    service: "Avtoyuma",
    area: "Yasamal",
    distance: 3.9,
    rating: 4.4,
    reviewCount: 230,
    priceFrom: 10,
    verified: true,

    services: [
      {
        id: "7-1",
        name: "Standart yuma",
        description: "Avtomobilin xarici yuyulması",
        price: 10,
        duration: 30,
      },
      {
        id: "7-2",
        name: "Kompleks yuma",
        description: "Xarici və daxili təmizlik",
        price: 20,
        duration: 60,
      },
    ],
  },

  {
    id: "8",
    name: "Turbo Servis",
    service: "Avtoservis",
    area: "Nizami",
    distance: 5.6,
    rating: 4.6,
    reviewCount: 88,
    priceFrom: 20,
    verified: true,

    services: [
      {
        id: "8-1",
        name: "Diaqnostika",
        description: "Avtomobil kompüter diaqnostikası",
        price: 20,
        duration: 30,
      },
      {
        id: "8-2",
        name: "Yağ dəyişimi",
        description: "Mühərrik yağı dəyişimi",
        price: 30,
        duration: 45,
      },
      {
        id: "8-3",
        name: "Əyləc sistemi",
        description: "Əyləc sisteminin yoxlanılması",
        price: 40,
        duration: 60,
      },
    ],
  },

  {
    id: "9",
    name: "Nərgiz müəllimə",
    service: "Repetitor",
    area: "Nəsimi",
    distance: 2.6,
    rating: 5,
    reviewCount: 58,
    priceFrom: 20,
    verified: true,

    services: [
      {
        id: "9-1",
        name: "Fərdi dərs",
        description: "Bir şagird üçün fərdi dərs",
        price: 20,
        duration: 60,
      },
      {
        id: "9-2",
        name: "İmtahan hazırlığı",
        description: "İmtahanlara xüsusi hazırlıq",
        price: 30,
        duration: 90,
      },
    ],
  },

  {
    id: "10",
    name: "Paws Grooming",
    service: "Grooming",
    area: "Nərimanov",
    distance: 0.9,
    rating: 4.9,
    reviewCount: 73,
    priceFrom: 30,
    verified: true,

    services: [
      {
        id: "10-1",
        name: "Kiçik cins grooming",
        description: "Kiçik itlər üçün grooming",
        price: 30,
        duration: 60,
      },
      {
        id: "10-2",
        name: "Böyük cins grooming",
        description: "Böyük itlər üçün grooming",
        price: 50,
        duration: 90,
      },
    ],
  },

  {
    id: "11",
    name: "iFix Telefon",
    service: "Telefon təmiri",
    area: "Nəsimi",
    distance: 2.4,
    rating: 4.6,
    reviewCount: 301,
    priceFrom: 35,
    verified: true,

    services: [
      {
        id: "11-1",
        name: "Ekran dəyişmə",
        description: "Telefon ekranının dəyişdirilməsi",
        price: 60,
        duration: 45,
      },
      {
        id: "11-2",
        name: "Batareya dəyişmə",
        description: "Telefon batareyasının dəyişdirilməsi",
        price: 35,
        duration: 30,
      },
    ],
  },

  {
    id: "12",
    name: "Tural Trainer",
    service: "Trainer",
    area: "Xətai",
    distance: 4.7,
    rating: 4.8,
    reviewCount: 47,
    priceFrom: 30,
    verified: true,

    services: [
      {
        id: "12-1",
        name: "Fərdi məşq",
        description: "Şəxsi məşqçi ilə fərdi məşq",
        price: 30,
        duration: 60,
      },
      {
        id: "12-2",
        name: "10 məşqlik paket",
        description: "10 fərdi məşqdən ibarət paket",
        price: 250,
        duration: 600,
      },
    ],
  },

  {
    id: "13",
    name: "Leyla Yoga",
    service: "Yoga",
    area: "Səbail",
    distance: 5.1,
    rating: 4.7,
    reviewCount: 66,
    priceFrom: 15,
    verified: false,

    services: [
      {
        id: "13-1",
        name: "Qrup dərsi",
        description: "Qrup şəklində yoga dərsi",
        price: 15,
        duration: 60,
      },
      {
        id: "13-2",
        name: "Fərdi dərs",
        description: "Şəxsi yoga məşqi",
        price: 40,
        duration: 60,
      },
    ],
  },
];