import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-bottom-panel',
  imports: [],
  templateUrl: './bottom-panel.html',
  styleUrl: './bottom-panel.scss',
})
export class BottomPanel {
  readonly isVisible = signal(true);

  toggle(): void {
    this.isVisible.update((visible) => !visible);
  }
}
