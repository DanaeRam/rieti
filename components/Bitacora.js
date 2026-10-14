"use client";

import { useEffect, useState } from "react";

export default function Bitacora({ folio, cerrar }) {
  const [bitacora, setBitacora] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function obtenerBitacora() {
      try {
        setCargando(true);
        setError("");

        const token = localStorage.getItem("token");

        const respuesta = await fetch(
          `https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1/admin/reportes/${encodeURIComponent(
            folio
          )}/expediente`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!respuesta.ok) {
          throw new Error("No se pudo obtener la bitácora");
        }

        const datos = await respuesta.json();

        setBitacora(datos.bitacora || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setCargando(false);
      }
    }

    if (folio) {
      obtenerBitacora();
    }
  }, [folio]);

  return (
    <div role="dialog" aria-modal="true">
      <h2>Bitácora</h2>

      <button onClick={cerrar}>
        Cerrar
      </button>

      <button>
        + Agregar actuación
      </button>

      {cargando && <p>Cargando bitácora...</p>}

      {error && <p>{error}</p>}

      {!cargando && !error && bitacora.length === 0 && (
        <p>No hay actuaciones registradas.</p>
      )}

      {!cargando && !error && bitacora.length > 0 && (
        <div>
          <h3>Actuaciones anteriores</h3>

          {bitacora.map((item, indice) => (
            <div key={indice}>
              <pre>{JSON.stringify(item, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}