export interface TransportRoute {
  id: number;
  routeName?: string;
  name?: string;
  monthlyFee: number;
  busNumber?: string;
  description?: string;
  stops?: TransportStop[];
}

export interface TransportStop {
  id: number;
  routeId: number;
  stopName: string;
  fee: number;
}
