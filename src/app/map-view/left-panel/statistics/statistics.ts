import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-statistics',
  imports: [],
  templateUrl: './statistics.html',
  styleUrl: './statistics.scss',
})
export class Statistics {
  readonly isExpanded = signal(false);

  toggle(): void {
    this.isExpanded.update((expanded) => !expanded);
  }
}
