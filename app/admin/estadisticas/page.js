"use client";

import { useEffect, useState } from "react";
import MapaMunicipios from "@/components/MapaMunicipios";
import MapaCalor from "@/components/MapaCalor";
import MapaPuntos from "@/components/MapaPuntos";
import GraficaActividad from "@/components/estadisticas/GraficaActividad";
import GraficaEvolucion from "@/components/estadisticas/GraficaEvolucion";

const URL_BASE =
  "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1";

/**
 * Página de estadísticas y analítica
 *
 * Presenta la distribución territorial de reportes
 * y las gráficas estadísticas del sistema.
 *
 * @component
 */
export default function Estadisticas() {
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [pestanaActiva, setPestanaActiva] = useState("municipios");

  const [estadisticas, setEstadisticas] = useState(null);
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(true);
  const [errorEstadisticas, setErrorEstadisticas] = useState("");

  useEffect(() => {
    const controlador = new AbortController();

    async function obtenerDatos(ruta) {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No hay una sesión activa.");
      }

      const respuesta = await fetch(`${URL_BASE}${ruta}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controlador.signal,
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.message || datos.error || "No se pudieron obtener los datos.",
        );
      }

      return datos;
    }

    async function obtenerReportes() {
      try {
        const datos = await obtenerDatos("/admin/reportes");

        if (!controlador.signal.aborted) {
          setReportes(Array.isArray(datos) ? datos : datos.reportes || []);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error al obtener reportes:", error);
          setError(error.message);
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    }

    async function obtenerEstadisticas() {
      try {
        const datos = await obtenerDatos(
          "/admin/dashboard/estadisticas?dias=30",
        );

        if (!controlador.signal.aborted) {
          setEstadisticas(datos);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error al obtener estadísticas:", error);
          setErrorEstadisticas(error.message);
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargandoEstadisticas(false);
        }
      }
    }

    obtenerReportes();
    obtenerEstadisticas();

    return () => controlador.abort();
  }, []);

  const porActividad = Array.isArray(estadisticas?.por_actividad)
    ? estadisticas.por_actividad
    : [];

  const porFecha = Array.isArray(estadisticas?.por_fecha)
    ? estadisticas.por_fecha
    : [];

  return (
    <main className="estadisticas-page">
      <div className="rieti-page-title">
        <h2>Estadísticas y analítica</h2>
      </div>

      {cargando && <p>Cargando estadísticas...</p>}

      {error && <p role="alert">{error}</p>}

      {!cargando && !error && (
        <article className="rieti-panel">
          <div className="rieti-panel-header">
            <div>
              <span>DISTRIBUCIÓN TERRITORIAL</span>
              <h3>Concentración geográfica de reportes</h3>
            </div>

            <span className="estadisticas-etiqueta">
              {reportes.length} reportes
            </span>
          </div>

          <div className="estadisticas-contenido">
            <div className="rieti-mapas-pestanas">
              <button
                type="button"
                className={pestanaActiva === "municipios" ? "activo" : ""}
                onClick={() => setPestanaActiva("municipios")}
              >
                Municipios
              </button>

              <button
                type="button"
                className={pestanaActiva === "calor" ? "activo" : ""}
                onClick={() => setPestanaActiva("calor")}
              >
                Zonas de calor
              </button>

              <button
                type="button"
                className={pestanaActiva === "reportes" ? "activo" : ""}
                onClick={() => setPestanaActiva("reportes")}
              >
                Reportes individuales
              </button>
            </div>

            <div className={`rieti-mapas-contenido mapa-${pestanaActiva}`}>
              {pestanaActiva === "municipios" && (
                <MapaMunicipios reportes={reportes} />
              )}

              {pestanaActiva === "calor" && <MapaCalor reportes={reportes} />}

              {pestanaActiva === "reportes" && (
                <MapaPuntos reportes={reportes} />
              )}
            </div>
          </div>
        </article>
      )}

      <section
        className="rieti-analitica-graficas"
        aria-label="Análisis estadístico de reportes"
      >
        <GraficaActividad
          datos={porActividad}
          cargando={cargandoEstadisticas}
          error={errorEstadisticas}
        />

        <GraficaEvolucion
          datos={porFecha}
          cargando={cargandoEstadisticas}
          error={errorEstadisticas}
        />
      </section>
    </main>
  );
}
