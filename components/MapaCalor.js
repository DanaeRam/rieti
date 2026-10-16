"use client";

import { useEffect, useRef } from "react";

const CENTRO_EDOMEX = [19.35, -99.65];
const ZOOM_INICIAL = 9;
const TAMANO_ZONA_KM = 3;
const COLORES = {
  baja: "#38bdf8",
  media: "#facc15",
  alta: "#dc2626",
};

function obtenerCoordenadas(reporte) {
  const latitud = Number(reporte.latitud);
  const longitud = Number(reporte.longitud);

  if (
    reporte.latitud == null ||
    reporte.longitud == null ||
    String(reporte.latitud).trim() === "" ||
    String(reporte.longitud).trim() === "" ||
    !Number.isFinite(latitud) ||
    !Number.isFinite(longitud) ||
    Math.abs(latitud) > 90 ||
    Math.abs(longitud) > 180 ||
    (latitud === 0 && longitud === 0)
  ) {
    return null;
  }

  return { latitud, longitud };
}

function agruparReportes(reportes) {
  const zonas = new Map();

  const pasoLatitud = TAMANO_ZONA_KM / 111.32;
  const pasoLongitud =
    TAMANO_ZONA_KM / (111.32 * Math.cos((19.35 * Math.PI) / 180));

  for (const reporte of reportes) {
    const coordenadas = obtenerCoordenadas(reporte);

    if (!coordenadas) continue;

    const { latitud, longitud } = coordenadas;

    const fila = Math.floor(latitud / pasoLatitud);
    const columna = Math.floor(longitud / pasoLongitud);
    const clave = `${fila}-${columna}`;

    if (!zonas.has(clave)) {
      zonas.set(clave, {
        cantidad: 0,
        sumaLatitud: 0,
        sumaLongitud: 0,
      });
    }

    const zona = zonas.get(clave);

    zona.cantidad++;
    zona.sumaLatitud += latitud;
    zona.sumaLongitud += longitud;
  }

  return [...zonas.values()].map((zona) => ({
    cantidad: zona.cantidad,
    latitud: zona.sumaLatitud / zona.cantidad,
    longitud: zona.sumaLongitud / zona.cantidad,
  }));
}

function clasificarZonas(zonas) {
  const maximo = Math.max(0, ...zonas.map((zona) => zona.cantidad));

  return zonas.map((zona) => {
    const porcentaje = maximo > 0 ? zona.cantidad / maximo : 0;

    let nivel = "baja";

    if (maximo > 1 && porcentaje >= 0.67) {
      nivel = "alta";
    } else if (maximo > 1 && porcentaje >= 0.34) {
      nivel = "media";
    }

    return {
      ...zona,
      nivel,
      color: COLORES[nivel],
    };
  });
}

function dibujarConcentracion(L, capa, zona) {
  const centro = [zona.latitud, zona.longitud];

  L.circle(centro, {
    radius: 1900,
    stroke: false,
    fillColor: zona.color,
    fillOpacity: 0.12,
    interactive: false,
    className: "rieti-calor-exterior",
  }).addTo(capa);

  L.circle(centro, {
    radius: 1200,
    stroke: false,
    fillColor: zona.color,
    fillOpacity: 0.3,
    interactive: false,
    className: "rieti-calor-intermedio",
  }).addTo(capa);

  L.circle(centro, {
    radius: 550,
    stroke: false,
    fillColor: zona.color,
    fillOpacity: 0.8,
    className: "rieti-calor-centro",
  })
    .bindPopup(
      `<strong>Concentración: ${zona.nivel}</strong>
       <p>Reportes en la zona: ${zona.cantidad}</p>`,
    )
    .addTo(capa);
}

function actualizarConcentraciones(reportes, L, capa) {
  capa.clearLayers();

  const zonas = agruparReportes(reportes);
  const zonasClasificadas = clasificarZonas(zonas);

  for (const zona of zonasClasificadas) {
    dibujarConcentracion(L, capa, zona);
  }
}

export default function MapaCalor({ reportes = [] }) {
  const mapaRef = useRef(null);
  const mapaInstancia = useRef(null);
  const capaRef = useRef(null);
  const leafletRef = useRef(null);
  const reportesRef = useRef(reportes);

  useEffect(() => {
    reportesRef.current = reportes;

    if (!leafletRef.current || !capaRef.current) return;

    actualizarConcentraciones(reportes, leafletRef.current, capaRef.current);
  }, [reportes]);

  useEffect(() => {
    let cancelado = false;
    let observador = null;

    async function cargarMapa() {
      const L = (await import("leaflet")).default;

      if (cancelado || !mapaRef.current) return;

      const mapa = L.map(mapaRef.current, {
        center: CENTRO_EDOMEX,
        zoom: ZOOM_INICIAL,
        minZoom: 7,
        maxZoom: 15,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      mapaInstancia.current = mapa;
      leafletRef.current = L;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(mapa);

      const capa = L.layerGroup().addTo(mapa);
      capaRef.current = capa;

      actualizarConcentraciones(reportesRef.current, L, capa);

      observador = new ResizeObserver(() => {
        mapa.invalidateSize({ pan: false });
      });

      observador.observe(mapaRef.current);
    }

    cargarMapa().catch((error) => {
      if (!cancelado) console.error("Error al cargar mapa:", error);
    });

    return () => {
      cancelado = true;
      observador?.disconnect();

      mapaInstancia.current?.remove();
      mapaInstancia.current = null;
      capaRef.current = null;
      leafletRef.current = null;
    };
  }, []);

  return (
    <div
      ref={mapaRef}
      className="rieti-mapa-calor"
      aria-label="Mapa de concentraciones del Estado de México"
    />
  );
}
