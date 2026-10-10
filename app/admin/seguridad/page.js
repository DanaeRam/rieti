"use client";

export default function Seguridad() {
  return (
    <>
      <div className="rieti-page-title">
        <h2>Seguridad</h2>
      </div>

      <section className="rieti-panel">
        <div className="rieti-panel-header">
          <div>
            <span>SEGURIDAD</span>
            <h3>Cambiar contraseña</h3>
          </div>
        </div>

        <div className="perfil-contenido">
          <form>
            <div>
              <label htmlFor="pwdActual">Contraseña actual</label>

              <input
                id="pwdActual"
                type="password"
                placeholder="Ingresa tu contraseña actual"
                required
              />
            </div>

            <div>
              <label htmlFor="pwdNuevo">Nueva contraseña</label>

              <input
                id="pwdNuevo"
                type="password"
                placeholder="Ingresa tu nueva contraseña"
                required
              />

              <small>La contraseña debe tener al menos 8 caracteres.</small>
            </div>

            <div>
              <label htmlFor="pwdConfirm">
                Confirmar nueva contraseña
              </label>

              <input
                id="pwdConfirm"
                type="password"
                placeholder="Confirma tu nueva contraseña"
                required
              />
            </div>

            <div>
              <button type="submit" className="seguridad-button">
                Cambiar contraseña
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}