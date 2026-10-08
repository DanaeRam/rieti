import Link from "next/link";

export default function Home() {
  return (
    <main className="rieti-home">
      <header className="rieti-home-header">
        <Link href="/login" className="rieti-home-admin">
          Administrador
        </Link>
      </header>

      <section className="rieti-home-content">
        <div className="loginHeader">
          <span>RIETI</span>

          <h1>
            Ruta Intermunicipal para la
            <br />
            Erradicación del Trabajo Infantil
          </h1>
        </div>

        <div className="rieti-home-actions">
          <Link href="/reporte" className="rieti-home-button primary">
            Reportar caso
          </Link>

          <Link href="/seguimiento" className="rieti-home-button primary">
            Seguimiento
          </Link>
        </div>
      </section>
    </main>
  );
}
