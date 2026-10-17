# Feature 16: Controles de Jugador y Disparadores Tácticos

**Épica:** `EPIC-04: Controles de Jugador y Agente de Inteligencia Artificial (AI & Inputs)`  
**Módulo:** `src/core/entities/BaseEntity.ts` y `src/ui/components/CooldownGauge.tsx`  
**Estado:** Especificado  

## Descripción General
Define el esquema de interacción del jugador para el modo individual (Player vs. Machine), permitiendo micro-impulsos cinemáticos para influir en la trayectoria de rebote y un botón de habilidad táctico con temporizador de recarga (*cooldown*).

---

### Historia de Usuario HU-31: Micro-impulsos cinemáticos por toque o ratón
*Como jugador,*  
*Quiero arrastrar o hacer clic en la pantalla para aplicar pequeños impulsos vectoriales a mi esfera,*  
*Para tener agencia sobre la física y poder esquivar cuchillas o buscar colisiones con precisión.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Aplicación de micro-impulso
  Dado que el jugador presiona y desliza el cursor o dedo en dirección hacia arriba a la derecha
  Cuando suelta el control
  Entonces se calcula el vector de dirección normalizado multiplicado por una fuerza máxima acotada
  Y se suma a la velocidad lineal actual de la esfera del jugador
  Sin violar la velocidad terminal máxima establecida en la configuración del nivel.
```

---

### Historia de Usuario HU-32: Activación manual de habilidades con botón de cooldown
*Como jugador,*  
*Quiero presionar la barra espaciadora o tocar el botón en el HUD cuando mi habilidad esté recargada,*  
*Para ejecutar mis ataques especiales en el momento estratégico oportuno.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Intento de disparo con habilidad en recarga
  Dado que la habilidad tiene un cooldown restante de 1.8 segundos
  Cuando el usuario presiona la barra espaciadora o el botón
  Entonces la habilidad NO DEBE ejecutarse
  Y el indicador visual de recarga DEBE parpadear en gris brevemente.

Escenario: Disparo con habilidad en estado READY
  Dado que el temporizador de cooldown ha llegado a 0 y la etiqueta muestra "[READY]"
  Cuando el usuario presiona el botón de habilidad
  Entonces la habilidad se ejecuta de inmediato
  Y el temporizador de cooldown se reinicia a su valor máximo correspondiente.
```
