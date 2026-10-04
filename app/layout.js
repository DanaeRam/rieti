import "./globals.css";

export const metadata = {
  title: "RIETI",
  description: "Sistema de reportes RIETI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}