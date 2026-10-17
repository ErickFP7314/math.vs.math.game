# Feature 09: Operador Integral (∫) y Proliferación Polinómica

**Épica:** `EPIC-02: Entidades Matemáticas y Reglas de Combate (Math Rules)`  
**Módulo:** `src/core/entities/IntegralEntity.ts`  
**Estado:** Especificado  

## Descripción General
Modela el operador integral indefinido $\int$ ($HP = 80$, color ámbar `#FB8C00`), su apéndice orbital rotatorio en forma de símbolo integral, la generación de constantes de integración $C_n$ tras cada choque contra $e^x$, la elevación de grado de sus esferas aliadas hasta grado 7 ($\frac{C_1}{5040}x^7$) y el ataque manual "Látigo Integral".

---

### Historia de Usuario HU-17: Integración indefinida y generación de constantes Cn
*Como operador integral $\int$,*  
*Quiero que al chocar contra $e^x$ se aplique $\int e^x dx = e^x + C_n$,*  
*Para engendrar una nueva esfera constante aliada $C_n$ en la arena sin dañar directamente a $e^x$.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Integración de la exponencial
  Dado que $\int$ colisiona contra $e^x$
  Entonces el HP de $e^x$ no disminuye
  Y DEBE mostrarse la fórmula flotante "\int e^x dx = e^x + C_n"
  Y DEBE instanciarse en la arena una nueva esfera de constante $C_n$ con 1 HP
  Y el índice de la constante DEBE incrementarse consecutivamente (C_1, C_2, ... C_44).
```

---

### Historia de Usuario HU-18: Elevación de grado polinómico sucesivo y Látigo Integral
*Como operador $\int$,*  
*Quiero que chocar contra mis esferas aliadas eleve su grado algebraico e invocar el Látigo Integral,*  
*Para desatar una lluvia masiva de lásers polinómicos que derrote a $e^x$.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Integración de un monomio aliado
  Dada una esfera aliada de monomio $C_n x^k$
  Cuando $\int$ colisiona contra ella
  Entonces la esfera se eleva a grado $k+1$ aplicando $\int C_n x^k dx = \frac{C_n}{k+1}x^{k+1} + C_m$
  Y DEBE crearse una constante $C_m$ adicional en la arena
  Y periódicamente las esferas aliadas DEBEN disparar lásers de su forma geométrica dañando a $e^x$ (-4 a -8 HP).

Escenario: Látigo Integral tras recarga
  Dado que han transcurrido 5 segundos de recarga y el HUD indica "[∫ 채찍 준비]"
  Cuando el jugador o la IA activa la habilidad
  Entonces el apéndice orbital ejecuta un azote de amplio rango infligiendo -12 HP totales a $e^x$
  Y generando una constante $C_n$ instantánea.
```
