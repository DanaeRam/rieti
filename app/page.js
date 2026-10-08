import Link from "next/link";

export default function Home() {
  return (
    <main>
      <header>
        <Link href="/admin">Administrador</Link>
      </header>

      <section>
        <h1>RIETI</h1>

        <p>Ruta Intermunicipal para la Erradicación del Trabajo Infantil</p>

        <div>
          <Link href="/reporte">Reportar caso</Link>

          <Link href="/seguimiento">Seguimiento</Link>
        </div>
      </section>
    </main>
  );
}
