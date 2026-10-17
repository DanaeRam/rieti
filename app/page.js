/**
 * Página principal de RIETI.
 * Muestra la presentación del sistema y las opciones
 * principales para reportar un caso o hacer seguimiento.
 *
 * @module app/page
 */
import Link from "next/link";

/**
 * Presenta el sistema y permite acceder a sus funciones principales.
 *
 * @component
 */

export default function Home() {
  return (
    <main className="rieti-home">
      <section className="rieti-home-hero">
        <div className="rieti-home-background" aria-hidden="true" />

        <div className="rieti-home-overlay" aria-hidden="true" />

        <header className="rieti-home-header">
          <div className="rieti-home-logo">
            <img
              src="/rieti_logo.png"
              alt="RIETI"
              className="rieti-home-logo-image"
            />
          </div>

          <Link href="/login" className="rieti-home-admin">
            Administrador
          </Link>
        </header>

        <div className="rieti-home-content">
          <h1 className="rieti-home-sr-only">
            Ruta Intermunicipal para la Erradicación del Trabajo Infantil
          </h1>

          <div className="rieti-home-title">
            <img
              src="images/rieti-logo2.png"
              alt=""
              className="rieti-home-title-image"
            />
          </div>

          <nav className="rieti-home-actions" aria-label="Accesos principales">
            <Link href="/reporte" className="rieti-home-button primary">
              Reportar caso
            </Link>

            <Link href="/seguimiento" className="rieti-home-button secondary">
              Seguimiento
            </Link>
          </nav>
        </div>
      </section>
    </main>
  );
}
