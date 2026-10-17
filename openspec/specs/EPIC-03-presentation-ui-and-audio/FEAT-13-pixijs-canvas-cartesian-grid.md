# Feature 13: Lienzo PixiJS v8 y Cuadrícula Cartesiana

**Épica:** `EPIC-03: Presentación Visual, HUD y Audio (Presentation Layer)`  
**Módulo:** `src/render/PixiStage.ts` y `src/render/CartesianGrid.ts`  
**Estado:** Especificado  

## Descripción General
Implementa la capa gráfica basada en WebGL/WebGPU mediante PixiJS v8 para renderizar el cuadrilátero vertical 9:16 con fondo blanco `#FFFFFF`, marco perimetral gris oscuro `#333333`, ejes coordenados $x$ e $y$ con origen $O$, marcas graduadas y subcuadrícula de $10 \times 10$ divisiones en gris tenue `#EEEEEE`, además de interpolación de movimiento para pantallas de 60 a 144 Hz.

---

### Historia de Usuario HU-25: Renderizado del plano cartesiano 9:16 con graduación y origen
*Como jugador,*  
*Quiero ver un plano cartesiano elegante y limpio con proporciones verticales de video móvil (9:16),*  
*Para sentirme inmerso en una auténtica batalla dentro de una hoja milimetrada de cálculo.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Inicialización de la vista cartesiana
  Dado el inicio de la partida en cualquier resolución de pantalla
  Cuando PixiStage ajusta el viewport
  Entonces el área de combate DEBE mantener una relación de aspecto vertical exacta de 9:16
  Y el fondo DEBE ser blanco puro "#FFFFFF" con borde perimetral "#333333"
  Y los ejes centrales X e Y DEBEN estar claramente marcados con graduaciones uniformes
  Y las subdivisiones de la cuadrícula DEBEN renderizarse en tono tenue "#EEEEEE".
```

---

### Historia de Usuario HU-26: Interpolación de movimiento (Lerp) para 60-120 FPS
*Como usuario con pantalla de alta tasa de refresco (90Hz, 120Hz o 144Hz),*  
*Quiero que el movimiento de las esferas se vea perfectamente suave y continuo sin tirones,*  
*Para disfrutar de una experiencia visual de máxima fluidez.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Interpolación de posición entre ticks físicos
  Dado que el motor físico avanza a 60 ticks por segundo
  Y el navegador renderiza a 120 FPS
  Cuando se dibuja un frame intermedio con factor de interpolación alpha = 0.5
  Entonces la posición visual del sprite DEBE calcularse como:
    PosVisual = PosAnterior * (1 - alpha) + PosActual * alpha
  Y no DEBE haber saltos perceptibles ni vibraciones de cámara.
```
