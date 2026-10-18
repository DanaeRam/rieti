"use client";

import { useEffect, useState } from "react";
import MapaMunicipios from "@/components/MapaMunicipios";

export default function Estadisticas() {
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const URL_BASE =
    "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1";

  useEffect(() => {
    async function obtenerReportes() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No hay una sesión activa.");
        }

        const respuesta = await fetch(`${URL_BASE}/admin/reportes`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            datos.message ||
              datos.error ||
              "No se pudieron obtener los reportes.",
          );
        }

        const listaReportes = Array.isArray(datos)
          ? datos
          : datos.reportes || [];

        setReportes(listaReportes);
      } catch (error) {
        console.error("Error al obtener reportes:", error);
        setError(error.message);
      } finally {
        setCargando(false);
      }
    }

    obtenerReportes();
  }, []);

  return (
    <>
      <div className="rieti-page-title">
        <h2>Estadísticas y analítica</h2>
      </div>

      <article className="rieti-panel">
        <div className="rieti-panel-header">
          <div>
            <span>DISTRIBUCIÓN TERRITORIAL</span>
            <h3>Concentración de reportes por municipio</h3>
          </div>
        </div>

        {cargando && <p>Cargando reportes municipales...</p>}

        {error && <p role="alert">{error}</p>}

        {!cargando && !error && <MapaMunicipios reportes={reportes} />}
      </article>
    </>
  );
}
