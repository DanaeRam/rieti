"use client";

import { useEffect, useState } from "react";

export default function HistorialEstatus({ folio, cerrar }) {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const URL_BASE =
    "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1";

  async function obtenerHistorial() {
    try {
      setCargando(true);
      setError("");

      const token = localStorage.getItem("token");

      const respuesta = await fetch(
        `${URL_BASE}/admin/reportes/${encodeURIComponent(folio)}/expediente`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.message || datos.error || "No se pudo obtener el historial.",
        );
      }

      console.log("HISTORIAL:", datos.historial);

      setHistorial(datos.historial || []);
    } catch (error) {
      console.error("Error al obtener historial:", error);
      setError(error.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (folio) {
      obtenerHistorial();
    }
  }, [folio]);

  return (
    <div role="dialog" aria-modal="true">
      <div>
        <div>
          <h2>Historial de estatus</h2>

          <p>
            Folio: <strong>{folio}</strong>
          </p>
        </div>

        <button type="button" onClick={cerrar}>
          Cerrar
        </button>
      </div>

      {cargando && <p>Cargando historial...</p>}

      {error && <p>{error}</p>}

      {!cargando && !error && historial.length === 0 && (
        <p>No hay cambios de estatus registrados.</p>
      )}

      {!cargando && !error && historial.length > 0 && (
        <div>
          {historial.map((item, indice) => (
            <div key={indice}>
              <pre>{JSON.stringify(item, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
