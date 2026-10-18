"use client";

import { useEffect, useRef } from "react";

const CENTRO_EDOMEX = [19.35, -99.65];

function agregarReportes(L, grupos, reportes) {
  grupos.clearLayers();

  const icono = L.divIcon({
    html: "<span></span>",
    className: "rieti-marcador",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  reportes.forEach((reporte) => {
    const lat = Number(reporte.latitud);
    const lon = Number(reporte.longitud);

    if (
      reporte.latitud == null ||
      reporte.longitud == null ||
      String(reporte.latitud).trim() === "" ||
      String(reporte.longitud).trim() === "" ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      Math.abs(lat) > 90 ||
      Math.abs(lon) > 180 ||
      (lat === 0 && lon === 0)
    ) {
      return;
    }

    const marcador = L.marker([lat, lon], { icon: icono });

    const contenido = document.createElement("div");
    contenido.textContent = `Folio: ${reporte.folio ?? "Sin folio"}`;

    marcador.bindPopup(contenido);
    grupos.addLayer(marcador);
  });
}

export default function MapaPuntos({ reportes = [] }) {
  const contenedorRef = useRef(null);
  const mapaRef = useRef(null);
  const gruposRef = useRef(null);
  const leafletRef = useRef(null);
  const reportesRef = useRef(reportes);

  reportesRef.current = reportes;

  useEffect(() => {
    let cancelado = false;

    async function cargarMapa() {
      const L = (await import("leaflet")).default;
      await import("leaflet.markercluster");

      if (cancelado || !contenedorRef.current) return;

      const mapa = L.map(contenedorRef.current, {
        center: CENTRO_EDOMEX,
        zoom: 9,
        scrollWheelZoom: false,
      });

      mapaRef.current = mapa;
      leafletRef.current = L;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapa);

      const grupos = L.markerClusterGroup({
        maxClusterRadius: 60,
        showCoverageOnHover: true,
        zoomToBoundsOnClick: true,
        spiderfyOnMaxZoom: true,

        iconCreateFunction: (cluster) => {
          const cantidad = cluster.getChildCount();

          return L.divIcon({
            html: `<span>${cantidad}</span>`,
            className: "rieti-cluster",
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          });
        },
      });

      gruposRef.current = grupos;

      grupos.addTo(mapa);

      agregarReportes(L, grupos, reportesRef.current);

      if (grupos.getLayers().length > 0) {
        mapa.fitBounds(grupos.getBounds(), {
          padding: [25, 25],
          maxZoom: 13,
        });
      }
    }

    cargarMapa().catch(console.error);

    return () => {
      cancelado = true;

      const mapa = mapaRef.current;
      mapaRef.current = null;
      gruposRef.current = null;
      leafletRef.current = null;

      if (mapa) {
        mapa.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!gruposRef.current || !leafletRef.current) return;

    agregarReportes(leafletRef.current, gruposRef.current, reportes);
  }, [reportes]);

  return (
    <div
      ref={contenedorRef}
      className="rieti-mapa-calor"
      aria-label="Mapa de reportes agrupados"
    />
  );
}
