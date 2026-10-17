# Índice General de Especificaciones: Epics, Features e Historias de Usuario (HUs)

Este directorio contiene la especificación formal del videojuego **Math vs Math (Mathematical Combat Simulator)**, estructurada jerárquicamente en **5 Épicas**, **18 Features** y **36 Historias de Usuario (HUs)** documentadas bajo la sintaxis estándar Gherkin (Given/When/Then) y RFC 2119.

---

## Mapa de Trazabilidad: Epics y Features

```
EPIC-01: Motor Físico y Núcleo de Simulación (Core Engine)
├── FEAT-01: Bucle de Tiempo Fijo y Acumulador (Fixed Timestep Loop)
│   ├── HU-01: Ejecución determinista a 60 Hz independiente de FPS
│   └── HU-02: Instantáneas de estado inmutables (Snapshots)
├── FEAT-02: Cinemática Vectorial 2D y Rebote Elástico
│   ├── HU-03: Operaciones vectoriales euclidianas puras
│   └── HU-04: Conservación de cantidad de movimiento en colisiones de esferas
└── FEAT-03: Detección de Colisiones y Trazado de Curvas Analíticas
    ├── HU-05: Colisión con límites de la arena cartesiana 9:16
    └── HU-06: Intersección círculo contra curvas paramétricas y láseres

EPIC-02: Entidades Matemáticas y Reglas de Combate (Math Rules)
├── FEAT-04: Operador Diferencial (d/dx)
│   ├── HU-07: Impacto y reducción de grado por derivada
│   └── HU-08: Gestión de salud y estela cian
├── FEAT-05: Entidades Polinómicas (x^3, x^2, x, 1) y Gráficos Láser
│   ├── HU-09: Subdivisión polinómica y barra global de 16 HP
│   └── HU-10: Invocación de gráfico y disparo de haces láser
├── FEAT-06: Función Exponencial (e^x), Inmunidad y Quemadura
│   ├── HU-11: Escudo de inmunidad matemática d/dx(e^x) = e^x
│   └── HU-12: Estado de quemadura (DoT) y ataque de Cuchilla Exponencial
├── FEAT-07: Unidad Imaginaria (i) y Rotación de Fases Cíclicas
│   ├── HU-13: Ciclo temporal de potencias (i -> -1 -> -i -> 1)
│   └── HU-14: Perforación fantasma e inversión de daño recibido
├── FEAT-08: Operadores Derivada Parcial (∂/∂y) y Multivariable
│   ├── HU-15: Aniquilación letal de variables independientes ∂/∂y(e^x) = 0
│   └── HU-16: Derivadas parciales con regla de la cadena (e^(xy))
├── FEAT-09: Operador Integral (∫) y Proliferación Polinómica
│   ├── HU-17: Integración indefinida y generación de constantes Cn
│   └── HU-18: Elevación de grado polinómico sucesivo y Látigo Integral
├── FEAT-10: Entidades Trigonométricas (sin x, cos x) y Orbes
│   ├── HU-19: Recolección de orbes multiplicadores de amplitud y frecuencia
│   └── HU-20: Disparo de ondas transversales con cadencia según período T
├── FEAT-11: Constante Pi (π), Cola Decimal y Sector Angular
│   ├── HU-21: Impacto de dígitos decimales orbitales (3.14159...)
│   └── HU-22: Corte de sector circular expansivo (π/6 -> 2π)
└── FEAT-12: Niveles de Expansión (Euler, Logaritmo, L'Hôpital)
    ├── HU-23: Gran Final de Euler (e^(iπ) + 1 = 0)
    └── HU-24: Singularidades de Logaritmo y L'Hôpital

EPIC-03: Presentación Visual, HUD y Audio (Presentation Layer)
├── FEAT-13: Lienzo PixiJS v8 y Cuadrícula Cartesiana
│   ├── HU-25: Renderizado del plano cartesiano 9:16 con graduación y origen
│   └── HU-26: Interpolación de movimiento (Lerp) para 60-120 FPS
├── FEAT-14: HUD Reactivo con Fórmulas KaTeX
│   ├── HU-27: Barras de HP y contadores temáticos dinámicos
│   └── HU-28: Avisos flotantes de fórmulas matemáticas evaluadas
└── FEAT-15: Sistema de Audio Retro Procedural
    ├── HU-29: Sintetizador Web Audio para pitidos y fanfarrias retro
    └── HU-30: Efectos dinámicos de corte, láser y DoT de fuego

EPIC-04: Controles de Jugador y Agente de Inteligencia Artificial (AI & Inputs)
├── FEAT-16: Controles de Jugador y Disparadores Tácticos
│   ├── HU-31: Micro-impulsos cinemáticos por toque o ratón
│   └── HU-32: Activación manual de habilidades con botón de cooldown
└── FEAT-17: Agente Táctico de IA para la Máquina
    ├── HU-33: Algoritmo heurístico de evasión de peligros y rayos
    └── HU-34: Detección de oportunidad y activación óptima de ataques

EPIC-05: Pista de Aterrizaje para Multijugador (Multiplayer Readiness)
└── FEAT-18: Cola de Comandos y Números Pseudoaleatorios Deterministas
    ├── HU-35: Despacho de acciones desacopladas (Command Queue)
    └── HU-36: Generador PRNG con semilla para sincronización P2P
```
