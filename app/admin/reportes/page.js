"use client";

import { useEffect, useState } from "react";

export default function Reportes() {
  const [municipio, setMunicipio] = useState("");
  const [estado, setEstado] = useState("");
  const [fecha, setFecha] = useState("");
  const [municipios, setMunicipios] = useState([]);
  const [actividad, setActividad] = useState("");
  const [actividades, setActividades] = useState([]);

  const [reportes, setReportes] = useState([]);
  const [cargandoReportes, setCargandoReportes] = useState(false);
  const [errorReportes, setErrorReportes] = useState("");

  useEffect(() => {
    async function cargarMunicipios() {
      try {
        const respuesta = await fetch(
          "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1/municipios",
        );

        const datos = await respuesta.json();
        setMunicipios(datos);
      } catch {
        setMunicipios([]);
      }
    }

    cargarMunicipios();
  }, []);

  useEffect(() => {
    async function cargarActividades() {
      try {
        const respuesta = await fetch(
          "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1/catalogos/actividades",
        );

        const datos = await respuesta.json();
        setActividades(datos);
      } catch {
        setActividades([]);
      }
    }

    cargarActividades();
  }, []);

  async function cargarReportes() {
    setCargandoReportes(true);
    setErrorReportes("");

    try {
      const token = localStorage.getItem("token");

      const respuesta = await fetch(
        "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1/admin/reportes",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.message || datos.error || "No se pudieron cargar los reportes",
        );
      }

      setReportes(datos.reportes || []);
    } catch (error) {
      console.error("Error al cargar reportes:", error);
      setErrorReportes(error.message || "No se pudieron cargar los reportes");
    } finally {
      setCargandoReportes(false);
    }
  }

  useEffect(() => {
    cargarReportes();
  }, []);

  function buscarReportes(event) {
    event.preventDefault();
  }

  function limpiarFiltros() {
    setMunicipio("");
    setEstado("");
    setFecha("");
    setActividad("");
  }

  return (
    <div className="reportes-page">
      <div className="rieti-page-title">
        <h2>Bandeja de reportes</h2>
      </div>

      <section className="rieti-panel">
        <div className="rieti-panel-header">
          <div>
            <span>CONSULTA</span>
            <h3>Filtrar reportes</h3>
          </div>
        </div>

        <form onSubmit={buscarReportes} className="reportes-filtros">
          <div className="reporte-filtro">
            <label htmlFor="municipio">Municipio</label>
            <select
              id="municipio"
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
            >
              <option value="">Todos los municipios</option>

              {municipios.map((municipio) => (
                <option
                  key={municipio.idMunicipio}
                  value={municipio.idMunicipio}
                >
                  {municipio.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="reporte-filtro">
            <label htmlFor="actividad">Actividad</label>
            <select
              id="actividad"
              value={actividad}
              onChange={(e) => setActividad(e.target.value)}
            >
              <option value="">Todas las actividades</option>

              {actividades.map((actividad) => (
                <option
                  key={actividad.idCatalogoActividad}
                  value={actividad.idCatalogoActividad}
                >
                  {actividad.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="reporte-filtro">
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
            </select>
          </div>

          <div className="reporte-filtro">
            <label htmlFor="fecha">Fecha</label>
            <input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <div className="reportes-filtro-actions">
            <button
              type="button"
              className="reportes-button secondary"
              onClick={limpiarFiltros}
            >
              Limpiar
            </button>

            <button type="submit" className="reportes-button primary">
              Buscar
            </button>
          </div>
        </form>
      </section>

      <section className="rieti-panel">
        <div className="rieti-panel-header reportes-list-header">
          <div>
            <span>REPORTES</span>
            <h3>Reportes recibidos</h3>
          </div>

          <span className="reportes-count">{reportes.length} reportes</span>
        </div>

        <div className="reportes-table-container">
          <table className="reportes-table">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Fecha</th>
                <th>Municipio</th>
                <th>Actividad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargandoReportes && (
                <tr>
                  <td colSpan="6">Cargando reportes...</td>
                </tr>
              )}

              {!cargandoReportes && errorReportes && (
                <tr>
                  <td colSpan="6">{errorReportes}</td>
                </tr>
              )}

              {!cargandoReportes && !errorReportes && reportes.length === 0 && (
                <tr>
                  <td colSpan="6">No hay reportes registrados</td>
                </tr>
              )}

              {!cargandoReportes &&
                !errorReportes &&
                reportes.map((reporte) => (
                  <tr key={reporte.folio}>
                    <td>{reporte.folio}</td>
                    <td>{reporte.fecha_registro}</td>
                    <td>{reporte.municipio}</td>
                    <td>{reporte.actividad}</td>
                    <td>{reporte.estatus}</td>
                    <td></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
