import { Component, signal, input, output } from '@angular/core';
import { Filters } from './filters/filters';
import { Statistics } from './statistics/statistics';
import { Settings } from './settings/settings';

@Component({
  selector: 'app-left-panel',
  imports: [Filters, Statistics, Settings],
  templateUrl: './left-panel.html',
  styleUrl: './left-panel.scss',
})
export class LeftPanel {
  readonly isVisible = signal(true);
  readonly visible = input.required<boolean>();
  readonly visibleChange = output<boolean>();

  toggle(): void {
    this.isVisible.update((visible) => !visible);
    this.visibleChange.emit(this.isVisible());
  }
}
