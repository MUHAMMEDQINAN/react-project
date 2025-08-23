
"use client";

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';

interface LocationMapProps {
  lat: number;
  lng: number;
  tooltipText: string;
}

export function LocationMap({ lat, lng, tooltipText }: LocationMapProps) {
  const position: LatLngExpression = [lat, lng];

  return (
    <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position}>
        <Tooltip>{tooltipText}</Tooltip>
      </Marker>
    </MapContainer>
  );
}
