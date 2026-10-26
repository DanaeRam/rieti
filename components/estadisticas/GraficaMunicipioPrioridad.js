/**
 * Gráfica de prioridades de reportes agrupadas por municipio.
 *
 * @module components/estadisticas/GraficaMunicipioPrioridad
 */
"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

/**
 * Normaliza texto para comparar niveles de prioridad.
 *
 * @param {string} valor - Texto que se va a normalizar.
 * @returns {string} Texto sin acentos y en minúsculas.
 */
function normalizarTexto(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Compara la cantidad de reportes por prioridad y municipio.
 *
 * @component
 */
export default function GraficaMunicipioPrioridad({
  reportes = [],
  cargando = false,
  error = "",
}) {
  const datosMunicipio = useMemo(() => {
    if (!Array.isArray(reportes)) return [];

    const mapa = new Map();

    reportes.forEach((reporte) => {
      const municipio = String(reporte.municipio || "Sin municipio").trim();
      const prioridadNormalizada = normalizarTexto(reporte.prioridad);

      if (!mapa.has(municipio)) {
        mapa.set(municipio, {
          municipio,
          Alta: 0,
          Media: 0,
          Baja: 0,
          total: 0,
        });
      }

      const actual = mapa.get(municipio);

      if (prioridadNormalizada === "alta") {
        actual.Alta += 1;
      } else if (prioridadNormalizada === "media") {
        actual.Media += 1;
      } else if (prioridadNormalizada === "baja") {
        actual.Baja += 1;
      }

      actual.total += 1;
    });

    return [...mapa.values()].sort((a, b) => b.total - a.total);
  }, [reportes]);

  const categorias = datosMunicipio.map((item) => item.municipio);

  const series = [
    {
      name: "Alta",
      data: datosMunicipio.map((item) => item.Alta),
    },
    {
      name: "Media",
      data: datosMunicipio.map((item) => item.Media),
    },
    {
      name: "Baja",
      data: datosMunicipio.map((item) => item.Baja),
    },
  ];

  const opciones = {
    chart: {
      type: "bar",
      stacked: true,
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
            filename: "RIETI_prioridad_por_municipio",
            columnDelimiter: ",",
            headerCategory: "Municipio",
            headerValue: "Reportes",
          },
          svg: {
            filename: "RIETI_prioridad_por_municipio",
          },
          png: {
            filename: "RIETI_prioridad_por_municipio",
          },
        },
      },
      background: "transparent",
      fontFamily: "inherit",
      foreColor: "#77749a",
    },
    colors: ["#e989bd", "#a879da", "#41b899"],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 5,
        columnWidth: "52%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: "#eae7f7",
      strokeDashArray: 4,
    },
    legend: {
      show: true,
      position: "bottom",
      fontSize: "12px",
      labels: {
        colors: "#514d69",
      },
      markers: {
        size: 9,
      },
    },
    xaxis: {
      categories: categorias,
      labels: {
        rotate: -35,
        hideOverlappingLabels: false,
        trim: true,
        style: {
          colors: "#30295d",
          fontSize: "11px",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
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
    noData: {
      text: "No hay datos disponibles.",
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 340,
          },
          xaxis: {
            labels: {
              rotate: -45,
            },
          },
        },
      },
    ],
  };

  return (
    <article className="rieti-panel rieti-analitica-municipio-prioridad">
      <div className="rieti-panel-header">
        <div>
          <span>MUNICIPIOS Y PRIORIDAD</span>
          <h3>Prioridad de reportes por municipio</h3>
          <p>
            Comparación de reportes registrados según el nivel de prioridad.
          </p>
        </div>
      </div>

      <div className="rieti-chart">
        {cargando ? (
          <p className="rieti-chart-placeholder">
            Cargando prioridad por municipio...
          </p>
        ) : error ? (
          <p className="rieti-chart-placeholder" role="alert">
            No se pudo cargar la gráfica: {error}
          </p>
        ) : datosMunicipio.length > 0 ? (
          <Chart
            options={opciones}
            series={series}
            type="bar"
            height={320}
            width="100%"
          />
        ) : (
          <p className="rieti-chart-placeholder">
            No hay datos de municipios disponibles.
          </p>
        )}
      </div>
    </article>
  );
}
