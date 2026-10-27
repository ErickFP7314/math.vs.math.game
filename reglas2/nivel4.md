# Prompt de Sistema: Implementación Literal de Nivel ($\frac{\partial}{\partial y}$ vs. $e^x$)

**Instrucción Crítica para el Agente IA:**
Lee y ejecuta estas instrucciones de forma 100% literal. No asumas comportamientos implícitos. Cada regla física, matemática y de estado debe programarse exactamente como se describe paso a paso.

---

## 1. Configuración Inicial Estricta

* **Arena:** Cuadrícula cartesiana delimitada por 4 paredes sólidas.
* **Física de Rebote:** Rebote elástico perfecto ($e = 1$). Cuando una bola choca contra una pared o contra la otra bola, cambia su dirección de movimiento sin perder ni ganar velocidad. No existe gravedad ni fricción.
* **Entidad Izquierda (Jugador): Derivada Parcial respecto a $y$ ($\frac{\partial}{\partial y}$)**
  * **HP Inicial / Máximo:** $100 / 100$.
  * **Posición Inicial:** Coordenada $(-3.5, 0)$ (mitad izquierda sobre el eje $X$).
  * **Estado Inicial en UI:** `[READY]` durante el conteo ($3, 2, 1$). Al segundo $0$, cambia permanentemente a `[Preparado para derivar parcialmente respecto a y]`.
* **Entidad Derecha (Enemigo / CPU): Función Exponencial ($e^x$)**
  * **HP Inicial / Máximo:** $80 / 80$.
  * **Posición Inicial:** Coordenada $(+3.5, 0)$ (mitad derecha sobre el eje $X$).
  * **Estado Inicial en UI:** `[READY]` durante el conteo. Al iniciar la partida, entra en `[Cooldown 1s]`.

---

## 2. Reglas de la Entidad Izquierda: Jugador ($\frac{\partial}{\partial y}$)

1. **Sin ataques a distancia ni proyectiles:** El Jugador NUNCA dispara rayos, curvas ni proyectiles. No tiene temporizador de enfriamiento (cooldown).
2. **Habilidad Pasiva Única ("Derivación Parcial por Contacto Directo"):**
   * **Condición de activación:** Los bordes de los círculos del Jugador ($\frac{\partial}{\partial y}$) y del Enemigo ($e^x$) deben tocarse físicamente (distancia entre centros $\le \text{radio}_1 + \text{radio}_2$).
   * **Lógica matemática literal:** Como la función $e^x$ depende únicamente de $x$ y no tiene variable $y$, para el operador $\frac{\partial}{\partial y}$ el enemigo es una constante. La derivada de una constante es $0$.
   * **Efecto exacto al colisionar cuerpo a cuerpo:**
     1. Ambas bolas rebotan físicamente de forma normal.
     2. Se muestra en el centro de la pantalla la ecuación matemática: $\frac{\partial}{\partial y} e^x = 0$.
     3. Se aplica un daño instantáneo al Enemigo igual al **100% de su HP máximo** ($-80\text{ HP}$), forzando su vida a $0 / 80$ en un solo golpe (One-Shot Kill), sin importar cuánta vida tuviera antes del toque.
     4. El Jugador recibe $0$ de daño en este choque.

---

## 3. Reglas de la Entidad Derecha: Enemigo ($e^x$)

El Enemigo utiliza exactamente la misma habilidad de "Cuchilla Exponencial" del nivel anterior, ejecutada bajo este ciclo literal:

1. **Fase de Cooldown:**
   * Al empezar la partida espera $1\text{ segundo}$. Después de cada ataque, espera $3\text{ segundos}$ (`[Cooldown 3s]` $\rightarrow$ `2s` $\rightarrow$ `1s`).
2. **Fase de Apuntado / Trazado (Dura exactamente $1\text{ segundo}$):**
   * El estado cambia a `[¡Cuchilla Exponencial!]`.
   * Se dibuja una línea punteada horizontal (asíntota) y una curva continua ($y = e^x + c$) que se mueve pegada al centro de la bola $e^x$.
   * **Regla literal:** Mientras la curva se está moviendo junto con la bola durante este segundo, **NO HACE DAÑO** aunque toque al Jugador.
3. **Fase de Disparo / Corte (Instantáneo al cumplirse el segundo de trazado):**
   * La curva se congela en su última posición, brilla y verifica si el círculo del Jugador ($\frac{\partial}{\partial y}$) está tocando cualquier punto de la línea curva.
   * **Si NO toca al Jugador:** No pasa nada y $e^x$ vuelve a `[Cooldown 3s]`.
   * **Si SÍ toca al Jugador (como ocurre en el segundo `00:04` del video):**
     1. **Daño de Impacto:** Si golpea con la parte baja/izquierda de la curva (cerca de la línea punteada), resta inmediatamente $-4\text{ HP}$ al Jugador.
     2. **Aplicación de Quemadura (DoT):** Inmediatamente en el mismo frame del impacto, aplica el estado de quemadura al Jugador y le resta el primer tick de $-2\text{ HP}$ (por eso en el segundo `00:05` la vida baja de $100$ a $94$ de golpe: $100 - 4 - 2 = 94$).
     3. **Ticks posteriores de Quemadura:** Mientras el estado de $e^x$ muestra `[¡Quemando!]`, el Jugador envuelto en llamas pierde $-2\text{ HP}$ adicionales cada $\sim 0.75\text{ segundos}$ durante $4$ ticks más (bajando a $92 \rightarrow 90 \rightarrow 88 \rightarrow 86\text{ HP}$).
     4. El Jugador NO tiene forma de bloquear, reflejar ni esquivar de forma intangible este rayo. Recibe todo el daño normalmente.

---

## 4. Secuencia Cronológica Exacta del Video (Referencia de Comportamiento)

* `00:00 - 00:02`: Cuenta regresiva ($3, 2, 1$). Bolas quietas.
* `00:03`: Ambas bolas se mueven y rebotan contra las paredes sin tocarse entre sí.
* `00:04`: $e^x$ traza su curva en la parte inferior. El Jugador ($\frac{\partial}{\partial y}$) pasa por encima de la parte plana de la curva justo cuando esta dispara.
* `00:05 - 00:07`: El Jugador recibe $-4\text{ HP}$ del corte y $5$ ticks de $-2\text{ HP}$ por quemadura ($14$ de daño total), quedando en $86 / 100\text{ HP}$.
* `00:08 - 00:09`: $e^x$ traza y dispara su segunda Cuchilla Exponencial en la parte superior, pero el Jugador está abajo y no toca la curva ($0$ daño).
* `00:10`: Ambas bolas chocan cuerpo a cuerpo por primera vez cerca del cuadrante superior derecho. Se ejecuta $\frac{\partial}{\partial y} e^x = 0$, $e^x$ recibe $-80\text{ HP}$, explota (`[DEAD]`) y gana $\frac{\partial}{\partial y}$ con $86\text{ HP}$ restantes.

---

## 5. Batería de Pruebas (QA Tests) para Validar la Implementación

Ejecuta estos casos de prueba unitarios y de integración para confirmar que el código no tiene ambigüedades:

* **Test 1: Verificación de One-Shot por Contacto Físico (Caso Principal)**
  * *Acción:* Forzar la dirección inicial de $\frac{\partial}{\partial y}$ directamente hacia $e^x$ para que choquen en el segundo `00:03`.
  * *Resultado esperado:* En el frame exacto en que la distancia entre centros sea $\le R_1 + R_2$, la vida de $e^x$ debe pasar de $80$ a $0$ instantáneamente, mostrar el texto `-80` y la fórmula $\frac{\partial}{\partial y} e^x = 0$, y terminar la partida.
* **Test 2: Intangibilidad Inofensiva durante Fase de Trazado**
  * *Acción:* Hacer que $\frac{\partial}{\partial y}$ cruce la curva de $e^x$ a los $0.5\text{ segundos}$ de haber iniciado la fase de trazado, pero que ya esté fuera de la curva en el segundo $1.0$ (momento del disparo).
  * *Resultado esperado:* El Jugador debe conservar $100 / 100\text{ HP}$ y no recibir estado de quemadura.
* **Test 3: Exactitud Matemática del Daño por Quemadura**
  * *Acción:* Hacer que el corte de la parte plana de la curva golpee a $\frac{\partial}{\partial y}$ una sola vez y evitar cualquier otro impacto.
  * *Resultado esperado:* La vida de $\frac{\partial}{\partial y}$ debe reducirse exactamente en $14$ puntos totales ($1$ golpe de $-4\text{ HP}$ + $5$ ticks de $-2\text{ HP}$), estabilizándose en $86 / 100\text{ HP}$ cuando desaparecen las partículas de fuego.
* **Test 4: Ausencia de Cooldowns en el Jugador**
  * *Acción:* Inspeccionar el estado del Jugador durante $30\text{ segundos}$ sin que las bolas choquen.
  * *Resultado esperado:* El Jugador nunca debe emitir ningún ataque a distancia ni cambiar su texto de estado de `[Preparado para derivar parcialmente respecto a y]`.