/**
 * Tabla con los reportes que requieren atención prioritaria.
 *
 * @module components/dashboard/TablaAtencion
 */
"use client";

import { useState } from "react";
import { FolderOpen } from "lucide-react";
import ExpedienteDigital from "@/components/ExpedienteDigital";

const PRIORIDADES = {
  alta: 1,
  media: 2,
  baja: 3,
};

/**
 * Normaliza texto para comparar estatus y prioridades.
 *
 * @param {string} valor - Texto que se va a normalizar.
 * @returns {string} Texto sin acentos y en minúsculas.
 */
function normalizar(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Presenta una fecha de reporte en formato local.
 *
 * @param {string} valor - Fecha recibida desde la API.
 * @returns {string} Fecha formateada o un guion si no es válida.
 */
function formatearFecha(valor) {
  if (!valor) return "—";

  const fechaTexto = String(valor);
  const coincidencia = fechaTexto.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (coincidencia) {
    return `${coincidencia[3]}/${coincidencia[2]}/${coincidencia[1]}`;
  }

  const fecha = new Date(valor);

  return Number.isNaN(fecha.getTime())
    ? "—"
    : fecha.toLocaleDateString("es-MX");
}

/**
 * Convierte una fecha en milisegundos para ordenar reportes.
 *
 * @param {string} valor - Fecha recibida desde la API.
 * @returns {number} Tiempo de la fecha o infinito si no es válida.
 */
function obtenerTiempo(valor) {
  if (!valor) return Number.POSITIVE_INFINITY;

  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? Number.POSITIVE_INFINITY
    : fecha.getTime();
}

/**
 * Ordena y muestra los reportes que requieren atención.
 *
 * @component
 */
export default function TablaAtencion({
  reportes = [],
  cargando = false,
  error = "",
  limite = 10,
  mostrarMunicipio = true,
}) {
  const [expediente, setExpediente] = useState(null);

  const pendientes = reportes
    .filter((reporte) => {
      const estatus = normalizar(reporte.estatus);

      return !["concluido", "cancelado"].includes(estatus);
    })
    .sort((a, b) => {
      const prioridadA = PRIORIDADES[normalizar(a.prioridad)] ?? 4;

      const prioridadB = PRIORIDADES[normalizar(b.prioridad)] ?? 4;

      if (prioridadA !== prioridadB) {
        return prioridadA - prioridadB;
      }

      return obtenerTiempo(a.fecha_registro) - obtenerTiempo(b.fecha_registro);
    })
    .slice(0, limite);

  return (
    <section className="rieti-panel rieti-atencion">
      <div className="rieti-panel-header">
        <div>
          <span>SEGUIMIENTO PRIORITARIO</span>
          <h3>Reportes que requieren atención</h3>
        </div>

        {!cargando && !error && (
          <span className="rieti-atencion-count">
            {pendientes.length} expedientes
          </span>
        )}
      </div>

      <div className="rieti-atencion-table-container">
        <table className="rieti-atencion-table">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Fecha</th>
              {mostrarMunicipio && <th>Municipio</th>}
              <th>Prioridad</th>
              <th>Estatus</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={mostrarMunicipio ? 6 : 5}>Cargando reportes...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={mostrarMunicipio ? 6 : 5} role="alert">
                  No se pudieron cargar los reportes: {error}
                </td>
              </tr>
            ) : pendientes.length === 0 ? (
              <tr>
                <td colSpan={mostrarMunicipio ? 6 : 5}>
                  No hay reportes que requieran atención.
                </td>
              </tr>
            ) : (
              pendientes.map((reporte) => {
                const prioridad = normalizar(reporte.prioridad);

                const claseEstatus = normalizar(reporte.estatus).replace(
                  /\s+/g,
                  "-",
                );

                return (
                  <tr key={reporte.folio}>
                    <td>
                      <span className="rieti-atencion-folio">
                        {reporte.folio}
                      </span>
                    </td>

                    <td>{formatearFecha(reporte.fecha_registro)}</td>

                    {mostrarMunicipio && <td>{reporte.municipio || "—"}</td>}

                    <td>
                      <span className={`rieti-atencion-riesgo ${prioridad}`}>
                        {reporte.prioridad || "Sin definir"}
                      </span>
                    </td>

                    <td>
                      <span className={`reportes-estatus ${claseEstatus}`}>
                        {reporte.estatus || "Sin estatus"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="rieti-atencion-ver"
                        onClick={() => setExpediente(reporte)}
                      >
                        <FolderOpen size={16} />
                        Ver expediente
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {expediente && (
        <ExpedienteDigital
          expediente={expediente}
          cerrar={() => setExpediente(null)}
        />
      )}
    </section>
  );
}
