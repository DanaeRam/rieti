/**
 * Layout principal de RIETI.
 * Define la estructura HTML, los estilos globales
 * y la información general del sitio.
 *
 * @module app/layout
 */
import "./globals.css";
import "leaflet/dist/leaflet.css";

/** Metadata general del sitio mostrada por el navegador. */
export const metadata = {
  title: "RIETI",
  description: "Sistema de reportes RIETI",
};

/**
 * Define la estructura HTML compartida por las páginas de la aplicación.
 *
 * @param {{ children: React.ReactNode }} props - Contenido de la página actual.
 * @component
 */
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}