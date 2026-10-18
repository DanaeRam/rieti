"use client";

import { useEffect, useRef } from "react";

const CENTRO_EDOMEX = [19.35, -99.65];

function obtenerPuntos(reportes) {
  return reportes
    .filter((reporte) => {
      const lat = Number(reporte.latitud);
      const lon = Number(reporte.longitud);

      return (
        reporte.latitud != null &&
        reporte.longitud != null &&
        String(reporte.latitud).trim() !== "" &&
        String(reporte.longitud).trim() !== "" &&
        Number.isFinite(lat) &&
        Number.isFinite(lon) &&
        Math.abs(lat) <= 90 &&
        Math.abs(lon) <= 180 &&
        !(lat === 0 && lon === 0)
      );
    })
    .map((reporte) => [Number(reporte.latitud), Number(reporte.longitud), 1]);
}

export default function MapaCalor({ reportes = [] }) {
  const contenedorRef = useRef(null);
  const mapaRef = useRef(null);
  const calorRef = useRef(null);
  const reportesRef = useRef(reportes);

  reportesRef.current = reportes;

  useEffect(() => {
    let cancelado = false;

    async function cargarMapa() {
      const L = (await import("leaflet")).default;
      await import("leaflet.heat");

      if (cancelado || !contenedorRef.current) return;

      const mapa = L.map(contenedorRef.current, {
        center: CENTRO_EDOMEX,
        zoom: 9,
        scrollWheelZoom: false,
      });

      mapaRef.current = mapa;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapa);

      const puntos = obtenerPuntos(reportesRef.current);

      calorRef.current = L.heatLayer(puntos, {
        radius: 30,
        blur: 20,
        maxZoom: 15,
        minOpacity: 0.25,
        max: 1,
      }).addTo(mapa);

      if (puntos.length > 0) {
        mapa.fitBounds(L.latLngBounds(puntos.map(([lat, lon]) => [lat, lon])), {
          padding: [25, 25],
          maxZoom: 13,
        });
      }

      const respuesta = await fetch("/geojson/municipios-edomex.geojson");

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los límites municipales.");
      }

      const municipios = await respuesta.json();

      if (cancelado) return;

      mapa.createPane("limitesMunicipales");

      const panel = mapa.getPane("limitesMunicipales");

      panel.style.zIndex = 450;
      panel.style.pointerEvents = "none";

      L.geoJSON(municipios, {
        pane: "limitesMunicipales",
        style: {
          color: "#7955c8",
          weight: 0.7,
          opacity: 0.25,
          fill: false,
          interactive: false,
        },
      }).addTo(mapa);
    }

    cargarMapa().catch(console.error);

    return () => {
      cancelado = true;
      mapaRef.current?.remove();
      mapaRef.current = null;
      calorRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (calorRef.current) {
      calorRef.current.setLatLngs(obtenerPuntos(reportes));
    }
  }, [reportes]);

  return (
    <div
      ref={contenedorRef}
      className="rieti-mapa-calor"
      aria-label="Mapa de calor de reportes"
    />
  );
}
