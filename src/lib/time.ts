// 徒歩時間（分）
export function calcWalkTime(distanceMeter: number): number {
  return Math.ceil(distanceMeter / 80)
}

// 出発時刻逆算
export function calcDepartureTime(
  arrivalTime: string,
  transportMin: number,
  walkMin: number
): string {
  const [h, m] = arrivalTime.split(":").map(Number)
  const date = new Date()
  date.setHours(h, m)
  date.setMinutes(date.getMinutes() - transportMin - walkMin)

  return date.toTimeString().slice(0, 5)
}
