"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import {MapContainer, TileLayer, Marker, useMap, useMapEvents} from "react-leaflet";

const CENTRO_INICIAL = [19.4326, -99.1332];

const icono = L.icon({
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
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
        setError("No se pudo obtener tu ubicación");
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

      <p>Haz clic en el mapa o arrastra el marcador para elegir el lugar.</p>

      <MapContainer
        center={CENTRO_INICIAL}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: "350px", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

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
