import { Component, signal, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-view',
  imports: [],
  templateUrl: './map-view.html',
  styleUrl: './map-view.scss',
})
export class MapViewComponent implements AfterViewInit, OnDestroy {
  private map?: L.Map;

  readonly minZoom = 9;
  readonly maxZoom = 14;
  readonly zoomPercent = signal(0);

  @ViewChild('mapShell')
  private mapShell?: ElementRef<HTMLElement>;

  async toggleFullscreen(): Promise<void> {
    const element = this.mapShell?.nativeElement;

    if (!element) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await element.requestFullscreen();
    }
  }

  zoomIn(): void {
    this.map?.zoomIn();
  }

  zoomOut(): void {
    this.map?.zoomOut();
  }

  ngAfterViewInit(): void {
    this.map = L.map('map', {
      zoomControl: false,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
      zoomDelta: 0.8,
      zoomSnap: 0.1,
    }).setView([53.428543, 14.552812], 13);

    this.updateZoomPercent();
    this.map.on('zoomend', () => {
      this.updateZoomPercent();
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    }).addTo(this.map);
  }

  private updateZoomPercent(): void {
    if (!this.map) return;

    const zoom = this.map.getZoom() ?? this.minZoom;
    const percent = ((zoom - this.minZoom) / (this.maxZoom - this.minZoom)) * 100;
    this.zoomPercent.set(Math.round(percent));
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  locateMe(): void {
    console.log('Locate me button clicked');
  }
}
