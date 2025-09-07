
export interface PlaceDetail {
  label: string;
  value: string;
  icon: string; // e.g., 'calendar', 'globe', 'geology'
}

export interface HistoricalPlace {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  zoom_level: number;
  details: PlaceDetail[];
  locationType: 'point' | 'area';
  placeId: string; // Google Place ID
}

export interface Category {
  key: string;
  name: string;
  emoji: string;
}
