"use client";

import { useState } from "react";

export default function Reporte() {
  const [paso, setPaso] = useState(1);

  const [modalidad, setModalidad] = useState("SEGUIMIENTO");
  const [correoContacto, setCorreoContacto] = useState("");

  const [numMenores, setNumMenores] = useState("");
  const [rangoEdad, setRangoEdad] = useState("");
  const [generoObservado, setGeneroObservado] = useState("");
  const [actividad, setActividad] = useState("");
  const [horaObservada, setHoraObservada] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [situacionRiesgo, setSituacionRiesgo] = useState("");

  const [municipio, setMunicipio] = useState("");
  const [calle, setCalle] = useState("");
  const [colonia, setColonia] = useState("");
  const [referencias, setReferencias] = useState("");

  const [aceptoAviso, setAceptoAviso] = useState(false);

  function siguiente() {
    setPaso(paso + 1);
  }

  function regresar() {
    setPaso(paso - 1);
  }

  return (
    <main>
      {paso === 1 && (
        <section>
          <span>01</span>
          <h1>¿Cómo deseas realizar tu reporte?</h1>
          <p>Selecciona la opción que prefieras.</p>
          <div>
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

          <div>
            <strong>Tu información está protegida</strong>
            <p>
              Los datos proporcionados serán utilizados únicamente para la
              atención y seguimiento del reporte.
            </p>
          </div>

          <button type="button" onClick={siguiente}>
            Continuar
          </button>
        </section>
      )}

      {paso === 2 && (
        <section>
          <span>02</span>
          <h1>Cuéntanos qué ocurrió</h1>
          <p>Describe únicamente lo que observaste.</p>
          <div>
            <label htmlFor="numMenores">Número de menores *</label>

            <select
              id="numMenores"
              value={numMenores}
              onChange={(e) => setNumMenores(e.target.value)}
              required
            >
              <option value="">Selecciona una opción</option>
              <option value="1">1 menor</option>
              <option value="2">2 menores</option>
              <option value="3">3 menores</option>
              <option value="4">4 menores</option>
              <option value="5">5 o más menores</option>
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
              <option value="1">Venta de productos en vía pública</option>
              <option value="2">Mendicidad</option>
              <option value="3">Trabajo en comercio local</option>
              <option value="4">Construcción</option>
              <option value="5">Limpieza de parabrisas</option>
              <option value="6">Actividades agrícolas</option>
              <option value="7">Otra actividad</option>
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

          <button type="button" onClick={regresar}>
            Regresar
          </button>
          <button type="button" onClick={siguiente}>
            Continuar
          </button>
        </section>
      )}

      {paso === 3 && (
        <section>
          <span>03</span>
          <h1>Indica dónde ocurrió</h1>
          <div>
            <label htmlFor="municipio">Municipio *</label>

            <select
              id="municipio"
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              required
            >
              <option value="">Selecciona un municipio</option>
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

          <div>
            <h2>Ubicación del reporte</h2>
            <p>
              Utiliza tu ubicación actual o selecciona manualmente el punto
              donde observaste la situación.
            </p>

            <button type="button">Usar mi ubicación</button>
          </div>

          <button type="button" onClick={regresar}>
            Regresar
          </button>

          <button type="button" onClick={siguiente}>
            Continuar
          </button>
        </section>
      )}

      {paso === 4 && (
        <section>
          <span>04</span>
          <h1>Verifica tu reporte</h1>
          <p>
            Revisa que la información sea correcta antes de enviar el reporte.
          </p>

          <div>
            <h2>Tipo de reporte</h2>
            <p>
              {modalidad === "ANONIMO"
                ? "Reporte anónimo"
                : "Reporte con seguimiento"}
            </p>

            {modalidad === "SEGUIMIENTO" && <p>Correo: {correoContacto}</p>}
          </div>

          <div>
            <h2>Situación observada</h2>

            <p>Número de menores: {numMenores}</p>
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

          <div>
            <h2>Ubicación</h2>
            <p>Municipio: {municipio}</p>
            <p>Calle: {calle}</p>
            <p>Colonia: {colonia}</p>
            <p>Referencias: {referencias}</p>
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                checked={aceptoAviso}
                onChange={(e) => setAceptoAviso(e.target.checked)}
              />
              Acepto el aviso de privacidad y autorizo el envío de la
              información proporcionada.
            </label>
          </div>

          <button type="button" onClick={regresar}>
            Regresar
          </button>

          <button type="button" disabled={!aceptoAviso}>
            Enviar reporte
          </button>
        </section>
      )}
    </main>
  );
}
