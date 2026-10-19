
"use client";

import { useEffect, useRef, useState } from "react";

export default function MapaExpediente({
  latitud,
  longitud,
  folio,
}) {
  const contenedorRef = useRef(null);
  const mapaRef = useRef(null);
  const marcadorRef = useRef(null);
  const leafletRef = useRef(null);
  const [error, setError] = useState("");

  const sinCoordenadas =
    latitud == null ||
    longitud == null ||
    String(latitud).trim() === "" ||
    String(longitud).trim() === "";

  const lat = Number(latitud);
  const lon = Number(longitud);

  const coordenadasValidas =
    !sinCoordenadas &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180 &&
    !(lat === 0 && lon === 0);

  useEffect(() => {
    if (!coordenadasValidas) return;

    let cancelado = false;
    let observador;

    async function cargarMapa() {
      setError("");

      const L = (await import("leaflet")).default;

      if (cancelado || !contenedorRef.current) return;

      leafletRef.current = L;

      const mapa = L.map(contenedorRef.current, {
        center: [lat, lon],
        zoom: 16,
        minZoom: 5,
        maxZoom: 19,
        scrollWheelZoom: false,
      });

      mapaRef.current = mapa;

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }
      ).addTo(mapa);

      const icono = L.divIcon({
        html: '<span class="rieti-expediente-marcador-punto"></span>',
        className: "rieti-expediente-marcador",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marcador = L.marker([lat, lon], {
        icon: icono,
        draggable: false,
      }).addTo(mapa);

      marcadorRef.current = marcador;

      const contenido = document.createElement("div");
      const titulo = document.createElement("strong");
      const descripcion = document.createElement("p");

      titulo.textContent = folio
        ? `Folio: ${folio}`
        : "Ubicación del reporte";

      descripcion.textContent = "Ubicación registrada del caso";

      contenido.append(titulo, descripcion);

      marcador.bindPopup(contenido);

      observador = new ResizeObserver(() => {
        mapa.invalidateSize();
      });

      observador.observe(contenedorRef.current);

      requestAnimationFrame(() => {
        if (!cancelado) {
          mapa.invalidateSize();
        }
      });
    }

    cargarMapa().catch((error) => {
      if (!cancelado) {
        console.error("Error al cargar mapa del expediente:", error);
        setError("No se pudo cargar el mapa del expediente.");
      }
    });

    return () => {
      cancelado = true;
      observador?.disconnect();
      marcadorRef.current = null;
      leafletRef.current = null;
      mapaRef.current?.remove();
      mapaRef.current = null;
    };
  }, [coordenadasValidas, lat, lon, folio]);

  if (!coordenadasValidas) {
    return (
      <div className="expediente-mapa-sin-ubicacion">
        No hay coordenadas válidas disponibles para mostrar
        la ubicación de este reporte.
      </div>
    );
  }

  return (
    <div className="expediente-mapa-contenedor">
      {error && (
        <p className="expediente-aviso error" role="alert">
          {error}
        </p>
      )}

      <div
        ref={contenedorRef}
        className="expediente-mapa"
        aria-label={`Mapa de ubicación del reporte ${folio ?? ""}`}
      />
    </div>
  );
}
