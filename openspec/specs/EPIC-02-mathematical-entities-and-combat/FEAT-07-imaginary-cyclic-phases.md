# Feature 07: Unidad Imaginaria (i) y Rotación de Fases Cíclicas

**Épica:** `EPIC-02: Entidades Matemáticas y Reglas de Combate (Math Rules)`  
**Módulo:** `src/core/entities/ImaginaryEntity.ts`  
**Estado:** Especificado  

## Descripción General
Modela la entidad del número imaginario puro $i$ ($HP = 50$), su rotación cíclica cada 3 segundos a través de las 4 potencias fundamentales ($i^1 = i$, $i^2 = -1$, $i^3 = -i$, $i^4 = 1$), y sus propiedades de combate asociadas: perforación intangible e inversión/reflexión del daño recibido.

---

### Historia de Usuario HU-13: Ciclo temporal de potencias (i -> -1 -> -i -> 1)
*Como entidad imaginaria $i$,*  
*Quiero alternar de forma cíclica entre cuatro estados algebraicos cada ~3 segundos,*  
*Para transformar mis propiedades físicas y visuales a lo largo del combate.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Rotación de fase con fórmula flotante
  Dada la entidad $i$ en fase "i"
  Cuando transcurren 3.0 segundos
  Entonces la fase DEBE rotar a "-1"
  Y el HUD inferior DEBE actualizarse a "[-1 반사]"
  Y DEBE mostrarse la fórmula flotante "i \times i = -1"
  Y un anillo exterior punteado giratorio DEBE aparecer sobre la esfera.
```

---

### Historia de Usuario HU-14: Perforación fantasma e inversión de daño recibido
*Como jugador controlando a $i$,*  
*Quiero atravesar al oponente en estados imaginarios y reflejar el daño en estados negativos,*  
*Para contrarrestar los ataques masivos de las funciones oponentes.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Fase i (Perforación intangible)
  Dada la entidad $i$ en fase "i"
  Cuando colisiona con el oponente
  Entonces NO DEBE rebotar elásticamente sino atravesar la esfera como fantasma
  Y DEBE infligir -8 HP de daño directo por cruce al oponente.

Escenario: Fase -1 (Reflexión de daño)
  Dada la entidad $i$ en fase "-1"
  Cuando recibe un ataque (corte de cuchilla o quemadura)
  Entonces multiplica el daño recibido por -1
  Y refleja el daño hacia el atacante (restando de -16 a -20 HP al oponente).

Escenario: Fase -i (Perforación + Reflexión)
  Dada la entidad $i$ en fase "-i"
  Entonces combina la intangibilidad con daño por cruce (-8 HP) y el reflejo de ataques.

Escenario: Fase 1 (Colisión normal)
  Dada la entidad $i$ en fase "1"
  Entonces se comporta con física de choque elástico estándar sin habilidades especiales.
```
