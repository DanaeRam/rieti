"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const ESTATUS = [
  { nombre: "Recibido", clave: "recibido", color: "#a879da" },
  { nombre: "En Revisión", clave: "en revision", color: "#e989bd" },
  { nombre: "En Proceso", clave: "en proceso", color: "#7955c8" },
  { nombre: "Canalizado", clave: "canalizado", color: "#20a8c8" },
  { nombre: "Cancelado", clave: "cancelado", color: "#a5a1b8" },
  { nombre: "Concluido", clave: "concluido", color: "#41b899" },
  { nombre: "Reincidencia", clave: "reincidencia", color: "#eea45a" },
];

function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Gráfica de distribución de reportes por estatus de RIETI.
 *
 * Recibe las estadísticas agrupadas del backend,
 * representa los siete estatus mediante colores
 * individuales y muestra su distribución porcentual.
 *
 * @component
 */
export default function GraficaEstatus({
  datos = [],
  cargando = false,
  error = "",
}) {
  const distribucion = useMemo(() => {
    const conteo = Object.fromEntries(ESTATUS.map((item) => [item.clave, 0]));

    let sinClasificar = 0;

    datos.forEach((item) => {
      const clave = normalizar(item.estatus);
      const cantidad = Number(item.total);

      if (!Number.isFinite(cantidad) || cantidad < 0) return;

      if (Object.prototype.hasOwnProperty.call(conteo, clave)) {
        conteo[clave] += cantidad;
      } else {
        sinClasificar += cantidad;
      }
    });

    const resultado = ESTATUS.map((item) => ({
      nombre: item.nombre,
      total: conteo[item.clave],
      color: item.color,
    }));

    if (sinClasificar > 0) {
      resultado.push({
        nombre: "Sin clasificar",
        total: sinClasificar,
        color: "#77749a",
      });
    }

    return resultado;
  }, [datos]);

  const total = distribucion.reduce((suma, item) => suma + item.total, 0);

  const options = {
    chart: {
      type: "donut",
      toolbar: { show: false },
      background: "transparent",
      fontFamily: "inherit",
      foreColor: "#77749a",
    },
    labels: distribucion.map((item) => item.nombre),
    colors: distribucion.map((item) => item.color),
    stroke: {
      width: 3,
      colors: ["#ffffff"],
    },
    dataLabels: {
      enabled: true,
      formatter: (porcentaje) =>
        porcentaje >= 5 ? `${porcentaje.toFixed(1)}%` : "",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "62%",
          labels: {
            show: true,
            name: {
              show: true,
              color: "#77749a",
            },
            value: {
              show: true,
              color: "#30295d",
              fontSize: "24px",
              fontWeight: 700,
            },
            total: {
              show: true,
              showAlways: true,
              label: "Total de reportes",
              color: "#77749a",
              formatter: () => String(total),
            },
          },
        },
      },
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
    tooltip: {
      theme: "light",
      y: {
        formatter: (valor) => `${valor} reportes`,
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: { height: 330 },
          legend: { position: "bottom" },
        },
      },
    ],
  };

  return (
    <article className="rieti-panel">
      <div className="rieti-panel-header">
        <div>
          <span>ESTATUS DE REPORTES</span>
          <h3>Distribución de reportes por estatus</h3>
        </div>
      </div>

      <div className="rieti-chart rieti-chart-estatus">
        {cargando ? (
          <p className="rieti-chart-placeholder">Cargando gráfica...</p>
        ) : error ? (
          <p className="rieti-chart-placeholder" role="alert">
            No se pudo cargar la distribución: {error}
          </p>
        ) : total > 0 ? (
          <Chart
            options={options}
            series={distribucion.map((item) => item.total)}
            type="donut"
            height={360}
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
