import { computed, Injectable, signal } from '@angular/core';
import { AircraftStreamService } from './aircraft-stream.service';

@Injectable({ providedIn: 'root' })
export class AircraftFilterService {
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

    return this.aircraftStream
      .aircraft()
      .filter(
        (aircraft) =>
          aircraft.altitudeM >= altitudeMin &&
          aircraft.altitudeM <= altitudeMax &&
          aircraft.speedKmh >= speedMin &&
          aircraft.speedKmh <= speedMax,
      );
  });
}
