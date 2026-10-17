# Feature 11: Constante Pi (π), Cola Decimal y Sector Angular

**Épica:** `EPIC-02: Entidades Matemáticas y Reglas de Combate (Math Rules)`  
**Módulo:** `src/core/entities/PiEntity.ts`  
**Estado:** Especificado  

## Descripción General
Modela la constante matemática trascendental $\pi$ ($HP = 75$, azul real `#1E88E5`), su cola orbital con la secuencia infinita de decimales ($3, 1, 4, 1, 5, 9, 2, 6, 5\dots$) que infligen daño de contacto según el valor del dígito activo, y su ataque progresivo de corte de sector circular con área $S = \frac{1}{2}r^2\theta$, duplicando su apertura angular desde $\frac{\pi}{6}$ hasta $2\pi$.

---

### Historia de Usuario HU-21: Impacto de dígitos decimales orbitales (3.14159...)
*Como entidad $\pi$,*  
*Quiero que mi cola de dígitos decimales en rotación orbital dañe al oponente por contacto,*  
*Para castigar la proximidad física del rival con el valor exacto de mis cifras.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Contacto con el dígito activo de Pi
  Dada la entidad $\pi$ con su primer dígito activo en "3"
  Cuando un oponente colisiona con el dígito orbital
  Entonces el oponente recibe exactamente -3 HP de daño directo
  Y el dígito "3" se consume, activando el siguiente decimal "1"
  Y el siguiente impacto infligirá -1 HP, seguido de -4 HP, -1 HP, -5 HP, -9 HP consecutivamente.
```

---

### Historia de Usuario HU-22: Corte de sector circular expansivo (π/6 -> 2π)
*Como jugador controlando a $\pi$,*  
*Quiero detonar el corte de sector angular ("부채꼴 베기!") cada vez que un enemigo entra en rango,*  
*Para infligir -15 HP de daño y expandir el ángulo del abanico hasta formar un círculo protector completo.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Ejecución de corte de sector y expansión angular
  Dada la entidad $\pi$ con ángulo de sector inicial $\theta = \frac{\pi}{6}$
  Cuando el oponente entra en el área del sector azul y se activa el corte
  Entonces DEBE emitirse un destello con la fórmula $S = \frac{1}{2}r^2\theta$
  Y el oponente DEBE recibir exactamente -15 HP de daño
  Y el ángulo $\theta$ para el próximo ataque DEBE duplicarse a $\frac{\pi}{3}$, luego a $\frac{\pi}{2}$, $\pi$ y $2\pi$
  Y al alcanzar $2\pi$ cubre los 360° completos alrededor de $\pi$ antes de reiniciarse a $\frac{\pi}{6}$.
```
