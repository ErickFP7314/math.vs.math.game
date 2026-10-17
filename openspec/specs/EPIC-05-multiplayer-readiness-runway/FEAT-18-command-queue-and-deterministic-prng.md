# Feature 18: Cola de Comandos y Números Pseudoaleatorios Deterministas

**Épica:** `EPIC-05: Pista de Aterrizaje para Multijugador (Multiplayer Readiness)`  
**Módulo:** `src/core/engine/SimulationEngine.ts` y `src/core/math/PRNG.ts`  
**Estado:** Especificado  

## Descripción General
Establece las dos piezas arquitectónicas esenciales para posibilitar multijugador 1v1 en tiempo real sin tener que refactorizar la lógica física: un sistema desacoplado de despacho de acciones (`CommandQueue`) y un generador pseudoaleatorio determinista alimentado por una semilla compartida (`Seeded PRNG`).

---

### Historia de Usuario HU-35: Despacho de acciones desacopladas (Command Queue)
*Como arquitecto de software,*  
*Quiero que todas las acciones del jugador humano y de la IA se encolen como comandos discretos antes de ejecutarse en el siguiente tick,*  
*Para que en el futuro los comandos del jugador remoto puedan inyectarse desde un canal WebRTC a la misma cola sin alterar el motor.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Encolado de comando de habilidad
  Dado que el jugador presiona el botón de habilidad en el milisegundo 14.2
  Cuando se registra la acción
  Entonces se empaqueta un objeto Command:
    { tick: 42, entityId: "player", type: "ACTIVATE_SKILL", payload: {} }
  Y se almacena en la cola de comandos del tick 42
  Y el motor procesa el comando de forma síncrona al iniciar el paso físico 42.
```

---

### Historia de Usuario HU-36: Generador PRNG con semilla para sincronización P2P
*Como sistema de simulación determinista,*  
*Quiero utilizar un generador de números pseudoaleatorios con semilla (ej. Mulberry32 o Xoshiro128),*  
*Para que la posición de aparición de orbes amarillos o perturbaciones de rebote sean exactamente iguales en dos clientes sincronizados.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Reproducibilidad determinista de secuencias aleatorias
  Dado dos motores de simulación independientes inicializados con la misma semilla (Seed = 1337)
  Cuando ambos generan una secuencia de 1,000 números aleatorios para posicionar orbes
  Entonces ambas secuencias numéricas DEBEN ser idénticas bit a bit
  Garantizando que no ocurra divergencia de estado (desync).
```
