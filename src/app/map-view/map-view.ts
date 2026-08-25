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

    ngAfterViewInit(): void {
       this.map = L.map('map', {
        zoomControl: false,
        }).setView([53.428543, 14.552812], 13);

      L.control.zoom({
      position: 'topright',
      }).addTo(this.map);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(this.map);
    }

    ngOnDestroy(): void {
      this.map?.remove();
    }

    locateMe(): void {
      console.log('Locate me button clicked');
    }
}
