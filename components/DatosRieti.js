
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const metricas = [
  {
    valor: 14,
    prefijo: "",
    titulo: "Municipios integrados",
    descripcion: "Trabajando de manera coordinada.",
  },
  {
    valor: 200,
    prefijo: "+",
    titulo: "Reportes recibidos",
    descripcion: "Situaciones registradas en RIETI.",
  },
  {
    valor: 50,
    prefijo: "+",
    titulo: "Casos atendidos",
    descripcion: "Reportes que han recibido atención.",
  },
];

const monios = [
  { x: -48, y: 0, color: "#e17ac0" },
  { x: -84, y: -2, color: "#5386d8" },
  { x: -120, y: 0, color: "#9870d5" },
];

function TrayectoriaPapalote() {
  const cabeza = "M 21 0 L 0 -19 L -18 0 L 0 19 Z";
  const cola = "M -23 0 C -34 -8, -42 8, -52 0 S -74 -8, -88 0 S -110 8, -124 0";
  const ladoIzquierdo = "M 0 0 Q -7 -7 -11 -5 Q -13 0 -11 5 Q -7 7 0 0 Z";
  const ladoDerecho = "M 0 0 Q 7 -7 11 -5 Q 13 0 11 5 Q 7 7 0 0 Z";

  return (
    <svg className="rieti-recorrido-svg" aria-hidden="true">
      <defs>
        <linearGradient id="rieti-gradiente-linea" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5386d8" />
          <stop offset="50%" stopColor="#9870d5" />
          <stop offset="100%" stopColor="#e17ac0" />
        </linearGradient>
      </defs>

      <path
        className="rieti-recorrido-linea"
        d="M 0 0"
        stroke="url(#rieti-gradiente-linea)"
      />

      <g className="rieti-recorrido-papalote">
        <g transform="scale(1.25)">
          <path d={cabeza} fill="#9870d5" />
          <path d="M 21 0 L 0 -19 L 0 0 Z" fill="#5386d8" />
          <path d="M 21 0 L 0 0 L 0 19 Z" fill="#e17ac0" />
          <path d="M -18 0 L 0 -19 L 0 0 Z" fill="#7955c8" />
          <path d="M -18 0 L 0 0 L 0 19 Z" fill="#9870d5" />
          <path d={cabeza} fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
          <path d="M -18 0 H 21 M 0 -19 V 19" fill="none" stroke="#fff" strokeWidth="1.2" />
          <circle r="2" fill="#fff" />
        </g>

        <path d={cola} fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
        <path d={cola} fill="none" stroke="#9870d5" strokeWidth="2.8" strokeLinecap="round" />

        {monios.map(({ x, y, color }) => (
          <g key={x} transform={`translate(${x} ${y}) rotate(90)`}>
            <path d={ladoIzquierdo} fill={color} stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
            <path d={ladoDerecho} fill={color} stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
            <circle r="2" fill="#fff" />
          </g>
        ))}
      </g>
    </svg>
  );
}

export default function DatosRieti() {
  const seccionRef = useRef(null);

  useEffect(() => {
    const seccion = seccionRef.current;
    if (!seccion) return;

    const contexto = gsap.context(() => {
      const svg = seccion.querySelector(".rieti-recorrido-svg");
      const linea = seccion.querySelector(".rieti-recorrido-linea");
      const papalote = seccion.querySelector(".rieti-recorrido-papalote");
      const descripcion = seccion.querySelector(".rieti-sipinna p");
      const transicion = seccion.querySelector(".rieti-transicion");
      const tarjetas = gsap.utils.toArray(".rieti-impacto-tarjeta", seccion);

      const reducirMovimiento = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const posicion = (elemento) => {
        const base = seccion.getBoundingClientRect();
        const rect = elemento.getBoundingClientRect();

        return {
          x: rect.left - base.left,
          y: rect.top - base.top,
          ancho: rect.width,
          alto: rect.height,
          centroX: rect.left - base.left + rect.width / 2,
        };
      };

      if (!reducirMovimiento) {
        const progreso = { valor: 0 };
        let longitud = 0;

        const dibujar = () => {
          if (!longitud) return;

          const recorrido = longitud * gsap.utils.clamp(0, 1, progreso.valor);
          const punto = linea.getPointAtLength(recorrido);
          const margen = Math.min(5, longitud / 2);

          const anterior = linea.getPointAtLength(Math.max(0, recorrido - margen));
          const siguiente = linea.getPointAtLength(Math.min(longitud, recorrido + margen));

          const angulo = Math.atan2(
            siguiente.y - anterior.y,
            siguiente.x - anterior.x
          ) * 180 / Math.PI;

          papalote.setAttribute(
            "transform",
            `translate(${punto.x} ${punto.y}) rotate(${angulo})`
          );

          linea.style.strokeDashoffset = longitud - recorrido;
        };

        const actualizarTrayectoria = () => {
          const w = seccion.clientWidth;
          const h = seccion.clientHeight;
          const movil = w <= 768;

          const texto = posicion(descripcion);
          const trans = posicion(transicion);
          const [c1, c2, c3] = tarjetas.map(posicion);

          const inicioX = texto.centroX;
          const inicioY = texto.y + texto.alto + 35;
          const salidaY = trans.y + trans.alto * 0.5;

          let ruta;

          if (movil) {
            const derecha = w + 155;
            const bordeDerecho = w - 20;
            const bordeIzquierdo = 20;

            const y1 = c1.y - 40;
            const y2 = c1.y + c1.alto + 25;
            const y3 = c2.y + c2.alto + 25;
            const y4 = c3.y + c3.alto + 45;

            ruta = `
              M ${inicioX} ${inicioY}
              C ${w * 0.65} ${inicioY + 45},
                ${derecha} ${salidaY - 80},
                ${derecha} ${salidaY}
              C ${derecha + 40} ${salidaY + 100},
                ${derecha + 20} ${y1 - 100},
                ${bordeDerecho} ${y1}
              C ${w * 0.6} ${y1 + 45},
                ${w * 0.7} ${y2 - 45},
                ${bordeIzquierdo} ${y2}
              C ${-45} ${y2 + 75},
                ${-30} ${y3 - 85},
                ${bordeDerecho} ${y3}
              C ${w + 40} ${y3 + 75},
                ${w * 0.65} ${y4 - 85},
                ${bordeIzquierdo} ${y4}
              C ${-40} ${y4 + 45},
                ${-110} ${y4 + 65},
                ${-190} ${y4 + 30}
            `;
          } else {
            const gap12 = (c1.x + c1.ancho + c2.x) / 2;
            const gap23 = (c2.x + c2.ancho + c3.x) / 2;

            const arriba = c2.y - 60;
            const centro = c2.y + c2.alto * 0.5;
            const abajo = c2.y + c2.alto + 65;
            const salidaX = w + 180;

            ruta = `
              M ${inicioX} ${inicioY}
              C ${inicioX + 35} ${inicioY + 95},
                ${w * 0.85} ${salidaY - 90},
                ${salidaX} ${salidaY}
              C ${salidaX + 75} ${salidaY + 95},
                ${salidaX + 75} ${salidaY + 190},
                ${salidaX} ${salidaY + 235}
              C ${w + 60} ${salidaY + 285},
                ${w + 90} ${abajo - 90},
                ${w - 15} ${abajo}
              C ${w * 0.85} ${abajo + 50},
                ${gap23 + 85} ${abajo + 65},
                ${gap23} ${centro}
              C ${gap23 - 45} ${centro - 90},
                ${c2.centroX + 95} ${arriba},
                ${c2.centroX} ${arriba}
              C ${c2.centroX - 95} ${arriba},
                ${gap12 + 45} ${centro - 90},
                ${gap12} ${centro}
              C ${gap12 - 45} ${centro + 105},
                ${c1.centroX + 110} ${abajo + 30},
                ${c1.centroX} ${abajo + 35}
              C ${c1.centroX - 120} ${abajo + 35},
                ${-70} ${abajo + 20},
                ${-190} ${abajo - 15}
            `;
          }

          svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
          linea.setAttribute("d", ruta);

          longitud = linea.getTotalLength();
          linea.style.strokeDasharray = longitud;

          dibujar();
        };

        actualizarTrayectoria();

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: seccion,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 1.2,
            invalidateOnRefresh: true,
            onRefresh: actualizarTrayectoria,
          },
        });

        timeline
          .to(progreso, {
            valor: 0.015,
            duration: 0.25,
            ease: "none",
            onUpdate: dibujar,
          })
          .to(progreso, {
            valor: 0.12,
            duration: 0.2,
            ease: "power1.inOut",
            onUpdate: dibujar,
          })
          .to(progreso, {
            valor: 1,
            duration: 0.55,
            ease: "none",
            onUpdate: dibujar,
          });
      }

      if (reducirMovimiento) return;

      tarjetas.forEach((tarjeta) => {
        const numero = tarjeta.querySelector(".rieti-impacto-numero");
        const valor = Number(numero.dataset.valor);
        const prefijo = numero.dataset.prefijo || "";
        const contador = { actual: 0 };

        gsap.from(tarjeta, {
          opacity: 0,
          y: 25,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: tarjeta,
            start: "top 90%",
            once: true,
          },
        });

        gsap.to(contador, {
          actual: valor,
          duration: 2.5,
          ease: "power2.in",
          scrollTrigger: {
            trigger: tarjeta,
            start: "top 90%",
            once: true,
          },
          onUpdate: () => {
            numero.textContent = prefijo + Math.round(contador.actual);
          },
        });
      });
    }, seccion);

    return () => contexto.revert();
  }, []);

  return (
    <section
      ref={seccionRef}
      className="rieti-recorrido"
      aria-label="Presentación e impacto de RIETI"
    >
      <div className="rieti-sipinna">
        <span className="rieti-seccion-etiqueta">EL ORIGEN DE RIETI</span>
        <h2>Una iniciativa impulsada por</h2>

        <div className="rieti-sipinna-logo">
          <img
            src="/images/sipinna-logo.png"
            alt="Sistema Nacional de Protección Integral de Niñas, Niños y Adolescentes"
          />
        </div>

        <p>
          RIETI es una iniciativa que impulsa la coordinación entre municipios
          para fortalecer la protección de niñas, niños y adolescentes frente
          al trabajo infantil.
        </p>
      </div>

      <div className="rieti-transicion" aria-hidden="true" />

      <div className="rieti-impacto">
        <div className="rieti-impacto-encabezado">
          <span className="rieti-seccion-etiqueta">RESULTADOS DE RIETI</span>
          <h2>Nuestro impacto</h2>
          <p>
            Cada municipio, cada reporte y cada acción forman parte de un
            esfuerzo conjunto.
          </p>
        </div>

        <div className="rieti-impacto-tarjetas">
          {metricas.map((metrica) => (
            <article className="rieti-impacto-tarjeta" key={metrica.titulo}>
              <strong
                className="rieti-impacto-numero"
                data-valor={metrica.valor}
                data-prefijo={metrica.prefijo}
              >
                {metrica.prefijo}{metrica.valor}
              </strong>
              <h3>{metrica.titulo}</h3>
              <p>{metrica.descripcion}</p>
            </article>
          ))}
        </div>
      </div>

      <TrayectoriaPapalote />
    </section>
  );
}
