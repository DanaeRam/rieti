/**
 * Dashboard administrativo de RIETI.
 * Presenta métricas y gráficas de los reportes registrados.
 *
 * @module app/admin/dashboard/page
 */
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

/**
 * Muestra el resumen, las métricas y las gráficas de los reportes.
 *
 * @component
 */
export default function Dashboard() {
  const [resumen, setResumen] = useState(null);
  const [cargandoResumen, setCargandoResumen] = useState(true);
  const [errorResumen, setErrorResumen] = useState("");
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(true);

  /**
   * Carga el resumen general de reportes del panel administrativo.
   */
  async function cargarResumen() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No hay una sesión activa.");
      }

      const respuesta = await fetch(
        "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1/admin/dashboard/resumen",
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
          datos.message || datos.error || "No se pudo obtener el resumen",
        );
      }

      setResumen(datos);
    } catch (error) {
      console.error("Error al cargar resumen:", error);
      setErrorResumen(error.message);
    } finally {
      setCargandoResumen(false);
    }
  }

  /**
   * Obtiene los datos estadísticos usados para las gráficas del dashboard.
   */
  async function cargarEstadisticas() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No hay una sesión activa.");
      }

      const respuesta = await fetch(
        "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1/admin/dashboard/estadisticas?dias=30",
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
          datos.message || datos.error || "No se pudieron obtener los datos",
        );
      }

      setEstadisticas(datos);
    } catch (error) {
      console.error("Error :( al cargar datos:", error);
    } finally {
      setCargandoEstadisticas(false);
    }
  }

  useEffect(() => {
    cargarResumen();
    cargarEstadisticas();
  }, []);

  let municipios = [];
  let reportesPorMunicipio = [];

  if (estadisticas) {
    estadisticas.por_municipio.forEach((item) => {
      municipios.push(item.municipio);
      reportesPorMunicipio.push(item.total);
    });
  }

  const graficaMunicipios = {
    series: [
      {
        name: "Reportes",
        data: reportesPorMunicipio,
      },
    ],
    options: {
      chart: {
        type: "bar",
        toolbar: {
          show: false,
        },
        fontFamily: "Arial, sans-serif",
      },
      colors: ["#3E3869"],
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 5,
          barHeight: "55%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: municipios,
        labels: {
          style: {
            colors: "#667085",
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#344054",
          },
        },
      },
      grid: {
        borderColor: "#EAECF0",
      },
      tooltip: {
        theme: "light",
      },
    },
  };

  const porFecha = estadisticas?.por_fecha || [];


  let reporteHoy = 0;
  let reportesEsteMes = 0;
  let reportesEstaSemana = 0;

  return (
    <>
      <div className="rieti-page-title">
        <h2>Dashboard</h2>
        <p>Resumen general de los reportes registrados</p>
      </div>

      <section className="rieti-metrics">
        <article className="rieti-metric purple">
          <span>TOTAL DE REPORTES</span>
          <strong>{cargandoResumen ? "..." : (resumen?.total ?? 0)}</strong>
          <small>Reportes registrados</small>
        </article>

        <article className="rieti-metric pink">
          <span>EN REVISIÓN</span>
          <strong>
            {cargandoResumen ? "..." : (resumen?.en_revision ?? 0)}
          </strong>
          <small>Reportes en revisión</small>
        </article>

        <article className="rieti-metric blue">
          <span>EN PROCESO</span>
          <strong>
            {cargandoResumen ? "..." : (resumen?.en_proceso ?? 0)}
          </strong>
          <small>Reportes en proceso</small>
        </article>

        <article className="rieti-metric turquoise">
          <span>CONCLUIDOS</span>
          <strong>
            {cargandoResumen ? "..." : (resumen?.concluidos ?? 0)}
          </strong>
          <small>Casos atendidos</small>
        </article>
      </section>

      <section className="rieti-mini-metrics">
        <article>
          <span>ESTE MES</span>
          <strong>{cargandoEstadisticas ? "..." : reportesEsteMes}</strong>
          <small>Reportes recibidos</small>
        </article>

        <article>
          <span>ESTA SEMANA</span>
          <strong>{cargandoEstadisticas ? "..." : reportesEstaSemana}</strong>
          <small>Reportes recibidos</small>
        </article>

        <article>
          <span>HOY</span>
          <strong>{cargandoEstadisticas ? "..." : reporteHoy}</strong>
          <small>Reportes recibidos</small>
        </article>
      </section>

      <section className="rieti-chart-grid">
        <article className="rieti-panel large">
          <div className="rieti-panel-header">
            <div>
              <span>MUNICIPIOS</span>
              <h3>Reportes recibidos por municipio</h3>
            </div>

            <button>⋮</button>
          </div>

          <div className="rieti-chart">
            <Chart
              options={graficaMunicipios.options}
              series={graficaMunicipios.series}
              type="bar"
              height={320}
            />
          </div>
        </article>

        <article className="rieti-panel">
          <div className="rieti-panel-header">
            <div>
              <span>COBERTURA</span>
              <h3>Reportes por municipio</h3>
            </div>

            <button>⋮</button>
          </div>

          <div className="rieti-chart">
            <Chart
              options={graficaMunicipios.options}
              series={graficaMunicipios.series}
              type="bar"
              height={320}
            />
          </div>
        </article>
      </section>
    </>
  );
}
