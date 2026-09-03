import { Component, signal, output, input, inject } from '@angular/core';
import type { TrackedAircraft } from '../../services/aircraft-stream.service';
import { DecimalPipe } from '@angular/common';
import { UnitService } from '../../services/unitService';

@Component({
  selector: 'app-bottom-panel',
  imports: [DecimalPipe],
  templateUrl: './bottom-panel.html',
  styleUrl: './bottom-panel.scss',
})
export class BottomPanel {
  readonly isVisible = signal(true);
  readonly rightPanelOpen = output<void>();
  readonly aircraft = input.required<TrackedAircraft[]>();
  readonly unitService = inject(UnitService);

  toggle(): void {
    this.isVisible.update((visible) => !visible);
  }
}
