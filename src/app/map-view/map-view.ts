import {
  Component,
  signal,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  inject,
  effect,
} from '@angular/core';
import * as L from 'leaflet';
import { LeftPanel } from './left-panel/left-panel';
import { BottomPanel } from './bottom-panel/bottom-panel';
import { RightPanel } from './right-panel/right-panel';
import { AircraftStreamService } from '../services/aircraft-stream.service';
import type { TrackedAircraft } from '../services/aircraft-stream.service';
import { AircraftFilterService } from '../services/aircraft-filter.service';

@Component({
  selector: 'app-map-view',
  imports: [LeftPanel, BottomPanel, RightPanel],
  templateUrl: './map-view.html',
  styleUrl: './map-view.scss',
})
export class MapViewComponent implements AfterViewInit, OnDestroy {
  private map?: L.Map;
  private locationMarker?: L.CircleMarker;
  private baseLayer?: L.TileLayer;
  private readonly aircraftStream = inject(AircraftStreamService);
  private readonly aircraftFilter = inject(AircraftFilterService);
  private readonly aircraftMarkers = new Map<string, L.Marker>();
  private readonly aircraftMarkerSync = effect(() => {
    const aircraft = this.aircraft();

    if (this.map) {
      this.syncAircraftMarkers(aircraft);
    }
  });

  readonly minZoom = 9;
  readonly maxZoom = 14;
  readonly zoomPercent = signal(0);
  readonly receiverLat = 53.428543;
  readonly receiverLong = 14.552812;
  readonly isLayerMenuOpen = signal(false);
  readonly isLeftPanelVisible = signal(true);
  readonly isRightPanelVisible = signal(false);
  readonly aircraft = this.aircraftFilter.visibleAircraft;

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

    this.changeLayer('streets');
    this.syncAircraftMarkers(this.aircraft());
    this.aircraftStream.setReceiverLocation(this.receiverLat, this.receiverLong);
    this.aircraftStream.start();
  }

  private updateZoomPercent(): void {
    if (!this.map) return;

    const zoom = this.map.getZoom() ?? this.minZoom;
    const percent = ((zoom - this.minZoom) / (this.maxZoom - this.minZoom)) * 100;
    this.zoomPercent.set(Math.round(percent));
  }

  ngOnDestroy(): void {
    this.aircraftStream.stop();
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
        const location: L.LatLngExpression = [coords.latitude, coords.longitude];

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

    const receiverLocation: L.LatLngExpression = [this.receiverLat, this.receiverLong];

    this.map.setView(receiverLocation, 13, { animate: true });
  }

  private syncAircraftMarkers(aircraft: TrackedAircraft[]): void {
    if (!this.map) return;

    const activeAircraft = new Set<string>();

    for (const plane of aircraft) {
      if (!Number.isFinite(plane.lat) || !Number.isFinite(plane.lon)) {
        continue;
      }

      activeAircraft.add(plane.hex);

      const position: L.LatLngExpression = [plane.lat, plane.lon];
      const icon = this.createAircraftIcon(plane.track);

      const existingMarker = this.aircraftMarkers.get(plane.hex);

      if (existingMarker) {
        existingMarker.setLatLng(position);
        existingMarker.setIcon(icon);
      } else {
        const marker = L.marker(position, { icon })
          .addTo(this.map)
          .bindTooltip(plane.callsign, {
            direction: 'top',
            offset: [0, -14],
          });

        marker.on('click', () => {
          this.centerOnAircraftByHex(plane.hex);
        });

        this.aircraftMarkers.set(plane.hex, marker);
      }
    }

    for (const [hex, marker] of this.aircraftMarkers) {
      if (!activeAircraft.has(hex)) {
        marker.remove();
        this.aircraftMarkers.delete(hex);
      }
    }
  }

  private createAircraftIcon(track: number): L.DivIcon {
    const heading = Number.isFinite(track) ? track : 0;

    return L.divIcon({
      className: 'aircraft-map-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      html: `
        <img
          src="icons/Plane.png"
          alt=""
          style="
            display: block;
            width: 28px;
            height: 28px;
            transform: rotate(${heading}deg);
            transform-origin: center;
            filter: drop-shadow(0 1px 3px #000);
          "
        />
      `,
    });
  }

  changeLayer(layer: 'streets' | 'satellite' | 'topographic'): void {
    if (!this.map) return;

    this.baseLayer?.removeFrom(this.map);

    if (layer === 'topographic') {
      this.baseLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        subdomains: 'abc',
        attribution:
          'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)',
      });
    } else if (layer === 'satellite') {
      this.baseLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: 'Tiles © Esri',
        },
      );
    } else {
      this.baseLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      });
    }

    this.baseLayer.addTo(this.map);
  }

  toggleLayerMenu(): void {
    this.isLayerMenuOpen.update((isOpen) => !isOpen);
  }

  selectLayer(layer: 'streets' | 'satellite' | 'topographic'): void {
    this.changeLayer(layer);
    this.isLayerMenuOpen.set(false);
  }

  centerOnAircraft(aircraft: TrackedAircraft): void {
    if (!this.map) return;

    this.map.panTo([aircraft.lat, aircraft.lon], {
      animate: true,
      duration: 0.7,
    });

  }

  private centerOnAircraftByHex(hex: string): void {
    const aircraft = this.aircraft().find((plane) => plane.hex === hex);

    if (aircraft) {
      this.centerOnAircraft(aircraft);
    }
  }
}
