import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-right-panel',
  templateUrl: './right-panel.html',
  styleUrl: './right-panel.scss',
})
export class RightPanel {
  readonly visible = input.required<boolean>();
  readonly closed = output<void>();
}
