import { FishingSpot } from "@/types";
import spotLacAnnecy from "@/assets/spot-lac-annecy.jpg";
import spotEtangForet from "@/assets/spot-etang-foret.jpg";
import spotRiviereVal from "@/assets/spot-riviere-val.jpg";
import avatarJean from "@/assets/avatar-jean.jpg";

export const fishingSpots: FishingSpot[] = [
  {
    id: "1",
    name: "Lac d'Annecy",
    latitude: 45.8992,
    longitude: 6.1294,
    rating: 4.5,
    image: spotLacAnnecy,
    description: "Un magnifique lac alpin aux eaux cristallines, idéal pour la pêche de la truite et de l'omble chevalier.",
    fish: ["Truite", "Omble", "Brochet"],
    regulations: {
      permit: true,
      minSize: "Truite: 23cm, Brochet: 50cm",
      quotas: "6 truites/jour, 2 brochets/jour",
    },
    reviews: [
      {
        id: "1",
        userName: "Pierre Dupont",
        userAvatar: avatarJean,
        rating: 5,
        comment: "Excellent spot, j'ai attrapé une belle truite de 2kg ! L'eau est très claire et le cadre magnifique.",
        date: "15 mars 2024",
      },
      {
        id: "2",
        userName: "Marie Laurent",
        userAvatar: avatarJean,
        rating: 4,
        comment: "Très beau lieu, mais il faut arriver tôt le matin pour avoir les meilleures places.",
        date: "8 mars 2024",
      },
    ],
  },
  {
    id: "2",
    name: "Étang de la Forêt",
    latitude: 48.8566,
    longitude: 2.3522,
    rating: 4.2,
    image: spotEtangForet,
    description: "Étang paisible entouré de végétation luxuriante, parfait pour une journée de pêche relaxante. Accès payant sans permis national.",
    fish: ["Carpe", "Gardon", "Tanche"],
    regulations: {
      permit: false,
      minSize: "Carpe: 40cm",
      quotas: "No-kill recommandé pour les carpes",
    },
    pricing: {
      daily: "15€",
      day24h: "25€",
      yearly: "200€",
    },
    reviews: [
      {
        id: "3",
        userName: "Thomas Martin",
        userAvatar: avatarJean,
        rating: 4,
        comment: "Très calme et relaxant. J'ai pris plusieurs gardons et une belle carpe miroir.",
        date: "22 mars 2024",
      },
    ],
  },
  {
    id: "3",
    name: "Rivière du Val",
    latitude: 43.6047,
    longitude: 1.4442,
    rating: 4.8,
    image: spotRiviereVal,
    description: "Rivière dynamique traversant la campagne, réputée pour ses truites sauvages et ses paysages pittoresques.",
    fish: ["Truite fario", "Vairon", "Chevesne"],
    regulations: {
      permit: true,
      minSize: "Truite: 20cm",
      quotas: "6 truites/jour",
    },
    reviews: [
      {
        id: "4",
        userName: "Luc Bernard",
        userAvatar: avatarJean,
        rating: 5,
        comment: "Le meilleur spot de la région ! Les truites sont nombreuses et combatives.",
        date: "1 avril 2024",
      },
      {
        id: "5",
        userName: "Sophie Moreau",
        userAvatar: avatarJean,
        rating: 5,
        comment: "Magnifique rivière avec des truites sauvages. Un vrai paradis pour les pêcheurs à la mouche.",
        date: "28 mars 2024",
      },
    ],
  },
];
