# Feature 17: Agente Táctico de IA para la Máquina

**Épica:** `EPIC-04: Controles de Jugador y Agente de Inteligencia Artificial (AI & Inputs)`  
**Módulo:** `src/core/ai/AIAgent.ts` y `TacticalHeuristics.ts`  
**Estado:** Especificado  

## Descripción General
Modela el agente inteligente que controla al oponente en el modo 1P vs. Machine, tomando decisiones de activación de habilidades y evasión vectorial según heurísticas de distancia, cooldowns y predicción geométrica de trayectorias.

---

### Historia de Usuario HU-33: Algoritmo heurístico de evasión de peligros y rayos
*Como agente de IA,*  
*Quiero detectar si un haz láser, cuchilla o proyectil cruzará mi radio en los próximos frames,*  
*Para aplicar una maniobra evasiva perpendicular a la amenaza.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Detección y evasión de haz de láser telegrafiado
  Dado que una entidad oponente activa una habilidad con fase de advertencia
  Cuando la IA calcula que su posición colisionará con el haz proyectado
  Entonces la IA aplica un impulso cinemático en dirección perpendicular al haz
  Para abandonar la zona de peligro antes de que transcurran los 0.8 s de disparo.
```

---

### Historia de Usuario HU-34: Detección de oportunidad y activación óptima de ataques
*Como agente de IA,*  
*Quiero esperar a que el jugador se encuentre dentro del cono o trayectoria de mi habilidad lista,*  
*Para detonarla en el momento de mayor probabilidad de impacto directo.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Disparo de Cuchilla Exponencial por la IA
  Dada la habilidad de Cuchilla Exponencial de la IA en estado [READY]
  Cuando el jugador se ubica a una distancia donde la curva matemática $y = e^x$ lo intersectaría
  Entonces la IA dispara la habilidad de inmediato
  Maximizando el daño directo y la aplicación de quemadura.
```
