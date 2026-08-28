import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-filters',
  imports: [],
  templateUrl: './filters.html',
  styleUrl: './filters.scss',
})
export class Filters {
  readonly isExpanded = signal(false);
  readonly search = signal('');
  readonly altitudeMin = signal(0);
  readonly altitudeMax = signal(15_000);
  readonly speedMin = signal(0);
  readonly speedMax = signal(1_300);
  readonly isCategoryMenuOpen = signal(false);
  readonly selectedCategories = signal<string[]>([]);
  readonly categories = ['Passenger', 'Cargo', 'Military', 'General aviation', 'Helicopter'];
  readonly categoryLabel = computed(() => {
    const selected = this.selectedCategories();
    return selected.length ? `${selected.length} selected` : 'All categories';
  });

  toggle(): void {
    this.isExpanded.update((expanded) => !expanded);
  }

  setSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  setAltitudeMin(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.altitudeMin.set(Math.min(value, this.altitudeMax()));
  }

  setAltitudeMax(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.altitudeMax.set(Math.max(value, this.altitudeMin()));
  }

  setSpeedMin(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.speedMin.set(Math.min(value, this.speedMax()));
  }

  setSpeedMax(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.speedMax.set(Math.max(value, this.speedMin()));
  }

  toggleCategory(category: string): void {
    this.selectedCategories.update((selected) =>
      selected.includes(category)
        ? selected.filter((item) => item !== category)
        : [...selected, category],
    );
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories().includes(category);
  }

  percent(value: number, max: number): number {
    return (value / max) * 100;
  }
}
