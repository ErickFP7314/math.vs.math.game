# Feature 12: Niveles de Expansión (Euler, Logaritmo, L'Hôpital)

**Épica:** `EPIC-02: Entidades Matemáticas y Reglas de Combate (Math Rules)`  
**Módulo:** `src/core/levels/LevelRegistry.ts` (Niveles 10 al 14)  
**Estado:** Especificado  

## Descripción General
Especifica los niveles y mecánicas avanzadas diseñadas como expansión del catálogo original, incluyendo la batalla épica de la Identidad de Euler ($e^{i\pi} + 1 = 0$), las singularidades asintóticas del Logaritmo Natural ($\ln x$), y la regla de L'Hôpital frente a indeterminaciones de tipo $\frac{0}{0}$.

---

### Historia de Usuario HU-23: Gran Final de Euler (e^(iπ) + 1 = 0)
*Como jugador enfrentando el combate culminante,*  
*Quiero rotar como un fasor en el plano complejo $e^{i\theta} = \cos \theta + i \sin \theta$ y fusionarme con $+1$ cuando $\theta = \pi$,*  
*Para desatar la legendaria aniquilación de Euler y limpiar la arena de proyectiles enemigos.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Activación de la identidad de Euler
  Dado que el ángulo del fasor $\theta$ alcanza $\pi$ radianes
  Y la entidad se ubica en $e^{i\pi} = -1$
  Cuando colisiona con el orbe central "+1"
  Entonces se evalúa la identidad fundamental $e^{i\pi} + 1 = 0$
  Y DEBE desencadenarse una onda armónica dorada que elimina todos los proyectiles hostiles en pantalla.
```

---

### Historia de Usuario HU-24: Singularidades de Logaritmo y L'Hôpital
*Como entidad en niveles avanzados,*  
*Quiero experimentar distorsiones gravitatorias en $x \le 0$ para $\ln x$ y zonas de indeterminación $\frac{0}{0}$,*  
*Para desafiar mi dominio del cálculo avanzado y los límites analíticos.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Singularidad asintótica de ln(x)
  Dada la arena con el operador $\ln(x)$ activo
  Cuando una entidad cruza hacia la región $x \le 0.1$
  Entonces experimenta una fuerza de atracción asintótica hacia el eje Y
  Y las trayectorias lineales se curvan en hipérbolas $\frac{1}{x}$.
```
