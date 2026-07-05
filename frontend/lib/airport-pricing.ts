/** Extra charge per airport code on top of vehicle base airport price */
export const AIRPORT_PRICE_SURCHARGE: Record<string, number> = {
  DME: 1000,
};

export function getAirportPrice(
  basePrice: number | null | undefined,
  airportCode?: string,
): number | null {
  if (basePrice == null) return null;
  const surcharge = airportCode ? (AIRPORT_PRICE_SURCHARGE[airportCode] ?? 0) : 0;
  return Number(basePrice) + surcharge;
}
