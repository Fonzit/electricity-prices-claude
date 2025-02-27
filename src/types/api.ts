export interface Price {
  price: number;
  startDate: string;
  endDate: string;
}

// API returns an object with a prices array
export interface PriceResponse {
  prices: Price[];
}