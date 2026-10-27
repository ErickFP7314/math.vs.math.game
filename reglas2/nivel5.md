# Prompt de Sistema: Implementación Literal de Nivel ($\frac{d}{dx}$ vs. $\sin x$)

**Instrucción Crítica para el Agente IA:**
Implementa este nivel siguiendo cada regla al pie de la letra. No asumas comportamientos implícitos. Todas las mecánicas responden a propiedades de cálculo diferencial y funciones trigonométricas.

## 1. Fundamento Matemático General del Nivel

1. **Inmortalidad Cíclica de $\sin x$ ante la Derivada:**
   * A diferencia de los polinomios (que al derivarse repetidamente llegan a $0$), las funciones trigonométricas entran en un ciclo infinito de $4$ estados al derivarse respecto a $x$:
     $$\sin x \xrightarrow{d/dx} \cos x \xrightarrow{d/dx} -\sin x \xrightarrow{d/dx} -\cos x \xrightarrow{d/dx} \sin x$$
   * **Traducción a Mecánica:** El Jugador ($\frac{d}{dx}$) **NUNCA** hace daño al tocar al Enemigo ($\sin x$). Cada choque físico solo transforma al Enemigo en su siguiente derivada y suma $+1$ al contador de intentos fallidos del Jugador.

2. **Período de una Onda ($T = \frac{2\pi}{b}$) como Cooldown:**
   * El tiempo de recarga del ataque del Enemigo es literalmente el período matemático de su función trigonométrica: $2\pi \approx 6.28\text{ segundos}$.
   * Si recoge el ítem $b=2$, su frecuencia angular se duplica ($\cos 2x$) y su período (cooldown) se reduce a la mitad al completar el ciclo actual: $T = \frac{2\pi}{2} = \pi \approx 3.14\text{ segundos}$.

3. **Regla de la Cadena ($\frac{d}{dx}[f(bx)] = b \cdot f'(bx)$):**
   * Una vez que el Enemigo tiene el multiplicador interno $b=2$, cada vez que el Jugador ($\frac{d}{dx}$) choca con él, la derivada saca un factor $\times 2$ afuera de la función (amplitud):
     $$\cos 2x \xrightarrow{d/dx} -2\sin 2x \xrightarrow{d/dx} -4\cos 2x$$

## 2. Configuración Inicial Estricta

* **Entidad Izquierda (Jugador): Operador Derivada ($\frac{d}{dx}$)**
  * **HP Inicial / Máximo:** $100 / 100$.
  * **Posición Inicial:** $(-3.5, 0)$.
  * **Habilidad:** Únicamente contacto físico (cuerpo a cuerpo). No dispara proyectiles.
  * **UI Inferior Izquierda:** Muestra `[READY]` en cuenta regresiva y luego cuenta las colisiones: `[Intento de derivación N veces]`.

* **Entidad Derecha (Enemigo / CPU): Función Trigonométrica ($\sin x$)**
  * **HP Inicial / Máximo:** $100 / 100$.
  * **Posición Inicial:** $(+3.5, 0)$.
  * **UI Inferior Derecha:** Muestra la ecuación actual (inicia en `[ y = sin x ]`) y una barra de progreso azul con el texto del período actual: `2\pi = 6.28s`.

## 3. Reglas de Interacción, Ataques y Power-Ups

### A. Colisión Cuerpo a Cuerpo ($\frac{d}{dx}$ toca a la bola Enemiga)
Cada vez que las dos bolas chocan físicamente:
1. Rebotan elásticamente de forma normal.
2. **Daño a ambas bolas:** $0\text{ HP}$.
3. El contador del Jugador sube en $+1$ (Si las bolas quedan atrapadas contra una esquina o pared, pueden ocurrir $2$ colisiones en menos de medio segundo).
4. La función del Enemigo se actualiza a su derivada exacta respecto a $x$ y se muestra la ecuación en el centro de la arena por $1\text{ segundo}$.

### B. Ataque del Enemigo: "Onda Seno / Onda Coseno"
* **Temporizador (Barra Azul):** Se llena de forma continua desde $0$ hasta el valor del período actual ($6.28\text{s}$ al inicio, o $3.14\text{s}$ tras actualizarse con $b=2$). **No se reinicia cuando el Jugador lo choca.**
* **Ejecución del Disparo (al llenarse la barra al 100%):**
  1. El Enemigo lanza un proyectil con forma de onda senoidal que viaja en línea recta hacia la posición donde está el Jugador ($\frac{d}{dx}$).
  2. Si la función actual contiene $\sin$, grita `¡Onda Seno!`; si contiene $\cos$, grita `¡Onda Coseno!`.
  3. **Impacto del Proyectil:**
     * Si el proyectil ondulatorio toca el círculo de $\frac{d}{dx}$, le resta exactamente **$-25\text{ HP}$** al Jugador.
     * Si el proyectil no toca al Jugador, sigue de largo hasta salir por el borde de la pantalla sin rebotar.

### C. Power-Ups en el Mapa (Círculos Amarillos Estáticos)
Aparecen en coordenadas fijas del mapa en momentos específicos de la partida:
* **Restricción de Recolección:** Son **intangible para el Jugador ($\frac{d}{dx}$)**. El Jugador pasa por encima de ellos sin recogerlos ni rebotar. Solo el Enemigo puede activarlos al tocarlos.
* **Power-Up 1: `b = 2` (Mejora de Período / Frecuencia)**
  * **Aparición:** Segundo `00:08` en el cuadrante inferior izquierdo $(-4, -2)$.
  * **Efecto al ser tocado por el Enemigo:** Multiplica el argumento interno $x$ por $2$ (ej. $\cos x \rightarrow \cos 2x$). Al finalizar el ciclo de disparo en curso, el cooldown máximo baja de $2\pi = 6.28\text{s}$ a $\pi = 3.14\text{s}$ y habilita el escalado por Regla de la Cadena en futuros choques.
* **Power-Up 2: `a = 2` (Multiplicador de Amplitud)**
  * **Aparición:** Segundo `00:14` en el cuadrante superior derecho $(+2.5, +1.5)$.
  * **Propósito:** Multiplicar la amplitud de la función por $2$ si el Enemigo lo toca (en este video nunca llega a tocarlo).

## 4. Cronología Literal de Eventos en el Video

* `00:00 - 00:02`: Cuenta regresiva ($3, 2, 1$).
* `00:03` **[Choque 1]:** Chocan en el centro. $\frac{d}{dx}(\sin x) = \cos x$. Vida: $100$ vs $100$. Intentos: `1`.
* `00:05` **[Choque 2 + Disparo 1]:** Chocan arriba a la derecha ($\frac{d}{dx}(\cos x) = -\sin x$, Intentos: `2`) exactamente en el instante en que se cumplen los primeros $6.28\text{s}$ de partida. El Enemigo dispara `¡Onda Coseno!` a quemarropa. El Jugador recibe **$-25\text{ HP}$** ($75 / 100\text{ HP}$).
* `00:08` **[Spawn Power-Up]:** Aparece el círculo amarillo `b = 2` abajo a la izquierda.
* `00:11` **[Choque 3 + Disparo 2]:** Se cumplen otros $6.28\text{s}$. El Enemigo dispara `¡Onda Seno!` mientras chocan abajo a la derecha ($\frac{d}{dx}(-\sin x) = -\cos x$, Intentos: `3`). El proyectil golpea al Jugador (**$-25\text{ HP}$**, baja a $50 / 100\text{ HP}$) y sigue viajando hacia la izquierda.
* `00:14` **[Choque 4 + Spawn Power-Up]:** Chocan a la izquierda ($\frac{d}{dx}(-\cos x) = \sin x$, Intentos: `4`). Aparece el círculo amarillo `a = 2` arriba a la derecha.
* `00:17` **[Disparo 3 - Fallido]:** Se cumplen $6.28\text{s}$. El Enemigo dispara `¡Onda Seno!` hacia la esquina inferior derecha, pero el Jugador se mueve hacia la izquierda y **esquiva** el proyectil ($0$ daño).
* `00:18 - 00:19` **[Choques 5, 6 y 7 en esquina]:** Las bolas se acorralan abajo a la derecha y rebotan $3$ veces seguidas rápidamente:
  * Intento `5`: $\sin x \rightarrow \cos x$.
  * Intento `6` y `7` (doble contacto rápido): $\cos x \rightarrow -\sin x \rightarrow -\cos x$ (y un toque adicional que lo deja en $\cos x$).
* `00:20` **[Recolección de `b = 2`]:** El Enemigo ($\cos x$) toca el círculo amarillo `b = 2`. Muestra `¡Mejora de período! y = cos 2x`. El círculo amarillo desaparece.
* `00:21` **[Choque 8 - Regla de la Cadena]:** Chocan a la izquierda. $\frac{d}{dx}(\cos 2x) = -2\sin 2x$. Intentos: `8`.
* `00:23 - 00:24` **[Choques 9 y 10 + Disparo 4]:** Acaban de cumplirse los últimos $6.28\text{s}$ del ciclo anterior y el temporizador se actualiza a **$\pi = 3.14\text{s}$**. Mientras chocan dos veces en la pared derecha (pasando a $-4\cos 2x$, Intentos: `10`), el Enemigo dispara `¡Onda Seno!` a quemarropa. El Jugador recibe **$-25\text{ HP}$** ($25 / 100\text{ HP}$).
* `00:27` **[Disparo 5 - Fallido]:** Pasan solo $3.14\text{s}$. El Enemigo dispara `¡Onda Coseno!` hacia la esquina inferior izquierda, fallando porque el Jugador está a la derecha.
* `00:30` **[Disparo 6 - Golpe Final]:** Pasan otros $3.14\text{s}$. El Enemigo dispara `¡Onda Coseno!` desde abajo hacia el centro, impactando al Jugador (**$-25\text{ HP}$**). El Jugador cae a $0 / 100\text{ HP}$ (`[DEAD]`) y gana $\sin x$ con $100\text{ HP}$ intactos.

## 5. Batería de Pruebas (QA Tests) para Validar la Implementación

* **Test 1: Inmunidad Total del Enemigo y Ciclo de 4 Derivadas**
  * *Acción:* Hacer chocar a $\frac{d}{dx}$ contra $\sin x$ exactamente $4$ veces seguidas sin recoger power-ups.
  * *Resultado esperado:* La vida del Enemigo debe mantenerse en $100 / 100$ en todo momento. Su texto debe cambiar en orden estricto: $\sin x \rightarrow \cos x \rightarrow -\sin x \rightarrow -\cos x \rightarrow \sin x$, y la UI del Jugador debe marcar `[Intento de derivación 4 veces]`.

* **Test 2: Aplicación de la Regla de la Cadena tras recoger `b = 2`**
  * *Acción:* Hacer que el Enemigo recoja `b = 2` estando en estado $\cos x$ (convirtiéndose en $\cos 2x$) y luego forzar $2$ colisiones con $\frac{d}{dx}$.
  * *Resultado esperado:* En la primera colisión debe transformarse en $-2\sin 2x$, y en la segunda colisión en $-4\cos 2x$.

* **Test 3: Reducción del Cooldown de $2\pi$ a $\pi$**
  * *Acción:* Medir el tiempo entre disparos antes y después de que el Enemigo toque el nodo `b = 2`.
  * *Resultado esperado:* Antes de tocarlo, el disparo ocurre cada $6.28\text{ segundos}$. Tras tocarlo y completar la barra en curso, el nuevo temporizador debe mostrar $\pi = 3.14\text{s}$ y disparar exactamente cada $3.14\text{ segundos}$.

* **Test 4: Exclusividad de Recolección de Power-Ups**
  * *Acción:* Dirigir la bola del Jugador ($\frac{d}{dx}$) para que pase directamente por encima de los nodos amarillos `b = 2` y `a = 2`.
  * *Resultado esperado:* Los nodos amarillos no deben desaparecer, ni alterar su posición, ni aplicar ningún efecto al Jugador o al Enemigo.