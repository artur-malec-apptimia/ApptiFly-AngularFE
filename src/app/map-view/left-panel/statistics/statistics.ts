import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-statistics',
  imports: [],
  templateUrl: './statistics.html',
  styleUrl: './statistics.scss',
})
export class Statistics {
  readonly isExpanded = signal(false);
  readonly currentlyOnAir = signal(0);
  readonly spottedToday = signal(0);
  readonly trackedThisWeek = signal(0);
  readonly trackedLastThirtyDays = signal(0);

  toggle(): void {
    this.isExpanded.update((expanded) => !expanded);
  }
}
