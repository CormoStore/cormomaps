export interface FishingSpot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  rating: number;
  image: string;
  images?: string[]; // Additional photos
  description: string;
  fish: string[];
  regulations: {
    permit: boolean;
    minSize: string;
    quotas: string;
  };
  pricing?: {
    daily: string;
    day24h: string;
    yearly: string;
  };
  reviews: Review[];
  isCustom?: boolean; // To identify user-created spots
}

export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Region {
  id: string;
  name: string;
  code: string;
}
