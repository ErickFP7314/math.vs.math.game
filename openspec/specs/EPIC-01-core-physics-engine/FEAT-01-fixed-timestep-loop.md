# Feature 01: Bucle de Tiempo Fijo y Acumulador (Fixed Timestep Loop)

**Épica:** `EPIC-01: Motor Físico y Núcleo de Simulación (Core Engine)`  
**Módulo:** `src/core/engine/GameLoop.ts`  
**Estado:** Especificado  

## Descripción General
El bucle principal de simulación del juego DEBE ejecutarse con una frecuencia fija de actualización de 60 Hz ($\Delta t = \frac{1}{60} \approx 0.016667 \text{ s}$), utilizando un patrón de acumulador de tiempo. Esto garantiza que la física matemática sea 100% determinista e inmune a las fluctuaciones de tasa de cuadros por segundo (FPS) del monitor del usuario o lag en el hilo principal del navegador.

---

### Historia de Usuario HU-01: Ejecución determinista a 60 Hz independiente de FPS
*Como motor de simulación,*  
*Quiero avanzar el estado del mundo en incrementos exactos de $\Delta t = 16.666 \text{ ms}$,*  
*Para que las trayectorias de rebote y las colisiones matemáticas sean idénticas sin importar si el usuario tiene una pantalla de 60Hz, 120Hz o sufre caídas de framerate.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: El frame del navegador demora 33.33 ms (30 FPS)
  Dado que el acumulador de tiempo del bucle se encuentra en 0 ms
  Cuando transcurre un frame de renderizado de 33.33 ms
  Entonces el motor de simulación DEBE ejecutar exactamente 2 pasos físicos de 16.666 ms
  Y el tiempo acumulado restante DEBE ser aproximadamente 0 ms.

Escenario: El frame del navegador demora 8.33 ms (120 FPS)
  Dado que el acumulador de tiempo del bucle se encuentra en 0 ms
  Cuando transcurre un frame de renderizado de 8.33 ms
  Entonces el motor de simulación NO DEBE ejecutar ningún paso físico en ese frame
  Y el acumulador DEBE retener los 8.33 ms para el siguiente frame.

Escenario: Prevención de espiral de la muerte (Spiral of Death)
  Dado que la pestaña del navegador estuvo en segundo plano durante 5 segundos
  Cuando el usuario regresa a la pestaña
  Entonces el motor de simulación DEBE limitar el acumulador a un máximo de 250 ms (15 pasos)
  Para evitar congelar el hilo principal de JavaScript.
```

---

### Historia de Usuario HU-02: Instantáneas de estado inmutables (Snapshots)
*Como adaptador de renderizado o servidor multijugador,*  
*Quiero consultar una instantánea inmutable del estado del mundo en cada tick,*  
*Para poder interpolar visualmente las posiciones o transmitirlas sin mutar el estado interno de la física.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Generación de snapshot tras un tick físico
  Dado que la entidad "d/dx" se encuentra en la posición (x: 10, y: 20) con velocidad (vx: 5, vy: -5)
  Cuando se completa el tick físico número 100
  Entonces el método getStateSnapshot() DEBE retornar un objeto serializable
  Y modificar dicho objeto NO DEBE afectar la posición interna de la entidad en el motor.
```
