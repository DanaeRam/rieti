
"use client";

import dynamic from "next/dynamic";

const MapaLeaflet = dynamic(
  () => import("./MapaUbicacionLeaflet"),
  {
    ssr: false,
    loading: () => (
      <div className="reporte-mapa-cargando">
        Cargando mapa ....
      </div>
    ),
  }
);

export default function MapaUbicacion(props) {
  return <MapaLeaflet {...props} />;
}
