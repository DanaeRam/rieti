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

const URL_BASE =
  "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws";

function obtenerFechaLocal(valor) {
  if (!valor) return null;

  if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [anio, mes, dia] = valor.split("-").map(Number);
    const fecha = new Date(anio, mes - 1, dia);

    return fecha.getFullYear() === anio &&
      fecha.getMonth() === mes - 1 &&
      fecha.getDate() === dia
      ? fecha
      : null;
  }

  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function calcularPeriodos(porFecha) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));

  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const resultado = { hoy: 0, semana: 0, mes: 0 };

  if (!Array.isArray(porFecha)) return resultado;

  porFecha.forEach((item) => {
    const fecha = obtenerFechaLocal(item.fecha);
    const total = Number(item.total ?? 0);

    if (!fecha || !Number.isFinite(total) || fecha > new Date()) return;

    fecha.setHours(0, 0, 0, 0);

    if (fecha.getTime() === hoy.getTime()) resultado.hoy += total;
    if (fecha >= inicioSemana) resultado.semana += total;
    if (fecha >= inicioMes) resultado.mes += total;
  });

  return resultado;
}

export default function Dashboard() {
  const [rolUsuario, setRolUsuario] = useState(null);

  const [resumen, setResumen] = useState(null);
  const [cargandoResumen, setCargandoResumen] = useState(true);
  const [errorResumen, setErrorResumen] = useState("");

  const [estadisticas, setEstadisticas] = useState(null);
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(true);
  const [errorEstadisticas, setErrorEstadisticas] = useState("");

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

    return () => controlador.abort();
  }, []);

  const porMunicipio = Array.isArray(estadisticas?.por_municipio)
    ? estadisticas.por_municipio
    : [];

  const periodos = calcularPeriodos(estadisticas?.por_fecha);

  const valorResumen = (campo) => {
    if (cargandoResumen) return "...";
    if (errorResumen) return "—";
    return resumen?.[campo] ?? 0;
  };

  const valorPeriodo = (campo) => {
    if (cargandoEstadisticas) return "...";
    if (errorEstadisticas) return "—";
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

      {rolUsuario === "Administrador" && (
        <section
          className="rieti-chart-grid"
          aria-label="Gráficas por municipio"
        >
          <GraficaMunicipios
            datos={porMunicipio}
            cargando={cargandoEstadisticas}
            error={errorEstadisticas}
          />
        </section>
      )}
    </div>
  );
}
