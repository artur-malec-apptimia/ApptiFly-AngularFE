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
  private locationMarker?: L.CircleMarker;

  readonly minZoom = 9;
  readonly maxZoom = 14;
  readonly zoomPercent = signal(0);
  readonly receiverLat = 53.428543;
  readonly receiverLong = 14.552812;

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
    }).setView([this.receiverLat, this.receiverLong], 13);

    this.updateZoomPercent();
    this.map.on('zoomend', () => {
      this.updateZoomPercent();
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(this.map);
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
    const map = this.map;

    if (!map || !navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location: L.LatLngExpression = [
          coords.latitude,
          coords.longitude,
        ];

        map.setView(location, 15, { animate: true });

        this.locationMarker?.remove();
        this.locationMarker = L.circleMarker(location, {
          radius: 9,
          color: '#ffffff',
          weight: 3,
          fillColor: '#2563eb',
          fillOpacity: 1,
        })
          .addTo(map)
          .openPopup();
      },
      (error) => {
        console.error('Unable to retrieve location:', error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 0,
      },
    );
  }

  centerOnReceiver(): void {
    if (!this.map) return;

    const receiverLocation: L.LatLngExpression = [
      this.receiverLat,
      this.receiverLong,
    ];

    this.map.setView(receiverLocation, 13, { animate: true });
  }
}
