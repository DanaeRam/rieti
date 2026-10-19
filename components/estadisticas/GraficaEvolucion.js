"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

/**
 * Gráfica de evolución temporal de reportes de RIETI.
 *
 * Muestra la cantidad de reportes por fecha,
 * el total registrado durante el período y
 * las opciones de exportación SVG, PNG y CSV.
 *
 * @component
 */
export default function GraficaEvolucion({
  datos = [],
  cargando = false,
  error = "",
}) {
  const registros = useMemo(() => {
    return (Array.isArray(datos) ? datos : [])
      .filter((item) => {
        const total = Number(item.total);

        return (
          /^\d{4}-\d{2}-\d{2}/.test(String(item.fecha ?? "")) &&
          Number.isFinite(total) &&
          total >= 0
        );
      })
      .map((item) => ({
        fecha: String(item.fecha).slice(0, 10),
        total: Number(item.total),
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, [datos]);

  const fechas = registros.map((item) => {
    const [anio, mes, dia] = item.fecha.split("-").map(Number);

    return new Date(anio, mes - 1, dia).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
    });
  });

  const cantidades = registros.map((item) => item.total);

  const total = cantidades.reduce((suma, valor) => suma + valor, 0);

  const options = {
    chart: {
      type: "area",
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
            filename: "RIETI_evolucion_reportes",
            columnDelimiter: ",",
            headerCategory: "Fecha",
            headerValue: "Reportes",
          },
          svg: {
            filename: "RIETI_evolucion_reportes",
          },
          png: {
            filename: "RIETI_evolucion_reportes",
          },
        },
      },
    },

    colors: ["#7955c8"],

    stroke: {
      curve: "smooth",
      width: 3,
    },

    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.02,
        stops: [0, 95, 100],
      },
    },

    markers: {
      size: 3,
      strokeWidth: 2,
      strokeColors: "#ffffff",
      hover: {
        size: 5,
      },
    },

    dataLabels: {
      enabled: false,
    },

    grid: {
      borderColor: "#eae7f7",
      strokeDashArray: 4,
      padding: {
        top: 5,
        right: 8,
        bottom: 0,
        left: 4,
      },
    },

    xaxis: {
      categories: fechas,
      tickPlacement: "on",
      labels: {
        rotate: -35,
        hideOverlappingLabels: true,
        style: {
          colors: "#8985a2",
          fontSize: "11px",
        },
      },
    },

    yaxis: {
      min: 0,
      forceNiceScale: true,
      decimalsInFloat: 0,
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

    legend: {
      show: false,
    },

    noData: {
      text: "Sin datos disponibles",
    },

    responsive: [
      {
        breakpoint: 768,
        options: {
          xaxis: {
            labels: {
              rotate: -45,
            },
          },
        },
      },
    ],
  };

  const series = [
    {
      name: "Reportes registrados",
      data: cantidades,
    },
  ];

  return (
    <article className="rieti-panel rieti-chart rieti-evolucion">
      <div className="rieti-panel-header">
        <div>
          <span>TENDENCIA DE REPORTES</span>
          <h3>Evolución de reportes en el tiempo</h3>
        </div>
      </div>

      <div className="rieti-evolucion-contenido">
        {cargando ? (
          <p>Cargando evolución de reportes...</p>
        ) : error ? (
          <p className="rieti-dashboard-error" role="alert">
            No se pudo cargar la gráfica: {error}
          </p>
        ) : registros.length === 0 ? (
          <p>No hay reportes registrados en este período.</p>
        ) : (
          <>
            <div className="rieti-evolucion-resumen">
              <span>Reportes en el período</span>
              <strong>{total.toLocaleString("es-MX")}</strong>
            </div>

            <Chart
              options={options}
              series={series}
              type="area"
              height={270}
              width="100%"
            />
          </>
        )}
      </div>
    </article>
  );
}
