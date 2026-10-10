"use client";

import { useState } from "react";

export default function Seguimiento() {
  const [folio, setFolio] = useState("");
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

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
    <>
      <div>
        <h2>Seguimiento de reporte</h2>
        <p>Consulta el estado de tu reporte ingresando tu folio.</p>
      </div>

      <section
        className="rieti-panel"
        style={{ maxWidth: "600px", margin: "0 auto" }}
      >
        <div className="rieti-panel-header">
          <div>
            <span>SEGUIMIENTO</span>
            <h3>Consultar reporte</h3>
          </div>
        </div>

        <form className="usuarios-form" onSubmit={consultarReporte}>
          <div className="usuario-filtro">
            <label htmlFor="folio">Folio del reporte</label>

            <input
              id="folio"
              type="text"
              value={folio}
              onChange={(e) => setFolio(e.target.value)}
              placeholder="Ej. RIETI-ATZ-2026-00008"
              required
            />
          </div>

          <div className="usuarios-form-actions">
            <button
              type="submit"
              className="usuarios-button"
              disabled={cargando}
            >
              {cargando ? "Consultando..." : "Consultar reporte"}
            </button>
          </div>
        </form>

        {error && <p>{error}</p>}
      </section>

      {reporte && (
        <section>
          <h2>Información del reporte</h2>

          <p>Folio: {reporte.folio}</p>
          <p>Estatus: {reporte.estatus}</p>
          <p>Fecha de registro: {reporte.fecha_registro}</p>
          <p>Última atención: (Pendiente de implementar)</p>
          <p>Municipio: {reporte.municipio}</p>
        </section>
      )}
    </>
  );
}
