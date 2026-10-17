# Feature 02: Cinemática Vectorial 2D y Rebote Elástico

**Épica:** `EPIC-01: Motor Físico y Núcleo de Simulación (Core Engine)`  
**Módulo:** `src/core/physics/Vector2D.ts` y `src/core/physics/ElasticSolver.ts`  
**Estado:** Especificado  

## Descripción General
Implementa la estructura matemática de vectores bidimensionales euclidianos y el solucionador de choques elásticos entre esferas que conservan la energía cinética y la cantidad de movimiento lineal total, sin gravedad ni fricción, tal como lo definen las especificaciones originales.

---

### Historia de Usuario HU-03: Operaciones vectoriales euclidianas puras
*Como desarrollador del motor físico,*  
*Quiero una librería inmutable de vectores 2D con suma, resta, producto punto, magnitud, normalización y rotación,*  
*Para modelar con exactitud analítica los vectores de posición y velocidad de las esferas matemáticas.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Normalización de un vector no nulo
  Dado un vector V con coordenadas (x: 3, y: 4)
  Cuando se calcula su magnitud y su normalización
  Entonces la magnitud DEBE ser exactamente 5.0
  Y el vector normalizado DEBE ser (x: 0.6, y: 0.8) con magnitud 1.0.

Escenario: Producto escalar y perpendicularidad
  Dado un vector A = (x: 1, y: 0) y un vector B = (x: 0, y: 1)
  Cuando se calcula el producto punto A · B
  Entonces el resultado DEBE ser 0.0.
```

---

### Historia de Usuario HU-04: Conservación de cantidad de movimiento en colisiones de esferas
*Como jugador,*  
*Quiero que las esferas que chocan entre sí reboten de forma elástica y natural,*  
*Para predecir visualmente la trayectoria de las entidades y esquivar o conectar ataques según las leyes de la física.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Colisión elástica frontal 1D entre dos esferas de igual masa
  Dado que la esfera A tiene masa 1.0, posición (0, 0) y velocidad (10, 0)
  Y la esfera B tiene masa 1.0, posición (2, 0) y velocidad (-10, 0)
  Cuando se resuelve la colisión elástica en el punto de contacto
  Entonces la nueva velocidad de la esfera A DEBE ser (-10, 0)
  Y la nueva velocidad de la esfera B DEBE ser (10, 0)
  Y no DEBE haber penetración geométrica residual entre los radios de ambas esferas.
```
