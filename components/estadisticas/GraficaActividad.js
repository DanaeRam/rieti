/**
 * Gráfica de reportes agrupados por tipo de actividad.
 *
 * @module components/estadisticas/GraficaActividad
 */
"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

/**
 * Gráfica de tipos de actividad de RIETI.
 *
 * Muestra reportes por actividad mediante barras
 * horizontales, ordenadas de mayor a menor.
 * Incluye una escala proporcional y exportación.
 *
 * @component
 */
export default function GraficaActividad({
  datos = [],
  cargando = false,
  error = "",
}) {
  const actividades = useMemo(() => {
    if (!Array.isArray(datos)) return [];

    return datos
      .map((item) => ({
        nombre: String(item.actividad || "Sin especificar"),
        total: Number(item.total) || 0,
      }))
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [datos]);

  const maximo = Math.max(0, ...actividades.map((item) => item.total));

  const intervalo = maximo <= 10 ? 2 : maximo <= 50 ? 5 : 10;

  const limiteX = Math.max(
    intervalo,
    Math.ceil(maximo / intervalo) * intervalo,
  );

  const opciones = {
    chart: {
      type: "bar",
      background: "transparent",
      fontFamily: "inherit",
      foreColor: "#77749a",
      animations: {
        enabled: true,
        speed: 600,
      },
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
            filename: "RIETI_reportes_por_actividad",
            columnDelimiter: ",",
            headerCategory: "Actividad",
            headerValue: "Reportes",
          },
          svg: {
            filename: "RIETI_reportes_por_actividad",
          },
          png: {
            filename: "RIETI_reportes_por_actividad",
          },
        },
      },
    },

    colors: ["#a879da"],

    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        barHeight: "55%",
        distributed: false,
      },
    },

    dataLabels: {
      enabled: true,
      formatter: (valor) => Math.round(valor).toString(),
      style: {
        fontSize: "11px",
        fontWeight: 600,
        colors: ["#ffffff"],
      },
    },

    grid: {
      borderColor: "#eae7f7",
      strokeDashArray: 4,
      xaxis: {
        lines: { show: true },
      },
      yaxis: {
        lines: { show: false },
      },
      padding: {
        top: 5,
        right: 10,
        bottom: 0,
        left: 5,
      },
    },

    xaxis: {
      categories: actividades.map((item) => item.nombre),
      min: 0,
      max: limiteX,
      tickAmount: Math.max(1, limiteX / intervalo),
      labels: {
        formatter: (valor) => String(Math.round(valor)),
        style: {
          colors: "#8985a2",
          fontSize: "11px",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },

    yaxis: {
      labels: {
        maxWidth: 180,
        style: {
          colors: "#30295d",
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

    legend: {
      show: false,
    },

    noData: {
      text: "No hay actividades registradas.",
    },
  };

  const series = [
    {
      name: "Reportes",
      data: actividades.map((item) => item.total),
    },
  ];

  return (
    <article className="rieti-panel rieti-analitica-actividad">
      <div className="rieti-panel-header">
        <div>
          <span>ANÁLISIS DE ACTIVIDADES</span>
          <h3>Reportes por tipo de actividad</h3>
        </div>
      </div>

      <div className="rieti-chart">
        {cargando ? (
          <p className="rieti-chart-placeholder">Cargando actividades...</p>
        ) : error ? (
          <p className="rieti-chart-placeholder" role="alert">
            No se pudieron cargar las actividades: {error}
          </p>
        ) : actividades.length > 0 ? (
          <Chart
            options={opciones}
            series={series}
            type="bar"
            height={310}
            width="100%"
          />
        ) : (
          <p className="rieti-chart-placeholder">
            No hay actividades registradas.
          </p>
        )}
      </div>
    </article>
  );
}
