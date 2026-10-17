# Feature 05: Entidades Polinómicas (x^3, x^2, x, 1) y Gráficos Láser

**Épica:** `EPIC-02: Entidades Matemáticas y Reglas de Combate (Math Rules)`  
**Módulo:** `src/core/entities/PolynomialEntity.ts`  
**Estado:** Especificado  

## Descripción General
Modela el equipo de funciones polinómicas, su barra compartida de salud global (16 HP), su jerarquía de radios y colores según el grado algebraico, y su habilidad especial manual "Invocación de Gráfico" con fase de advertencia y disparo de láseres.

---

### Historia de Usuario HU-09: Subdivisión polinómica y barra global de 16 HP
*Como equipo polinómico,*  
*Quiero compartir una reserva de salud global de 16 puntos de vida,*  
*Para que cada derivación sufrida reste exactamente 1 punto a la barra general hasta llegar a 0.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Colisión de derivada reduce salud global
  Dada una barra de salud global del equipo polinómico en 16 / 16
  Cuando cualquier esfera del equipo (ya sea x^3, x^2, x o 1) sufre un impacto de d/dx
  Entonces la salud global DEBE decrementarse en 1 punto (15 / 16)
  Y la etiqueta inferior DEBE actualizarse a "[공 N개]" con el conteo de esferas activas.

Escenario: Jerarquía de radios y tonos de color
  Dado el equipo polinómico en combate
  Entonces una esfera de grado 3 ($x^3$) DEBE tener radio grande y color naranja oscuro "#FF7043"
  Y las esferas de grado 2 ($x^2$) DEBEN tener radio mediano y color naranja medio
  Y las esferas de grado 1 ($x$) DEBEN tener radio intermedio y color naranja claro
  Y las esferas de grado 0 ($1$) DEBEN tener radio pequeño y color amarillo ámbar "#FFD54F".
```

---

### Historia de Usuario HU-10: Invocación de gráfico y disparo de haces láser
*Como jugador o IA controlando al polinomio,*  
*Quiero activar manualmente la habilidad de "Invocación de Gráfico" tras 3 a 4 segundos de recarga,*  
*Para disparar haces láser que sigan la forma matemática de cada esfera activa y dañen a $\frac{d}{dx}$.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Activación de Invocación de Gráfico con telegrafiado
  Dado que el tiempo de recarga ha expirado y la etiqueta indica "[그래프 소환!]"
  Cuando el usuario o la IA activa la habilidad
  Entonces durante los primeros 0.8 segundos cada esfera DEBE trazar una línea guía marrón/naranja anclada en su centro
  Y transcurridos los 0.8 segundos las líneas DEBEN transformarse en láseres brillantes
  Y si un láser de $x^2$ impacta a d/dx, DEBE infligir exactamente -23 HP de daño
  Y si un láser de $x$ o $1$ impacta a d/dx, DEBE infligir exactamente -18 HP de daño.
```
