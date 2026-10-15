/**
 * Bandeja de reportes para consultar y filtrar reportes recibidos.
 *
 * @module app/admin/reportes/page
 */
"use client";

import { useEffect, useState } from "react";
import { FolderClosed, ClipboardList, FileClock } from "lucide-react";
import ExpedienteDigital from "@/components/ExpedienteDigital";
import Bitacora from "@/components/Bitacora";

/**
 * Permite consultar reportes mediante filtros y muestra los resultados.
 *
 * @component
 */
export default function Reportes() {
  const [municipio, setMunicipio] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [estatus, setEstatus] = useState("");
  const [fecha, setFecha] = useState("");

  const [filtrosAvanzados, setFiltrosAvanzados] = useState(false);
  const [nna, setNna] = useState("");
  const [rangoEdad, setRangoEdad] = useState("");
  const [genero, setGenero] = useState("");
  const [actividad, setActividad] = useState("");
  const [hora, setHora] = useState("");
  const [reportesFiltrados, setReportesFiltrados] = useState([]);
  
  const [municipios, setMunicipios] = useState([]);
  const [reportes, setReportes] = useState([])
  const [actividades, setActividades] = useState([]);
  const [cargandoReportes, setCargandoReportes] = useState(false);
  const [errorReportes, setErrorReportes] = useState("");

  const [expediente, setExpediente] = useState(null);
  const [folioBitacora, setFolioBitacora] = useState(null);

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
      setReportesFiltrados(datos.reportes || []);

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
  }

  function abrirBitacora(reporte) {
    setFolioBitacora(reporte.folio);
  }

  function cerrarExpediente() {
    setExpediente(null); 
  }

  function cerrarBitacora() {
    setFolioBitacora(null);
  }

  /**
   * Procesa el envío de los filtros de búsqueda.
   *
   * @param {import("react").FormEvent<HTMLFormElement>} event - Evento de envío del formulario.
   */

  function buscarReportes(event) {
    event.preventDefault();

    let resultados = reportes;

    if (municipio) {
      const municipioSeleccionado = municipios.find(
        (item) => String(item.idMunicipio) === municipio
      );

      resultados = resultados.filter(
        (reporte) =>
          reporte.municipio === municipioSeleccionado?.nombre
      );
    }

    if (estatus) {
      resultados = resultados.filter(
        (reporte) => reporte.estatus === estatus
      );
    }

    if (prioridad) {
      resultados = resultados.filter(
        (reporte) => reporte.prioridad === prioridad
      );
    }

    if (fecha) {
      resultados = resultados.filter(
        (reporte) => reporte.fecha_registro.startsWith(fecha)
      );
    }

    if (nna) {
      if (nna === "5") {
        resultados = resultados.filter(
          (reporte) => Number(reporte.num_menores) >= 5
        );
      } else {
        resultados = resultados.filter(
          (reporte) => String(reporte.num_menores) === nna
        );
      }
    }

    if (rangoEdad) {
      resultados = resultados.filter(
        (reporte) => reporte.rango_edad === rangoEdad
      );
    }

    if (genero) {
      resultados = resultados.filter(
        (reporte) =>
          reporte.genero_observado?.toLowerCase() ===
          genero.toLowerCase()
      );
    }

  if (actividad) {
  const actividadSeleccionada = actividades.find(
    (item) => String(item.idCatalogoActividad) === actividad
  );

  resultados = resultados.filter(
    (reporte) =>
      reporte.actividad === actividadSeleccionada?.nombre
  );
}

    if (hora) {
      resultados = resultados.filter(
        (reporte) =>
          reporte.hora_observada?.startsWith(hora)
      );
    }

    setReportesFiltrados(resultados);
  }

  /**
   * Restablece los filtros de búsqueda a sus valores iniciales.
   */

  function limpiarFiltros() {
    setMunicipio("");
    setEstatus("");
    setPrioridad("");
    setFecha("");

    setNna("");
    setRangoEdad("");
    setGenero("");
    setActividad("");
    setHora("");

    setFiltrosAvanzados(false);

    setReportesFiltrados(reportes);
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
            <label htmlFor="estatus">estatus</label>

            <select
              id="estatus"
              value={estatus}
              onChange={(e) => setEstatus(e.target.value)}
            >
              <option value="">Todos los estatus</option>
              <option value="Recibido">Recibido</option>
              <option value="En Revision">En Revisión</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Canalizado">Canalizado</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Concluido">Concluido</option>
              <option value="Reincidencia">Reincidencia</option>
            </select>
          </div>

          <div className="reporte-filtro">
            <label htmlFor="prioridad">Prioridad</label>

            <select
              id="prioridad"
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value)}
            >
              <option value="">Todas las prioridades</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
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

          <button
            type="button"
            className="reportes-filtros-avanzados-button"
            onClick={() => setFiltrosAvanzados(!filtrosAvanzados)}
          >
            Filtros avanzados
          </button>

          {filtrosAvanzados && (
            <div className="reportes-filtros-avanzados">
              <div className="reporte-filtro">
                <label htmlFor="nna">Número de niños</label>
                <select value={nna} onChange={(e) => setNna(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5 o más</option>
                </select>
              </div>

              <div className="reporte-filtro">
                <label htmlFor="rangoEdad">Rango de edad</label>
                <select
                  value={rangoEdad}
                  onChange={(e) => setRangoEdad(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="0-5">0 a 5 años</option>
                  <option value="6-11">6 a 11 años</option>
                  <option value="12-14">12 a 14 años</option>
                  <option value="15-17">15 a 17 años</option>
                </select>
              </div>

              <div className="reporte-filtro">
                <label htmlFor="genero">Género</label>
                <select
                  value={genero}
                  onChange={(e) => setGenero(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="mixto">Mixto</option>
                </select>
              </div>

              <div className="reporte-filtro">
                <label>Tipo de actividad</label>

                <select
                  value={actividad}
                  onChange={(e) => setActividad(e.target.value)}
                >
                  <option value="">Todas</option>

                  {actividades.map((item) => (
                    <option
                      key={item.idCatalogoActividad}
                      value={item.idCatalogoActividad}
                    >
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="reporte-filtro">
                <label>Horario</label>

                <input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                />
              </div>
            </div>
          )}

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

          <span className="reportes-count">
            {reportesFiltrados.length} reportes
          </span>
        </div>

        <div className="reportes-table-container">
          <table className="reportes-table">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Municipio</th>
                <th>Estatus</th>
                <th>Prioridad</th>
                <th>Fecha</th>
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

              {!cargandoReportes &&
                !errorReportes &&
                reportesFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="6">
                      No se encontraron reportes con los filtros seleccionado
                    </td>
                  </tr>
                )}

              {!cargandoReportes &&
                !errorReportes &&
                reportesFiltrados.map((reporte) => (
                  <tr key={reporte.folio}>
                    <td>{reporte.folio}</td>
                    <td>{reporte.municipio}</td>
                    <td>{reporte.estatus}</td>
                    <td>{reporte.prioridad}</td>
                    <td>{reporte.fecha_registro}</td>
                    <td>
                      <button
                        type="button"
                        title="Expediente digital"
                        onClick={() => abrirExpediente(reporte)}
                      >
                        <FolderClosed size={18} />
                      </button>

                      <button
                        type="button"
                        title="Bitácora"
                        onClick={() => abrirBitacora(reporte)}
                      >
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
            <ExpedienteDigital
              expediente={expediente}
              cerrar={cerrarExpediente}
            />
          )}

          {folioBitacora && (
            <Bitacora
              folio={folioBitacora}
              cerrar={cerrarBitacora}
            />
          )}
        </div>

      </section>
    </div>
  );
}
