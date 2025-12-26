export type Route = {
  id: string
  totalTimeMin: number
  fare: number
  departureTime: string
  arrivalTime: string
  transfers: number
}

// MVP用ダミー経路
export const mockRoutes: Route[] = [
  {
    id: "route-1",
    totalTimeMin: 45,
    fare: 420,
    departureTime: "08:15",
    arrivalTime: "09:00",
    transfers: 1,
  },
  {
    id: "route-2",
    totalTimeMin: 50,
    fare: 310,
    departureTime: "08:10",
    arrivalTime: "09:00",
    transfers: 2,
  },
]
