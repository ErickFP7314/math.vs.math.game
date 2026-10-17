# Feature 14: HUD Reactivo con Fórmulas KaTeX

**Épica:** `EPIC-03: Presentación Visual, HUD y Audio (Presentation Layer)`  
**Módulo:** `src/ui/components/HeaderHUD.tsx`, `HPBar.tsx` y `FloatingMathText.tsx`  
**Estado:** Especificado  

## Descripción General
Despliega la capa de interfaz de usuario montada en React 19 sobre el lienzo de PixiJS, incluyendo los avatares circulares del Header con etiquetas tipográficas en coreano/español, barras de HP dinámicas con indicación de daño en rojo, medidores de tiempo de recarga y fórmulas matemáticas de impacto renderizadas a alta velocidad mediante KaTeX.

---

### Historia de Usuario HU-27: Barras de HP y contadores temáticos dinámicos
*Como jugador,*  
*Quiero ver barras de vida claras con colores temáticos para cada bando y etiquetas contextuales,*  
*Para conocer el estado exacto de salud y los intentos o habilidades activas en todo momento.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Header y barras en Nivel 1 (d/dx vs x^3)
  Dado el inicio de la partida en el Nivel 1
  Entonces el avatar izquierdo muestra el círculo cian con "d/dx" y etiqueta "미분"
  Y el avatar derecho muestra el círculo naranja con "x^3" y etiqueta "x^3"
  Y la barra izquierda inicia en "100 / 100" cian "#00ACC1" con etiqueta "[READY]"
  Y la barra derecha inicia en "16 / 16" naranja "#F4511E" con etiqueta alternante "[공 N개]" y "[그래프 소환!]".

Escenario: Muestra de daño recibido en rojo
  Cuando una entidad pierde puntos de salud
  Entonces el tramo de vida descontado DEBE mostrarse temporalmente en rojo brillante
  Antes de encogerse suavemente a su nuevo valor numérico.
```

---

### Historia de Usuario HU-28: Avisos flotantes de fórmulas matemáticas evaluadas
*Como espectador o jugador,*  
*Quiero que cada interacción matemática clave despliegue un texto flotante renderizado en LaTeX con KaTeX,*  
*Para aprender y visualizar la belleza del cálculo matemático durante la acción del juego.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Notificación flotante de derivada
  Cuando d/dx colisiona contra x^3
  Entonces KaTeX compila y renderiza en pantalla el texto "3x^2" con tipografía de cálculo
  Y el elemento flota hacia arriba desvaneciéndose en 1.2 segundos con efecto alfa.
```
