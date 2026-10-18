"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import LimitesMunicipales from "@/components/LimitesMunicipales";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const CENTRO_INICIAL = [19.45, -99.6];

const icono = L.icon({
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});

function SeleccionarPunto({ onSeleccionar }) {
  useMapEvents({
    click(evento) {
      onSeleccionar(evento.latlng.lat, evento.latlng.lng);
    },
  });

  return null;
}

function CentrarMapa({ posicion }) {
  const mapa = useMap();

  useEffect(() => {
    if (posicion) {
      mapa.setView(posicion, 16);
    }
  }, [mapa, posicion?.[0], posicion?.[1]]);

  return null;
}

export default function MapaUbicacionLeaflet({
  latitud,
  longitud,
  onSeleccionar,
}) {
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);
  const [error, setError] = useState("");

  const posicion =
    latitud !== "" &&
    longitud !== "" &&
    latitud != null &&
    longitud != null &&
    Number.isFinite(Number(latitud)) &&
    Number.isFinite(Number(longitud))
      ? [Number(latitud), Number(longitud)]
      : null;

  function usarMiUbicacion() {
    setError("");

    if (!navigator.geolocation) {
      setError("Tu navegador no permite obtener la ubicación.");
      return;
    }

    setObteniendoUbicacion(true);

    navigator.geolocation.getCurrentPosition(
      (resultado) => {
        onSeleccionar(resultado.coords.latitude, resultado.coords.longitude);
        setObteniendoUbicacion(false);
      },
      () => {
        setError("No se pudo obtener tu ubicación.");
        setObteniendoUbicacion(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
      },
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={usarMiUbicacion}
        disabled={obteniendoUbicacion}
      >
        {obteniendoUbicacion ? "Obteniendo ubicación..." : "Usar mi ubicación"}
      </button>

      <p>
        Haz clic en el mapa o arrastra el marcador para indicar dónde ocurrió la
        situación.
      </p>

      <MapContainer
        center={CENTRO_INICIAL}
        zoom={9}
        scrollWheelZoom={false}
        style={{ height: "350px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LimitesMunicipales />

        <SeleccionarPunto onSeleccionar={onSeleccionar} />

        <CentrarMapa posicion={posicion} />

        {posicion && (
          <Marker
            position={posicion}
            icon={icono}
            draggable
            eventHandlers={{
              dragend(evento) {
                const punto = evento.target.getLatLng();
                onSeleccionar(punto.lat, punto.lng);
              },
            }}
          />
        )}
      </MapContainer>

      {posicion && (
        <p>
          Coordenadas: {posicion[0].toFixed(6)}, {posicion[1].toFixed(6)}
        </p>
      )}

      {error && <p role="alert">{error}</p>}
    </div>
  );
}
