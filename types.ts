
export interface HistoricalPlace {
  name: string;
  description: string;
  historicalPeriod: string;
  latitude: number;
  longitude: number;
  country: string;
  significance: string;
  category: string;
  visualImpact: string;
  bestViewingTime: string;
  historicalContext: string;
  zoom_level: number;
}

export interface Category {
  key: string;
  name: string;
  emoji: string;
}
