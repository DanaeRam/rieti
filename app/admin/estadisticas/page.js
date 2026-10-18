"use client";

import { useEffect, useState } from "react";
import MapaMunicipios from "@/components/MapaMunicipios";
import MapaCalor from "@/components/MapaCalor";
import MapaPuntos from "@/components/MapaPuntos";

export default function Estadisticas() {
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [pestanaActiva, setPestanaActiva] = useState("municipios");

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

        setReportes(Array.isArray(datos) ? datos : datos.reportes || []);
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

      {cargando && <p>Cargando estadísticas...</p>}

      {error && <p role="alert">{error}</p>}

      {!cargando && !error && (
        <>
          <article className="rieti-panel">
            <h3>DISTRIBUCIÓN TERRITORIAL</h3>
            <p>Concentración geográfica de reportes</p>

            <div className="rieti-mapas-pestanas">
              <button
                className={pestanaActiva === "municipios" ? "activo" : ""}
                onClick={() => setPestanaActiva("municipios")}
              >
                Municipios
              </button>

              <button
                className={pestanaActiva === "calor" ? "activo" : ""}
                onClick={() => setPestanaActiva("calor")}
              >
                Zonas de calor
              </button>

              <button
                className={pestanaActiva === "reportes" ? "activo" : ""}
                onClick={() => setPestanaActiva("reportes")}
              >
                Reportes individuales
              </button>
            </div>

            <div className="rieti-mapas-contenido">
              {pestanaActiva === "municipios" && (
                <MapaMunicipios reportes={reportes} />
              )}

              {pestanaActiva === "calor" && <MapaCalor reportes={reportes} />}

              {pestanaActiva === "reportes" && (
                <MapaPuntos reportes={reportes} />
              )}
            </div>
          </article>
        </>
      )}
    </>
  );
}
