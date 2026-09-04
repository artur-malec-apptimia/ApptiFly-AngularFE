import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { AircraftStreamService } from '../../../services/aircraft-stream.service';
import { HttpClient } from '@angular/common/http';

interface FlightNumberResponse {
  last_day: number;
  last_week: number;
  last_month: number;
}

@Component({
  selector: 'app-statistics',
  imports: [],
  templateUrl: './statistics.html',
  styleUrl: './statistics.scss',
})
export class Statistics implements OnInit {
  private readonly aircraftStream = inject(AircraftStreamService);
  private readonly http = inject(HttpClient);

  readonly isExpanded = signal(false);
  readonly currentlyOnAir = computed(() => this.aircraftStream.aircraft().length);
  readonly spottedToday = signal(0);
  readonly trackedThisWeek = signal(0);
  readonly trackedLastMonth = signal(0);

  toggle(): void {
    this.isExpanded.update((expanded) => !expanded);
    if (this.isExpanded()) {
      this.loadStatistics();
    }
  }

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.http.get<FlightNumberResponse>('http://16.171.56.106:8080/flightnumber').subscribe({
      next: (data) => {
        this.spottedToday.set(data.last_day);
        this.trackedThisWeek.set(data.last_week);
        this.trackedLastMonth.set(data.last_month);
      },
      error: (error) => {
        console.error('Unable to load flight statistics:', error);
      },
    });
  }
}
