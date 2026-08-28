import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  readonly isExpanded = signal(false);

  toggle(): void {
    this.isExpanded.update((expanded) => !expanded);
  }
}
