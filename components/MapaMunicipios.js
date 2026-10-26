/**
 * Mapa que resume los reportes por municipio.
 *
 * @module components/MapaMunicipios
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { booleanPointInPolygon } from "@turf/boolean-point-in-polygon";

const COLORES = {
  sinReportes: "#ffffff",
  baja: "#38bdf8",
  media: "#facc15",
  alta: "#dc2626",
};

/**
 * Valida las coordenadas de un reporte para el formato GeoJSON.
 *
 * @param {Object} reporte - Reporte con latitud y longitud.
 * @returns {[number, number]|null} Longitud y latitud válidas o null.
 */
function obtenerCoordenadas(reporte) {
  const lat = Number(reporte.latitud);
  const lon = Number(reporte.longitud);

  if (
    reporte.latitud == null ||
    reporte.longitud == null ||
    String(reporte.latitud).trim() === "" ||
    String(reporte.longitud).trim() === "" ||
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

/**
 * Cuenta los reportes ubicados dentro de cada municipio.
 *
 * @param {Array<Object>} reportes - Reportes que se van a contar.
 * @param {Object} municipios - GeoJSON con límites municipales.
 * @returns {Map<string, number>} Conteo de reportes por clave municipal.
 */
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

/**
 * Elige el color de concentración correspondiente al conteo.
 *
 * @param {number} cantidad - Reportes del municipio.
 * @param {number} maximo - Conteo más alto del mapa.
 * @returns {string} Color para representar el nivel.
 */
function obtenerColor(cantidad, maximo) {
  if (cantidad === 0 || maximo === 0) {
    return COLORES.sinReportes;
  }

  const porcentaje = cantidad / maximo;

  if (porcentaje >= 0.67) return COLORES.alta;
  if (porcentaje >= 0.34) return COLORES.media;

  return COLORES.baja;
}

/**
 * Presenta la concentración de reportes dentro de cada municipio.
 *
 * @component
 */
export default function MapaMunicipios({ reportes = [] }) {
  const contenedorRef = useRef(null);
  const mapaRef = useRef(null);
  const capaRef = useRef(null);
  const leafletRef = useRef(null);
  const municipiosRef = useRef(null);
  const reportesRef = useRef(reportes);

  const [error, setError] = useState("");
  const [maximo, setMaximo] = useState(0);

  reportesRef.current = reportes;

  /** Actualiza los polígonos y conteos mostrados en el mapa. */
  function mostrarMunicipios(L, capa, municipios, listaReportes) {
    capa.clearLayers();

    const conteos = contarReportes(listaReportes, municipios);
    const mayorConteo = Math.max(0, ...conteos.values());

    setMaximo(mayorConteo);

    L.geoJSON(municipios, {
      style: (municipio) => {
        const cantidad = conteos.get(municipio.properties.cveinegi) || 0;

        return {
          color: "#ffffff",
          weight: 1,
          fillColor: obtenerColor(cantidad, mayorConteo),
          fillOpacity: 0.8,
        };
      },

      onEachFeature: (municipio, poligono) => {
        const nombre = municipio.properties.nom_mun;
        const cantidad = conteos.get(municipio.properties.cveinegi) || 0;

        poligono.bindTooltip(nombre);

        const contenido = document.createElement("div");
        const titulo = document.createElement("strong");
        const total = document.createElement("p");

        titulo.textContent = nombre;
        total.textContent = `Reportes: ${cantidad}`;

        contenido.append(titulo, total);
        poligono.bindPopup(contenido);

        poligono.on({
          mouseover(evento) {
            evento.target.setStyle({
              color: "#51448d",
              weight: 2,
              fillOpacity: 0.95,
            });

            evento.target.bringToFront();
          },

          mouseout(evento) {
            evento.target.setStyle({
              color: "#ffffff",
              weight: 1,
              fillColor: obtenerColor(cantidad, mayorConteo),
              fillOpacity: 0.8,
            });
          },
        });
      },
    }).addTo(capa);
  }

  useEffect(() => {
    const L = leafletRef.current;
    const capa = capaRef.current;
    const municipios = municipiosRef.current;

    if (!L || !capa || !municipios) return;

    mostrarMunicipios(L, capa, municipios, reportes);
  }, [reportes]);

  useEffect(() => {
    let cancelado = false;
    let observador;

    /** Inicializa Leaflet y carga los límites municipales. */
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
      if (!cancelado) setError(error.message);
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

  const umbralMedio = Math.max(1, Math.ceil(maximo * 0.34));
  const umbralAlto = Math.max(1, Math.ceil(maximo * 0.67));

  const simbologia = [
    {
      nombre: "Sin reportes",
      detalle: "0 reportes",
      color: COLORES.sinReportes,
    },
    {
      nombre: "Baja concentración",
      detalle:
        maximo > 0 ? `1–${Math.max(0, umbralMedio - 1)} reportes` : "Sin datos",
      color: COLORES.baja,
    },
    {
      nombre: "Media concentración",
      detalle:
        maximo > 0
          ? `${umbralMedio}–${Math.max(umbralMedio, umbralAlto - 1)} reportes`
          : "Sin datos",
      color: COLORES.media,
    },
    {
      nombre: "Alta concentración",
      detalle: maximo > 0 ? `${umbralAlto} o más reportes` : "Sin datos",
      color: COLORES.alta,
    },
  ];

  return (
    <div className="rieti-municipios-contenedor">
      {error && <p role="alert">{error}</p>}

      <div
        ref={contenedorRef}
        className="rieti-mapa-calor"
        aria-label="Mapa de concentración de reportes por municipio"
      />

      <div
        className="rieti-municipios-simbologia"
        aria-label="Simbología de concentración por municipio"
      >
        <div className="rieti-municipios-simbologia-header">
          <strong>Concentración de reportes</strong>
          <span>Por municipio</span>
        </div>

        <div className="rieti-municipios-simbologia-lista">
          {simbologia.map((item) => (
            <div className="rieti-municipios-simbologia-item" key={item.nombre}>
              <span
                className="rieti-municipios-simbologia-color"
                style={{ backgroundColor: item.color }}
              />

              <div>
                <strong>{item.nombre}</strong>
                <span>{item.detalle}</span>
              </div>
            </div>
          ))}
        </div>

        <p>
          Los niveles se calculan respecto al municipio con mayor número de
          reportes.
        </p>
      </div>
    </div>
  );
}
