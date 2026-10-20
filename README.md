# ⚡ Math vs Math: 2D Mathematical Combat Simulator

<p align="center">
  <img src="https://img.shields.io/badge/Physics-Deterministic%2060Hz-cyan.svg?style=for-the-badge" alt="Physics" />
  <img src="https://img.shields.io/badge/Audio-Procedural%20Web%20Audio-magenta.svg?style=for-the-badge" alt="Audio" />
  <img src="https://img.shields.io/badge/Languages-EN%20%7C%20ES%20%7C%20KO-blue.svg?style=for-the-badge" alt="i18n" />
  <img src="https://img.shields.io/badge/React-19-61DAFB.svg?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6.svg?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF.svg?style=for-the-badge&logo=vite" alt="Vite" />
</p>

---

## 📐 Overview

**Math vs Math** transforms calculus, linear algebra, trigonometry, and complex analysis into a high-octane 2D arena combat simulator. Mathematical entities—such as the differential operator $\frac{d}{dx}$, exponential functions $e^x$, indefinite integrals $\int$, trigonometric waves, and transcendental constants like $\pi$ and $e$—clash in real-time elastic physics collisions.

Every interaction faithfully reproduces actual mathematical laws:
- Differentiating a cubic polynomial degrades it into three parabolas ($3x^2$), then lines ($2x$), then constants ($1$), and finally annihilates it ($0$).
- Attacking the exponential eigenfunction $\frac{d}{dx}(e^x) = e^x$ yields zero damage and burns the operator with reflected recoil.
- Partial differentiation $\frac{\partial}{\partial y}(e^x)$ treats $x$ as a constant, achieving an immediate one-shot critical wipeout to $0$.
- Integrating functions spawns lingering integration constant orbs ($+ C_n$) that bounce around the arena.

---

## 🎮 How to Play & Controls

You take command of the left-hand champion (highlighted with an active cyan reticle and the **"YOU"** badge). Direct your sphere to evade attacks, ram enemy entities, and activate mathematical curve abilities!

| Action | Control | Description |
|---|---|---|
| **Thruster Movement** | <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or <kbd>↑</kbd> <kbd>←</kbd> <kbd>↓</kbd> <kbd>→</kbd> | Continuous directional propulsion inside the arena. |
| **Instant Impulse Dash** | **Left Click (Target Area)** | Instantly thrusts your sphere toward the cursor with a shockwave impulse. |
| **Aim Guide & Reticle** | **Mouse Cursor** | Dynamic targeting crosshair and trajectory guide for precise angle bounces. |
| **Activate Skill** | <kbd>Spacebar</kbd> or **[⚡ TRIGGER SKILL]** | Unleashes your entity's signature mathematical curve laser or projectile when charged. |
| **Mute / Unmute** | <kbd>🔊</kbd> Icon in HUD | Toggles the 8-bit procedural Web Audio synthesizer. |
| **Restart Match** | <kbd>🔄</kbd> Icon in HUD | Resets the simulation to the 3-2-1 countdown. |
| **Math Theory Guide** | <kbd>📖</kbd> Icon in HUD/Menu | Opens the interactive mathematical laboratory & didactic guide for all 10 levels. |
| **Language Switcher** | **[EN / ES / KO]** in Header | Switch the entire UI seamlessly between English, Spanish, and Korean. |
| **Client Routing** | `/#/levels`, `/#/level/:id`, `/#/info/:id` | Full hash-based client-side routing with browser back/forward history support. |

---

## ⚔️ Featured Levels & Mathematical Matchups

```
┌────────────────────────────────────────────────────────────────────────┐
│ LEVEL 1 : Differential Operator vs Polynomial                         │
│           d/dx  ⚡  x³ → 3x² → 2x → 1 → 0                             │
│ LEVEL 2 : Differential Operator vs Exponential Function                │
│           d/dx  🛡️  eˣ (Eigenfunction Immunity + Counter-Burn)         │
│ LEVEL 3 : Indefinite Integral vs Sine Wave                             │
│           ∫     🌊  sin x → -cos x (Cyclic Anti-derivative Phase Shift)│
│ LEVEL 4 : Multivariable Partial Derivative vs Exponential              │
│           ∂/∂y  💥  eˣ = 0 (One-shot dimension wipeout)                │
│ LEVEL 5 : Chain Rule vs Composite Function                             │
│           d/dx  🔗  f(g(x)) = f'(g(x)) · g'(x)                        │
│ LEVEL 6 : Indefinite Integral vs Exponential                           │
│           ∫     🪐  eˣ + C₁, C₂, C₃ (Infinite Constant Orb Spawns)    │
│ LEVEL 7 : Imaginary Unit vs Real Axis (Euler's Identity)               │
│           i     🌀  e^(ix) = cos x + i sin x                           │
│ LEVEL 8 : Pi vs Euler's Constant                                       │
│           π     🎯  e (Irrational infinite decimal digit bombardment)   │
│ LEVEL 9 : Gamma Function vs Factorial                                  │
│           Γ(n)  ✨  (n - 1)!                                           │
│ LEVEL 10: Dirac Delta vs Continuous Field                              │
│           δ(x)  ⚡  f(0) Instant Impulse Singularity                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Architecture & Tech Stack

The simulator is built with zero heavyweight physics engines—every equation and trajectory is computed directly from first principles:

```
src/
├── core/
│   ├── physics/
│   │   ├── Vector2D.ts        # 2D Euclidean vector arithmetic & projections
│   │   └── ElasticSolver.ts   # Momentum conservation & restitution collision solver
│   ├── math/
│   │   └── Curves.ts          # Parametric raycasting (Cubic, Exponential, Sine, Sector)
│   ├── engine/
│   │   ├── GameLoop.ts        # 60Hz fixed-timestep delta accumulator loop
│   │   ├── SimulationEngine.ts# State machine, collision dispatcher, match rules
│   │   └── EventBus.ts        # Decoupled pub/sub event pipeline
│   └── levels/
│       └── LevelRegistry.ts   # 10 configured mathematical match definitions
├── render/
│   └── ArenaCanvas.tsx        # High-performance HTML5 Canvas rendering & particles
├── audio/
│   └── WebAudioSynth.ts       # Zero-asset procedural 8-bit chip synthesizer
├── i18n/
│   ├── translations.ts        # Full localization dictionaries (en, es, ko)
│   └── LanguageContext.tsx    # Reactive multi-language provider
├── ui/
│   └── components/            # Modern Tailwind CSS HUD, HP bars, Level Selector & Math Lab
│       ├── GameArenaScreen.tsx# Arena HUD, input handling, and 60Hz loop coordinator
│       ├── MathInfoScreen.tsx # Interactive Didactic Math Guide & Laboratory
│       ├── LevelSelectScreen.tsx # 10-Level selection dashboard & links
│       └── VictoryModal.tsx   # Animated victory popup with instant background freeze
```

### Architectural Highlights
- **Deterministic 60 FPS Simulation**: Fixed-timestep update tick (`dt = 1/60s`) decoupled from the browser monitor's variable `requestAnimationFrame` refresh rate.
- **Custom Parametric Curve Raycaster**: Curves ($y = x^3$, $y = e^x$, $y = \sin x$, circular sectors) are evaluated parametrically into line segments and tested for circle-line intersection in real-time.
- **Zero-Asset Procedural Audio**: 8-bit sound effects (impact bleeps, lasers, countdown chimes, victory jingles) synthesized dynamically with the native browser `AudioContext`.
- **Pure Localization**: Full English, Spanish, and Korean translations with zero language leakage in UI elements, buttons, level summaries, and KaTeX-style mathematical popups.

---

## 🚀 Quickstart Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm` or `pnpm`

### Installation
```bash
# Clone the repository
git clone https://github.com/ErickFP7314/math.vs.math.game.git
cd math.vs.math.game

# Install dependencies
npm install
```

### Running Locally
```bash
# Start Vite development server
npm run dev
```
Open your browser and navigate to `http://localhost:5173/` to play immediately!

### Building for Production
```bash
# Typecheck and build optimized bundle
npm run build

# Preview production build locally
npm run preview
```

### Running the Test Suite
```bash
# Run unit tests via Vitest
npm test
```

---

## 🧪 Testing & Verification

The project is developed using **Spec-Driven Development (SDD)** with automated unit tests for:
- 2D Vector algebra & normalization safety (`Vector2D.test.ts`)
- 2D Elastic momentum collision dynamics (`ElasticSolver.test.ts`)
- Parametric curve raycasting against circular entities (`Curves.test.ts`)
- Simulation lifecycle, countdown transitions, and victory conditions (`SimulationEngine.test.ts`)
- Multi-language dictionary completeness (`i18n.test.ts`)

---

## 📄 License
This project is open-source under the MIT License. Feel free to contribute, extend mathematical mechanics, or create custom levels!
