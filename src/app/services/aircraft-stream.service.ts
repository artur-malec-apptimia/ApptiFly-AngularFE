import { Injectable } from '@angular/core';

export interface LiveAircraft {
  now: number;
  hex: string;
  flight: string;
  alt_baro: number;
  gs: number;
  track: number;
  lat: number;
  lon: number;
  rssi: number;
}

@Injectable({ providedIn: 'root' })
export class AircraftStreamService {
  connect(onAircraft: (aircraft: LiveAircraft) => void): WebSocket {
    const socket = new WebSocket('ws://16.171.56.106:8080/ws');

    socket.onopen = () => {
      console.log('Connected to aircraft stream');
    };

    socket.onmessage = (event) => {
      onAircraft(JSON.parse(event.data) as LiveAircraft);
    };

    socket.onerror = (error) => {
      console.error('Aircraft stream error:', error);
    };

    socket.onclose = () => {
      console.log('Aircraft stream disconnected');
    };

    return socket;
  }
}
