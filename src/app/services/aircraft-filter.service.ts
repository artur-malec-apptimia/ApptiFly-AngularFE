import { computed, Injectable, signal } from '@angular/core';
import { AircraftStreamService } from './aircraft-stream.service';

@Injectable({ providedIn: 'root' })
export class AircraftFilterService {
  readonly search = signal('');
  readonly maximumAltitude = 15_000;
  readonly maximumSpeed = 1_300;
  readonly altitudeMin = signal(0);
  readonly altitudeMax = signal(this.maximumAltitude);
  readonly speedMin = signal(0);
  readonly speedMax = signal(this.maximumSpeed);

  constructor(private readonly aircraftStream: AircraftStreamService) {}

  readonly visibleAircraft = computed(() => {
    const altitudeMin = this.altitudeMin();
    const altitudeMax = this.altitudeMax();
    const speedMin = this.speedMin();
    const speedMax = this.speedMax();
    const search = this.search().trim().toLowerCase();

    return this.aircraftStream.aircraft().filter((aircraft) => {
      const matchesAltitude =
        aircraft.altitudeM >= altitudeMin && aircraft.altitudeM <= altitudeMax;

      const matchesSpeed = aircraft.speedKmh >= speedMin && aircraft.speedKmh <= speedMax;

      const matchesSearch =
        !search ||
        aircraft.callsign.toLowerCase().includes(search) ||
        aircraft.hex.toLowerCase().includes(search);

      return matchesAltitude && matchesSpeed && matchesSearch;
    });
  });
}
