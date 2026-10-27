# Prompt de Sistema: Implementación Literal de Nivel ($i$ vs. $\pi$)

**Instrucción Crítica para el Agente IA:**
Implementa este nivel siguiendo cada regla de forma 100% literal. No asumas comportamientos implícitos ni omitas mecánicas secundarias. Ignora aspectos estéticos o tipográficos; concéntrate exclusivamente en el motor físico, las máquinas de estado, la geometría de hitboxes, el consumo de colas de datos y la resolución matemática de daño y reflexión.

---

## 1. Fundamento Matemático General del Nivel

1. **Potencias Cíclicas de la Unidad Imaginaria ($i^n$) como Máquina de Estados:**
   * En el plano complejo, multiplicar sucesivamente por $i$ produce una rotación de $90^\circ$ con un ciclo cerrado de período $4$:
     $$i \xrightarrow{\times i} -1 \xrightarrow{\times i} -i \xrightarrow{\times i} 1 \xrightarrow{\times i} i$$
   * **Traducción literal a mecánica:** El Jugador cambia automáticamente de estado cada **$3.0\text{ segundos}$** exactos:
     * **Componente Imaginaria ($\pm i$):** Otorga **Penetración (Intangibilidad física)**. La entidad atraviesa el cuerpo del enemigo sin rebotar y le inflige **$-8\text{ HP}$** al superponerse con su núcleo.
     * **Signo Negativo ($-1$ y $-i$):** Otorga **Reflexión ($\times (-1)$)**. Cualquier daño que el enemigo intente infligirle (ya sea mediante el corte de sector circular o mediante un dígito de la cola decimal) se multiplica por $-1$: el Jugador recibe **$0\text{ HP}$** de daño y el Enemigo ($\pi$) recibe el **$100\%$ de su propio daño reflejado**.

2. **Área del Sector Circular ($S = \frac{1}{2}r^2\theta$) de Radio $r = 2$:**
   * $\pi$ proyecta un cono/sector circular rotatorio cuyo radio es $r = 2$ unidades de la cuadrícula ($\frac{1}{2}r^2 = 2$).
   * Cada vez que el sector se activa al tocar al Jugador, muestra la ecuación $S = \frac{1}{2}r^2\theta = 2\theta$, intenta infligir **$-15\text{ HP}$** y evoluciona su ángulo $\theta$ al siguiente valor notable:
     $$\frac{\pi}{6} \longrightarrow \frac{\pi}{3} \longrightarrow \frac{\pi}{2} \longrightarrow \pi \longrightarrow 2\pi \longrightarrow \text{reinicia a } \frac{\pi}{6}$$
   * **Regla crítica de evolución bajo reflexión:** Aunque el daño del sector ($-15\text{ HP}$) sea reflejado por los estados $-1$ o $-i$, **el ángulo $\theta$ de $\pi$ evoluciona igualmente al siguiente nivel**.

3. **Cola FIFO de Decimales de $\pi$ ($3.14159265\dots$) bajo Reflexión:**
   * Del cuerpo de $\pi$ cuelga una cola física cuyos dígitos se consumen en orden estricto ($3 \rightarrow 1 \rightarrow 4 \rightarrow 1 \rightarrow 5 \rightarrow 9 \rightarrow 2 \rightarrow 6\dots$).
   * **Regla crítica de consumo bajo reflexión:** Si el dígito activo $(d_k)$ toca al Jugador mientras este se encuentra en estado $-1$ o $-i$, el daño se invierte ($\times (-1) \, d_k$), restándole **$-d_k\text{ HP}$ a $\pi$**, y **el dígito se consume y avanza al siguiente decimal exactamente igual que en un impacto normal**.

---

## 2. Configuración Inicial Estricta

* **Arena:** Cuadrícula cartesiana cuadrada delimitada por $4$ paredes sólidas con rebote elástico perfecto ($e = 1$). Sin gravedad ni fricción.
* **Entidad Izquierda (Jugador): Unidad Imaginaria ($i$)**
  * **HP Inicial / Máximo:** $50 / 50$.
  * **Posición Inicial:** $(-3.5, 0)$.
  * **Estado Inicial en UI:** `[READY]` durante el conteo (`3, 2, 1`). En el segundo `00:03` inicia en el Estado 1: `[i Penetración]`.
* **Entidad Derecha (Enemigo / CPU): Constante Pi ($\pi$)**
  * **HP Inicial / Máximo:** $75 / 75$.
  * **Posición Inicial:** $(+3.5, 0)$.
  * **Estado Inicial en UI:** `[READY]` durante el conteo. Al iniciar la partida muestra `[Siguiente sector \theta = \pi/6]`.
  * **Componentes Físicos Acoplados a $\pi$:**
    1. **Cuerpo Circular Principal ($\pi$):** Único componente con colisión física sólida (cuando el Jugador está en estado sólido) y único receptor de daño.
    2. **Sector Circular Rotatorio:** Sensor geométrico de radio $r = 2$ anclado al centro de $\pi$ que gira continuamente en sentido horario. Inicia en $\theta = \frac{\pi}{6}$.
    3. **Cola de Decimales:** Cadena articulada de sensores adherida al borde de $\pi$. Inicia con el dígito activo `(3)` seguido de `. 1 4 1 ...`

---

## 3. Reglas de Físicas, Estados y Colisiones Paso a Paso

### A. Máquina de Estados Cíclica del Jugador ($i$)
El temporizador interno del Jugador ejecuta una transición exactamente cada **$3.0\text{ segundos}$** de partida activa:

1. **Estado 1: $[i \text{ Penetración}]$ (Segundos `00:03–00:05`, `00:15–00:17`, `00:27–00:29`)**
   * **Colisión Cuerpo a Cuerpo:** **Desactivada (Intangible)** contra el cuerpo de $\pi$. Solo rebota contra las $4$ paredes de la arena.
   * **Ataque por Superposición:** Si el círculo de $i$ se superpone con el círculo central de $\pi$, le resta **$-8\text{ HP}$** a $\pi$ (con un cooldown de inmunidad por cruce para aplicar un único golpe de $-8\text{ HP}$ por cada atravesamiento).
   * **Vulnerabilidad:** No tiene reflexión. Recibe el $100\%$ del daño del sector ($-15\text{ HP}$) y de los dígitos de la cola ($-d_k\text{ HP}$).

2. **Estado 2: $[-1 \text{ Reflexión}]$ (Segundos `00:06–00:08`, `00:18–00:20`, `00:30–00:32`)**
   * **Fórmula mostrada al transicionar:** $i \times i = -1$.
   * **Colisión Cuerpo a Cuerpo:** **Sólida (Rebote elástico normal)** contra el cuerpo central de $\pi$. No hace daño de penetración ($0\text{ HP}$ por choque de cuerpos).
   * **Escudo Reflector Activo:**
     * Si entra en el sector circular de $\pi$: $i$ recibe $0$ daño, se muestra $\times (-1)\ 15$, $\pi$ recibe **$-15\text{ HP}$** y el sector de $\pi$ sube de nivel.
     * Si toca el dígito activo $(d_k)$ de la cola de $\pi$: $i$ recibe $0$ daño, se muestra $\times (-1)\ d_k$, $\pi$ recibe **$-d_k\text{ HP}$** y la cola avanza al siguiente dígito.

3. **Estado 3: $[-i \text{ Penetración + Reflexión}]$ (Segundos `00:09–00:11`, `00:21–00:23`)**
   * **Fórmula mostrada al transicionar:** $-1 \times i = -i$.
   * **Colisión Cuerpo a Cuerpo:** **Desactivada (Intangible)** contra el cuerpo de $\pi$.
   * **Doble Propiedad simultánea:**
     * Al atravesar el cuerpo central de $\pi$, le inflige **$-8\text{ HP}$** por penetración.
     * Mantiene el **Escudo Reflector Activo**: refleja los **$-15\text{ HP}$** del sector circular y el daño **$-d_k\text{ HP}$** de cualquier dígito activo de la cola directamente contra $\pi$.

4. **Estado 4: $[1 \text{ Normal}]$ (Segundos `00:12–00:14`, `00:24–00:26`)**
   * **Fórmula mostrada al transicionar:** $-i \times i = 1$. (Al terminar este estado tras $3\text{s}$, muestra $1 \times i = i$ y vuelve al Estado 1).
   * **Colisión Cuerpo a Cuerpo:** **Sólida (Rebote elástico normal)** contra el cuerpo central de $\pi$.
   * **Sin Habilidades:** No hace daño al chocar y recibe el $100\%$ del daño del sector ($-15\text{ HP}$) y de la cola decimal ($-d_k\text{ HP}$).

### B. Independencia Geométrica de los 3 Hitboxes de $\pi$
Para que el motor replique fielmente el video (especialmente lo que ocurre en el segundo `00:27`), $\pi$ debe manejar **tres colisionadores independientes**:
1. **Hitbox 1 — Cuerpo Central de $\pi$ (Radio $R_\pi \approx 0.75$ unidades):**
   * Es el único que rebota físicamente contra el Jugador (cuando el Jugador está en estado $-1$ o $1$).
   * Es el único que activa el daño de **$-8\text{ HP}$** cuando el Jugador lo atraviesa en estado $i$ o $-i$.
2. **Hitbox 2 — Sector Circular (Cono de Radio $r = 2.0$ unidades y ángulo $\theta$):**
   * Es un sensor (*trigger*) que sobresale mucho más allá del cuerpo central de $\pi$.
   * Si el Jugador toca el borde exterior de este cono de radio $2.0$ sin llegar a tocar el cuerpo central de radio $0.75$ (como pasa en `00:27`), **se dispara el `¡Corte de Sector!` ($-15\text{ HP}$), pero NO se activa el daño de penetración de $-8\text{ HP}$**.
3. **Hitbox 3 — Nodo del Dígito Activo $(d_k)$:**
   * Es un sensor (*trigger*) circular pequeño ubicado en el primer eslabón de la cola de decimales. No genera rebote físico; solo evalúa contacto para aplicar o reflejar $-d_k\text{ HP}$ y desencolar el dígito.

---

## 4. Matriz Completa de Interacciones

| Estado Actual del Jugador | Colisión con Cuerpo Central de $\pi$ ($R_\pi \approx 0.75$) | Entrada al Sector Circular de $\pi$ ($r = 2.0$) | Contacto con Dígito Activo $(d_k)$ de la Cola |
| :--- | :--- | :--- | :--- |
| **$[i]$ Penetración** | Atraviesa sin rebotar.<br>$\pi$ recibe **$-8\text{ HP}$**. | Jugador recibe **$-15\text{ HP}$**.<br>Sector $\theta$ evoluciona al siguiente nivel. | Jugador recibe **$-d_k\text{ HP}$**.<br>Se consume $d_k$ y avanza la cola. |
| **$[-1]$ Reflexión** | Rebote elástico sólido.<br>$0$ daño por choque de cuerpos. | **Reflejado ($\times (-1)\ 15$):**<br>Jugador recibe $0$. **$\pi$ recibe $-15\text{ HP}$**.<br>Sector $\theta$ evoluciona igualmente. | **Reflejado ($\times (-1)\ d_k$):**<br>Jugador recibe $0$. **$\pi$ recibe $-d_k\text{ HP}$**.<br>Se consume $d_k$ y avanza la cola. |
| **$[-i]$ Penetración + Reflexión** | Atraviesa sin rebotar.<br>$\pi$ recibe **$-8\text{ HP}$**. | **Reflejado ($\times (-1)\ 15$):**<br>Jugador recibe $0$. **$\pi$ recibe $-15\text{ HP}$**.<br>Sector $\theta$ evoluciona igualmente. | **Reflejado ($\times (-1)\ d_k$):**<br>Jugador recibe $0$. **$\pi$ recibe $-d_k\text{ HP}$**.<br>Se consume $d_k$ y avanza la cola. |
| **$[1]$ Normal** | Rebote elástico sólido.<br>$0$ daño por choque de cuerpos. | Jugador recibe **$-15\text{ HP}$**.<br>Sector $\theta$ evoluciona al siguiente nivel. | Jugador recibe **$-d_k\text{ HP}$**.<br>Se consume $d_k$ y avanza la cola. |

---

## 5. Cronología Literal y Contabilidad Matemática del Video

* `00:00 - 00:02`: Cuenta regresiva (`3, 2, 1`). Jugador ($i$) con $50 / 50\text{ HP}$; Enemigo ($\pi$) con $75 / 75\text{ HP}$, sector inicial $\theta = \frac{\pi}{6}$ y cola decimal en `(3) . 1 4 1 ...`
* `00:03 - 00:05`: Jugador inicia en `[i Penetración]`. Ambas bolas se mueven y rebotan contra las paredes sin tocarse. Vida: $50$ vs $75$.
* `00:06 - 00:07`: Jugador cambia a `[-1 Reflexión]` ($i \times i = -1$).
* `00:08` **[1.ª Interacción — Reflexión del Dígito `(3)`]:**
  * Se cruzan en el centro de la arena. El nodo del dígito activo `(3)` de $\pi$ toca a `(-1)`.
  * El daño se refleja ($\times (-1)\ 3$): $\pi$ pierde **$-3\text{ HP}$** (baja de $75 \rightarrow 72 / 75\text{ HP}$).
  * El dígito `(3)` se consume y la cola de $\pi$ avanza a `(1) 4 1 5 ...`
* `00:09`: Jugador cambia a `[-i Penetración + Reflexión]` ($-1 \times i = -i$).
* `00:10` **[2.ª Interacción — Penetración + Reflexión del Sector $\theta = \frac{\pi}{6}$]:**
  * En el cuadrante superior izquierdo, `(-i)` atraviesa directamente el cuerpo de $\pi$ y su sector $\theta = \frac{\pi}{6}$:
    1. Por atravesar el cuerpo central de $\pi$, `(-i)` inflige **$-8\text{ HP}$** a $\pi$.
    2. El sector $\theta = \frac{\pi}{6}$ dispara `¡Corte de Sector!` ($S = \frac{1}{2}r^2\theta = \frac{\pi}{3}$). El daño de $15$ es reflejado ($\times (-1)\ 15$), infligiendo **$-15\text{ HP}$** adicionales a $\pi$.
  * Daño total a $\pi$: $-8 + (-15) = -23\text{ HP}$ ($\pi$ cae de $72 \rightarrow 49 / 75\text{ HP}$). Jugador sigue intacto en $50 / 50\text{ HP}$.
  * El sector de $\pi$ evoluciona de $\frac{\pi}{6} \rightarrow \frac{\pi}{3}$.
* `00:12 - 00:14`: Jugador cambia a `[1 Normal]` ($-i \times i = 1$). Rebotan por el mapa sin tocarse. Vida: $50$ vs $49$.
* `00:15`: Jugador completa el ciclo y vuelve a `[i Penetración]` ($1 \times i = i$). Pierde la propiedad de reflexión.
* `00:16 - 00:17` **[3.ª Interacción — Intercambio en Estado `[i]`]:**
  * En el cuadrante inferior derecho, `i` entra en el sector $\theta = \frac{\pi}{3}$ y atraviesa el cuerpo de $\pi$:
    1. Como `i` NO tiene reflexión, recibe el impacto completo del `¡Corte de Sector!`: **$-15\text{ HP}$** (Jugador baja de $50 \rightarrow 35 / 50\text{ HP}$). El sector de $\pi$ evoluciona de $\frac{\pi}{3} \rightarrow \frac{\pi}{2}$.
    2. Al atravesar el cuerpo central de $\pi$, `i` le inflige **$-8\text{ HP}$** ($\pi$ baja de $49 \rightarrow 41 / 75\text{ HP}$).
* `00:18 - 00:19`: Jugador cambia a `[-1 Reflexión]` ($i \times i = -1$).
* `00:20` **[4.ª Interacción — Doble Reflexión (Sector $\theta = \frac{\pi}{2}$ + Dígito `(1)`)]:**
  * En la zona media izquierda, `(-1)` choca sólidamente contra $\pi$, entrando en el sector $\theta = \frac{\pi}{2}$ y tocando el dígito activo `(1)`:
    1. Como `(-1)` es sólido, rebotan sin causar los $-8\text{ HP}$ de penetración.
    2. El `¡Corte de Sector!` ($\theta = \frac{\pi}{2}$, $S = \frac{1}{2}r^2\theta = \pi$) se refleja ($\times (-1)\ 15$): **$-15\text{ HP}$** a $\pi$. El sector evoluciona de $\frac{\pi}{2} \rightarrow \pi$.
    3. El dígito activo `(1)` se refleja ($\times (-1)\ 1$): **$-1\text{ HP}$** a $\pi$. La cola avanza de `(1)` a `(4) 1 5 9 ...`
  * Daño total a $\pi$: $-15 + (-1) = -16\text{ HP}$ ($\pi$ cae de $41 \rightarrow 25 / 75\text{ HP}$). Jugador sigue en $35 / 50\text{ HP}$.
* `00:21`: Jugador cambia a `[-i Penetración + Reflexión]` ($-1 \times i = -i$).
* `00:22` **[5.ª Interacción — Penetración + Reflexión del Sector $\theta = \pi$]:**
  * En la zona media derecha, `(-i)` atraviesa el semicírculo $\theta = \pi$ y el cuerpo central de $\pi$:
    1. Por penetración del cuerpo central, inflige **$-8\text{ HP}$** a $\pi$.
    2. El `¡Corte de Sector!` ($\theta = \pi$, $S = \frac{1}{2}r^2\theta = 2\pi$) se refleja ($\times (-1)\ 15$): **$-15\text{ HP}$** a $\pi$.
  * Daño total a $\pi$: $-8 + (-15) = -23\text{ HP}$ ($\pi$ cae críticamente de $25 \rightarrow 2 / 75\text{ HP}$).
  * El sector de $\pi$ evoluciona a su fase máxima de círculo completo: $\theta = 2\pi$.
* `00:24 - 00:25` **[6.ª Interacción — Cambio a `[1 Normal]` dentro del Sector $\theta = 2\pi$ + Dígito `(4)`]:**
  * En `00:24`, arriba a la izquierda, el Jugador cambia a `[1 Normal]` ($-i \times i = 1$), quedando vulnerable.
  * Inmediatamente entra en el sector de círculo completo ($\theta = 2\pi$):
    1. Se activa `¡Corte de Sector!` mostrando $S = \frac{1}{2}r^2\theta = 4\pi$ e infligiendo **$-15\text{ HP}$** al Jugador (baja de $35 \rightarrow 20 / 50\text{ HP}$).
    2. Tras ejecutarse en $\theta = 2\pi$, el sector de $\pi$ se reinicia a $\theta = \frac{\pi}{6}$.
  * Una fracción de segundo después (`00:24–00:25`), en el rebote contra la esquina superior izquierda, el dígito activo `(4)` toca a `(1)`:
    1. El Jugador recibe **$-4\text{ HP}$** (baja de $20 \rightarrow 16 / 50\text{ HP}$).
    2. La cola de $\pi$ avanza de `(4)` a `(1) 5 9 2 ...`
* `00:27` **[7.ª Interacción — Cambio a `[i Penetración]` y Roce del Sector Exterior $\theta = \frac{\pi}{6}$]:**
  * Abajo a la derecha, el Jugador cambia a `[i Penetración]` ($1 \times i = i$).
  * El Jugador toca el extremo del cono del sector $\theta = \frac{\pi}{6}$ (radio $r = 2.0$) sin llegar a tocar el círculo central de $\pi$:
    1. Se activa `¡Corte de Sector!` ($S = \frac{1}{2}r^2\theta = \frac{\pi}{3}$), restando **$-15\text{ HP}$** al Jugador (cae de $16 \rightarrow 1 / 50\text{ HP}$).
    2. El sector de $\pi$ evoluciona de $\frac{\pi}{6} \rightarrow \frac{\pi}{3}$.
    3. Como los cuerpos principales no se superpusieron, $\pi$ no recibe daño de penetración y permanece en $2 / 75\text{ HP}$.
* `00:30 - 00:31` **[8.ª Interacción — Cambio a `[-1 Reflexión]` y Doble Reflexión de Cola (`1` y `5`) para Ganar]:**
  * En `00:30`, arriba a la derecha, el Jugador cambia a `[-1 Reflexión]` ($i \times i = -1$).
  * En ese mismo segundo (`00:30`), `(-1)` toca el dígito activo `(1)` de la cola de $\pi$:
    1. Se refleja el daño ($\times (-1)\ 1$), restando **$-1\text{ HP}$** a $\pi$ ($\pi$ cae de $2 \rightarrow 1 / 75\text{ HP}$).
    2. La cola de $\pi$ avanza de `(1)` a `(5) 9 2 6 ...`
  * En `00:31`, al rebotar juntos en la parte superior central, `(-1)` toca el nuevo dígito activo `(5)`:
    1. Se refleja el daño ($\times (-1)\ 5$), restando **$-5\text{ HP}$** a $\pi$.
    2. $\pi$ cae de $1 \rightarrow 0 / 75\text{ HP}$ (`[DEAD]`) y gana $i$ con exactamente $1 / 50\text{ HP}$ restante.

---

## 6. Batería de Pruebas (QA Tests) para Validar la Implementación

Ejecuta estos casos de prueba para verificar que la lógica del nivel cumple cada regla sin ambigüedades:

* **Test 1: Evolución del Sector Circular tras Impacto Reflejado**
  * *Acción:* Fijar al Jugador en estado `[-1 Reflexión]` y hacer que entre en el sector $\theta = \frac{\pi}{6}$ de $\pi$.
  * *Resultado esperado:* El Jugador debe mantener $50 / 50\text{ HP}$, $\pi$ debe perder $-15\text{ HP}$ ($75 \rightarrow 60\text{ HP}$), debe mostrarse el texto $\times (-1)\ 15$ y el ángulo del sector de $\pi$ **debe actualizarse obligatoriamente a $\theta = \frac{\pi}{3}$**.

* **Test 2: Consumo de Dígitos Decimales tras Impacto Reflejado**
  * *Acción:* Fijar al Jugador en estado `[-1 Reflexión]` y hacer que toque únicamente el nodo del dígito activo de la cola de $\pi$ dos ($2$) veces seguidas.
  * *Resultado esperado:* En el primer toque, $\pi$ debe recibir $-3\text{ HP}$ y el dígito `(3)` debe desaparecer pasando a `(1)`. En el segundo toque, $\pi$ debe recibir $-1\text{ HP}$ y el dígito `(1)` debe pasar a `(4)`. El Jugador no debe perder vida.

* **Test 3: Daño Compuesto en Estado `[-i Penetración + Reflexión]`**
  * *Acción:* Fijar al Jugador en estado `[-i]` y lanzarlo en línea recta a través del centro de $\pi$ cruzando su sector circular (sin tocar la cola decimal).
  * *Resultado esperado:* $\pi$ debe perder exactamente **$-23\text{ HP}$** en ese cruce ($-8\text{ HP}$ por superposición del cuerpo intangible + $-15\text{ HP}$ por reflexión del sector circular), y el Jugador debe atravesar a $\pi$ sin cambiar su vector de dirección.

* **Test 4: Separación de Radios entre Sector ($r = 2.0$) y Cuerpo de $\pi$ ($R_\pi \approx 0.75$)**
  * *Acción:* Fijar al Jugador en estado `[i Penetración]` y hacer que pase a una distancia de $1.5$ unidades del centro de $\pi$ (dentro del cono del sector de radio $2.0$, pero fuera del cuerpo circular de $\pi$).
  * *Resultado esperado:* El Jugador debe recibir **$-15\text{ HP}$** del `¡Corte de Sector!`, pero $\pi$ debe recibir **$0\text{ HP}$** de daño porque el cuerpo de $i$ no tocó el cuerpo principal de $\pi$.

* **Test 5: Cálculo de Área en Fase $5$ ($\theta = 2\pi$)**
  * *Acción:* Llevar el sector de $\pi$ hasta la fase $\theta = 2\pi$ y activarlo contra el Jugador.
  * *Resultado esperado:* El texto de la fórmula mostrada en pantalla debe ser literalmente $S = \frac{1}{2}r^2\theta = 4\pi$ y, tras el impacto, el sector debe reiniciarse a $\theta = \frac{\pi}{6}$.