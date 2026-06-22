import * as Location from 'expo-location';

import { calculateDistanceKm, isNearSummit } from '@/utils/distanceUtils';

export interface LocationResult {
  granted: boolean;
  latitude?: number;
  longitude?: number;
}

export const locationService = {
  async getPermissionStatus(): Promise<Location.PermissionStatus> {
    return (await Location.getForegroundPermissionsAsync()).status;
  },

  async getCurrentLocation(requestPermission = true): Promise<LocationResult> {
    let permission = await Location.getForegroundPermissionsAsync();
    if (permission.status !== Location.PermissionStatus.GRANTED && requestPermission && permission.canAskAgain) {
      permission = await Location.requestForegroundPermissionsAsync();
    }
    if (permission.status !== Location.PermissionStatus.GRANTED) return { granted: false };
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return {
      granted: true,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  },

  distanceTo(latitude: number, longitude: number, targetLatitude: number, targetLongitude: number): number {
    return calculateDistanceKm(latitude, longitude, targetLatitude, targetLongitude);
  },

  isSummitVerified(distanceKm: number): boolean {
    return isNearSummit(distanceKm);
  },
};
