import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-filters',
  imports: [],
  templateUrl: './filters.html',
  styleUrl: './filters.scss',
})
export class Filters {
  readonly isExpanded = signal(false);

  toggle(): void {
    this.isExpanded.update((expanded) => !expanded);
  }
}
