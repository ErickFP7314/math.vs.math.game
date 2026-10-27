# Prompt de Sistema: Implementación Literal de Nivel ($e^x$ vs. $\pi$)

**Instrucción Crítica para el Agente IA:**
Implementa este nivel siguiendo cada regla de forma 100% literal. No asumas comportamientos implícitos ni omitas mecánicas secundarias. Ignora aspectos estéticos o tipográficos; concéntrate exclusivamente en el motor físico, geometría de colisiones, progresión matemática de ángulos/decimales y lógica de daño.

---

## 1. Fundamento Matemático General del Nivel

1. **Área del Sector Circular ($S = \frac{1}{2}r^2\theta$) como Ataque Evolutivo de $\pi$:**
   * Geométricamente, el área de un sector circular de radio $r$ y ángulo central $\theta$ (en radianes) está dada por:
     $$S = \frac{1}{2}r^2\theta$$
   * **Traducción literal a mecánica:** La entidad $\pi$ proyecta un sector circular físico de radio fijo $r = 2\text{ unidades}$ de la cuadrícula ($\frac{1}{2}r^2 = \frac{1}{2}(2)^2 = 2$). Por lo tanto, el área mostrada en cada corte es exactamente $S = 2\theta$.
   * Cada vez que el sector circular golpea a $e^x$, su ángulo de apertura $\theta$ crece al siguiente valor notable en radianes, cubriendo un área angular cada vez mayor alrededor de $\pi$ hasta completar la circunferencia completa ($2\pi$):
     $$\frac{\pi}{6} \ (30^\circ) \longrightarrow \frac{\pi}{3} \ (60^\circ) \longrightarrow \frac{\pi}{2} \ (90^\circ) \longrightarrow \pi \ (180^\circ) \longrightarrow 2\pi \ (360^\circ) \longrightarrow \text{reinicia a } \frac{\pi}{6}$$

2. **Expansión Decimal Infinita ($\pi = 3.14159265\dots$) como Cola de Daño Secuencial:**
   * $\pi$ es un número irracional cuyos primeros dígitos son $3, 1, 4, 1, 5, 9, 2, 6, 5\dots$
   * **Traducción literal a mecánica:** Adherida al cuerpo de $\pi$ cuelga una cola física formada por una fila de dígitos que actúa como una cola de datos (*FIFO Queue*). El primer dígito activo está encerrado en un círculo pequeño. Cuando ese dígito activo toca a $e^x$, le inflige un daño plano exactamente igual al **valor numérico de ese dígito** ($-3, -1, -4, -1, -5, -9\dots$), consume dicho dígito y avanza la cola al siguiente decimal de $\pi$.

3. **Crecimiento Exponencial ($y = e^x + c$) como Gradiente de Daño y Quemadura:**
   * La curva $y = e^x + c$ tiene una pendiente casi nula a la izquierda ($x < 0$, cerca de su asíntota horizontal) y una pendiente que crece abruptamente hacia la derecha ($x > 0$).
   * **Traducción literal a mecánica:** El corte en la zona plana izquierda inflige daño bajo/moderado pero aplica daño en el tiempo por **Quemadura** (fricción/calor), mientras que el corte en la rampa empinada derecha inflige daño directo masivo instantáneo ($-20\text{ HP}$).

---

## 2. Configuración Inicial Estricta

* **Arena:** Plano cartesiano cuadrado delimitado por 4 paredes sólidas con rebote elástico perfecto ($e = 1$). Sin gravedad ni fricción.
* **Entidad Izquierda (Jugador): Función Exponencial ($e^x$)**
  * **HP Inicial / Máximo:** $80 / 80$.
  * **Posición Inicial:** $(-3.5, 0)$.
  * **Estado Inicial en UI:** `[READY]` durante el conteo (`3, 2, 1`). Al segundo `00:03` pasa a `[Cooldown 1s]`.
* **Entidad Derecha (Enemigo / CPU): Constante Pi ($\pi$)**
  * **HP Inicial / Máximo:** $75 / 75$.
  * **Posición Inicial:** $(+3.5, 0)$.
  * **Estado Inicial en UI:** `[READY]` durante el conteo. Al iniciar la partida muestra permanentemente el ángulo del sector actual: `[Siguiente sector \theta = \pi/6]`.
  * **Componentes Físicos Acoplados a $\pi$ desde el inicio:**
    1. **Sector Circular Rotatorio:** Un cono/sector de radio $r = 2$ unidades anclado al centro de $\pi$, que inicia con apertura $\theta = \frac{\pi}{6}$ y gira continuamente alrededor de $\pi$ a velocidad angular constante en sentido horario.
    2. **Cola de Decimales:** Una cadena articulada que cuelga del borde de $\pi$ mostrando inicialmente: `(3) . 1 4 1 ...`

---

## 3. Reglas de Interacción, Físicas y Habilidades Paso a Paso

### A. Colisión Cuerpo a Cuerpo ($e^x$ vs. Cuerpo Principal de $\pi$)
1. Los círculos principales de $e^x$ y $\pi$ son sólidos entre sí y rebotan elásticamente al chocar.
2. El choque entre los dos círculos principales por sí solo no hace daño, **PERO** debido a la cercanía física del choque, casi siempre provoca que $e^x$ entre en contacto con la **Cola de Decimales** o con el **Sector Circular** de $\pi$.

### B. Habilidad 1 del Enemigo ($\pi$): "Corte de Sector Circular" (`¡Corte de Sector!`)
1. **Detección de Disparo por Proximidad Angular (Trigger):**
   * El sector circular de radio $r = 2$ y ángulo $\theta$ gira de forma continua alrededor del centro de $\pi$.
   * No se dispara por un temporizador fijo en el vacío; **se activa automáticamente en el instante en que el círculo de $e^x$ toca o entra dentro del área geométrica del sector** (siempre que haya pasado su breve enfriamiento interno de $\sim 1.5\text{s}$ tras el corte anterior).
2. **Efectos Exactos al Activarse el Corte:**
   * Inflige un daño fijo e invariable de **$-15\text{ HP}$** a $e^x$ (sin importar qué tan grande sea el ángulo $\theta$).
   * Muestra en pantalla la fórmula del área evaluada en ese instante: $S = \frac{1}{2}r^2\theta = 2\theta$.
   * **Evolución del Ángulo:** Inmediatamente después de impactar, el ángulo $\theta$ del sector sube al siguiente nivel de la tabla de progresión (haciendo que el cono sea más ancho y más fácil de impactar en el siguiente encuentro).
   * Si el corte se ejecutó con $\theta = 2\pi$ (círculo completo), el ángulo se reinicia a $\theta = \frac{\pi}{6}$.

### C. Habilidad 2 del Enemigo ($\pi$): "Cola de Dígitos Decimales"
1. **Estructura de la Cola:**
   * Es un apéndice físico rotatorio/oscilante unido al borde de $\pi$.
   * El nodo frontal (más cercano al borde de $\pi$) contiene el dígito activo $d_k$ dentro de un pequeño círculo sólido. Detrás de él se muestran los siguientes $3$ dígitos de $\pi$ seguidos de `...`
2. **Condición de Impacto y Consumo de Dígito:**
   * Cuando el círculo de $e^x$ toca el nodo del dígito activo $(d_k)$:
     1. $e^x$ recibe instantáneamente **$-d_k\text{ HP}$** de daño (donde $d_k$ es el valor entero del dígito).
     2. El punto decimal (`.`) solo aparece tras el `3` inicial y se omite al avanzar al `1`.
     3. El dígito usado se destruye y el siguiente dígito de la serie de $\pi$ pasa a ocupar el círculo activo inmediatamente.
     4. Si el siguiente dígito en la serie fuera $0$, no se alcanza en una partida estándar porque la suma de los primeros $6$ dígitos ($3 + 1 + 4 + 1 + 5 + 9 = 23$) combinada con los cortes de sector ($-15\text{ HP}$) supera los $80\text{ HP}$ de $e^x$.

### D. Habilidad del Jugador ($e^x$): "Cuchilla Exponencial"
1. **Ciclo de Ejecución:**
   * Cada $\sim 2\text{ a }3\text{ segundos}$, $e^x$ traza la curva $y = e^x + c$ pasando por su propio centro (con su asíntota horizontal punteada debajo) y ejecuta un barrido/corte a lo largo de toda la curva.
2. **Zonas de Impacto sobre $\pi$:**
   * **Zona Plana / Media-Baja (Izquierda y Centro de la curva):**
     * Inflige daño directo moderado dividido en dos impactos simultáneos sobre $\pi$ (ej. $-8$ y $-4 = -12\text{ HP}$ en `00:05`, $-4$ y $-4 = -8\text{ HP}$ en `00:19`, o $-4$ y $-6 = -10\text{ HP}$ en `00:21`).
     * Aplica el estado alterado **Quemadura (`[¡Quemando!]`)** a $\pi$.
     * **Efecto de Quemadura:** Envuelve a $\pi$ en partículas de fuego y le resta **$-2\text{ HP}$** por tick cada $\sim 0.6\text{ segundos}$ (aproximadamente $4$ ticks por aplicación).
   * **Zona Empinada / Alta (Extremo Derecho de la curva, resaltado con estela gruesa):**
     * Si $\pi$ es golpeado por el tramo casi vertical del extremo derecho de la curva (como ocurre en el segundo `00:08`), recibe un golpe crítico directo de **$-20\text{ HP}$**, sin aplicar estado de quemadura.
3. **Inmunidad de los Apéndices de $\pi$:**
   * El sector circular y la cola de decimales de $\pi$ NO sufren daño ni se destruyen cuando los cruza la curva de $e^x$; solo el cuerpo circular principal de $\pi$ tiene hitbox para recibir daño de $e^x$.

---

## 4. Tablas de Progresión Matemática de $\pi$

### Tabla 1: Progresión del Sector Circular ($r = 2$)
| Nivel | Ángulo Central ($\theta$) | Grados Equivalentes | Ecuación Mostrada ($S = \frac{1}{2}r^2\theta$) | Daño al Impactar a $e^x$ | Siguiente Estado de $\theta$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Fase 1** | $\theta = \frac{\pi}{6}$ | $30^\circ$ | $S = \frac{1}{2}r^2\theta = \frac{\pi}{3}$ | $-15\text{ HP}$ | Pasa a Fase 2 ($\frac{\pi}{3}$) |
| **Fase 2** | $\theta = \frac{\pi}{3}$ | $60^\circ$ | $S = \frac{1}{2}r^2\theta = \frac{2\pi}{3}$ | $-15\text{ HP}$ | Pasa a Fase 3 ($\frac{\pi}{2}$) |
| **Fase 3** | $\theta = \frac{\pi}{2}$ | $90^\circ$ | $S = \frac{1}{2}r^2\theta = \pi$ | $-15\text{ HP}$ | Pasa a Fase 4 ($\pi$) |
| **Fase 4** | $\theta = \pi$ | $180^\circ$ (Semicírculo) | $S = \frac{1}{2}r^2\theta = 2\pi$ | $-15\text{ HP}$ | Pasa a Fase 5 ($2\pi$) |
| **Fase 5** | $\theta = 2\pi$ | $360^\circ$ (Círculo total) | *(Golpe de área completa)* | $-15\text{ HP}$ | Reinicia a Fase 1 ($\frac{\pi}{6}$) |

### Tabla 2: Cola FIFO de Dígitos Decimales de $\pi$ ($3.14159265\dots$)
| Orden de Impacto | Dígito Activo en Círculo | Cola Visible Detrás | Daño Exacto Infligido a $e^x$ | Siguiente Dígito Activo |
| :--- | :--- | :--- | :--- | :--- |
| **1.º Impacto** | `(3)` | `. 1 4 1 ...` | **$-3\text{ HP}$** | `(1)` |
| **2.º Impacto** | `(1)` | `4 1 5 ...` | **$-1\text{ HP}$** | `(4)` |
| **3.º Impacto** | `(4)` | `1 5 9 ...` | **$-4\text{ HP}$** | `(1)` |
| **4.º Impacto** | `(1)` | `5 9 2 ...` | **$-1\text{ HP}$** | `(5)` |
| **5.º Impacto** | `(5)` | `9 2 6 ...` | **$-5\text{ HP}$** | `(9)` |
| **6.º Impacto** | `(9)` | `2 6 5 ...` *(En el video muestra `2 5 5 ...`)* | **$-9\text{ HP}$** | `(2)` |

---

## 5. Cronología Literal de Eventos en el Video

* `00:00 - 00:02`: Cuenta regresiva (`3, 2, 1`). $e^x$ con $80 / 80\text{ HP}$; $\pi$ con $75 / 75\text{ HP}$, sector $\theta = \frac{\pi}{6}$ y cola en `(3) . 1 4 1 ...`
* `00:03` **[1.º Impacto de Cola Decimal `(3)`]:**
  * Ambas bolas chocan arriba al centro. El dígito activo `(3)` toca a $e^x$ e inflige **$-3\text{ HP}$** ($e^x$ baja de $80 \rightarrow 77 / 80\text{ HP}$).
  * La cola de $\pi$ avanza su puntero a `(1) 4 1 5 ...`
* `00:04` **[1.º Corte de Sector ($\theta = \frac{\pi}{6}$)]:**
  * $e^x$ entra en el sector $\theta = \frac{\pi}{6}$ de $\pi$. Se activa `¡Corte de Sector!`, mostrando $S = \frac{1}{2}r^2\theta = \frac{\pi}{3}$ y restando **$-15\text{ HP}$** a $e^x$ ($e^x$ baja de $77 \rightarrow 62 / 80\text{ HP}$).
  * El sector de $\pi$ se expande a $\theta = \frac{\pi}{3}$.
* `00:04 - 00:07` **[1.º Impacto de Cuchilla Exponencial + Quemadura]:**
  * Al final del segundo `00:04`, $e^x$ dispara su Cuchilla Exponencial y corta a $\pi$.
  * En `00:05`, $\pi$ recibe $-8$ y $-4$ (**$-12\text{ HP}$** directos) más el primer tick de **Quemadura** de **$-2\text{ HP}$** ($\pi$ baja de $75 \rightarrow 61 / 75\text{ HP}$).
  * Entre `00:05` y `00:07`, $\pi$ sufre $4$ ticks adicionales de quemadura de $-2\text{ HP}$ cada uno ($61 \rightarrow 59 \rightarrow 57 \rightarrow 55 \rightarrow 53 / 75\text{ HP}$).
* `00:08` **[2.º Corte de Sector ($\theta = \frac{\pi}{3}$) + Golpe Crítico de Cuchilla Exponencial]:**
  * Ambas entidades se cruzan arriba al centro y se golpean mutuamente en el mismo segundo:
  * $e^x$ entra en el sector $\theta = \frac{\pi}{3}$ de $\pi$: recibe **$-15\text{ HP}$** ($e^x$ baja de $62 \rightarrow 47 / 80\text{ HP}$), se muestra $S = \frac{1}{2}r^2\theta = \frac{2\pi}{3}$ y el sector de $\pi$ crece a $\theta = \frac{\pi}{2}$.
  * Simultáneamente, la parte empinada derecha de la Cuchilla Exponencial de $e^x$ corta de lleno a $\pi$, infligiéndole **$-20\text{ HP}$** directos ($\pi$ cae de $53 \rightarrow 33 / 75\text{ HP}$).
* `00:09 - 00:11`: Rebotan por la arena sin tocarse. $e^x$ dispara cortes exponenciales en la parte superior izquierda, pero $\pi$ está abajo y los esquiva por completo.
* `00:12 - 00:13` **[2.º Impacto de Cola Decimal `(1)`]:**
  * Al cruzarse cerca del centro, $e^x$ esquiva el sector $\theta = \frac{\pi}{2}$ pero roza el dígito activo `(1)` de la cola de $\pi$.
  * $e^x$ recibe **$-1\text{ HP}$** (baja de $47 \rightarrow 46 / 80\text{ HP}$) y la cola de $\pi$ avanza a `(4) 1 5 9 ...`
* `00:14 - 00:17`: Ambos siguen rebotando; $e^x$ lanza cortes exponenciales en `00:15` y `00:17` que no alcanzan a $\pi$.
* `00:18` **[3.º Corte de Sector ($\theta = \frac{\pi}{2}$)]:**
  * En el cuadrante inferior derecho, $e^x$ entra en el sector de $90^\circ$ ($\theta = \frac{\pi}{2}$).
  * Se ejecuta `¡Corte de Sector!`, muestra $S = \frac{1}{2}r^2\theta = \pi$ y resta **$-15\text{ HP}$** a $e^x$ ($e^x$ baja de $46 \rightarrow 31 / 80\text{ HP}$).
  * El sector de $\pi$ evoluciona a un semicírculo de $180^\circ$ ($\theta = \pi$).
* `00:19` **[3.º Impacto de Cola Decimal `(4)` + 2.º Impacto de Cuchilla Exponencial]:**
  * Chocan abajo a la derecha. El dígito activo `(4)` de $\pi$ golpea a $e^x$ por **$-4\text{ HP}$** ($e^x$ baja de $31 \rightarrow 27 / 80\text{ HP}$) y la cola avanza a `(1) 5 9 2 ...`
  * Al mismo tiempo, la Cuchilla Exponencial de $e^x$ corta a $\pi$ en su parte baja: inflige **$-4\text{ HP}$** directos ($\pi$ baja de $33 \rightarrow 29 / 75\text{ HP}$) e inicia **Quemadura** ($-2\text{ HP}$ por tick).
* `00:20` **[4.º Corte de Sector ($\theta = \pi$) + 4.º Impacto de Cola Decimal `(1)`]:**
  * $\pi$ sufre dos ticks de quemadura ($-2$ y $-2\text{ HP}$, bajando de $29 \rightarrow 25 / 75\text{ HP}$).
  * $e^x$ está encima de $\pi$ y recibe simultáneamente el `¡Corte de Sector!` de $\theta = \pi$ (**$-15\text{ HP}$**) y el toque del dígito activo `(1)` (**$-1\text{ HP}$**), perdiendo $-16\text{ HP}$ en total ($e^x$ cae de $27 \rightarrow 11 / 80\text{ HP}$).
  * Se muestra $S = \frac{1}{2}r^2\theta = 2\pi$, el sector de $\pi$ alcanza su fase máxima de círculo completo de $360^\circ$ ($\theta = 2\pi$) y la cola de $\pi$ avanza a `(5) 9 2 6 ...`
* `00:21` **[3.º Impacto de Cuchilla Exponencial sobre $\pi$]:**
  * Mientras $\pi$ sigue quemándose, $e^x$ vuelve a cortarlo con la Cuchilla Exponencial infligiendo $-4$ y $-6$ (**$-10\text{ HP}$** directos) más dos ticks de quemadura de $-2\text{ HP}$ ($\pi$ cae de $25 \rightarrow 11 / 75\text{ HP}$ en `00:21` y luego a $7 / 75\text{ HP}$ en `00:22` tras dos últimos ticks de $-2\text{ HP}$).
* `00:22` **[5.º Corte de Sector ($\theta = 2\pi$) + 5.º Impacto de Cola Decimal `(5)` - Golpe Final]:**
  * En el cuadrante superior izquierdo, $e^x$ (con $11\text{ HP}$) entra en el círculo completo $\theta = 2\pi$ de $\pi$ y toca el dígito `(5)`.
  * Recibe **$-15\text{ HP}$** del sector y **$-5\text{ HP}$** del dígito `(5)` ($-20\text{ HP}$ totales).
  * $e^x$ cae a $0 / 80\text{ HP}$ (`[DEAD]`), el sector de $\pi$ se reinicia a $\theta = \frac{\pi}{6}$, su cola avanza al dígito `(9)` y $\pi$ gana la partida con $7\text{ HP}$ restantes.

---

## 6. Batería de Pruebas (QA Tests) para Validar la Implementación

Ejecuta estos casos de prueba para verificar que la lógica del nivel cumple cada regla sin ambigüedades:

* **Test 1: Verificación de Secuencia y Daño Exacto de la Cola Decimal ($3, 1, 4, 1, 5, 9$)**
  * *Acción:* Desactivar temporalmente el sector circular de $\pi$ y hacer que $e^x$ toque únicamente el nodo del dígito activo de la cola de $\pi$ seis ($6$) veces consecutivas.
  * *Resultado esperado:* $e^x$ debe perder exactamente $-3, -1, -4, -1, -5\text{ y }-9\text{ HP}$ en cada toque respectivo (restando $23\text{ HP}$ en total, pasando de $80 \rightarrow 57\text{ HP}$), y el dígito encerrado en el círculo debe actualizarse en ese mismo orden estricto.

* **Test 2: Progresión Angular y Reinicio del Sector Circular ($\theta$)**
  * *Acción:* Hacer que $e^x$ entre en el área del sector circular de $\pi$ cinco ($5$) veces seguidas (dejando pasar el cooldown interno entre impactos).
  * *Resultado esperado:*
    1. En los $5$ impactos, el daño del sector debe ser siempre constante de **$-15\text{ HP}$**.
    2. El ángulo del cono físico debe crecer en la secuencia estricta: $30^\circ (\frac{\pi}{6}) \rightarrow 60^\circ (\frac{\pi}{3}) \rightarrow 90^\circ (\frac{\pi}{2}) \rightarrow 180^\circ (\pi) \rightarrow 360^\circ (2\pi)$.
    3. Inmediatamente después del quinto impacto (con $\theta = 2\pi$), el sector debe volver a encogerse a $30^\circ (\frac{\pi}{6})$.

* **Test 3: Independización de Hitboxes (Sector vs. Cola Decimal)**
  * *Acción:* Posicionar a $\pi$ con el sector $\theta = \frac{\pi}{6}$ apuntando hacia la derecha $(0^\circ)$ y la cola decimal colgando hacia la izquierda $(180^\circ)$. Hacer que $e^x$ toque la cola por la izquierda y se retire sin tocar el cono derecho.
  * *Resultado esperado:* $e^x$ debe recibir únicamente el daño del dígito activo (ej. $-3\text{ HP}$), sin activar el `¡Corte de Sector!` ni recibir los $-15\text{ HP}$ ni hacer evolucionar el ángulo $\theta$.

* **Test 4: Daño Simultáneo Acumulable (Sector + Dígito en el mismo Frame)**
  * *Acción:* Cuando $\pi$ esté en fase $\theta = \pi$ o $\theta = 2\pi$ (donde el sector cubre también la zona de la cola decimal), hacer que $e^x$ choque directamente contra el dígito activo `(1)` dentro del sector.
  * *Resultado esperado:* Ambos triggers deben resolverse de forma independiente y aditiva en el mismo encuentro, restando $-15\text{ HP}$ (del sector) + $-1\text{ HP}$ (del dígito) = **$-16\text{ HP}$** totales a $e^x$.