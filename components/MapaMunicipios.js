"use client";

import { useEffect, useRef, useState } from "react";
import { booleanPointInPolygon } from "@turf/boolean-point-in-polygon";

const COLORES = {
  sinReportes: "#e9e7ef",
  baja: "#38bdf8",
  media: "#facc15",
  alta: "#dc2626",
};

function obtenerCoordenadas(reporte) {
  const lat = Number(reporte.latitud);
  const lon = Number(reporte.longitud);

  if (
    reporte.latitud == null ||
    reporte.longitud == null ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    (lat === 0 && lon === 0) ||
    Math.abs(lat) > 90 ||
    Math.abs(lon) > 180
  ) {
    return null;
  }

  return [lon, lat];
}

function contarReportes(reportes, municipios) {
  const conteos = new Map();

  for (const municipio of municipios.features) {
    conteos.set(municipio.properties.cveinegi, 0);
  }

  for (const reporte of reportes) {
    const coordenadas = obtenerCoordenadas(reporte);

    if (!coordenadas) continue;

    const municipio = municipios.features.find((elemento) =>
      booleanPointInPolygon(coordenadas, elemento),
    );

    if (!municipio) continue;

    const clave = municipio.properties.cveinegi;

    conteos.set(clave, conteos.get(clave) + 1);
  }

  return conteos;
}

function obtenerColor(cantidad, maximo) {
  if (cantidad === 0) return COLORES.sinReportes;

  const porcentaje = cantidad / maximo;

  if (porcentaje >= 0.67) return COLORES.alta;
  if (porcentaje >= 0.34) return COLORES.media;

  return COLORES.baja;
}

export default function MapaMunicipios({ reportes = [] }) {
  const contenedorRef = useRef(null);
  const mapaRef = useRef(null);
  const capaRef = useRef(null);
  const leafletRef = useRef(null);
  const municipiosRef = useRef(null);
  const reportesRef = useRef(reportes);

  const [error, setError] = useState("");

  useEffect(() => {
    reportesRef.current = reportes;

    const L = leafletRef.current;
    const capa = capaRef.current;
    const municipios = municipiosRef.current;

    if (!L || !capa || !municipios) return;

    mostrarMunicipios(L, capa, municipios, reportes);
  }, [reportes]);

  function mostrarMunicipios(L, capa, municipios, listaReportes) {
    capa.clearLayers();

    const conteos = contarReportes(listaReportes, municipios);
    const maximo = Math.max(0, ...conteos.values());

    L.geoJSON(municipios, {
      style: (municipio) => {
        const cantidad = conteos.get(municipio.properties.cveinegi) || 0;

        return {
          color: "#ffffff",
          weight: 1,
          fillColor: obtenerColor(cantidad, maximo),
          fillOpacity: 0.75,
        };
      },

      onEachFeature: (municipio, poligono) => {
        const nombre = municipio.properties.nom_mun;
        const cantidad = conteos.get(municipio.properties.cveinegi) || 0;

        poligono.bindTooltip(nombre);

        poligono.bindPopup(
          `<strong>${nombre}</strong><p>Reportes: ${cantidad}</p>`,
        );

        poligono.on({
          mouseover(evento) {
            evento.target.setStyle({
              color: "#51448d",
              weight: 2,
              fillOpacity: 0.9,
            });

            evento.target.bringToFront();
          },

          mouseout(evento) {
            evento.target.setStyle({
              color: "#ffffff",
              weight: 1,
              fillColor: obtenerColor(cantidad, maximo),
              fillOpacity: 0.75,
            });
          },
        });
      },
    }).addTo(capa);
  }

  useEffect(() => {
    let cancelado = false;
    let observador;

    async function cargarMapa() {
      const L = (await import("leaflet")).default;

      if (cancelado || !contenedorRef.current) return;

      const mapa = L.map(contenedorRef.current, {
        center: [19.35, -99.65],
        zoom: 9,
        minZoom: 7,
        maxZoom: 17,
        scrollWheelZoom: false,
      });

      mapaRef.current = mapa;
      leafletRef.current = L;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(mapa);

      const capa = L.layerGroup().addTo(mapa);
      capaRef.current = capa;

      const respuesta = await fetch("/geojson/municipios-edomex.geojson");

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los municipios.");
      }

      const municipios = await respuesta.json();

      if (cancelado) return;

      municipiosRef.current = municipios;

      mostrarMunicipios(L, capa, municipios, reportesRef.current);

      const limites = L.geoJSON(municipios).getBounds();

      if (limites.isValid()) {
        mapa.fitBounds(limites, {
          padding: [20, 20],
        });
      }

      observador = new ResizeObserver(() => {
        mapa.invalidateSize();
      });

      observador.observe(contenedorRef.current);
    }

    cargarMapa().catch((error) => {
      if (!cancelado) {
        setError(error.message);
      }
    });

    return () => {
      cancelado = true;
      observador?.disconnect();
      mapaRef.current?.remove();
      mapaRef.current = null;
      capaRef.current = null;
      leafletRef.current = null;
      municipiosRef.current = null;
    };
  }, []);

  return (
    <div>
      {error && <p role="alert">{error}</p>}

      <div
        ref={contenedorRef}
        className="rieti-mapa-calor"
        aria-label="Mapa de reportes por municipio"
      />
    </div>
  );
}
