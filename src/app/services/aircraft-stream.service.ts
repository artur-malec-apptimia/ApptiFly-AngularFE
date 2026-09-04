import { computed, Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface LiveAircraft {
  now: number;
  hex: string;
  flight: string;
  alt_baro: number;
  gs: number;
  track: number;
  lat: number;
  lon: number;
  rssi: number;
}

export interface TrackedAircraft {
  hex: string;
  callsign: string;
  category: string;
  altitudeM: number;
  speedKmh: number;
  lat: number;
  lon: number;
  track: number;
  distanceKm: number | null;
  lastSeenAt: number;
}

interface AircraftInfoResponse {
  hex: string;
  data: {
    category?: unknown;
  };
}

@Injectable({ providedIn: 'root' })
export class AircraftStreamService {
  private socket?: WebSocket;
  private readonly http = inject(HttpClient);
  private readonly categoryRequestsInFlight = new Set<string>();
  private readonly categoryRetryAt = new Map<string, number>();
  private readonly staleAfterMs = 15_000;
  private readonly cleanupIntervalMs = 1_000;
  private staleTimer?: ReturnType<typeof setInterval>;
  readonly aircraft = computed(() => {
    const receiver = this.receiverLocation();

    return [...this.aircraftByHex().values()].map((aircraft) => ({
      ...aircraft,
      distanceKm: receiver
        ? this.calculateDistanceKm(receiver.lat, receiver.lon, aircraft.lat, aircraft.lon)
        : null,
    }));
  });
  private readonly aircraftByHex = signal(new Map<string, Omit<TrackedAircraft, 'distanceKm'>>());
  private readonly receiverLocation = signal<{ lat: number; lon: number } | null>(null);
  private readonly connectionState = signal<'connected' | 'disconnected'>('disconnected');
  readonly connectionStatus = this.connectionState.asReadonly();

  start(): void {
    this.connectionState.set('disconnected');

    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    this.socket = new WebSocket('ws://16.171.56.106:8080/ws');

    this.socket.onopen = () => {
      this.connectionState.set('connected');
      console.log('Connected to aircraft stream');
    };

    this.socket.onmessage = (event) => {
      const raw = JSON.parse(event.data) as LiveAircraft;

      this.aircraftByHex.update((current) => {
        const existing = current.get(raw.hex);
        const next = new Map(current);

        next.set(raw.hex, {
          hex: raw.hex,
          callsign: raw.flight.trim() || raw.hex,
          category: existing?.category ?? 'Unknown',
          altitudeM: raw.alt_baro * 0.3048,
          speedKmh: raw.gs * 1.852,
          lat: raw.lat,
          lon: raw.lon,
          track: raw.track,
          lastSeenAt: Date.now(),
        });

        return next;
      });

      if (this.aircraftByHex().get(raw.hex)?.category === 'Unknown') {
        this.loadAircraftCategory(raw.hex);
      }
    };

    this.socket.onerror = (error) => {
      this.connectionState.set('disconnected');
      console.error('Aircraft stream error:', error);
    };

    this.socket.onclose = () => {
      this.connectionState.set('disconnected');
      console.log('Aircraft stream disconnected');
    };

    this.startStaleAircraftCleanup();
  }

  stop(): void {
    this.connectionState.set('disconnected');
    this.socket?.close();
    this.socket = undefined;

    clearInterval(this.staleTimer);
    this.staleTimer = undefined;
  }

  setReceiverLocation(lat: number, lon: number): void {
    this.receiverLocation.set({ lat, lon });
  }

  private calculateDistanceKm(
    fromLat: number,
    fromLon: number,
    toLat: number,
    toLon: number,
  ): number {
    const earthRadiusKm = 6371;
    const radians = (value: number) => (value * Math.PI) / 180;

    const latitudeDifference = radians(toLat - fromLat);
    const longitudeDifference = radians(toLon - fromLon);

    const a =
      Math.sin(latitudeDifference / 2) ** 2 +
      Math.cos(radians(fromLat)) *
        Math.cos(radians(toLat)) *
        Math.sin(longitudeDifference / 2) ** 2;

    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private startStaleAircraftCleanup(): void {
    clearInterval(this.staleTimer);

    this.staleTimer = setInterval(() => {
      const cutoff = Date.now() - this.staleAfterMs;

      this.aircraftByHex.update((current) => {
        const next = new Map([...current].filter(([, aircraft]) => aircraft.lastSeenAt >= cutoff));

        return next;
      });
    }, this.cleanupIntervalMs);
  }

  private loadAircraftCategory(hex: string): void {
    const retryAt = this.categoryRetryAt.get(hex) ?? 0;

    if (this.categoryRequestsInFlight.has(hex) || Date.now() < retryAt) {
      return;
    }

    this.categoryRequestsInFlight.add(hex);

    console.log(`Requesting category for ${hex}`);

    this.http
      .get<AircraftInfoResponse>(`http://16.171.56.106:8080/acinfo?hex=${encodeURIComponent(hex)}`)
      .subscribe({
        next: (response) => {
          const category =
            typeof response.data.category === 'string' ? response.data.category : 'Unknown';

          console.log(`Category loaded for ${hex}:`, category);

          this.aircraftByHex.update((current) => {
            const aircraft = current.get(hex);

            if (!aircraft) {
              return current;
            }

            const next = new Map(current);

            next.set(hex, {
              ...aircraft,
              category,
            });

            return next;
          });

          if (category === 'Unknown') {
            this.categoryRetryAt.set(hex, Date.now() + 30_000);
          } else {
            this.categoryRetryAt.delete(hex);
          }

          this.categoryRequestsInFlight.delete(hex);
        },
        error: (error) => {
          console.error(`Could not load category for ${hex}:`, error);
          this.categoryRetryAt.set(hex, Date.now() + 30_000);
          this.categoryRequestsInFlight.delete(hex);
        },
      });
  }
}
