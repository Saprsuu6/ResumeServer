export interface PingResponse {
  gecko_says: string;
}

export interface CoinInfo {
  name: string;
  usd: number;
  usd_24h_change: number;
}

export interface IConcertPoster {
  imageUrl: string;
  eventName: string;
  description: string;
  date: Date;
  location: string;
  artists: string[];
  ticketPrice: number;
  availableTickets: number;
  eventType: string;
  organizer: string;
}
