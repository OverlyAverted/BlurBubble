import { GeofenceZone } from '../types';

/**
 * Calculates Haversine distance between two lat/lng coordinates in meters.
 */
export function getHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Evaluates current position against all active geofence zones.
 * Returns the matching zone if inside a high-risk area.
 */
export function evaluateGeofences(
  currentPos: { lat: number; lng: number },
  zones: GeofenceZone[] = []
): { insideZone: GeofenceZone | null; distanceMeters: number } {
  for (const zone of zones) {
    if (!zone.isActive || !zone.triggerOnEnter) continue;
    const distanceMeters = getHaversineDistanceMeters(
      currentPos.lat,
      currentPos.lng,
      zone.lat,
      zone.lng
    );
    if (distanceMeters <= zone.radiusMeters) {
      return { insideZone: zone, distanceMeters };
    }
  }
  return { insideZone: null, distanceMeters: Infinity };
}
