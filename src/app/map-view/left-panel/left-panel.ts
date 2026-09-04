import { Component, signal, input, output, inject } from '@angular/core';
import { Filters } from './filters/filters';
import { Statistics } from './statistics/statistics';
import { Settings } from './settings/settings';
import { AircraftStreamService } from '../../services/aircraft-stream.service';

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
  private readonly aircraftStream = inject(AircraftStreamService);
  readonly connectionStatus = this.aircraftStream.connectionStatus;

  toggle(): void {
    this.isVisible.update((visible) => !visible);
    this.visibleChange.emit(this.isVisible());
  }
}
