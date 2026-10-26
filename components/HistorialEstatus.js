/**
 * Modal con los cambios de estatus registrados para un reporte.
 *
 * @module components/HistorialEstatus
 */
"use client";

import { useEffect, useState } from "react";

/**
 * Muestra los cambios de estatus registrados para un reporte.
 *
 * @component
 */
export default function HistorialEstatus({ folio, cerrar }) {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const URL_BASE =
    "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1";

  /** Consulta el historial de estatus del reporte. */
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

  /**
   * Presenta la fecha del cambio en formato local.
   *
   * @param {string} fecha - Fecha recibida desde la API.
   * @returns {string} Fecha formateada o mensaje alternativo.
   */
  function formatearFecha(fecha) {
    if (!fecha) {
      return "Fecha no disponible";
    }

    const fechaFormateada = new Date(fecha);

    if (Number.isNaN(fechaFormateada.getTime())) {
      return fecha;
    }

    return fechaFormateada.toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Devuelve la clase visual asociada a un estatus conocido.
   *
   * @param {string} estatus - Estatus del reporte.
   * @returns {string} Clase CSS correspondiente o una cadena vacía.
   */
  function obtenerClaseEstatus(estatus) {
    if (!estatus) {
      return "";
    }

    switch (estatus) {
      case "Recibido":
        return "recibido";

      case "En Revision":
        return "revision";

      case "En Proceso":
        return "proceso";

      case "Concluido":
        return "concluido";

      case "Reincidencia":
        return "reincidencia";

      case "Canalizado":
        return "canalizado";

      case "Cancelado":
        return "cancelado";

      default:
        return "";
    }
  }

  return (
    <div
      className="rieti-historial-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          cerrar();
        }
      }}
    >
      <div
        className="rieti-historial"
        role="dialog"
        aria-modal="true"
        aria-labelledby="historial-titulo"
      >
        {/* ENCABEZADO */}

        <div className="rieti-historial-header">
          <div>
            <h2 id="historial-titulo">Historial de estatus</h2>

            <p>
              Folio: <strong>{folio}</strong>
            </p>
          </div>

          <button
            type="button"
            className="rieti-historial-cerrar"
            onClick={cerrar}
          >
            Cerrar
          </button>
        </div>

        {/* CONTENIDO */}

        <div className="rieti-historial-contenido">
          {cargando && (
            <p className="rieti-historial-mensaje">Cargando historial...</p>
          )}

          {error && <p className="rieti-historial-error">{error}</p>}

          {!cargando && !error && historial.length === 0 && (
            <p className="rieti-historial-mensaje">
              No hay cambios de estatus registrados.
            </p>
          )}

          {!cargando && !error && historial.length > 0 && (
            <div className="rieti-historial-timeline">
              {historial.map((item, indice) => (
                <div
                  className="rieti-historial-item"
                  key={item.idHistorialEstatus || indice}
                >
                  {/* LÍNEA Y PUNTO */}

                  <div className="rieti-historial-linea">
                    <div className="rieti-historial-punto"></div>
                  </div>

                  {/* INFORMACIÓN */}

                  <div className="rieti-historial-card">
                    <div className="rieti-historial-fecha">
                      {formatearFecha(item.fecha)}
                    </div>

                    <div className="rieti-historial-estatus">
                      <span
                        className={`rieti-historial-estatus-item ${obtenerClaseEstatus(
                          item.estatus_anterior,
                        )}`}
                      >
                        {item.estatus_anterior || "Sin estatus"}
                      </span>

                      <span className="rieti-historial-flecha">→</span>

                      <span
                        className={`rieti-historial-estatus-item ${obtenerClaseEstatus(
                          item.estatus_nuevo,
                        )}`}
                      >
                        {item.estatus_nuevo || "Sin estatus"}
                      </span>
                    </div>

                    <div className="rieti-historial-datos">
                      <div>
                        <span>Usuario</span>

                        <strong>Usuario #{item.idUsuario}</strong>
                      </div>

                      <div>
                        <span>Justificación</span>

                        <strong>
                          {item.justificacion || "Sin justificación registrada"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
