"use client";

import { useEffect, useRef } from "react";

export default function MapaCalor({ reportes }) {
  const mapaRef = useRef(null);
  const mapaInstancia = useRef(null);

  useEffect(() => {
    let cancelado = false;

    async function cargarMapa() {
      const L = (await import("leaflet")).default;
      const { heatLayer } = await import("@linkurious/leaflet-heat");

      if (cancelado || !mapaRef.current) {
        return;
      }

      const puntos = reportes
        .map((reporte) => {
          const latitud = Number(reporte.latitud);
          const longitud = Number(reporte.longitud);

          if (
            Number.isNaN(latitud) ||
            Number.isNaN(longitud)
          ) {
            return null;
          }

          return [latitud, longitud, 1];
        })
        .filter(Boolean);

        const mapa = L.map(mapaRef.current, {
          center: [19.35, -99.65],
          zoom: 9,
          minZoom: 7,
          maxZoom: 15,
          zoomControl: true,
          scrollWheelZoom: false,
        });

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        },
      ).addTo(mapa);

      heatLayer(puntos, {
        radius: 30,
        blur: 20,
        maxZoom: 15,
        minOpacity: 0.35,
        gradient: {
          0.2: "#3e3869",
          0.4: "#496a9f",
          0.6: "#35a9c4",
          0.8: "#e45b91",
          1: "#e63946",
        },
      }).addTo(mapa);
      mapaInstancia.current = mapa;
    }

    cargarMapa();

    return () => {
      cancelado = true;

      if (mapaInstancia.current) {
        mapaInstancia.current.remove();
        mapaInstancia.current = null;
      }
    };
  }, [reportes]);

  return (
    <div
      ref={mapaRef}
      className="rieti-mapa-calor"
    />
  );
}