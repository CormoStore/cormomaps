export interface FishingSpot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  rating: number;
  image: string;
  description: string;
  fish: string[];
  regulations: {
    permit: boolean;
    minSize: string;
    quotas: string;
  };
  reviews: Review[];
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
