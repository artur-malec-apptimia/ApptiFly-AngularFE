import { Component, signal, computed, ElementRef, HostListener, ViewChild } from '@angular/core';

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
  readonly hasSliderChanges = computed(
    () =>
      this.altitudeMin() !== 0 ||
      this.altitudeMax() !== 15_000 ||
      this.speedMin() !== 0 ||
      this.speedMax() !== 1_300,
  );
  readonly categoryQuery = signal('');

  readonly filteredCategories = computed(() => {
    const query = this.categoryQuery().trim().toLowerCase();

    return query
      ? this.categories.filter((category) => category.toLowerCase().includes(query))
      : this.categories;
  });

  @ViewChild('categoryFilter')
  private categoryFilter?: ElementRef<HTMLElement>;

  @HostListener('document:pointerdown', ['$event'])
  closeCategoryOnOutsideClick(event: PointerEvent): void {
    if (!this.isCategoryMenuOpen()) return;

    const target = event.target;

    if (target instanceof Node && !this.categoryFilter?.nativeElement.contains(target)) {
      this.isCategoryMenuOpen.set(false);
    }
  }

  setCategoryQuery(event: Event): void {
    this.categoryQuery.set((event.target as HTMLInputElement).value);
    this.isCategoryMenuOpen.set(true);
  }

  toggle(): void {
    this.isExpanded.update((expanded) => !expanded);
  }

  setSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  setAltitudeMin(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Math.min(Number(input.value), this.altitudeMax());

    input.value = String(value);
    this.altitudeMin.set(value);
  }

  setAltitudeMax(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Math.max(Number(input.value), this.altitudeMin());

    input.value = String(value);
    this.altitudeMax.set(value);
  }

  setSpeedMin(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Math.min(Number(input.value), this.speedMax());

    input.value = String(value);
    this.speedMin.set(value);
  }

  setSpeedMax(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Math.max(Number(input.value), this.speedMin());

    input.value = String(value);
    this.speedMax.set(Math.max(value, this.speedMin()));
  }

  setAltitudeFromPointer(event: PointerEvent): void {
    if (event.target instanceof HTMLInputElement) return;

    const value = this.valueFromPointer(event, 15_000);
    const distanceToMin = Math.abs(value - this.altitudeMin());
    const distanceToMax = Math.abs(value - this.altitudeMax());

    if (distanceToMin <= distanceToMax) {
      this.altitudeMin.set(value);
    } else {
      this.altitudeMax.set(value);
    }
  }

  setSpeedFromPointer(event: PointerEvent): void {
    if (event.target instanceof HTMLInputElement) return;

    const value = this.valueFromPointer(event, 1_300);
    const distanceToMin = Math.abs(value - this.speedMin());
    const distanceToMax = Math.abs(value - this.speedMax());

    if (distanceToMin <= distanceToMax) {
      this.speedMin.set(value);
    } else {
      this.speedMax.set(value);
    }
  }

  private valueFromPointer(event: PointerEvent, max: number): number {
    const element = event.currentTarget as HTMLElement;
    const bounds = element.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));

    return Math.round(progress * max);
  }

  removeCategory(category: string): void {
    this.selectedCategories.update((selected) => selected.filter((item) => item !== category));
  }

  toggleCategory(category: string): void {
    this.selectedCategories.update((selected) =>
      selected.includes(category)
        ? selected.filter((item) => item !== category)
        : [...selected, category],
    );

    this.categoryQuery.set('');
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories().includes(category);
  }

  percent(value: number, max: number): number {
    return (value / max) * 100;
  }

  resetSliders(): void {
    this.altitudeMin.set(0);
    this.altitudeMax.set(15_000);
    this.speedMin.set(0);
    this.speedMax.set(1_300);
  }
}
