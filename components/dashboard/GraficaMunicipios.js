/**
 * Gráfica de reportes recibidos por municipio.
 *
 * @module components/dashboard/GraficaMunicipios
 */
"use client";

import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

/**
 * Representa el total de reportes recibidos por municipio.
 *
 * @component
 */
export default function GraficaMunicipios({
  datos = [],
  cargando = false,
  error = "",
}) {
  const municipios = datos.map((item) => item.municipio);
  const cantidades = datos.map((item) => Number(item.total) || 0);

  const options = {
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
            filename: "RIETI_reportes_por_municipio",
            columnDelimiter: ",",
            headerCategory: "Municipio",
            headerValue: "Reportes",
          },
          svg: {
            filename: "RIETI_reportes_por_municipio",
          },
          png: {
            filename: "RIETI_reportes_por_municipio",
          },
        },
      },
    },
    colors: ["#7955c8"],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        barHeight: "50%",
      },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "#eae7f7",
      strokeDashArray: 4,
    },
    xaxis: {
      categories: municipios,
      labels: {
        style: {
          colors: "#8985a2",
          fontSize: "11px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#30295d",
          fontSize: "11px",
        },
        maxWidth: 150,
      },
    },
    tooltip: { theme: "light" },
    legend: { show: false },
  };

  return (
    <article className="rieti-panel">
      <div className="rieti-panel-header">
        <div>
          <span>MUNICIPIOS</span>
          <h3>Reportes recibidos por municipio</h3>
        </div>
      </div>

      <div className="rieti-chart">
        {cargando ? (
          <p className="rieti-chart-placeholder">Cargando gráfica...</p>
        ) : error ? (
          <p className="rieti-chart-placeholder" role="alert">
            No se pudo cargar la gráfica.
          </p>
        ) : datos.length > 0 ? (
          <Chart
            options={options}
            series={[{ name: "Reportes", data: cantidades }]}
            type="bar"
            height={320}
            width="100%"
          />
        ) : (
          <p className="rieti-chart-placeholder">
            No hay reportes disponibles.
          </p>
        )}
      </div>
    </article>
  );
}
