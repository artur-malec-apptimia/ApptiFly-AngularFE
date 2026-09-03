import { Injectable, computed, signal } from '@angular/core';

export type UnitSystem = 'metric' | 'imperial';

@Injectable({ providedIn: 'root' })
export class UnitService {
  readonly system = signal<UnitSystem>('metric');

  readonly altitudeLabel = computed(() => (this.system() === 'metric' ? 'm' : 'ft'));

  readonly speedLabel = computed(() => (this.system() === 'metric' ? 'km/h' : 'kt'));

  readonly distanceLabel = computed(() => (this.system() === 'metric' ? 'km' : 'nm'));

  formatAltitude(meters: number): string {
    return this.system() === 'metric'
      ? `${Math.round(meters)} m`
      : `${Math.round(meters * 3.28084)} ft`;
  }

  formatSpeed(kmh: number): string {
    return this.system() === 'metric' ? `${Math.round(kmh)} km/h` : `${Math.round(kmh / 1.852)} kt`;
  }

  formatDistance(kilometers: number): string {
    return this.system() === 'metric'
      ? `${Math.round(kilometers)} km`
      : `${Math.round(kilometers * 0.539957)} nm`;
  }
}
