# Feature 08: Operadores Derivada Parcial (∂/∂y) y Multivariable

**Épica:** `EPIC-02: Entidades Matemáticas y Reglas de Combate (Math Rules)`  
**Módulo:** `src/core/entities/DifferentialOperator.ts`  
**Estado:** Especificado  

## Descripción General
Modela el operador de derivada parcial respecto a la variable $y$ ($\frac{\partial}{\partial y}$) con radio constante, color verde esmeralda `#00C853` y 100 HP, evaluando a cualquier función independiente de $y$ (como $e^x$) como una constante matemática, resultando en su derivada idénticamente nula ($\frac{\partial}{\partial y}(e^x) = 0$).

---

### Historia de Usuario HU-15: Aniquilación letal de variables independientes ∂/∂y(e^x) = 0
*Como operador de derivada parcial $\frac{\partial}{\partial y}$,*  
*Quiero aniquilar instantáneamente en un solo golpe a cualquier función dependiente únicamente de $x$,*  
*Para reflejar fielmente la regla del cálculo multivariable donde las variables ajenas se tratan como constantes puras.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Colisión directa letal contra e^x
  Dada la entidad $\frac{\partial}{\partial y}$ con vida 100 / 100
  Y la entidad $e^x$ con vida 80 / 80
  Cuando ambas esferas colisionan directamente en la arena
  Entonces se evalúa formalmente la derivada parcial $\frac{\partial}{\partial y}(e^x) = 0$
  Y DEBE mostrarse un texto central verde grande "\frac{\partial}{\partial y}(e^x) = 0"
  Y DEBE infligir exactamente -80 HP de daño crítico directo a $e^x$
  Y la entidad $e^x$ DEBE vaciar su barra de salud a 0/80 y desintegrarse en partículas.
```

---

### Historia de Usuario HU-16: Derivadas parciales con regla de la cadena (e^(xy))
*Como jugador o entidad multivariable,*  
*Quiero que funciones compuestas multivariables como $e^{xy}$ apliquen la regla de la cadena $\frac{\partial}{\partial y}(e^{xy}) = x \cdot e^{xy}$,*  
*Para resistir el impacto generando una esfera multiplicadora $x$ en lugar de morir en un solo golpe.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Colisión contra función compuesta dependiente de ambas variables
  Dada la entidad multivariable $e^{xy}$
  Cuando $\frac{\partial}{\partial y}$ colisiona contra ella
  Entonces NO DEBE morir de un solo golpe
  Y DEBE generarse una esfera orbital dependiente de $x$ que absorbe 50 puntos del impacto crítico
  Y reducir el daño a -30 HP.
```
