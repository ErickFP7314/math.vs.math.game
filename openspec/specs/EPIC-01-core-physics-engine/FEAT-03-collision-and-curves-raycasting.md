# Feature 03: Detección de Colisiones y Trazado de Curvas Analíticas

**Épica:** `EPIC-01: Motor Físico y Núcleo de Simulación (Core Engine)`  
**Módulo:** `src/core/physics/CollisionDetector.ts` y `src/core/math/Curves.ts`  
**Estado:** Especificado  

## Descripción General
Modela el confinamiento de las entidades dentro de la caja cartesiana vertical de proporción 9:16 e implementa algoritmos analíticos de intersección entre esferas y curvas geométricas continuas (cúbicas, parábolas, curvas exponenciales, ondas senoidales y sectores circulares).

---

### Historia de Usuario HU-05: Colisión con límites de la arena cartesiana 9:16
*Como entidad en la arena,*  
*Quiero rebotar de forma elástica al alcanzar las paredes laterales, superior o inferior del plano cartesiano,*  
*Para permanecer siempre confinada dentro del área de juego visible.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Rebote en pared derecha
  Dada una arena cartesiana con límites en X de [-50, +50]
  Y una esfera de radio 5 centrada en X = 46 con velocidad Vx = +10
  Cuando avanza el paso de tiempo físico
  Entonces la esfera detecta colisión con el límite derecho X = +50
  Y su velocidad Vx DEBE invertirse a -10
  Y su posición en X DEBE corregirse a 45 para evitar sobrepaso.
```

---

### Historia de Usuario HU-06: Intersección círculo contra curvas paramétricas y láseres
*Como operador diferencial o entidad enemiga,*  
*Quiero que el motor calcule si mi esfera toca una curva matemática activa o rayo láser,*  
*Para recibir daño con precisión geométrica milimétrica.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Detección de impacto de Cuchilla Exponencial
  Dada una curva exponencial activa $y - y_0 = e^{x - x_0}$ anclada en $(x_0: 0, y_0: 0)$
  Y una esfera de radio 3 ubicada en $(x: 1, y: 2.718)$
  Cuando el motor evalúa la distancia mínima euclidiana de la esfera a la curva
  Entonces la distancia resulta menor que el radio de la esfera (3)
  Y el motor DEBE registrar un evento de impacto por Cuchilla Exponencial.
```
