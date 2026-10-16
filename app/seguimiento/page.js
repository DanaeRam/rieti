/**
 * Página para consultar el estado de un reporte mediante su folio.
 *
 * @module app/seguimiento/page
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import {Home, ChevronRight, FileSearch, FileText, Search, Clock3, CalendarDays, MapPin,} from "lucide-react";

/**
 * Permite consultar un reporte y muestra el resultado del seguimiento.
 *
 * @component
 */
export default function Seguimiento() {
  const [folio, setFolio] = useState("");
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  /**
   * Consulta en la API el reporte correspondiente al folio ingresado.
   *
   * @param {import("react").FormEvent<HTMLFormElement>} event - Evento de envío del formulario.
   */
  async function consultarReporte(event) {
    event.preventDefault();

    setCargando(true);
    setError("");
    setReporte(null);

    try {
      const respuesta = await fetch(
        `https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1/reportes/${encodeURIComponent(
          folio.trim(),
        )}`,
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.message || "No se encontró el reporte.");
        return;
      }

      setReporte(datos.reporte);
    } catch (error) {
      console.error("Error de conexión:", error);
      setError("No se pudo consultar el reporte.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="seguimiento-page">
      <div className="seguimiento-container">
        <nav className="seguimiento-breadcrumb" aria-label="Navegación">
          <Link href="/">
            <Home size={16} />
            Inicio
          </Link>

          <ChevronRight size={15} />
          <span>Seguimiento de reporte</span>
        </nav>

        <header className="seguimiento-header">
          <span>SEGUIMIENTO</span>
          <h1>Seguimiento de reporte</h1>
          <p>Consulta el estado de tu reporte ingresando tu folio.</p>
        </header>

        <section className="seguimiento-panel">
          <div className="seguimiento-panel-header">
            <div className="seguimiento-icono">
              <FileSearch size={25} />
            </div>

            <div>
              <h2>Consultar reporte</h2>
              <p>
                Ingresa el folio de tu reporte para conocer su estado actual.
              </p>
            </div>
          </div>

          <form className="seguimiento-form" onSubmit={consultarReporte}>
            <div className="seguimiento-campo">
              <label htmlFor="folio">Folio del reporte</label>

              <div className="seguimiento-input">
                <FileText size={20} />

                <input
                  id="folio"
                  type="text"
                  value={folio}
                  onChange={(e) => setFolio(e.target.value)}
                  placeholder="Ej. RIETI-ATZ-2026-00008"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="seguimiento-boton"
              disabled={cargando}
            >
              <Search size={19} />
              {cargando ? "Consultando..." : "Consultar reporte"}
            </button>
          </form>

          {error && (
            <p className="seguimiento-error" role="alert">
              {error}
            </p>
          )}
        </section>

        {reporte && (
          <section className="seguimiento-panel">
            <div className="seguimiento-panel-header">
              <div className="seguimiento-icono turquesa">
                <FileText size={25} />
              </div>

              <div>
                <h2>Información del reporte</h2>
                <p>Detalle y estado actual del reporte.</p>
              </div>
            </div>

            <div className="seguimiento-detalles">
              <div className="seguimiento-fila">
                <div className="seguimiento-etiqueta">
                  <FileText size={18} />
                  <span>Folio del reporte</span>
                </div>
                <strong>{reporte.folio}</strong>
              </div>

              <div className="seguimiento-fila">
                <div className="seguimiento-etiqueta">
                  <Clock3 size={18} />
                  <span>Estatus</span>
                </div>

                <span
                  className={`seguimiento-estatus ${
                    reporte.estatus
                      ?.toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/\s+/g, "-") || ""
                  }`}
                >
                  {reporte.estatus || "—"}
                </span>
              </div>

              <div className="seguimiento-fila">
                <div className="seguimiento-etiqueta">
                  <CalendarDays size={18} />
                  <span>Fecha de registro</span>
                </div>

                <strong>
                  {reporte.fecha_registro
                    ? new Date(reporte.fecha_registro).toLocaleDateString("es-MX")
                    : "—"}
                </strong>
              </div>

              <div className="seguimiento-fila">
                <div className="seguimiento-etiqueta">
                  <Clock3 size={18} />
                  <span>Última atención</span>
                </div>

                <strong>
                  {reporte.fecha_ultima_atencion
                    ? new Date(reporte.fecha_ultima_atencion).toLocaleDateString(
                        "es-MX"
                      )
                    : "Sin atención registrada"}
                </strong>
              </div>

              <div className="seguimiento-fila">
                <div className="seguimiento-etiqueta">
                  <MapPin size={18} />
                  <span>Municipio</span>
                </div>

                <strong>{reporte.municipio || "—"}</strong>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );

}
