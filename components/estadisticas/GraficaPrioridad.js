/**
 * Gráfica de reportes agrupados por nivel de prioridad.
 *
 * @module components/estadisticas/GraficaPrioridad
 */
"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

/**
 * Gráfica de reportes por nivel de prioridad de RIETI.
 *
 * Representa las prioridades Alta, Media y Baja
 * mediante barras verticales con exportación.
 *
 * @component
 */
export default function GraficaPrioridad({
  datos = [],
  cargando = false,
  error = "",
}) {
  const prioridades = useMemo(() => {
    const nombres = ["Alta", "Media", "Baja"];

    const normalizar = (valor) =>
      String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();

    return nombres.map((nombre) => ({
      nombre,
      total: (Array.isArray(datos) ? datos : [])
        .filter((item) => normalizar(item.prioridad) === normalizar(nombre))
        .reduce((suma, item) => suma + (Number(item.total) || 0), 0),
    }));
  }, [datos]);

  const maximo = Math.max(...prioridades.map((item) => item.total));
  const intervalo = maximo <= 10 ? 2 : maximo <= 50 ? 5 : 10;
  const limite = Math.max(intervalo, Math.ceil(maximo / intervalo) * intervalo);

  const opciones = {
    chart: {
      type: "bar",
      background: "transparent",
      fontFamily: "inherit",
      foreColor: "#77749a",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
        export: {
          csv: {
            filename: "RIETI_reportes_por_prioridad",
            columnDelimiter: ",",
            headerCategory: "Prioridad",
            headerValue: "Reportes",
          },
          svg: {
            filename: "RIETI_reportes_por_prioridad",
          },
          png: {
            filename: "RIETI_reportes_por_prioridad",
          },
        },
      },
    },
    colors: ["#e989bd", "#a879da", "#41b899"],
    plotOptions: {
      bar: {
        horizontal: false,
        distributed: true,
        borderRadius: 6,
        columnWidth: "42%",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (valor) => String(Math.round(valor)),
      style: {
        colors: ["#ffffff"],
        fontSize: "11px",
        fontWeight: 600,
      },
    },
    grid: {
      borderColor: "#eae7f7",
      strokeDashArray: 4,
      padding: { top: 8, right: 12, bottom: 0, left: 4 },
    },
    xaxis: {
      categories: prioridades.map((item) => item.nombre),
      labels: {
        style: {
          colors: ["#30295d", "#30295d", "#30295d"],
          fontSize: "12px",
        },
      },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
    yaxis: {
      min: 0,
      max: limite,
      tickAmount: Math.max(1, limite / intervalo),
      labels: {
        formatter: (valor) => String(Math.round(valor)),
        style: {
          colors: "#8985a2",
          fontSize: "11px",
        },
      },
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: (valor) => `${valor} reportes`,
      },
    },
    legend: { show: false },
  };

  const series = [
    {
      name: "Reportes",
      data: prioridades.map((item) => item.total),
    },
  ];

  const hayDatos = prioridades.some((item) => item.total > 0);

  return (
    <article className="rieti-panel rieti-analitica-prioridad">
      <div className="rieti-panel-header">
        <div>
          <span>NIVELES DE PRIORIDAD</span>
          <h3>Reportes por nivel de prioridad</h3>
        </div>
      </div>

      <div className="rieti-chart">
        {cargando ? (
          <p className="rieti-chart-placeholder">Cargando prioridades...</p>
        ) : error ? (
          <p className="rieti-chart-placeholder" role="alert">
            No se pudieron cargar las prioridades: {error}
          </p>
        ) : hayDatos ? (
          <Chart
            options={opciones}
            series={series}
            type="bar"
            height={310}
            width="100%"
          />
        ) : (
          <p className="rieti-chart-placeholder">
            No hay datos de prioridad disponibles.
          </p>
        )}
      </div>
    </article>
  );
}
