import {
  Component,
  signal,
  computed,
  ElementRef,
  HostListener,
  ViewChild,
  inject,
} from '@angular/core';
import { UnitService } from '../../../services/unitService';

@Component({
  selector: 'app-filters',
  imports: [],
  templateUrl: './filters.html',
  styleUrl: './filters.scss',
})
export class Filters {
  readonly maximumAltitude = 15_000;
  readonly maximumSpeed = 1_300;
  readonly unitService = inject(UnitService);
  readonly isExpanded = signal(false);
  readonly search = signal('');
  readonly altitudeMin = signal(0);
  readonly altitudeMax = signal(this.maximumAltitude);
  readonly speedMin = signal(0);
  readonly speedMax = signal(this.maximumSpeed);
  readonly isCategoryMenuOpen = signal(false);
  readonly selectedCategories = signal<string[]>([]);
  readonly categories = ['Passenger', 'Cargo', 'Military', 'General aviation', 'Helicopter'];
  readonly categoryLabel = computed(() => {
    const selected = this.selectedCategories();
    return selected.length ? `${selected.length} selected` : 'All categories';
  });
  readonly hasActiveFilters = computed(
    () =>
      this.altitudeMin() !== 0 ||
      this.altitudeMax() !== this.maximumAltitude ||
      this.speedMin() !== 0 ||
      this.speedMax() !== this.maximumSpeed ||
      this.selectedCategories().length > 0,
  );
  readonly categoryQuery = signal('');

  readonly filteredCategories = computed(() => {
    const query = this.categoryQuery().trim().toLowerCase();

    return query
      ? this.categories.filter((category) => category.toLowerCase().includes(query))
      : this.categories;
  });

  readonly displayedMaximumAltitude = computed(() => this.altitudeForDisplay(this.maximumAltitude));

  readonly displayedMaximumSpeed = computed(() => this.speedForDisplay(this.maximumSpeed));

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

  compactValue(value: number): string {
    const rounded = Math.round(value);

    if (rounded < 1_000) {
      return String(rounded);
    }

    const thousands = rounded / 1_000;

    return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}k`;
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
    const value = Math.min(this.altitudeFromDisplay(Number(input.value)), this.altitudeMax());

    this.altitudeMin.set(value);
    input.value = String(this.altitudeForDisplay(value));
  }

  setAltitudeMax(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Math.max(this.altitudeFromDisplay(Number(input.value)), this.altitudeMin());

    this.altitudeMax.set(value);
    input.value = String(this.altitudeForDisplay(value));
  }

  setSpeedMin(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Math.min(this.speedFromDisplay(Number(input.value)), this.speedMax());

    this.speedMin.set(value);
    input.value = String(this.speedForDisplay(value));
  }

  setSpeedMax(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Math.max(this.speedFromDisplay(Number(input.value)), this.speedMin());

    this.speedMax.set(Math.max(value, this.speedMin()));
    input.value = String(this.speedForDisplay(this.speedMax()));
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

  altitudeForDisplay(meters: number): number {
    return this.unitService.system() === 'metric'
      ? Math.round(meters)
      : Math.round(meters * 3.28084);
  }

  altitudeFromDisplay(value: number): number {
    return this.unitService.system() === 'metric' ? value : Math.round(value / 3.28084);
  }

  speedForDisplay(kmh: number): number {
    return this.unitService.system() === 'metric' ? Math.round(kmh) : Math.round(kmh / 1.852);
  }

  speedFromDisplay(value: number): number {
    return this.unitService.system() === 'metric' ? value : Math.round(value * 1.852);
  }

  resetSliders(): void {
    this.search.set('');
    this.altitudeMin.set(0);
    this.altitudeMax.set(this.maximumAltitude);
    this.speedMin.set(0);
    this.speedMax.set(this.maximumSpeed);
    this.categoryQuery.set('');
    this.selectedCategories.set([]);
    this.isCategoryMenuOpen.set(false);
  }
}
