# Prompt de Sistema: Implementación Literal de Nivel ($\sin x$ vs. $\cos x$)

**Instrucción Crítica para el Agente IA:**
Implementa este nivel siguiendo cada regla de forma 100% literal. No asumas comportamientos implícitos ni agregues mecánicas no descritas. Ignora colores, fuentes tipográficas o efectos estéticos; concéntrate exclusivamente en las leyes físicas, geometría de hitboxes, temporizadores matemáticos y máquinas de estado.

---

## 1. Fundamento Matemático General del Nivel

Ambas entidades representan funciones de onda armónica simple de la forma general:

$$y_{\text{jugador}} = a \sin(bx) \quad \text{y} \quad y_{\text{enemigo}} = a \cos(bx)$$

Donde ambos inician con coeficiente de amplitud $a = 1$ y frecuencia angular $b = 1$.

1. **Amplitud ($a$) como Ancho Transversal del Hitbox del Proyectil:**
   * Matemáticamente, el parámetro $a$ estira verticalmente la onda entre $[-a, +a]$.
   * **Traducción literal a mecánica:** El valor de $a$ determina el **ancho físico (grosor transversal de pico a pico)** de la onda disparada.
   * **Regla crítica de daño:** Aumentar $a$ **NO aumenta el daño del proyectil**. El daño es siempre una constante fija de **$-25\text{ HP}$** por impacto, sin importar si $a = 1$ o $a = 16$. El único propósito mecánico de subir $a$ es hacer que el proyectil sea tan ancho que resulte casi imposible de esquivar.

2. **Frecuencia Angular ($b$) como Reductor de Cooldown (Período $T = \frac{2\pi}{b}$):**
   * Matemáticamente, el período de una función trigonométrica es $T = \frac{2\pi}{b}$.
   * **Traducción literal a mecánica:** El tiempo de recarga (cooldown) en segundos entre cada disparo es exactamente el valor numérico de $T$:
     $$T = \frac{2\pi}{b}\text{ segundos}$$
   * Cada vez que una entidad recoge el multiplicador $b \times 2$, su frecuencia $b$ se duplica y su tiempo de recarga se divide exactamente a la mitad de forma inmediata. Adicionalmente, la onda disparada comprime su longitud de onda (mayor densidad de oscilaciones por unidad de distancia).

---

## 2. Configuración Inicial Estricta

* **Arena:** Plano cartesiano cuadrado delimitado por 4 paredes sólidas.
* **Física de Movimiento:** Movimiento rectilíneo a velocidad escalar constante. Rebote elástico perfecto ($e = 1$) contra las 4 paredes y entre ambas bolas. Sin gravedad ni fricción.
* **Entidad Izquierda (Jugador): Función Seno ($\sin x$)**
  * **HP Inicial / Máximo:** $100 / 100$.
  * **Posición Inicial:** $(-3.5, 0)$.
  * **Ecuación Inicial:** $y = \sin x$ ($a = 1, b = 1$).
  * **Período / Cooldown Inicial:** $2\pi = 6.28\text{s}$.
* **Entidad Derecha (Enemigo / CPU): Función Coseno ($\cos x$)**
  * **HP Inicial / Máximo:** $100 / 100$.
  * **Posición Inicial:** $(+3.5, 0)$.
  * **Ecuación Inicial:** $y = \cos x$ ($a = 1, b = 1$).
  * **Período / Cooldown Inicial:** $2\pi = 6.28\text{s}$.
* **Condición Inicial del Temporizador de Disparo (Pre-carga del 50%):**
  * Durante la cuenta regresiva (`3, 2, 1`), la barra de enfriamiento de ambas entidades NO empieza en $0\%$, sino **pre-cargada exactamente al $50\%$** ($\pi \approx 3.14\text{s}$ acumulados). Por lo tanto, el primer disparo de ambos ocurre a los $\sim 2\text{ a }3\text{ segundos}$ de haber iniciado el movimiento.

---

## 3. Reglas de Física, Disparo, Colisiones y Power-Ups

### A. Colisión Cuerpo a Cuerpo ($\sin x$ toca a $\cos x$)
1. Cuando el círculo de $\sin x$ y el círculo de $\cos x$ chocan físicamente:
   * Rebotan elásticamente intercambiando vectores de velocidad según la física de colisión de esferas rígidas.
   * **Daño por contacto físico:** $0\text{ HP}$ para ambos.
   * **Alteración de fórmulas:** Ninguna. Chocar entre sí no altera ni a $\sin x$ ni a $\cos x$.

### B. Sistema de Apuntado y Disparo de Ondas (`¡Onda Seno!` / `¡Onda Coseno!`)
1. **Indicador Direccional (Cañón de Perímetro):**
   * Cada bola tiene un pequeño círculo adherido a su borde exterior que apunta siempre en la **dirección exacta de su vector de velocidad actual** (hacia adelante según hacia dónde se esté moviendo la bola en ese frame).
2. **Disparo al completarse la Barra de Período ($T$):**
   * En el frame exacto en que el temporizador alcanza el valor $T = \frac{2\pi}{b}$, la barra se vacía a $0$ e inicia un nuevo ciclo inmediatamente.
   * Se traza una línea guía punteada recta en la dirección del vector de velocidad actual de la bola que dispara (no apunta automáticamente al enemigo; dispara recto hacia adelante hacia donde la bola esté viajando).
   * Un nodo guía viaja a lo largo de esa línea recta a velocidad constante, dejando tras de sí la estela sólida de la curva $a\sin(bx)$ o $a\cos(bx)$ centrada sobre ese eje de disparo.
3. **Geometría del Hitbox y Regla de Impacto:**
   * El proyectil tiene un ancho transversal proporcional a $a$ y avanza hasta cruzar por completo los límites de la arena.
   * **Inmunidad propia:** Una entidad no recibe daño de su propia onda.
   * **Impacto contra el oponente:** Si cualquier punto de la onda o de su cabeza guía toca el círculo del oponente:
     * Resta instantáneamente **$-25\text{ HP}$** al oponente.
     * Una misma onda solo puede dañar al oponente **una vez por disparo** (aplica inmunidad a ese proyectil específico tras el primer toque para no drenar múltiples veces $-25\text{ HP}$ con la misma estela).
   * **Interacción Onda vs. Onda:** Las ondas de $\sin x$ y $\cos x$ NO chocan ni se anulan entre sí; se atraviesan mutuamente sin afectarse.

### C. Sistema de Power-Ups en la Arena (Nodos Amarillos Estáticos)
Periódicamente aparecen círculos amarillos estáticos en coordenadas del mapa con dos etiquetas posibles: **`a \times 2`** o **`b \times 2`**.

1. **Recolección Simétrica (Ambos pueden recogerlos):**
   * A diferencia de otros niveles, aquí **tanto el Jugador ($\sin x$) como el Enemigo ($\cos x$) pueden recoger cualquier nodo amarillo**.
2. **Física de Contacto con el Nodo Amarillo:**
   * Los nodos amarillos son sensores (*triggers*), no obstáculos sólidos. Cuando una bola toca un nodo amarillo, **NO rebota**; sigue su trayectoria recta normal y el nodo amarillo se consume y desaparece.
   * Los proyectiles de onda atraviesan los nodos amarillos sin activarlos ni destruirlos; solo el cuerpo circular de $\sin x$ o $\cos x$ puede recogerlos.
3. **Efecto Literal de `a \times 2` (Mejora de Amplitud):**
   * Multiplica el coeficiente $a$ actual de la entidad recolectora por $2$:
     $$a_{\text{nuevo}} = a_{\text{actual}} \times 2$$
   * Duplica el ancho transversal del hitbox de todos los próximos disparos de esa entidad.
   * No modifica el tiempo de recarga $T$.
4. **Efecto Literal de `b \times 2` (Mejora de Período / Frecuencia):**
   * Multiplica el coeficiente $b$ actual de la entidad recolectora por $2$:
     $$b_{\text{nuevo}} = b_{\text{actual}} \times 2$$
   * **Actualización inmediata del Cooldown:** En el mismo instante en que recoge el nodo, el período máximo $T$ de su barra de enfriamiento se divide entre $2$:
     $$T_{\text{nuevo}} = \frac{T_{\text{actual}}}{2}$$

---

## 4. Tabla de Escalado Matemático Exacto

| Nivel de Mejora | Valor de $a$ (Multiplicador de Ancho de Hitbox) | Daño por Impacto | Valor de $b$ (Multiplicador de Frecuencia) | Período Exacto $T = \frac{2\pi}{b}$ (Cooldown en UI) |
| :--- | :--- | :--- | :--- | :--- |
| **Inicial (Base)** | $a = 1$ (Ancho base $1\times$) | $-25\text{ HP}$ | $b = 1$ | $2\pi = 6.28\text{s}$ |
| **1 Power-Up** | $a = 2$ (Ancho $2\times$) | $-25\text{ HP}$ | $b = 2$ | $\pi = 3.14\text{s}$ |
| **2 Power-Ups** | $a = 4$ (Ancho $4\times$) | $-25\text{ HP}$ | $b = 4$ | $\frac{\pi}{2} = 1.57\text{s}$ |
| **3 Power-Ups** | $a = 8$ (Ancho $8\times$) | $-25\text{ HP}$ | $b = 8$ | $\frac{\pi}{4} = 0.79\text{s}$ |
| **4 Power-Ups** | $a = 16$ (Ancho masivo $16\times$) | $-25\text{ HP}$ | $b = 16$ | $\frac{\pi}{8} = 0.39\text{s}$ |

---

## 5. Cronología Literal de Eventos en el Video

* `00:00 - 00:02`: Cuenta regresiva (`3, 2, 1`). Ambos en $100 / 100\text{ HP}$ con barra pre-cargada al $50\%$ (`2\pi = 6.28s`).
* `00:03`: Inicia el movimiento. $\sin x$ y $\cos x$ rebotan contra las paredes superiores e inferiores.
* `00:04`: Aparece el primer nodo `b \times 2` en el cuadrante inferior derecho $(+2.5, -2.5)$.
* `00:05` **[Choque físico + Primer Disparo Simultáneo]:**
  * Ambas bolas chocan elásticamente en la zona superior central ($0$ daño por choque) justo cuando sus barras llegan al $100\%$.
  * $\sin x$ dispara su onda hacia arriba a la derecha, impactando a $\cos x$ a quemarropa: $\cos x$ recibe **$-25\text{ HP}$** (baja a $75 / 100\text{ HP}$).
  * $\cos x$ dispara su onda hacia la esquina superior derecha y falla.
* `00:06`: Aparece un nodo `a \times 2` a la izquierda $(-4.5, -1.5)$.
* `00:07`:
  * $\sin x$ recoge el nodo `a \times 2` izquierdo y evoluciona a **$y = 2\sin x$**.
  * Aparece un segundo nodo `b \times 2` cerca del centro $(0, +0.5)$.
* `00:08` **[Doble Mejora de Período]:**
  * $\cos x$ recoge el nodo central `b \times 2` $\rightarrow$ evoluciona a **$y = \cos 2x$** y su cooldown baja a $\pi = 3.14\text{s}$.
  * Una fracción de segundo después, $2\sin x$ recoge el nodo inferior derecho `b \times 2` $\rightarrow$ evoluciona a **$y = 2\sin 2x$** y su cooldown también baja a $\pi = 3.14\text{s}$.
* `00:09 - 00:10`:
  * Aparece `a \times 2` abajo a la izquierda $(-4.5, -3.5)$ y `b \times 2` arriba al centro-izquierda $(-1, +2)$.
  * $\cos 2x$ dispara en `00:09` y falla. $2\sin 2x$ dispara en `00:10` hacia la esquina inferior derecha y falla. Ambas bolas rebotan entre sí abajo al centro ($0$ daño).
* `00:11 - 00:12`:
  * $\cos 2x$ sube y recoge `b \times 2` en $(-1, +2)$ $\rightarrow$ evoluciona a **$y = \cos 4x$**, bajando su cooldown a $\frac{\pi}{2} = 1.57\text{s}$. Dispara hacia el borde superior y falla.
  * Aparece un nodo `a \times 2` arriba a la izquierda $(-4.5, +1.5)$.
* `00:13 - 00:14`:
  * Aparece un nodo `b \times 2` en el centro $(-0.5, +0.5)$.
  * $2\sin 2x$ dispara hacia la pared derecha y falla.
  * $\cos 4x$ recoge el nodo superior izquierdo `a \times 2` $\rightarrow$ evoluciona a **$y = 2\cos 4x$**. En `00:14` dispara hacia la pared izquierda y falla.
* `00:15 - 00:16` **[Primer Impacto de $\cos x$]:**
  * Aparece `a \times 2` a la derecha $(+5, +1)$ y `b \times 2` a la izquierda $(-4, -1.5)$.
  * $2\cos 4x$ baja hacia el centro-abajo y dispara su onda justo hacia donde sube $2\sin 2x$. La onda impacta a $2\sin 2x$ en `00:16`, restándole **$-25\text{ HP}$** ($2\sin 2x$ baja a $75 / 100\text{ HP}$).
  * $2\sin 2x$ dispara hacia arriba a la derecha y falla.
* `00:17 - 00:18`:
  * $2\cos 4x$ dispara contra la pared derecha en `00:17` (falla) y recoge el nodo `a \times 2` derecho $(+5, +1)$ $\rightarrow$ evoluciona a **$y = 4\cos 4x$**.
  * Aparece otro `a \times 2` cerca del centro $(-2, +0.5)$.
* `00:19 - 00:20` **[Segundo Impacto de $\cos x$ + Mejora de $\sin x$]:**
  * Aparece `b \times 2` abajo a la derecha $(+3, -2.5)$.
  * $2\sin 2x$ dispara hacia abajo a la izquierda y falla.
  * $4\cos 4x$ dispara desde abajo hacia arriba-izquierda una onda de amplitud $4$, golpeando a $2\sin 2x$ por **$-25\text{ HP}$** ($2\sin 2x$ baja a $50 / 100\text{ HP}$).
  * En ese mismo instante (`00:20`), $2\sin 2x$ toca el nodo central `b \times 2` $\rightarrow$ evoluciona a **$y = 2\sin 4x$** y reduce su cooldown a $\frac{\pi}{2} = 1.57\text{s}$.
* `00:21`:
  * $2\sin 4x$ toca inmediatamente el nodo `a \times 2` contiguo $(-2, +0.5)$ $\rightarrow$ evoluciona a **$y = 4\sin 4x$** y dispara hacia la esquina superior izquierda (falla).
  * Simultáneamente, $4\cos 4x$ toca el nodo `a \times 2` en la esquina inferior izquierda $(-4.5, -3.5)$ $\rightarrow$ evoluciona a **$y = 8\cos 4x$**.
  * Aparece un nodo `a \times 2` abajo a la derecha $(+5, -2.5)$.
* `00:22 - 00:24` **[Intercambio de Golpes y Escalado a $8\cos 8x$]:**
  * En `00:22`, $8\cos 4x$ dispara una onda gigante ($a=8$) hacia arriba que impacta a $4\sin 4x$ en `00:23` por **$-25\text{ HP}$** ($4\sin 4x$ cae a $25 / 100\text{ HP}$).
  * En `00:23`, $8\cos 4x$ recoge el nodo izquierdo `b \times 2` $(-4, -1.5)$ $\rightarrow$ evoluciona en `00:24` a **$y = 8\cos 8x$**, bajando su cooldown a $\frac{\pi}{4} = 0.79\text{s}$.
* `00:23 - 00:25` **[Doble Impacto Consecutivo de $\sin x$]:**
  * $4\sin 4x$ dispara hacia abajo en `00:23` y acierta a $8\cos 8x$: **$-25\text{ HP}$** ($8\cos 8x$ baja de $75$ a $50 / 100\text{ HP}$).
  * En `00:24`, $4\sin 4x$ vuelve a disparar hacia abajo y su onda golpea nuevamente a $8\cos 8x$ en `00:25`: **$-25\text{ HP}$** ($8\cos 8x$ baja de $50$ a $25 / 100\text{ HP}$). Ambos quedan empatados a $25 / 100\text{ HP}$.
* `00:26 - 00:28`:
  * $8\cos 8x$ dispara ráfagas cada $0.79\text{s}$ hacia la parte superior y derecha, pero no apunta hacia donde está $4\sin 4x$.
  * En `00:28`, $8\cos 8x$ recoge el nodo inferior derecho `b \times 2` $(+3, -2.5)$ $\rightarrow$ evoluciona a **$y = 8\cos 16x$**, reduciendo su cooldown a $\frac{\pi}{8} = 0.39\text{s}$.
* `00:29 - 00:30` **[Evolución a $16\cos 16x$ y Golpe Final]:**
  * En `00:29`, $8\cos 16x$ recoge el nodo `a \times 2` de la esquina inferior derecha $(+5, -2.5)$ $\rightarrow$ evoluciona a **$y = 16\cos 16x$**.
  * $16\cos 16x$ rebota en la esquina inferior derecha apuntando en diagonal hacia arriba-izquierda y, con su cooldown de $0.39\text{s}$, dispara una onda masiva de ancho $a=16$ que barre el cuadrante inferior izquierdo e impacta a $4\sin 4x$ en `00:30` por **$-25\text{ HP}$**.
  * $4\sin 4x$ cae a $0 / 100\text{ HP}$ (`[DEAD]`) y gana $\cos x$ con $25\text{ HP}$ restantes.

---

## 6. Batería de Pruebas (QA Tests) para Validar la Implementación

Ejecuta estos casos de prueba para verificar que el sistema cumple exactamente con las reglas sin ambigüedades:

* **Test 1: Invarianza del Daño respecto a la Amplitud ($a$)**
  * *Acción:* Configurar a $\sin x$ con $a = 1$ y disparar contra $\cos x$. Luego configurar a $\sin x$ con $a = 16$ y disparar nuevamente contra $\cos x$.
  * *Resultado esperado:* En ambos casos, el impacto debe restar exactamente **$-25\text{ HP}$**. La única diferencia debe ser que el ancho transversal del hitbox del proyectil con $a = 16$ es $16$ veces mayor que con $a = 1$.

* **Test 2: División Exacta del Cooldown al recoger `b \times 2`**
  * *Acción:* Hacer que una entidad pase por encima de $4$ nodos `b \times 2` consecutivos e inspeccionar su temporizador de disparo después de cada recolección.
  * *Resultado esperado:* El período máximo de recarga debe actualizarse instantáneamente siguiendo la serie estricta: $6.28\text{s} \rightarrow 3.14\text{s} \rightarrow 1.57\text{s} \rightarrow 0.79\text{s} \rightarrow 0.39\text{s}$.

* **Test 3: Disparo Estricto en Dirección del Vector Velocidad (Sin Auto-Aim)**
  * *Acción:* Colocar a $\sin x$ en $(0, 0)$ moviéndose horizontalmente hacia la derecha $(+1, 0)$, mientras $\cos x$ está arriba en $(0, +4)$, y forzar el disparo de $\sin x$.
  * *Resultado esperado:* La onda de $\sin x$ debe viajar horizontalmente hacia la derecha $(+1, 0)$ siguiendo su vector de movimiento actual, ignorando por completo la posición de $\cos x$.

* **Test 4: Ausencia de Rebote y Recolección Bilateral en Nodos Amarillos**
  * *Acción:* Lanzar a $\sin x$ con un ángulo de $45^\circ$ directamente contra un nodo `a \times 2` y a $\cos x$ con un ángulo de $45^\circ$ contra un nodo `b \times 2`.
  * *Resultado esperado:* Ninguna de las dos bolas debe cambiar su dirección ni velocidad al tocar el nodo; ambas deben atravesarlo limpiamente, consumir el nodo y aplicar la multiplicación correspondiente a su propia ecuación.

* **Test 5: Daño Único por Onda de Alta Frecuencia ($b = 16$)**
  * *Acción:* Hacer que una onda de $16\cos 16x$ (que contiene decenas de crestas comprimidas) atraviese de principio a fin el cuerpo de $\sin x$.
  * *Resultado esperado:* Aunque múltiples crestas de esa misma onda toquen a $\sin x$ durante los frames que tarda el proyectil en cruzarlo, $\sin x$ debe recibir únicamente **un (1) impacto de $-25\text{ HP}$** por ese disparo.