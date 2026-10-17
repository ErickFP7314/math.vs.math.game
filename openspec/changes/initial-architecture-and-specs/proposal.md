# Propuesta de Cambio: Arquitectura Inicial y Especificaciones de Math vs Math

**ID de Cambio:** `initial-architecture-and-specs`  
**Documento Fuente Principal:** [PROPOSE-ARCHITECTURE.md](../../../PROPOSE-ARCHITECTURE.md)  
**Estado:** Aprobado / En Transición a Especificación y Diseño  

## 1. Motivación y Resumen Ejecutivo
Math vs Math es un juego 2D web donde entidades matemáticas se enfrentan en un cuadrilátero cartesiano bajo física elástica y reglas formales de cálculo y álgebra. El objetivo de este cambio es establecer las bases de ingeniería del proyecto:
1. Arquitectura Hexagonal y Núcleo Headless Determinista.
2. Trade-offs arquitectónicos explicitados (priorizar determinismo, desacoplamiento y 60 FPS sobre complejidad de backend y servidores pesados).
3. Especificación detallada de requerimientos fragmentada en Epics, Features e Historias de Usuario (HUs).
4. Diseño técnico exhaustivo con contratos TypeScript y máquinas de estado.
5. Plan de trabajo estructurado en tareas comprobables bajo modalidad TDD Estricto.

## 2. Capacidades (Capabilities)

### Nuevas Capacidades (New Capabilities)
* **`core-physics-engine`**: Motor físico 2D vectorial determinista en paso de tiempo fijo (60Hz), detección de colisiones círculo-círculo, rebotes elásticos y raycasting de curvas analíticas.
* **`mathematical-entities-and-combat`**: Entidades y reglas formales de cálculo: operadores diferenciales ($d/dx, \partial/\partial y$), integrales ($\int$), polinomios ($x^n$), exponenciales ($e^x$), números imaginarios ($i$), constantes ($\pi$) y funciones trigonométricas ($\sin, \cos$).
* **`presentation-ui-and-audio`**: Lienzo PixiJS 2D vertical 9:16, HUD reactivo en React 19 con KaTeX y generador de audio retro procedural con Web Audio API.
* **`ai-and-player-controls`**: Modelo de micro-impulsos y activación de habilidades para el jugador, y máquina de estados táctica heurística para la máquina/IA.
* **`multiplayer-readiness-runway`**: Cola de comandos serializables (`CommandQueue`) y generador determinista con semilla (`PRNG`) listos para WebRTC/WebSockets sin reescritura.

## 3. Plan de Rollback
Al tratarse de la inicialización de la arquitectura y especificaciones, el rollback consiste en revertir el commit inicial de Git.
