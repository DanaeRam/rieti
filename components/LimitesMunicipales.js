"use client";

import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";

export default function LimitesMunicipales() {
  const [municipios, setMunicipios] = useState(null);

  useEffect(() => {
    const controlador = new AbortController();

    async function cargarMunicipios() {
      try {
        const respuesta = await fetch("/geojson/municipios-edomex.geojson", {
          signal: controlador.signal,
        });

        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar los municipios.");
        }

        const datos = await respuesta.json();

        if (!controlador.signal.aborted) {
          setMunicipios(datos);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error al cargar municipios:", error);
        }
      }
    }

    cargarMunicipios();

    return () => controlador.abort();
  }, []);

  if (!municipios) return null;

  return (
    <GeoJSON
      data={municipios}
      style={{
        color: "#7955c8",
        weight: 1.5,
        fillColor: "#7955c8",
        fillOpacity: 0.08,
      }}
      onEachFeature={(municipio, capa) => {
        capa.bindTooltip(municipio.properties.nom_mun || "Municipio");
      }}
    />
  );
}
