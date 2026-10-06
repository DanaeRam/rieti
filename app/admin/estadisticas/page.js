"use client";

export default function Estadisticas() {
  return (
    <>
      <div className="rieti-page-title">
        <h2>Estadísticas y analítica</h2>
      </div>

      <article className="rieti-panel">
        <div className="rieti-panel-header">
          <div>
            <h3>Mapa de calor</h3>
          </div>
        </div>

        <div className="rieti-chart">
          <p>Próximamente.</p>
        </div>
      </article>

      <section className="rieti-chart-grid">
        <article className="rieti-panel">
          <div className="rieti-panel-header">
            <div>
              <span>ACTIVIDAD</span>
              <h3>Reportes por mes</h3>
            </div>
          </div>

          <div className="rieti-chart"></div>
        </article>

        <article className="rieti-panel">
          <div className="rieti-panel-header">
            <div>
              <span>COBERTURA</span>
              <h3>Reportes por municipio</h3>
            </div>
          </div>

          <div className="rieti-chart"></div>
        </article>
      </section>

      <section className="rieti-bottom-grid">
        <article className="rieti-panel">
          <div className="rieti-panel-header">
            <div>
              <span>ESTADO</span>
              <h3>Distribución por estado</h3>
            </div>
          </div>

          <div className="rieti-chart"></div>
        </article>

        <article className="rieti-panel">
          <div className="rieti-panel-header">
            <div>
              <span>PRIORIDAD</span>
              <h3>Reportes por prioridad</h3>
            </div>
          </div>

          <div className="rieti-chart"></div>
        </article>
      </section>

      <section className="rieti-bottom-grid">
        <article className="rieti-panel">
          <div className="rieti-panel-header">
            <div>
              <span>TIPO DE REPORTE</span>
              <h3>Reportes por actividad</h3>
            </div>
          </div>

          <div className="rieti-chart"></div>
        </article>
      </section>
    </>
  );
}
