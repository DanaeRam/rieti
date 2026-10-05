"use client";

import { useState } from "react";

export default function Reportes() {
  const [municipio, setMunicipio] = useState("");
  const [estado, setEstado] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [fecha, setFecha] = useState("");

  function buscarReportes(event) {
    event.preventDefault();
  }

  function limpiarFiltros() {
    setMunicipio("");
    setEstado("");
    setPrioridad("");
    setFecha("");
  }

  return (
    <div>
      <div>
        <h2>Bandeja de reportes</h2>
        <p>Consulta y gestión de los reportes recibidos.</p>
      </div>

      <section>
        <div>
          <span>CONSULTA</span>
          <h3>Filtrar reportes</h3>
        </div>

        <form onSubmit={buscarReportes}>
          <div>
            <label htmlFor="municipio">Municipio</label>
            <select
              id="municipio"
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
            >
              <option value="">Todos los municipios</option>
            </select>
          </div>

          <div>
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
            </select>
          </div>

          <div>
            <label htmlFor="prioridad">Prioridad</label>
            <select
              id="prioridad"
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value)}
            >
              <option value="">Todas las prioridades</option>
            </select>
          </div>

          <div>

            <label htmlFor="fecha">Fecha</label>
            <input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <div>
            <button
              type="button"
              onClick={limpiarFiltros}
            >
              Limpiar
            </button>

            <button type="submit">
              Buscar

            </button>
          </div>
        </form>
      </section>

      <section>
        <div>
          <span>REPORTES</span>
          <h3>Reportes recibidos</h3>
          <span>0 reportes</span>
        </div>

        <div>
          <table>
            <thead>
              <tr>
                <th>Folio</th>
                <th>Fecha</th>
                <th>Municipio</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Acciones</th>

              </tr>
            </thead>

            <tbody>
              <tr></tr>
            </tbody>
          </table>
        </div>
      </section>
      
    </div>
  );
}