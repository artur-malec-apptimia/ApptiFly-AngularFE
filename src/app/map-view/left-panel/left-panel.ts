import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-left-panel',
  imports: [],
  templateUrl: './left-panel.html',
  styleUrl: './left-panel.scss',
})
export class LeftPanel {
  readonly isVisible = signal(true);

  toggle(): void {
    this.isVisible.update((visible) => !visible);
  }
}
