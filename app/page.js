/**
 * Página principal del portal ciudadano de RIETI.
 *
 * @module app/page
 * @author Danae Ramírez
 */
import Link from "next/link";
import DatosRieti from "@/components/DatosRieti";

/**
 * Muestra los accesos públicos y la información de RIETI.
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
          <Link href="/" className="rieti-home-logo">
            <img
              src="/rieti_logo.png"
              alt="RIETI"
              className="rieti-home-logo-image"
            />
          </Link>

          <Link href="/login" className="rieti-home-admin">
            Administrador <span aria-hidden="true">→</span>
          </Link>
        </header>

        <div className="rieti-home-content">
          <h1 className="rieti-home-title">
            <img
              src="/images/rieti-logo2.png"
              alt="Ruta Intermunicipal para la Erradicación del Trabajo Infantil"
              className="rieti-home-title-image"
            />
          </h1>

          <p className="rieti-home-description">
            Impulsado por SIPINNA, RIETI busca prevenir, identificar y dar seguimiento a 
            casos de trabajo infantil, fortaleciendo la protección de niñas, niños y
            adolescentes.
          </p>

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
      <DatosRieti />
    </main>
  );
}
