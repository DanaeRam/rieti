"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
const meses = [];
const reportesPorMes = [];
const municipios = [];
const reportesPorMunicipio = [];

export default function Dashboard() {
  const [resumen, setResumen] = useState(null);
  const [cargandoResumen, setCargandoResumen] = useState(true);
  const [errorResumen, setErrorResumen] = useState("");

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

  useEffect(() => {
        cargarResumen();
      }, []);

  const graficaMensual = {
    series: [
      {
        name: "Reportes",
        data: reportesPorMes,
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
          borderRadius: 6,
          columnWidth: "45%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: meses,
        labels: {
          style: {
            colors: "#667085",
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#667085",
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
      colors: ["#55AFC1"],
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

  const graficaEstados = {
    series: [],
    options: {
      chart: {
        type: "donut",
        fontFamily: "Arial, sans-serif",
      },
      colors: ["#D16C9A", "#496A9F", "#55AFC1"],
      labels: ["Pendientes", "En seguimiento", "Concluidos"],
      legend: {
        position: "bottom",
        fontSize: "13px",
        labels: {
          colors: "#344054",
        },
      },
      dataLabels: {
        enabled: true,
      },
      plotOptions: {
        pie: {
          donut: {
            size: "68%",
          },
        },
      },
      stroke: {
        width: 3,
        colors: ["#FFFFFF"],
      },
    },
  };

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
          <strong>—</strong>
          <small>Reportes recibidos</small>
        </article>

        <article>
          <span>ESTA SEMANA</span>
          <strong>—</strong>
          <small>Reportes recibidos</small>
        </article>

        <article>
          <span>HOY</span>
          <strong>—</strong>
          <small>Reportes recibidos</small>
        </article>
      </section>

      <section className="rieti-chart-grid">
        <article className="rieti-panel large">
          <div className="rieti-panel-header">
            <div>
              <span>ACTIVIDAD</span>
              <h3>Reportes recibidos por mes</h3>
            </div>

            <button>⋮</button>
          </div>

          <div className="rieti-chart">
            <Chart
              options={graficaMensual.options}
              series={graficaMensual.series}
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

      <section className="rieti-bottom-grid">
        <article className="rieti-panel">
          <div className="rieti-panel-header">
            <div>
              <span>ESTADO</span>
              <h3>Distribución de reportes</h3>
            </div>

            <button>⋮</button>
          </div>

          <div className="rieti-chart">
            <Chart
              options={graficaEstados.options}
              series={graficaEstados.series}
              type="donut"
              height={320}
            />
          </div>
        </article>

        <article className="rieti-panel">
          <div className="rieti-panel-header">
            <div>
              <span>RESUMEN</span>
              <h3>Estado de los reportes</h3>
            </div>
          </div>

          <div className="rieti-status-list">
            <div>
              <span>
                <i className="status-dot pink"></i>
                Pendientes
              </span>

              <strong>—</strong>
            </div>

            <div>
              <span>
                <i className="status-dot blue"></i>
                En seguimiento
              </span>

              <strong>—</strong>
            </div>

            <div>
              <span>
                <i className="status-dot turquoise"></i>
                Concluidos
              </span>

              <strong>—</strong>
            </div>

            <div className="status-total">
              <span>Total</span>
              <strong>—</strong>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
