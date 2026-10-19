"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

function normalizarTexto(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

const ESTATUS_CONFIG = [
  { nombre: "Recibido", clave: "recibido", color: "#a274d6" },
  { nombre: "En Revisión", clave: "en_revision", color: "#e989bd" },
  { nombre: "En Proceso", clave: "en_proceso", color: "#6c58cf" },
  { nombre: "Canalizado", clave: "canalizado", color: "#23a6c6" },
  { nombre: "Cancelado", clave: "cancelado", color: "#a6a0bb" },
  { nombre: "Concluido", clave: "concluido", color: "#41b899" },
  { nombre: "Reincidencia", clave: "reincidencia", color: "#eba24e" },
];

export default function GraficaMunicipioEstatus({
  reportes = [],
  cargando = false,
  error = "",
}) {
  const datosMunicipio = useMemo(() => {
    if (!Array.isArray(reportes)) return [];

    const mapa = new Map();

    reportes.forEach((reporte) => {
      const municipio = String(reporte.municipio || "Sin municipio").trim();
      const estatus = normalizarTexto(reporte.estatus);

      if (!mapa.has(municipio)) {
        mapa.set(municipio, {
          municipio,
          recibido: 0,
          en_revision: 0,
          en_proceso: 0,
          canalizado: 0,
          cancelado: 0,
          concluido: 0,
          reincidencia: 0,
          total: 0,
        });
      }

      const actual = mapa.get(municipio);

      if (estatus === "recibido") actual.recibido += 1;
      else if (estatus === "en revision") actual.en_revision += 1;
      else if (estatus === "en proceso") actual.en_proceso += 1;
      else if (estatus === "canalizado") actual.canalizado += 1;
      else if (estatus === "cancelado") actual.cancelado += 1;
      else if (estatus === "concluido") actual.concluido += 1;
      else if (estatus === "reincidencia") actual.reincidencia += 1;

      actual.total += 1;
    });

    return [...mapa.values()].sort((a, b) => b.total - a.total);
  }, [reportes]);

  const categorias = datosMunicipio.map((item) => item.municipio);

  const series = ESTATUS_CONFIG.map((estatus) => ({
    name: estatus.nombre,
    data: datosMunicipio.map((item) => item[estatus.clave]),
  }));

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
            filename: "RIETI_estatus_por_municipio",
            columnDelimiter: ",",
            headerCategory: "Municipio",
            headerValue: "Reportes",
          },
          svg: {
            filename: "RIETI_estatus_por_municipio",
          },
          png: {
            filename: "RIETI_estatus_por_municipio",
          },
        },
      },
      background: "transparent",
      fontFamily: "inherit",
      foreColor: "#77749a",
    },
    colors: ESTATUS_CONFIG.map((item) => item.color),
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 5,
        columnWidth: "58%",
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
            height: 360,
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
    <article className="rieti-panel rieti-analitica-municipio-estatus">
      <div className="rieti-panel-header">
        <div>
          <span>MUNICIPIOS Y ESTATUS</span>
          <h3>Estatus de reportes por municipio</h3>
          <p>
            Comparación de reportes registrados según el estatus del expediente.
          </p>
        </div>
      </div>

      <div className="rieti-chart">
        {cargando ? (
          <p className="rieti-chart-placeholder">
            Cargando estatus por municipio...
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
            height={340}
            width="100%"
          />
        ) : (
          <p className="rieti-chart-placeholder">
            No hay datos de estatus disponibles.
          </p>
        )}
      </div>
    </article>
  );
}
