MILPA — KIT DE LOGO
====================
symbol/    Símbolo Grano (M). color = oro, black = para fondos claros, white = para fondos oscuros.
wordmark/  Wordmark con grano-i, vectorizado (Space Grotesk, sin dependencia de fuente).
           color-dark/light = bicolor (oro grano); black/white = monocromo.
lockup/    Lockups horizontal y vertical en sus variantes de color/mono.
favicon/   App icon (tile tierra + M oro). Para favicon plano usa symbol/milpa-symbol-color.svg.

Colores
  Tierra  #17120D     Oro maíz #E8B14C
  Azul maíz #4B4794   Cal      #ECE6D8

Tipografía
  Display: Space Grotesk (medium)   Código/CLI/labels: Space Mono

Reglas
  Respeto mínimo = 1 módulo (un grano). Tamaño mínimo del símbolo: 16 px.
  El símbolo es mono-oro; el azul maíz se reserva para UI y acentos.

Uso en HTML (snippet oficial — T8.3)
  El wordmark NUNCA se construye con tipografía + trucos CSS (span/pseudo
  desplazado como grano): el grano queda flotando entre letras y la i
  conserva su punto natural (doble punto). Usá SIEMPRE el vector:

  1) Inline como <symbol> (una vez por página) + <use> por instancia:
       <svg style="display:none" aria-hidden="true">
         <symbol id="wm-milpa" viewBox="0 0 2406.90 900.00"> …paths de
         wordmark/milpa-wordmark-color-dark.svg con el <g> de letras en
         fill="currentColor" y el rect del grano en fill="var(--oro-300)"…
         </symbol>
       </svg>
       <svg role="img" aria-label="milpa" viewBox="0 0 2406.90 900.00"
            style="height:1em;width:auto"><use href="#wm-milpa"/></svg>
     (referencia viva: proof/milpa-ds-proof.html y proof/milpa-admin-proof.html)

  2) O como <img src=".../wordmark/milpa-wordmark-color-dark|light.svg">
     eligiendo variante por tema.

  Duro: letras = currentColor (heredan --text, temeables); grano = oro-300
  (#E8B14C) CONSTANTE en ambos temas — el logo es marca, no UI, y no se
  adapta al tema (WCAG exime logotipos). No usar var(--accent) para el
  grano: en light se profundiza a oro-600 y deja de ser el oro del kit.
