"use client";

import { useEffect, useState } from "react";

export default function Reporte() {
  const [paso, setPaso] = useState(1);

  const [modalidad, setModalidad] = useState("SEGUIMIENTO");
  const [correoContacto, setCorreoContacto] = useState("");

  const [numNinos, setNumNinos] = useState("");
  const [rangoEdad, setRangoEdad] = useState("");
  const [generoObservado, setGeneroObservado] = useState("");
  const [actividad, setActividad] = useState("");
  const [actividades, setActividades] = useState([]);
  const [horaObservada, setHoraObservada] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [situacionRiesgo, setSituacionRiesgo] = useState("");

  const [municipio, setMunicipio] = useState("");
  const [municipios, setMunicipios] = useState([]);
  const [calle, setCalle] = useState("");
  const [colonia, setColonia] = useState("");
  const [referencias, setReferencias] = useState("");

  const [aceptoAviso, setAceptoAviso] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [folio, setFolio] = useState("");
  const [estatus, setEstatus] = useState("");
  const [errorEnvio, setErrorEnvio] = useState("");

  useEffect(() => {
    async function cargarActividades() {
      try {
        const respuesta = await fetch(
          "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1/catalogos/actividades",
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar las actividades");
        }

        setActividades(datos);
      } catch (error) {
        console.error("Error al cargar actividades:", error);
        setActividades([]);
      }
    }

    cargarActividades();
  }, []);

  useEffect(() => {
    async function cargarMunicipios() {
      try {
        const respuesta = await fetch(
          "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1/municipios",
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar los municipios");
        }

        setMunicipios(datos);
      } catch (error) {
        console.error("Error al cargar municipios:", error);
        setMunicipios([]);
      }
    }

    cargarMunicipios();
  }, []);

  async function enviarReporte() {
    if (!aceptoAviso) {
      return;
    }

    setEnviando(true);
    setErrorEnvio("");

    try {
      const datosReporte = {
        idMunicipio: Number(municipio),
        idCatalogoActividad: Number(actividad),
        modalidad,
        correo_contacto: modalidad === "SEGUIMIENTO" ? correoContacto : null,
        num_menores: Number(numNinos),
        rango_edad: rangoEdad,
        genero_observado: generoObservado,
        hora_observada: horaObservada ? `${horaObservada}:00` : undefined,
        descripcion,
        situacion_riesgo:
          situacionRiesgo === "true"
            ? true
            : situacionRiesgo === "false"
              ? false
              : null,
        latitud: 0,
        longitud: 0,
        calle,
        colonia,
        cp: null,
        referencias,
        acepto_aviso: true,
      };

      const respuesta = await fetch(
        "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1/reportes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datosReporte),
        },
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.message || datos.error || "No se pudo enviar el reporte.",
        );
      }

      setFolio(datos.folio);
      setEstatus(datos.estatus);
    } catch (error) {
      console.error("Error al enviar reporte:", error);
      setErrorEnvio(error.message || "No se pudo enviar el reporte.");
    } finally {
      setEnviando(false);
    }
  }

  function siguiente() {
    setPaso(paso + 1);
  }

  function regresar() {
    setPaso(paso - 1);
  }

  return (
    <main className="reporte-page">
      {paso === 1 && (
        <section className="reporte-card">
          <span>01</span>

          <h1>¿Cómo deseas realizar tu reporte?</h1>

          <p>Selecciona la opción que prefieras.</p>

          <div className="reporte-opciones">
            <button
              type="button"
              onClick={() => {
                setModalidad("ANONIMO");
                setCorreoContacto("");
              }}
            >
              <h2>Reporte anónimo</h2>

              <p>
                No se solicitará información de contacto ni se generará un folio
                de seguimiento.
              </p>
            </button>

            <button type="button" onClick={() => setModalidad("SEGUIMIENTO")}>
              <h2>Reporte con seguimiento</h2>

              <p>
                Proporciona un correo para recibir tu folio y consultar los
                avances del reporte.
              </p>
            </button>
          </div>

          {modalidad === "SEGUIMIENTO" && (
            <div>
              <label htmlFor="correoContacto">Correo electrónico *</label>

              <input
                id="correoContacto"
                type="email"
                value={correoContacto}
                onChange={(e) => setCorreoContacto(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
          )}

          <div className="reporte-resumen">
            <h2>Tu información está protegida</h2>

            <p>
              Los datos proporcionados serán utilizados únicamente para la
              atención y seguimiento del reporte.
            </p>
          </div>

          <div className="reporte-botones">
            <span />

            <button type="button" onClick={siguiente}>
              Continuar
            </button>
          </div>
        </section>
      )}

      {paso === 2 && (
        <section className="reporte-card">
          <span>02</span>

          <h1>Cuéntanos qué ocurrió</h1>

          <p>Describe únicamente lo que observaste.</p>

          <div>
            <label htmlFor="numNinos">Número de niños *</label>

            <select
              id="numNinos"
              value={numNinos}
              onChange={(e) => setNumNinos(e.target.value)}
              required
            >
              <option value="">Selecciona una opción</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5 o más</option>
            </select>
          </div>

          <div>
            <label htmlFor="rangoEdad">Rango de edad *</label>

            <select
              id="rangoEdad"
              value={rangoEdad}
              onChange={(e) => setRangoEdad(e.target.value)}
              required
            >
              <option value="">Selecciona una opción</option>
              <option value="0-5">0 a 5 años</option>
              <option value="6-11">6 a 11 años</option>
              <option value="12-14">12 a 14 años</option>
              <option value="15-17">15 a 17 años</option>
              <option value="NO_ESPECIFICADO">No especificado</option>
            </select>
          </div>

          <div>
            <label htmlFor="generoObservado">Género observado *</label>

            <select
              id="generoObservado"
              value={generoObservado}
              onChange={(e) => setGeneroObservado(e.target.value)}
              required
            >
              <option value="">Selecciona una opción</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMENINO">Femenino</option>
              <option value="MIXTO">Mixto</option>
              <option value="NO_ESPECIFICADO">No sé</option>
            </select>
          </div>

          <div>
            <label htmlFor="actividad">Tipo de actividad *</label>
            <select
              id="actividad"
              value={actividad}
              onChange={(e) => setActividad(e.target.value)}
              required
            >
              <option value="">Selecciona una opción</option>

              {actividades.map((actividad) => (
                <option
                  key={actividad.idCatalogoActividad}
                  value={actividad.idCatalogoActividad}
                >
                  {actividad.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="horaObservada">Horario observado</label>

            <input
              id="horaObservada"
              type="time"
              value={horaObservada}
              onChange={(e) => setHoraObservada(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="descripcion">¿Qué observaste? *</label>

            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe brevemente la situación..."
              required
            />
          </div>

          <div>
            <label htmlFor="situacionRiesgo">
              ¿Observaste una situación de riesgo?
            </label>

            <select
              id="situacionRiesgo"
              value={situacionRiesgo}
              onChange={(e) => setSituacionRiesgo(e.target.value)}
            >
              <option value="">Selecciona una opción</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>

          <div className="reporte-botones">
            <button type="button" onClick={regresar}>
              Regresar
            </button>

            <button type="button" onClick={siguiente}>
              Continuar
            </button>
          </div>
        </section>
      )}

      {paso === 3 && (
        <section className="reporte-card">
          <span>03</span>

          <h1>Indica dónde ocurrió</h1>

          <p>Proporciona la ubicación donde observaste la situación.</p>

          <div>
            <label htmlFor="municipio">Municipio *</label>

            <select
              id="municipio"
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              required
            >
              <option value="">Selecciona un municipio</option>
              {municipios.map((municipio) => (
                <option
                  key={municipio.idMunicipio}
                  value={municipio.idMunicipio}
                >
                  {municipio.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="calle">Calle *</label>

            <input
              id="calle"
              type="text"
              value={calle}
              onChange={(e) => setCalle(e.target.value)}
              placeholder="Nombre de la calle"
              required
            />
          </div>

          <div>
            <label htmlFor="colonia">Colonia *</label>

            <input
              id="colonia"
              type="text"
              value={colonia}
              onChange={(e) => setColonia(e.target.value)}
              placeholder="Nombre de la colonia"
              required
            />
          </div>

          <div>
            <label htmlFor="referencias">Referencias del lugar *</label>

            <textarea
              id="referencias"
              value={referencias}
              onChange={(e) => setReferencias(e.target.value)}
              placeholder="Ej. frente a una escuela, junto a un parque..."
              required
            />
          </div>

          <div className="reporte-resumen">
            <h2>Ubicación del reporte</h2>

            <p>
              Utiliza tu ubicación actual o selecciona manualmente el punto
              donde observaste la situación.
            </p>

            <button type="button">Usar mi ubicación</button>
          </div>

          <div className="reporte-botones">
            <button type="button" onClick={regresar}>
              Regresar
            </button>

            <button type="button" onClick={siguiente}>
              Continuar
            </button>
          </div>
        </section>
      )}

      {paso === 4 && (
        <section className="reporte-card">
          <span>04</span>

          <h1>Verifica tu reporte</h1>

          <p>
            Revisa que la información sea correcta antes de enviar el reporte.
          </p>

          <div className="reporte-resumen">
            <h2>Tipo de reporte</h2>

            <p>
              {modalidad === "ANONIMO"
                ? "Reporte anónimo"
                : "Reporte con seguimiento"}
            </p>

            {modalidad === "SEGUIMIENTO" && <p>Correo: {correoContacto}</p>}
          </div>

          <div className="reporte-resumen">
            <h2>Situación observada</h2>

            <p>Número de niños: {numNinos}</p>
            <p>Rango de edad: {rangoEdad}</p>
            <p>Género observado: {generoObservado}</p>
            <p>Tipo de actividad: {actividad}</p>
            <p>Horario observado: {horaObservada || "No especificado"}</p>
            <p>Descripción: {descripcion}</p>
            <p>
              Situación de riesgo:{" "}
              {situacionRiesgo === "true"
                ? "Sí"
                : situacionRiesgo === "false"
                  ? "No"
                  : "No especificado"}
            </p>
          </div>

          <div className="reporte-resumen">
            <h2>Ubicación</h2>

            <p>Municipio: {municipio}</p>
            <p>Calle: {calle}</p>
            <p>Colonia: {colonia}</p>
            <p>Referencias: {referencias}</p>
          </div>

          <div>
            <label className="reporte-checkbox">
              <input
                type="checkbox"
                checked={aceptoAviso}
                onChange={(e) => setAceptoAviso(e.target.checked)}
              />

              <span>
                Acepto el aviso de privacidad y autorizo el envío de la
                información proporcionada.
              </span>
            </label>
          </div>

          <div className="reporte-botones">
            <button type="button" onClick={regresar}>
              Regresar
            </button>

            <button
              type="button"
              disabled={!aceptoAviso || enviando}
              onClick={enviarReporte}
            >
              {enviando ? "Enviando..." : "Enviar reporte"}
            </button>

          </div>
        </section>
      )}
    </main>
  );
}
