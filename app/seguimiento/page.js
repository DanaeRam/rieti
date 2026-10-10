"use client";

import { useState } from "react";

export default function Seguimiento() {
  const [folio, setFolio] = useState("");

  return (
    <main>
      <div>
        <h1>Seguimiento de reporte</h1>
        <p>Consulta el estado de tu reporte ingresando tu folio</p>
      </div>

      <section>
        <h2>Consultar reporte</h2>

        <form>
          <div>
            <label htmlFor="folio">Folio del reporte</label>

            <input
              id="folio"
              type="text"
              value={folio}
              onChange={(e) => setFolio(e.target.value)}
              placeholder="Ej. RIETI-ATZ-2026-00008"
            />
          </div>

          <button type="submit">Consultar reporte</button>
        </form>
      </section>

      <section>
        <h2>Información del reporte</h2>

        <div>
          <div>
            <span>Folio</span>
            <strong>—</strong>
          </div>

          <div>
            <span>Estatus</span>
            <strong>—</strong>
          </div>

          <div>
            <span>Fecha de registro</span>
            <strong>—</strong>
          </div>

          <div>
            <span>Última atención</span>
            <strong>—</strong>
          </div>

          <div>
            <span>Municipio</span>
            <strong>—</strong>
          </div>
        </div>
      </section>
    </main>
  );
}
