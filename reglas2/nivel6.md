# Prompt de Sistema: Implementación Literal de Nivel ($\int$ vs. $e^x$)

**Instrucción Crítica para el Agente IA:**
Implementa este nivel siguiendo cada regla de forma 100% literal. No asumas comportamientos implícitos. Todas las mecánicas responden a propiedades de cálculo integral indefinido (generación de constantes de integración $+ C$ y regla de la potencia inversa).

## 1. Fundamento Matemático General del Nivel

1. **Invarianza de $e^x$ y Generación de Constantes de Integración ($+ C$):**
   * La integral indefinida de $e^x$ es ella misma más una constante arbitraria:
     $$\int e^x \, dx = e^x + C_n$$
   * **Traducción a Mecánica:** Cuando el Jugador ($\int$) toca a $e^x$, $e^x$ no cambia de forma ni sufre daño por el contacto del cuerpo circular, pero cada integración **instancia una nueva entidad física estática** en la arena llamada $C_n$ ($C_1, C_2, C_3 \dots$).

2. **Integración Polinómica Sucesiva (Fábrica de Entidades y Rayos):**
   * El Jugador ($\int$) también puede integrar a sus propias constantes $C_n$ al chocar con ellas. Al integrar una constante o un monomio, este sube de grado siguiendo la regla de la potencia $\int x^k \, dx = \frac{x^{k+1}}{k+1} + C_{\text{nuevo}}$:
     $$C_n \xrightarrow{\int} C_n x + C_{m} \xrightarrow{\int} \frac{C_n}{2}x^2 + C_{p} \xrightarrow{\int} \frac{C_n}{6}x^3 + C_{q} \dots \left(\frac{C_n}{k!}x^k\right)$$
   * **Traducción a Mecánica:** Cada vez que $\int$ choca contra un nodo aliado de grado $k$:
     1. El nodo golpeado evoluciona al grado $k+1$ (aumentando su tamaño físico).
     2. Se dispara un **Haz de Función Polinómica** (recta para grado $1$, parábola para grado $2$, cúbica para grado $3$, etc.) que daña a $e^x$ si la cruza.
     3. Se genera **un nuevo nodo constante $C_{\text{nuevo}}$** en una posición aleatoria de la arena, provocando un crecimiento poblacional exponencial de obstáculos aliados.

## 2. Configuración Inicial Estricta

* **Entidad Izquierda (Jugador): Operador Integral ($\int$)**
  * **HP Inicial / Máximo:** $80 / 80$.
  * **Posición Inicial:** $(-3.5, 0)$.
  * **Cuerpo Compuesto:** A diferencia de otras bolas, tiene dos partes físicas:
    1. **Cuerpo circular:** Rebota elásticamente contra paredes, contra $e^x$ y contra todos los nodos aliados $C_n$.
    2. **Apéndice / Cola ("Látigo $\int$"):** Un brazo rígido con forma del extremo inferior del símbolo $\int$ que sobresale del borde del círculo y rota continuamente.
  * **UI Inferior Izquierda:** Inicia en `[Cooldown 1s]`, pasa a `[Látigo \int listo]` y al golpear con el látigo entra en `[Cooldown 5s]`.

* **Entidad Derecha (Enemigo / CPU): Función Exponencial ($e^x$)**
  * **HP Inicial / Máximo:** $80 / 80$.
  * **Posición Inicial:** $(+3.5, 0)$.
  * **Física Especial:** Rebota contra las 4 paredes y contra el cuerpo de $\int$, pero **ATRAVIESA (es intangible)** a todos los nodos naranjas ($C_n, C_n x, \frac{C_n}{k!}x^k$) sin rebotar contra ellos.

## 3. Reglas de Interacción Paso a Paso

### A. Interacción 1: $\int$ toca a $e^x$ (Cuerpo vs. Látigo)
1. **Si solo chocan los cuerpos circulares (ej. segundo `00:03`):**
   * Rebotan sin hacerse daño ($0\text{ HP}$).
   * Se muestra $\int e^x \, dx = e^x + C_1$ y aparece el nodo $C_1$ en el mapa.
2. **Si el Látigo de $\int$ está en estado `[Látigo \int listo]` y golpea a $e^x$ (ej. segundos `00:06` y `00:21`):**
   * Se activa el ataque `¡Látigo \int!`.
   * Inflige daño directo múltiple a $e^x$: un golpe de $-7\text{ HP}$ más un golpe secundario de $-5\text{ HP}$ (total $-12\text{ HP}$).
   * También ejecuta la integración $\int e^x \, dx = e^x + C_n$, creando una nueva constante en el mapa.
   * El látigo entra inmediatamente en `[Cooldown 5s]`.

### B. Interacción 2: $\int$ choca contra un Nodo Aliado ($\frac{C_n}{k!}x^k$)
Cada vez que el círculo de $\int$ toca físicamente a cualquier nodo naranja en la arena:
1. $\int$ **rebota físicamente** contra el nodo (los nodos son estáticos e inamovibles, actuando como bumpers de pinball para $\int$).
2. El nodo tocado incrementa su exponente en $+1$ y su denominador se multiplica por el nuevo exponente ($1, 2, 6, 24, 120, 720, 5040\dots$).
3. Aparece una nueva constante $C_{\text{siguiente}}$ en el mapa.
4. **Disparo de Haz Polinómico:** En el instante de la integración, se dibuja en la arena la gráfica matemática del nuevo polinomio resultante pasando por el nodo:
   * Si el resultado es $C_n x + C_m$: Se dispara un haz recto diagonal/horizontal.
   * Si es $\frac{C_n}{2}x^2 + C_m$: Se dispara un haz parabólico en forma de U.
   * Si es de grado $\ge 3$: Se dispara la curva polinómica correspondiente.
   * **Daño del Haz a $e^x$:** Si el cuerpo de $e^x$ está tocando la línea de ese haz polinómico cuando se dispara, $e^x$ recibe **$-4\text{ HP}$** por cada haz que lo cruce (si ocurren dos integraciones rápidas que lo cruzan, recibe $-8\text{ HP}$, como en `00:28` y `00:31`).

### C. Interacción 3: Ataques de $e^x$ ("Cuchilla Exponencial") contra $\int$ y Nodos
$e^x$ ejecuta su ciclo habitual de *Cuchilla Exponencial* (traza la curva $y = e^x + c$ y corta):
1. **Contra el Jugador ($\int$):**
   * Igual que en niveles anteriores: si corta a $\int$ en la parte plana/baja de la curva, le inflige $-4\text{ HP}$ (o $-8\text{ HP}$ en zona media) y le aplica el estado **Quemadura (`[¡Quemando!]`)**, que drena $-2\text{ HP}$ por tick.
2. **Contra los Nodos Aliados ($C_n, \frac{C_n}{k!}x^k$):**
   * Los nodos naranjas tienen **vida oculta (HP propio)**.
   * Cada vez que el rayo de la *Cuchilla Exponencial* de $e^x$ corta a través de un nodo naranja, aparece un texto rojo **`-1`** sobre ese nodo.
   * Si un nodo recibe suficientes cortes de `-1` (aproximadamente $2$ a $3$ impactos), **se destruye y desaparece** de la arena mostrando pequeños puntos suspensivos naranjas (visible en el segundo `00:28` cuando destruye dos nodos en el cuadrante superior izquierdo).

## 4. Cronología Literal de Eventos Clave en el Video

* `00:00 - 00:02`: Cuenta regresiva ($3, 2, 1$). Ambos con $80 / 80\text{ HP}$.
* `00:03`: Primer choque en el centro ($\int$ aún en cooldown de $1\text{s}$). No hay daño. Se ejecuta $\int e^x \, dx = e^x + C_1$ y aparece el nodo $C_1$ a la derecha.
* `00:04 - 00:05`: $e^x$ lanza su primera Cuchilla Exponencial arriba; $\int$ está abajo y la esquiva.
* `00:06`: $\int$ tiene `[Látigo \int listo]` y golpea a $e^x$. Activa `¡Látigo \int!`, inflige $-7$ y $-5$ ($-12\text{ HP}$ total, $e^x$ baja a $68 / 80\text{ HP}$) y genera el nodo $C_2$.
* `00:08 - 00:13`: $\int$ empieza a rebotar entre sus propios nodos en la izquierda ($C_1 \rightarrow C_1 x + C_3$, $C_2 \rightarrow C_2 x + C_4 \rightarrow \frac{C_2}{2}x^2 + C_7 \rightarrow \frac{C_2}{6}x^3 + C_8$). Cada choque dispara líneas y parábolas naranjas, y multiplica la cantidad de nodos en pantalla. En `00:10` y `00:12`, el rayo de $e^x$ corta nodos naranjas haciéndoles `-1` de daño.
* `00:14`: Dos rayos/impactos golpean a $\int$ y a $e^x$ simultáneamente:
  * $e^x$ recibe $-4\text{ HP}$ de una parábola naranja (baja a $64 / 80\text{ HP}$).
  * $\int$ es cortado por la parte baja de la curva de $e^x$ ($-4\text{ HP}$ + Quemadura de $-2\text{ HP}$ por tick), bajando progresivamente hasta $40 / 80\text{ HP}$ en el segundo `00:20` tras encadenar una segunda quemadura en `00:18`.
* `00:16 - 00:20`: $\int$ queda atrapado rebotando frenéticamente entre nodos en la esquina superior derecha, llevando un polinomio hasta grado 6 ($\frac{C_{11}}{720}x^6 + C_{19}$) y llenando el mapa hasta llegar a $C_{20}$.
* `00:21`: $\int$ golpea a $e^x$ con su segundo `¡Látigo \int!` ($-7$ y $-5 = -12\text{ HP}$), bajando a $e^x$ de $64$ a $52 / 80\text{ HP}$.
* `00:24 - 00:33`: El mapa está saturado de nodos (hasta $C_{41}$). $\int$ rebota sin parar entre ellos disparando haces constantes que golpean a $e^x$ a distancia:
  * `00:24`: $-4\text{ HP}$ a $e^x$ ($48\text{ HP}$).
  * `00:26`: $-4\text{ HP}$ a $e^x$ ($44\text{ HP}$).
  * `00:27`: $-4\text{ HP}$ a $e^x$ ($40\text{ HP}$).
  * `00:28`: Doble impacto de haz ($-8\text{ HP}$) a $e^x$ ($32\text{ HP}$), mientras el corte de $e^x$ destruye dos nodos con `-1`.
  * `00:31`: Doble impacto ($-8\text{ HP}$) a $e^x$ ($24\text{ HP}$).
  * `00:32 - 00:33`: Dos impactos más de $-4\text{ HP}$ bajan a $e^x$ a $16 / 80\text{ HP}$ (mientras un polinomio alcanza grado 7: $\frac{C_{29}}{5040}x^7 + C_{42}$).
* `00:34 - 00:37`: $e^x$ logra cortar a $\int$ con su Cuchilla Exponencial aplicando quemadura; $\int$ cae críticamente hasta $3 / 80\text{ HP}$. Mientras tanto, los haces polinómicos siguen golpeando a $e^x$ de $-4$ en $-4$ ($16 \rightarrow 12 \rightarrow 8 \rightarrow 4\text{ HP}$).
* `00:40`: $\int$ integra un nodo en el cuadrante inferior izquierdo ($\int \frac{C_{31}}{2}x^2 \, dx = \frac{C_{31}}{6}x^3$), disparando una curva cúbica que cruza a $e^x$ en la esquina inferior derecha, infligiéndole los últimos **$-4\text{ HP}$**. $e^x$ cae a $0 / 80\text{ HP}$ (`[DEAD]`) y gana $\int$ con $3\text{ HP}$ restantes.

## 5. Batería de Pruebas (QA Tests) para Validar la Implementación

* **Test 1: Asimetría de Colisión con Nodos ($C_n$)**
  * *Acción:* Colocar un nodo $C_1$ en el centro y lanzar a $\int$ y a $e^x$ directamente contra él.
  * *Resultado esperado:* $\int$ debe rebotar sólidamente contra $C_1$ (transformándolo en $C_1 x$ y creando a $C_2$), mientras que $e^x$ debe atravesar a $C_1$ de largo como un fantasma sin alterar su trayectoria.

* **Test 2: Progresión Factorial Exacta ($\frac{C_n}{k!}x^k$)**
  * *Acción:* Hacer que $\int$ rebote $5$ veces seguidas contra el mismo nodo inicial $C_1$.
  * *Resultado esperado:* El texto del nodo debe evolucionar estrictamente en la secuencia: $C_1 \rightarrow C_1 x \rightarrow \frac{C_1}{2}x^2 \rightarrow \frac{C_1}{6}x^3 \rightarrow \frac{C_1}{24}x^4 \rightarrow \frac{C_1}{120}x^5$, incrementando su radio visual en cada paso y generando $5$ nuevas constantes independientes en el mapa.

* **Test 3: Daño de Haz Polinómico vs. Daño de Látigo**
  * *Acción:* Medir la reducción de HP de $e^x$ cuando es golpeado directamente por el apéndice de $\int$ (fuera de cooldown) frente a cuando es cruzado a distancia por la línea generada al integrar un nodo.
  * *Resultado esperado:* El golpe de látigo debe restar exactamente $12\text{ HP}$ ($-7$ y $-5$) y activar un cooldown de $5\text{s}$; el cruce de un haz polinómico debe restar exactamente $4\text{ HP}$ por línea sin depender del cooldown del látigo.

* **Test 4: Destrucción de Nodos por Cuchilla Exponencial**
  * *Acción:* Hacer que la curva $y = e^x + c$ dispare repetidamente sobre un mismo nodo $C_n$.
  * *Resultado esperado:* En cada disparo debe aparecer el indicador `-1` sobre el nodo y, al agotar sus puntos de vida, el nodo debe ser eliminado del array de entidades de la arena.