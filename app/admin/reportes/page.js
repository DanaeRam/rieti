/**
 * Bandeja de reportes para consultar y filtrar reportes recibidos.
 *
 * @module app/admin/reportes/page
 */
"use client";

import { useEffect, useState } from "react";
import { FolderClosed, ClipboardList, FileClock } from "lucide-react";

/**
 * Permite consultar reportes mediante filtros y muestra los resultados.
 *
 * @component
 */
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

  const [expediente, setExpediente] = useState(null);
  const [pestana, setPestana] = useState("encabezado");

  useEffect(() => {
    /** Carga el catálogo de municipios para el filtro de reportes. */
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
    /** Carga el catálogo de actividades para el filtro de reportes. */
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

  /**
   * Obtiene el listado de reportes desde la API administrativa.
   */
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

  function abrirExpediente(reporte) {
    setExpediente(reporte);
    setPestana("encabezado");
  }

  function cerrarExpediente() {
    setExpediente(null);
  }

  /**
   * Procesa el envío de los filtros de búsqueda.
   *
   * @param {import("react").FormEvent<HTMLFormElement>} event - Evento de envío del formulario.
   */
  function buscarReportes(event) {
    event.preventDefault();
  }

  /**
   * Restablece los filtros de búsqueda a sus valores iniciales.
   */
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
                    <td>
                      <button
                        type="button"
                        title="Expediente digital"
                        onClick={() => abrirExpediente(reporte)}
                      >
                        <FolderClosed size={18} />
                      </button>

                      <button type="button" title="Bitácora">
                        <ClipboardList size={18} />
                      </button>

                      <button type="button" title="Historial de estatus">
                        <FileClock size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {expediente && (
            <div className="expediente-overlay">
              <div className="expediente-ventana">
                <div className="expediente-pestanas">
                  <button
                    type="button"
                    className={`expediente-pestana ${
                      pestana === "encabezado" ? "activa" : ""
                    }`}
                    onClick={() => setPestana("encabezado")}
                  >
                    Encabezado
                  </button>

                  <button
                    type="button"
                    className={`expediente-pestana ${
                      pestana === "informacion" ? "activa" : ""
                    }`}
                    onClick={() => setPestana("informacion")}
                  >
                    Información
                  </button>

                  <button
                    type="button"
                    className={`expediente-pestana ${
                      pestana === "geolocalizacion" ? "activa" : ""
                    }`}
                    onClick={() => setPestana("geolocalizacion")}
                  >
                    Geolocalización
                  </button>

                  <button
                    type="button"
                    className={`expediente-pestana ${
                      pestana === "evidencias" ? "activa" : ""
                    }`}
                    onClick={() => setPestana("evidencias")}
                  >
                    Evidencias
                  </button>

                  <button
                    type="button"
                    className="expediente-cerrar"
                    onClick={cerrarExpediente}
                  >
                    ×
                  </button>
                </div>

                <div className="expediente-contenido">
                  {pestana === "encabezado" && (
                    <section className="expediente-seccion">
                      <h3>Encabezado</h3>

                      <div className="expediente-datos">
                        <div className="expediente-dato">
                          <span>Folio</span>
                          <strong>{expediente.folio}</strong>
                        </div>

                        <div className="expediente-dato">
                          <span>Municipio asignado</span>
                          <strong>{expediente.municipio || "—"}</strong>
                        </div>

                        <div className="expediente-dato">
                          <span>Alimentador asignado</span>
                          <strong>{expediente.alimentador || "—"}</strong>
                        </div>

                        <div className="expediente-dato">
                          <span>Estado</span>
                          <strong>{expediente.estatus || "—"}</strong>
                        </div>

                        <div className="expediente-dato">
                          <span>Prioridad</span>
                          <strong>{expediente.prioridad || "—"}</strong>
                        </div>
                      </div>
                    </section>
                  )}

                  {pestana === "informacion" && (
                    <section className="expediente-seccion">
                      <h3>Información</h3>

                      <div className="expediente-datos">
                        <div className="expediente-dato">
                          <span>Fecha</span>
                          <strong>{expediente.fecha_registro || "—"}</strong>
                        </div>

                        <div className="expediente-dato">
                          <span>Municipio</span>
                          <strong>{expediente.municipio || "—"}</strong>
                        </div>

                        <div className="expediente-dato">
                          <span>Tipo de actividad</span>
                          <strong>{expediente.actividad || "—"}</strong>
                        </div>

                        <div className="expediente-dato">
                          <span>NNA aproximados</span>
                          <strong>{expediente.num_menores || "—"}</strong>
                        </div>

                        <div className="expediente-dato">
                          <span>Nivel de riesgo</span>
                          <strong>{expediente.prioridad || "—"}</strong>
                        </div>
                      </div>

                      <div className="expediente-descripcion">
                        <span>Descripción</span>
                        <p>{expediente.descripcion || "—"}</p>
                      </div>
                    </section>
                  )}

                  {pestana === "geolocalizacion" && (
                    <section className="expediente-seccion">
                      <h3>Geolocalización</h3>

                      <div className="expediente-datos">
                        <div className="expediente-dato">
                          <span>Latitud</span>
                          <strong>{expediente.latitud || "—"}</strong>
                        </div>

                        <div className="expediente-dato">
                          <span>Longitud</span>
                          <strong>{expediente.longitud || "—"}</strong>
                        </div>

                        <div className="expediente-dato">
                          <span>Calle</span>
                          <strong>{expediente.calle || "—"}</strong>
                        </div>

                        <div className="expediente-dato">
                          <span>Colonia</span>
                          <strong>{expediente.colonia || "—"}</strong>
                        </div>

                        <div className="expediente-dato">
                          <span>CP</span>
                          <strong>{expediente.cp || "—"}</strong>
                        </div>
                      </div>

                      <div className="expediente-descripcion">
                        <span>Referencias</span>
                        <p>{expediente.referencias || "—"}</p>
                      </div>
                    </section>
                  )}

                  {pestana === "evidencias" && (
                    <section className="expediente-seccion">
                      <h3>Evidencias</h3>

                      <p>No hay evidencias disponibles.</p>
                    </section>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
