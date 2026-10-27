# Prompt de Sistema: Implementación de Nivel ($e^x$ vs. Unidad Imaginaria $i$)

---

## 1. Configuración Inicial y Entidades

*   **Entorno:** Arena cuadrada con rebote elástico perfecto en los 4 bordes (sin fricción ni pérdida de velocidad al rebotar contra las paredes).
*   **Movimiento Base:** Ambas entidades son círculos con el mismo radio y velocidad constante, moviéndose en línea recta hasta colisionar con un borde o entre sí (salvo cuando el Enemigo está en estado intangible).
*   **Entidad 1: Jugador (Izquierda - $e^x$)**
    *   **HP Máximo:** $80\text{ HP}$.
    *   **Posición inicial:** $(-x, 0)$.
*   **Entidad 2: Enemigo / CPU (Derecha - $i$)**
    *   **HP Máximo:** $50\text{ HP}$.
    *   **Posición inicial:** $(+x, 0)$.

---

## 2. Mecánicas del Jugador ($e^x$)

### Habilidad Activa: "Cuchilla Exponencial" (Exponential Blade)
*   **Ciclo de Enfriamiento (Cooldown):** $3\text{ segundos}$ entre usos (al iniciar la partida tras la cuenta regresiva, el primer cooldown es de $1\text{ segundo}$).
*   **Fase 1 - Trazado (Duración: $1\text{ segundo}$):**
    *   Se dibuja una curva exponencial en toda la arena siguiendo la función $y = e^x + c$, donde la asíntota horizontal (línea punteada) se ajusta para que la curva pase exactamente por las coordenadas $(x, y)$ actuales del Jugador, actualizándose en tiempo real mientras este se mueve.
    *   Durante esta fase la línea es solo un indicador y no tiene hitbox.
*   **Fase 2 - Corte / Rayo (Instantáneo al terminar la Fase 1):**
    *   La curva se fija y ejecuta un corte (rayo) a lo largo de su trayectoria.
    *   **Hitbox:** Toda la extensión de la curva $y = e^x + c$.
    *   **Efecto al impactar al Enemigo:**
        1.  **Daño Directo Escalable:** Inflige daño instantáneo proporcional al valor de la pendiente/altura de la curva en el punto de impacto (o posición en el eje $X$). En la parte derecha alta inflige daño masivo (ej. $-21\text{ HP}$), mientras que en la parte baja/plana inflige daño reducido (ej. $-4\text{ HP}$).
        2.  **Efecto de Estado "Quemadura" (DoT):** Si el rayo impacta en la sección baja/plana de la curva (cerca de la asíntota), aplica el estado *Quemadura* al Enemigo durante $3\text{ segundos}$.
            *   La Quemadura inflige $-2\text{ HP}$ por tick en intervalos rápidos (~$0.5\text{s}$) y genera pequeños proyectiles/chispas desde el cuerpo del Enemigo.

---

## 3. Mecánicas del Enemigo ($i$) - Máquina de Estados Cíclica

El Enemigo cicla automáticamente entre **4 estados matemáticos** cada **$3\text{ segundos}$**, multiplicando su valor actual por $i$ en cada transición:

### Estado 1: $[i]$ - Penetración (Intangible)
*   **Duración:** $3\text{s}$ (Estado inicial).
*   **Física de Colisión:** **Desactivada contra el Jugador.** El Enemigo atraviesa el cuerpo del Jugador sin rebotar.
*   **Daño por Contacto:** Al atravesar (superponerse) al Jugador, le inflige **$-8\text{ HP}$** (con un breve cooldown interno de inmunidad por contacto para no drenar toda la vida en un solo cruce).

### Estado 2: $[-1]$ - Reflexión ($i \times i = -1$)
*   **Duración:** $3\text{s}$.
*   **Física de Colisión:** **Sólida (Rebote elástico normal)** contra el Jugador. No inflige daño por contacto físico.
*   **Propiedad Especial (Escudo Reflector):**
    *   Si es golpeado por la *Cuchilla Exponencial* del Jugador, **refleja el $100\%$ del daño** de vuelta al Jugador (ej. si el rayo hacía $20$ de daño, el Enemigo recibe $0$ y el Jugador recibe $-20\text{ HP}$).
    *   Si el Enemigo tiene *Quemadura* activa durante este estado, cada tick de $-2\text{ HP}$ (o chispa de quemadura) se **invierte** ($\times(-1)$): el Enemigo se **cura $+2\text{ HP}$** por tick y le refleja **$-2\text{ HP}$** de daño al Jugador.

### Estado 3: $[-i]$ - Penetración + Reflexión ($-1 \times i = -i$)
*   **Duración:** $3\text{s}$.
*   **Física de Colisión:** **Desactivada contra el Jugador (Intangible).**
*   **Daño por Contacto:** Atraviesa al Jugador infligiendo **$-8\text{ HP}$**.
*   **Propiedad Especial (Escudo Reflector):** Mantiene la propiedad de reflexión total del Estado 2. Si el rayo exponencial lo toca, el Enemigo no recibe daño y el Jugador recibe todo el daño reflejado (en el video se observa reflejar $-4$ y $-5$ simultáneamente por un total de $-9\text{ HP}$).

### Estado 4: $[1]$ - Normal ($-i \times i = 1$)
*   **Duración:** $3\text{s}$. (Al terminar, vuelve al Estado 1: $1 \times i = i$).
*   **Física de Colisión:** **Sólida (Rebote elástico normal)** contra el Jugador.
*   **Propiedades:** Sin habilidades especiales. No hace daño por contacto y es totalmente vulnerable al rayo del Jugador.

---

## 4. Matriz Resumen de Interacciones y Colisiones

| Estado del Enemigo | Colisión Cuerpo a Cuerpo ($e^x$ vs Enemigo) | Colisión con Rayo ($y = e^x + c$) | Interacción con Quemadura (DoT) |
| :--- | :--- | :--- | :--- |
| **$[i]$ Penetración** | Atraviesa sin rebote. Jugador recibe **$-8\text{ HP}$**. | Enemigo recibe daño directo ($4$ a $21$) + posible Quemadura. | Enemigo recibe **$-2\text{ HP}$** por tick. |
| **$[-1]$ Reflexión** | Rebote físico normal. **$0$ daño** a ambos. | Enemigo recibe $0$ daño. Jugador recibe **daño reflejado**. | Enemigo se cura **$+2\text{ HP}$** y Jugador recibe **$-2\text{ HP}$** por tick. |
| **$[-i]$ Penetración + Reflexión** | Atraviesa sin rebote. Jugador recibe **$-8\text{ HP}$**. | Enemigo recibe $0$ daño. Jugador recibe **daño reflejado**. | Enemigo se cura **$+2\text{ HP}$** y Jugador recibe **$-2\text{ HP}$** por tick. |
| **$[1]$ Normal** | Rebote físico normal. **$0$ daño** a ambos. | Enemigo recibe daño directo + posible Quemadura. | Enemigo recibe **$-2\text{ HP}$** por tick. |

---

## 5. Condición de Fin de Juego
*   Cuando el HP de cualquiera de las dos entidades llega a $0$, la entidad derrotada se destruye (estado `[DEAD]`), se detienen los temporizadores de habilidades y se declara ganador al sobreviviente mostrando su HP restante.
