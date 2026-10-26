/**
 * Panel con el resumen y las métricas de reportes.
 *
 * @module app/admin/dashboard/page
 * @author Danae Ramírez
 */
"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  Clock3,
  Settings,
  CircleCheck,
  CalendarDays,
  ChartNoAxesColumn,
  TrendingUp,
} from "lucide-react";

import GraficaMunicipios from "@/components/dashboard/GraficaMunicipios";
import GraficaEstatus from "@/components/dashboard/GraficaEstatus";
import TablaAtencion from "@/components/dashboard/TablaAtencion";

const URL_BASE =
  "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws";


/**
 * Convierte una fecha en un objeto local y rechaza fechas inválidas.
 *
 * @param {string|Date} valor - Fecha recibida desde el reporte.
 * @returns {Date|null} Fecha válida o null si no se puede convertir.
 */
function obtenerFechaLocal(valor) {
  if (!valor) return null;

  if (typeof valor === "string") {
    const coincidencia = valor.match(
      /^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s])/
    );

    if (coincidencia) {
      const [, anioTexto, mesTexto, diaTexto] = coincidencia;
      const anio = Number(anioTexto);
      const mes = Number(mesTexto);
      const dia = Number(diaTexto);

      const fecha = new Date(anio, mes - 1, dia);

      if (
        fecha.getFullYear() === anio &&
        fecha.getMonth() === mes - 1 &&
        fecha.getDate() === dia
      ) {
        return fecha;
      }

      return null;
    }
  }

  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

/**
 * Cuenta los reportes registrados hoy, esta semana y este mes.
 *
 * @param {Array<Object>} reportes - Reportes que se van a contar.
 * @returns {{hoy: number, semana: number, mes: number}} Totales por periodo.
 */
function calcularPeriodos(reportes) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(
    hoy.getDate() - ((hoy.getDay() + 6) % 7)
  );

  const inicioMes = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    1
  );

  const resultado = {
    hoy: 0,
    semana: 0,
    mes: 0,
  };

  if (!Array.isArray(reportes)) return resultado;

  reportes.forEach((reporte) => {
    const fecha = obtenerFechaLocal(
      reporte.fecha_registro
    );

    if (!fecha) return;

    fecha.setHours(0, 0, 0, 0);

    if (fecha > hoy) return;

    if (fecha.getTime() === hoy.getTime()) {
      resultado.hoy++;
    }

    if (fecha >= inicioSemana) {
      resultado.semana++;
    }

    if (fecha >= inicioMes) {
      resultado.mes++;
    }
  });

  return resultado;
}


/**
 * Muestra el resumen, las gráficas y los reportes prioritarios.
 *
 * @component
 */
export default function Dashboard() {
  const [rolUsuario, setRolUsuario] = useState(null);

  const [resumen, setResumen] = useState(null);
  const [cargandoResumen, setCargandoResumen] = useState(true);
  const [errorResumen, setErrorResumen] = useState("");

  const [estadisticas, setEstadisticas] = useState(null);
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(true);
  const [errorEstadisticas, setErrorEstadisticas] = useState("");

  const [reportes, setReportes] = useState([]);
  const [cargandoReportes, setCargandoReportes] = useState(true);
  const [errorReportes, setErrorReportes] = useState("");

  useEffect(() => {
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
      setRolUsuario(usuario?.rol || null);
    } catch {
      setRolUsuario(null);
    }
  }, []);

  useEffect(() => {
    const controlador = new AbortController();

    /**
     * Consulta un recurso administrativo con la sesión actual.
     *
     * @param {string} ruta - Ruta de la API que se consultará.
     * @returns {Promise<Object>} Datos devueltos por la API.
     */
    async function obtenerDatos(ruta) {
      const token = localStorage.getItem("token");

      if (!token) throw new Error("No hay una sesión activa.");

      const respuesta = await fetch(`${URL_BASE}${ruta}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        signal: controlador.signal,
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.message || datos.error || "No se pudieron obtener los datos",
        );
      }

      return datos;
    }

    /** Carga el resumen general de reportes. */
    async function cargarResumen() {
      try {
        const datos = await obtenerDatos("/api/v1/admin/dashboard/resumen");
        if (!controlador.signal.aborted) setResumen(datos);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error al cargar resumen:", error);
          setErrorResumen(error.message);
        }
      } finally {
        if (!controlador.signal.aborted) setCargandoResumen(false);
      }
    }

    /** Carga las estadísticas de los últimos 30 días. */
    async function cargarEstadisticas() {
      try {
        const datos = await obtenerDatos(
          "/api/v1/admin/dashboard/estadisticas?dias=30",
        );

        if (!controlador.signal.aborted) setEstadisticas(datos);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error al cargar estadísticas:", error);
          setErrorEstadisticas(error.message);
        }
      } finally {
        if (!controlador.signal.aborted) setCargandoEstadisticas(false);
      }
    }

    cargarResumen();
    cargarEstadisticas();
    cargarReportes();

    /** Carga los reportes usados para calcular los totales por periodo. */
    async function cargarReportes() {
      try {
        const datos = await obtenerDatos("/api/v1/admin/reportes");

        if (!controlador.signal.aborted) {
          setReportes(Array.isArray(datos.reportes) ? datos.reportes : []);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error al cargar reportes:", error);
          setErrorReportes(error.message);
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargandoReportes(false);
        }
      }
    }

    return () => controlador.abort();
  }, []);

  const porMunicipio = Array.isArray(estadisticas?.por_municipio)
    ? estadisticas.por_municipio
    : [];

  const porEstatus = Array.isArray(estadisticas?.por_estatus)
    ? estadisticas.por_estatus
    : [];

const periodos = calcularPeriodos(reportes);

  const valorResumen = (campo) => {
    if (cargandoResumen) return "...";
    if (errorResumen) return "—";
    return resumen?.[campo] ?? 0;
  };

  /**
   * Devuelve el total de un periodo o el estado de carga correspondiente.
   *
   * @param {"hoy"|"semana"|"mes"} campo - Periodo que se muestra.
   * @returns {number|string} Total, indicador de carga o guion si hay error.
   */
  const valorPeriodo = (campo) => {
    if (cargandoReportes) return "...";
    if (errorReportes) return "—";
    return periodos[campo];
  };

  const metricas = [
    {
      titulo: "TOTAL DE REPORTES",
      valor: valorResumen("total"),
      descripcion: "Reportes registrados",
      clase: "purple",
      icono: ClipboardList,
    },
    {
      titulo: "EN REVISIÓN",
      valor: valorResumen("en_revision"),
      descripcion: "Reportes en revisión",
      clase: "pink",
      icono: Clock3,
    },
    {
      titulo: "EN PROCESO",
      valor: valorResumen("en_proceso"),
      descripcion: "Reportes en proceso",
      clase: "blue",
      icono: Settings,
    },
    {
      titulo: "CONCLUIDOS",
      valor: valorResumen("concluidos"),
      descripcion: "Casos atendidos",
      clase: "turquoise",
      icono: CircleCheck,
    },
  ];

  const metricasPeriodo = [
    {
      titulo: "ESTE MES",
      valor: valorPeriodo("mes"),
      icono: CalendarDays,
      clase: "month",
    },
    {
      titulo: "ESTA SEMANA",
      valor: valorPeriodo("semana"),
      icono: ChartNoAxesColumn,
      clase: "week",
    },
    {
      titulo: "HOY",
      valor: valorPeriodo("hoy"),
      icono: TrendingUp,
      clase: "today",
    },
  ];

  return (
    <div className="rieti-dashboard">
      <div className="rieti-page-title">
        <h2>Dashboard</h2>
        <p>Resumen general de los reportes registrados</p>
      </div>

      {errorResumen && (
        <div className="rieti-dashboard-error" role="alert">
          No se pudo cargar el resumen: {errorResumen}
        </div>
      )}

      <section className="rieti-metrics" aria-label="Resumen de reportes">
        {metricas.map((metrica) => {
          const Icono = metrica.icono;

          return (
            <article
              key={metrica.clase}
              className={`rieti-metric ${metrica.clase}`}
            >
              <div className="rieti-metric-top">
                <span>{metrica.titulo}</span>
                <div className="rieti-metric-icon">
                  <Icono size={26} strokeWidth={2.2} />
                </div>
              </div>

              <strong>{metrica.valor}</strong>
              <small>{metrica.descripcion}</small>
            </article>
          );
        })}
      </section>

      <section className="rieti-mini-metrics" aria-label="Reportes recientes">
        {metricasPeriodo.map((metrica) => {
          const Icono = metrica.icono;

          return (
            <article
              key={metrica.clase}
              className={`rieti-mini-metric ${metrica.clase}`}
            >
              <div className="rieti-mini-icon">
                <Icono size={27} strokeWidth={2.1} />
              </div>

              <div className="rieti-mini-info">
                <span>{metrica.titulo}</span>
                <strong>{metrica.valor}</strong>
                <small>Reportes recibidos</small>
              </div>
            </article>
          );
        })}
      </section>

      {errorEstadisticas && (
        <div className="rieti-dashboard-error" role="alert">
          No se pudieron cargar las estadísticas: {errorEstadisticas}
        </div>
      )}

      <section
        className="rieti-chart-grid"
        aria-label="Gráficas estadísticas de reportes"
      >
        {rolUsuario === "Administrador" && (
          <GraficaMunicipios
            datos={porMunicipio}
            cargando={cargandoEstadisticas}
            error={errorEstadisticas}
          />
        )}

        <GraficaEstatus
          datos={porEstatus}
          cargando={cargandoEstadisticas}
          error={errorEstadisticas}
        />
      </section>

      <TablaAtencion
        reportes={reportes}
        cargando={cargandoReportes}
        error={errorReportes}
        limite={rolUsuario === "Administrador" ? 10 : 5}
        mostrarMunicipio={rolUsuario === "Administrador"}
      />
    </div>
  );
}
