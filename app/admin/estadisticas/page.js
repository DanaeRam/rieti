/**
 * Página de estadísticas y analítica de RIETI.
 * Presenta los espacios destinados a gráficas e indicadores del sistema.
 *
 * @module app/admin/estadisticas/page
 */
"use client";

import { useEffect, useRef } from "react";

/**
 * Presenta los paneles de análisis estadístico del sistema y el mapa de calor.
 *
 * @component
 */
export default function Estadisticas() {
  const mapaRef = useRef(null);

  useEffect(() => {
    let mapa;
    let cancelado = false;

    async function cargarMapa() {
      const L = (await import("leaflet")).default;

      if (cancelado || !mapaRef.current) {
        return;
      }

      mapa = L.map(mapaRef.current).setView([19.4326, -99.1332], 10);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
        mapa,
      );
    }

    cargarMapa();

    return () => {
      cancelado = true;

      if (mapa) {
        mapa.remove();
      }
    };
  }, []);

  return (
    <>
      <div className="rieti-page-title">
        <h2>Estadísticas y analítica</h2>
      </div>

      <article className="rieti-panel">
        <div className="rieti-panel-header">
          <div>
            <h3>Mapa de calor</h3>
          </div>
        </div>

        <div
          ref={mapaRef}
          style={{
            height: "400px",
            width: "100%",
          }}
        ></div>
      </article>
    </>
  );
}
