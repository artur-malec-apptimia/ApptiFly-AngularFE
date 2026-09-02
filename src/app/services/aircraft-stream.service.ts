import { computed, Injectable, signal } from '@angular/core';

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
  altitudeM: number;
  speedKmh: number;
  lat: number;
  lon: number;
  lastSeenAt: number;
}

@Injectable({ providedIn: 'root' })
export class AircraftStreamService {
  private socket?: WebSocket;
  private staleTimer?: ReturnType<typeof setInterval>;

  private readonly aircraftByHex = signal(new Map<string, TrackedAircraft>());

  readonly aircraft = computed(() => [...this.aircraftByHex().values()]);

  start(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    this.socket = new WebSocket('ws://16.171.56.106:8080/ws');

    this.socket.onopen = () => {
      console.log('Connected to aircraft stream');
    };

    this.socket.onmessage = (event) => {
      const raw = JSON.parse(event.data) as LiveAircraft;

      this.aircraftByHex.update((current) => {
        const next = new Map(current);

        next.set(raw.hex, {
          hex: raw.hex,
          callsign: raw.flight.trim() || raw.hex,
          altitudeM: raw.alt_baro * 0.3048,
          speedKmh: raw.gs * 1.852,
          lat: raw.lat,
          lon: raw.lon,
          lastSeenAt: Date.now(),
        });

        return next;
      });
    };

    this.socket.onerror = (error) => {
      console.error('Aircraft stream error:', error);
    };

    this.socket.onclose = () => {
      console.log('Aircraft stream disconnected');
    };

    this.startStaleAircraftCleanup();
  }

  stop(): void {
    this.socket?.close();
    this.socket = undefined;

    clearInterval(this.staleTimer);
    this.staleTimer = undefined;
  }

  private startStaleAircraftCleanup(): void {
    clearInterval(this.staleTimer);

    this.staleTimer = setInterval(() => {
      const cutoff = Date.now() - 60_000;

      this.aircraftByHex.update((current) => {
        const next = new Map([...current].filter(([, aircraft]) => aircraft.lastSeenAt >= cutoff));

        return next;
      });
    }, 5_000);
  }
}
