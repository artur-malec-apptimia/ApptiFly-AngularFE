import { Component, signal, output } from '@angular/core';

@Component({
  selector: 'app-bottom-panel',
  imports: [],
  templateUrl: './bottom-panel.html',
  styleUrl: './bottom-panel.scss',
})
export class BottomPanel {
  readonly isVisible = signal(true);
  readonly rightPanelOpen = output<void>();

  toggle(): void {
    this.isVisible.update((visible) => !visible);
  }
}
