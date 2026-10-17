# Feature 10: Entidades Trigonométricas (sin x, cos x) y Orbes

**Épica:** `EPIC-02: Entidades Matemáticas y Reglas de Combate (Math Rules)`  
**Módulo:** `src/core/entities/TrigEntity.ts`  
**Estado:** Especificado  

## Descripción General
Modela las funciones trigonométricas fundamentales $\sin x$ (azul índigo `#3F51B5`) y $\cos x$ (magenta púrpura `#D500F9`), ambas con 100 HP, su absorción de orbes potenciadores de amplitud (`a x 2`) y frecuencia (`b x 2`), y su ataque de proyectil ondulatorio con tiempo de recarga gobernado analíticamente por su período $T = \frac{2\pi}{b}$.

---

### Historia de Usuario HU-19: Recolección de orbes multiplicadores de amplitud y frecuencia
*Como entidad trigonométrica ($y = a \sin(bx)$ o $y = a \cos(bx)$),*  
*Quiero recolectar orbes dorados en la arena para duplicar mis coeficientes $a$ y $b$,*  
*Para disparar ondas más anchas y con cadencia de tiro mucho más rápida.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Recolección de orbe de amplitud (a x 2)
  Dada una entidad con ecuación actual y = 1 sin(1x)
  Cuando colisiona con un orbe "a x 2"
  Entonces su coeficiente a se duplica a 2 (y = 2 sin(1x))
  Y el ancho transversal del proyectil de onda DEBE aumentar en proporción a a.

Escenario: Recolección de orbe de frecuencia (b x 2)
  Dada una entidad con período de recarga actual T = 2π / 1 ≈ 6.28 s
  Cuando colisiona con un orbe "b x 2"
  Entonces su coeficiente b se duplica a 2 (y = a sin(2x))
  Y su nuevo período de recarga DEBE reducirse a la mitad (T = 2π / 2 = 3.14 s)
  Y tras recolectar orbes sucesivos puede llegar hasta b = 16 (T ≈ 0.39 s).
```

---

### Historia de Usuario HU-20: Disparo de ondas transversales con cadencia según período T
*Como jugador controlando a $\sin x$ o $\cos x$,*  
*Quiero disparar un proyectil en forma de onda oscilante hacia el rival cada vez que transcurre el período $T$,*  
*Para infligir -25 HP de daño directo por impacto.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Disparo de Onda Seno / Coseno
  Dado que la barra de recarga por período ha alcanzado el 100%
  Cuando el jugador activa el disparo ("사인파!" o "코사인파!")
  Entonces se emite un proyectil ondulatorio que avanza hacia el rival oscilando con amplitud a y frecuencia b
  Y al contactar a la esfera contraria DEBE infligir exactamente -25 HP de daño
  Y desplegar partículas de impacto del color característico del atacante.
```
