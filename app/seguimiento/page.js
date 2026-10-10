"use client";

import { useState } from "react";

export default function Seguimiento() {
  const [folio, setFolio] = useState("");

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

        <form className="usuarios-form">
          <div className="usuario-filtro">
            <label htmlFor="folio">Folio del reporte</label>

            <input
              id="folio"
              type="text"
              value={folio}
              onChange={(e) => setFolio(e.target.value)}
              placeholder="Ej. RIETI-ATZ-2026-00008"
            />
          </div>

          <div className="usuarios-form-actions">
            <button type="submit" className="usuarios-button">
              Consultar reporte
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2>Información del reporte</h2>

        <p>Folio: —</p>
        <p>Estatus: —</p>
        <p>Fecha de registro: —</p>
        <p>Última atención: —</p>
        <p>Municipio: —</p>
      </section>
    </>
  );
}