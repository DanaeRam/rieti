"use client";

import { useEffect, useState } from "react";
import MapaCalor from "@/components/MapaCalor";

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

        console.log("TOKEN:", token);

        if (!token) {
          throw new Error("No hay una sesión activa.");
        }

        const respuesta = await fetch(
          "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1/admin/reportes",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        console.log("STATUS:", respuesta.status);

        const datos = await respuesta.json();

        console.log("REPORTES:", datos);

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
        console.error("ERROR REPORTES:", error);
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
            <span>UBICACIÓN</span>
            <h3>Mapa de calor</h3>
          </div>
        </div>

        {cargando && <p>Cargando mapa de calor...</p>}

        {error && <p>{error}</p>}

        {!cargando && !error && <MapaCalor reportes={reportes} />}
      </article>
    </>
  );
}
