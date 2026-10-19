"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

const CENTRO_INICIAL = [23.6345, -102.5528];

const iconoUbicacion = L.divIcon({
  className: "reporte-marcador",
  html: '<div class="reporte-marcador-punto"></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

/**
 * Centra el mapa cuando cambian las coordenadas,
 * por ejemplo, al utilizar el GPS.
 *
 * @component
 */
function CentrarMapa({ latitud, longitud }) {
  const mapa = useMap();

  useEffect(() => {
    if (latitud === "" || longitud === "") return;

    mapa.flyTo([Number(latitud), Number(longitud)], 16, { duration: 1 });
  }, [latitud, longitud, mapa]);

  return null;
}

/**
 * Permite seleccionar un punto haciendo clic
 * sobre el mapa.
 *
 * @component
 */
function SeleccionarPunto({ onSeleccionar }) {
  useMapEvents({
    click(evento) {
      onSeleccionar(evento.latlng.lat, evento.latlng.lng);
    },
  });

  return null;
}

/**
 * Mapa interactivo de ubicación de reportes RIETI.
 *
 * Utiliza OpenStreetMap y permite seleccionar
 * o arrastrar un marcador para modificar
 * las coordenadas del reporte.
 *
 * @component
 */
export default function MapaUbicacionLeaflet({
  latitud,
  longitud,
  onSeleccionar,
}) {
  const tieneUbicacion =
    latitud !== "" &&
    longitud !== "" &&
    Number.isFinite(Number(latitud)) &&
    Number.isFinite(Number(longitud));

  const posicion = tieneUbicacion ? [Number(latitud), Number(longitud)] : null;

  return (
    <MapContainer
      center={CENTRO_INICIAL}
      zoom={5}
      minZoom={3}
      maxZoom={19}
      scrollWheelZoom={true}
      className="reporte-mapa-leaflet"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      <SeleccionarPunto onSeleccionar={onSeleccionar} />

      <CentrarMapa latitud={latitud} longitud={longitud} />

      {posicion && (
        <Marker
          position={posicion}
          icon={iconoUbicacion}
          draggable={true}
          eventHandlers={{
            dragend(evento) {
              const nuevaPosicion = evento.target.getLatLng();

              onSeleccionar(nuevaPosicion.lat, nuevaPosicion.lng);
            },
          }}
        />
      )}
    </MapContainer>
  );
}
