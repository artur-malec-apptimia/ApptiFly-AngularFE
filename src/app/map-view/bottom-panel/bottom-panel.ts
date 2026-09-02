import { Component, signal, output, input } from '@angular/core';
import type { TrackedAircraft } from '../../services/aircraft-stream.service';

@Component({
  selector: 'app-bottom-panel',
  imports: [],
  templateUrl: './bottom-panel.html',
  styleUrl: './bottom-panel.scss',
})
export class BottomPanel {
  readonly isVisible = signal(true);
  readonly rightPanelOpen = output<void>();
  readonly aircraft = input.required<TrackedAircraft[]>();

  toggle(): void {
    this.isVisible.update((visible) => !visible);
  }
}
