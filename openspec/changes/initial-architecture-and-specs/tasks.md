# Plan de Tareas de Implementación (Work Breakdown Structure - TDD Estricto)

**Cambio:** `initial-architecture-and-specs`  
**Modalidad de Testing:** `Strict TDD Mode (RED -> GREEN -> REFACTOR)`  
**Comando de Test:** `npx vitest run`  
**Estado:** Listo para Ejecución en Fase `sdd-apply`  

---

## ÉPICA 1: Motor Físico y Núcleo de Simulación (Core Engine)

### Feature 01: Bucle de Tiempo Fijo y Acumulador (Fixed Timestep Loop)
- [ ] **T-01.1 (RED):** Escribir pruebas unitarias en `tests/engine/GameLoop.test.ts` para validar que el bucle avance en incrementos exactos de 16.666 ms independientemente del `deltaTime` del navegador.
- [ ] **T-01.2 (GREEN):** Implementar la clase `src/core/engine/GameLoop.ts` con el patrón de acumulador de tiempo y límite de prevención de congelamiento (`MAX_ACCUMULATOR = 0.25`).
- [ ] **T-01.3 (RED):** Escribir pruebas unitarias para `getStateSnapshot()` asegurando la inmutabilidad y serialización del estado del mundo.
- [ ] **T-01.4 (GREEN):** Implementar generación de instantáneas inmutables en `src/core/engine/SimulationEngine.ts`.
- [ ] **T-01.5 (REFACTOR):** Optimizar la asignación de memoria reutilizando estructuras internas para reducir recolección de basura.

### Feature 02: Cinemática Vectorial 2D y Rebote Elástico
- [ ] **T-02.1 (RED):** Escribir suite de pruebas en `tests/physics/Vector2D.test.ts` cubriendo operaciones vectoriales (suma, resta, producto escalar, magnitud, normalización y rotación).
- [ ] **T-02.2 (GREEN):** Implementar `src/core/physics/Vector2D.ts` con funciones puras e inmutables.
- [ ] **T-02.3 (RED):** Escribir pruebas en `tests/physics/ElasticSolver.test.ts` validando la conservación de momento lineal y corrección posicional en choques elásticos 2D de esferas.
- [ ] **T-02.4 (GREEN):** Implementar `src/core/physics/ElasticSolver.ts` con cálculo analítico del impulso elástico $J$ y resolución de penetración.
- [ ] **T-02.5 (REFACTOR):** Documentar casos límite matemáticos en `ElasticSolver.ts` (masas asimétricas y choques a velocidad cero).

### Feature 03: Confinamiento en Arena y Detección de Curvas
- [ ] **T-03.1 (RED):** Escribir pruebas en `tests/physics/CollisionDetector.test.ts` para rebotes contra las 4 paredes del lienzo 9:16.
- [ ] **T-03.2 (GREEN):** Implementar detección y corrección de límites de arena en `CollisionDetector.ts`.
- [ ] **T-03.3 (RED):** Escribir pruebas unitarias para la intersección analítica de esferas contra polinomios, curvas exponenciales y ondas en `tests/math/Curves.test.ts`.
- [ ] **T-03.4 (GREEN):** Implementar ecuaciones paramétricas y muestreo analítico de distancias en `src/core/math/Curves.ts`.

---

## ÉPICA 2: Entidades Matemáticas y Reglas de Combate

### Feature 04: Operador Diferencial (d/dx)
- [ ] **T-04.1 (RED):** Escribir pruebas para la reducción de grado polinómico en `tests/entities/DifferentialOperator.test.ts`.
- [ ] **T-04.2 (GREEN):** Implementar clase `src/core/entities/DifferentialOperator.ts` con HP = 100, color cian `#00ACC1` y lógica de derivación por impacto.
- [ ] **T-04.3 (REFACTOR):** Desacoplar eventos de fórmulas matemáticas al `EventBus`.

### Feature 05: Polinomios (x^3, x^2, x, 1) y Gráficos Láser
- [ ] **T-05.1 (RED):** Escribir pruebas para la división de $x^3 \rightarrow 3x^2 \rightarrow 2x \rightarrow 1 \rightarrow 0$ y decremento de HP global (16/16) en `tests/entities/PolynomialEntity.test.ts`.
- [ ] **T-05.2 (GREEN):** Implementar `src/core/entities/PolynomialEntity.ts` con jerarquía de radios, colores naranjas y salud global compartida.
- [ ] **T-05.3 (RED):** Escribir pruebas para la habilidad "Invocación de Gráfico" (telegrafiado 0.8s, daño de láser de $x^2$ = -23 HP, $x/1$ = -18 HP).
- [ ] **T-05.4 (GREEN):** Implementar temporizador y disparo de láseres en `PolynomialEntity.ts`.

### Feature 06: Exponencial (e^x), Inmunidad y Quemadura
- [ ] **T-06.1 (RED):** Escribir pruebas en `tests/entities/ExponentialEntity.test.ts` verificando que $d/dx$ no reduzca la salud de $e^x$ (inmunidad total con escudo).
- [ ] **T-06.2 (GREEN):** Implementar escudo de inmunidad en `src/core/entities/ExponentialEntity.ts`.
- [ ] **T-06.3 (RED):** Escribir pruebas para la quemadura DoT (-4 inicial, -2 por tick) y la Cuchilla Exponencial (-10 a -13 HP).
- [ ] **T-06.4 (GREEN):** Implementar aplicación de DoT y trazado de la Cuchilla Exponencial con asíntota en `ExponentialEntity.ts`.

### Feature 07: Unidad Imaginaria (i) y Fases Cíclicas
- [ ] **T-07.1 (RED):** Escribir pruebas para la rotación de fases cada 3.0s ($i \rightarrow -1 \rightarrow -i \rightarrow 1$) en `tests/entities/ImaginaryEntity.test.ts`.
- [ ] **T-07.2 (GREEN):** Implementar máquina de fases de $i$ en `src/core/entities/ImaginaryEntity.ts`.
- [ ] **T-07.3 (RED):** Escribir pruebas para el daño por cruce intangible (-8 HP) en fase $i$ y la reflexión de daño ($\times (-1)$) en fase $-1$.
- [ ] **T-07.4 (GREEN):** Implementar lógica de intangibilidad y proyectiles reflejados en `ImaginaryEntity.ts`.

### Feature 08: Derivada Parcial (∂/∂y) y Multivariable
- [ ] **T-08.1 (RED):** Escribir pruebas en `tests/entities/PartialDerivative.test.ts` para la aniquilación letal instantánea $\frac{\partial}{\partial y}(e^x) = 0$ (-80 HP).
- [ ] **T-08.2 (GREEN):** Implementar entidad `PartialDerivative.ts` con color verde esmeralda y regla de daño crítico mortal.
- [ ] **T-08.3 (RED):** Escribir pruebas para la regla de la cadena multivariable $\frac{\partial}{\partial y}(e^{xy}) = x \cdot e^{xy}$.
- [ ] **T-08.4 (GREEN):** Implementar variante multivariable de absorción orbital.

### Feature 09: Operador Integral (∫) y Proliferación
- [ ] **T-09.1 (RED):** Escribir pruebas para $\int e^x dx = e^x + C_n$ y elevación de grado polinómico sucesivo en `tests/entities/IntegralEntity.test.ts`.
- [ ] **T-09.2 (GREEN):** Implementar `src/core/entities/IntegralEntity.ts` con generación de constantes $C_n$ (1 HP) y proliferación polinómica.
- [ ] **T-09.3 (RED):** Escribir pruebas para el Látigo Integral (5s cooldown, -12 HP totales).
- [ ] **T-09.4 (GREEN):** Implementar ataque de látigo y apéndice rotatorio en `IntegralEntity.ts`.

### Feature 10: Duelo Trigonométrico (sin x vs cos x)
- [ ] **T-10.1 (RED):** Escribir pruebas para la recolección de orbes `a x 2` y `b x 2` en `tests/entities/TrigEntity.test.ts`.
- [ ] **T-10.2 (GREEN):** Implementar `src/core/entities/TrigEntity.ts` con recálculo dinámico de amplitud $a$ y período $T = \frac{2\pi}{b}$.
- [ ] **T-10.3 (RED):** Escribir pruebas para el proyectil ondulatorio con -25 HP de daño.
- [ ] **T-10.4 (GREEN):** Implementar disparo de ondas sinusoidales guiadas en `TrigEntity.ts`.

### Feature 11: Constante Pi (π) y Corte de Sector
- [ ] **T-11.1 (RED):** Escribir pruebas para el consumo sucesivo de la cola de dígitos decimales (`3.14159...`) en `tests/entities/PiEntity.test.ts`.
- [ ] **T-11.2 (GREEN):** Implementar cola decimal orbital en `src/core/entities/PiEntity.ts`.
- [ ] **T-11.3 (RED):** Escribir pruebas para el corte de sector circular (-15 HP) y la duplicación del ángulo $\theta$ ($\frac{\pi}{6} \rightarrow 2\pi$).
- [ ] **T-11.4 (GREEN):** Implementar corte de sector circular con área $S = \frac{1}{2}r^2\theta$ en `PiEntity.ts`.

### Feature 12: Niveles de Expansión (Euler, Logaritmo, L'Hôpital)
- [ ] **T-12.1 (RED):** Escribir pruebas para la batalla de la Identidad de Euler ($e^{i\pi} + 1 = 0$) en `tests/levels/EulerLevel.test.ts`.
- [ ] **T-12.2 (GREEN):** Implementar entidad fasor y onda armónica de Euler en `src/core/levels/LevelRegistry.ts`.
- [ ] **T-12.3 (RED):** Escribir pruebas para la singularidad asintótica en $x \le 0$ de $\ln(x)$ y la indeterminación $\frac{0}{0}$.
- [ ] **T-12.4 (GREEN):** Implementar distorsiones gravitatorias e indeterminaciones de L'Hôpital.

---

## ÉPICA 3: Presentación Visual, HUD y Audio

### Feature 13: Lienzo PixiJS y Cuadrícula Cartesiana
- [ ] **T-13.1 (GREEN):** Implementar `src/render/PixiStage.ts` con viewport responsivo vertical 9:16 y soporte WebGL/WebGPU.
- [ ] **T-13.2 (GREEN):** Implementar `src/render/CartesianGrid.ts` con ejes graduados, origen y cuadrícula $10 \times 10$ `#EEEEEE`.
- [ ] **T-13.3 (GREEN):** Implementar `src/render/Interpolator.ts` para interpolación lineal (Lerp) de posiciones visuales a 60-120 FPS.

### Feature 14: HUD Reactivo con KaTeX
- [ ] **T-14.1 (GREEN):** Implementar cabecera con avatares circulares y etiquetas dinámicas en `src/ui/components/HeaderHUD.tsx`.
- [ ] **T-14.2 (GREEN):** Implementar barras de salud con transición de daño en rojo en `src/ui/components/HPBar.tsx`.
- [ ] **T-14.3 (GREEN):** Implementar notificaciones flotantes de fórmulas matemáticas LaTeX con KaTeX en `FloatingMathText.tsx`.

### Feature 15: Sistema de Audio Procedural
- [ ] **T-15.1 (GREEN):** Implementar sintetizador de ondas Web Audio para pitidos de cuenta regresiva y fanfarria en `src/audio/WebAudioSynth.ts`.
- [ ] **T-15.2 (GREEN):** Implementar gestor de efectos dinámicos de corte y fuego en `src/audio/SoundManager.ts`.

---

## ÉPICA 4: Controles de Jugador e Inteligencia Artificial

### Feature 16: Controles de Jugador y Disparadores Tácticos
- [ ] **T-16.1 (RED):** Escribir pruebas para la aplicación de micro-impulsos cinemáticos acotados en `tests/input/PlayerInput.test.ts`.
- [ ] **T-16.2 (GREEN):** Implementar captura de gestos táctiles y ratón en el componente de arena.
- [ ] **T-16.3 (GREEN):** Conectar tecla de espacio y botón del HUD con la cola de comandos de habilidad.

### Feature 17: Agente Táctico de IA para la Máquina
- [ ] **T-17.1 (RED):** Escribir pruebas para la detección heurística de peligros y activación oportuna de ataques en `tests/ai/AIAgent.test.ts`.
- [ ] **T-17.2 (GREEN):** Implementar máquina de estados táctica en `src/core/ai/AIAgent.ts`.

---

## ÉPICA 5: Pista de Aterrizaje para Multijugador

### Feature 18: Cola de Comandos y PRNG Determinista
- [ ] **T-18.1 (RED):** Escribir pruebas para la sincronización determinista de partidas usando la misma semilla en `tests/engine/PRNG.test.ts`.
- [ ] **T-18.2 (GREEN):** Implementar generador Mulberry32 con semilla en `src/core/math/PRNG.ts`.
- [ ] **T-18.3 (GREEN):** Implementar `CommandQueue` desacoplada en `SimulationEngine.ts`.
