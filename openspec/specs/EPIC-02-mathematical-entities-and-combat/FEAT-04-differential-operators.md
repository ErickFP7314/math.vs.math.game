# Feature 04: Operador Diferencial (d/dx)

**Épica:** `EPIC-02: Entidades Matemáticas y Reglas de Combate (Math Rules)`  
**Módulo:** `src/core/entities/DifferentialOperator.ts`  
**Estado:** Especificado  

## Descripción General
Modela la entidad del operador diferencial ordinario $\frac{d}{dx}$, su vida base de 100 HP, su estela de color cian `#00ACC1` y su mecánica de ataque pasivo por impacto físico: evaluar la derivada de la función o polinomio contra el cual colisiona.

---

### Historia de Usuario HU-07: Impacto y reducción de grado por derivada
*Como operador $\frac{d}{dx}$,*  
*Quiero que al chocar contra una función $f(x)$ se calcule automáticamente su derivada formal $f'(x)$,*  
*Para reducir el grado de los polinomios o aplicar las reglas matemáticas particulares de cada entidad.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Colisión contra monomio $x^3$
  Dado que $\frac{d}{dx}$ colisiona con una esfera de grado 3 ($x^3$)
  Cuando se evalúa la regla de derivación $\frac{d}{dx}(x^3) = 3x^2$
  Entonces el contador de derivaciones "[미분 N회]" DEBE incrementarse en 1
  Y la esfera $x^3$ DEBE fragmentarse en exactamente 3 esferas de grado 2 ($x^2$)
  Y el evento "MATH_FORMULA_TRIGGERED" DEBE publicarse con la fórmula "3x^2".

Escenario: Colisión contra constante numérica 1
  Dado que $\frac{d}{dx}$ colisiona con una esfera de grado 0 (constante 1)
  Cuando se evalúa $\frac{d}{dx}(1) = 0$
  Entonces la esfera DEBE destruirse con una onda expansiva
  Y desaparecer de la simulación.
```

---

### Historia de Usuario HU-08: Gestión de salud y estela cian
*Como operador $\frac{d}{dx}$,*  
*Quiero poseer 100 puntos de salud iniciales y un rastro visual continuo de trayectoria,*  
*Para que el jugador reconozca su posición y estado vital en la arena.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Inicialización de la entidad
  Dado el inicio del combate
  Entonces la entidad $\frac{d}{dx}$ DEBE instanciarse con HP = 100 y MaxHP = 100
  Y su etiqueta inferior DEBE indicar "[READY]"
  Y su color primario DEBE ser cian "#00ACC1".
```
