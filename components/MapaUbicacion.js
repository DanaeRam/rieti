
"use client";

import dynamic from "next/dynamic";

/**
 * Carga el mapa de ubicación de forma dinámica
 * para evitar renderizar Leaflet en el servidor.
 *
 * @component
 */
const MapaLeaflet = dynamic(
  () => import("./MapaUbicacionLeaflet"),
  {
    ssr: false,
    loading: () => (
      <div className="reporte-mapa-cargando">
        Cargando mapa...
      </div>
    ),
  }
);

export default function MapaUbicacion(props) {
  return <MapaLeaflet {...props} />;
}
