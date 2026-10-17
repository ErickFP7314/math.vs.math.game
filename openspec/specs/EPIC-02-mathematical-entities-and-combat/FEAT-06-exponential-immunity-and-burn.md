# Feature 06: Función Exponencial (e^x), Inmunidad y Quemadura

**Épica:** `EPIC-02: Entidades Matemáticas y Reglas de Combate (Math Rules)`  
**Módulo:** `src/core/entities/ExponentialEntity.ts`  
**Estado:** Especificado  

## Descripción General
Modela la función exponencial $e^x$, su invulnerabilidad intrínseca frente al operador derivada $\frac{d}{dx}(e^x) = e^x$, la aplicación del efecto de estado negativo "Quemadura" (DoT) por contacto físico, y el ataque especial "Cuchilla Exponencial" con asíntota horizontal punteada.

---

### Historia de Usuario HU-11: Escudo de inmunidad matemática d/dx(e^x) = e^x
*Como entidad exponencial $e^x$,*  
*Quiero ser completamente inmune al daño por colisión con $\frac{d}{dx}$,*  
*Para reflejar fielmente la propiedad analítica de que la derivada de $e^x$ es ella misma.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Colisión con el operador diferencial
  Dada la entidad $e^x$ con HP inicial 80 / 80
  Cuando $\frac{d}{dx}$ colisiona contra ella
  Entonces el HP de $e^x$ DEBE permanecer estrictamente en 80 / 80
  Y se DEBE desplegar un escudo hexagonal rojo giratorio sobre $e^x$
  Y la etiqueta DEBE mostrar "[미분 면역!]"
  Y el HUD izquierdo DEBE incrementar el contador de intentos fallidos "[미분 시도 N회]".
```

---

### Historia de Usuario HU-12: Estado de quemadura (DoT) y ataque de Cuchilla Exponencial
*Como jugador o entidad $e^x$,*  
*Quiero infligir quemadura al oponente y disparar un corte en curva exponencial tras recargar,*  
*Para infligir daño directo y daño en el tiempo a los rivales.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Aplicación de quemadura por contacto
  Dado que $\frac{d}{dx}$ colisiona contra $e^x$
  Entonces $\frac{d}{dx}$ DEBE recibir un impacto inicial de -4 HP
  Y adquirir el estado "화상!" (Quemadura) con anillo ígneo
  Y perder -2 HP por tick periódicamente mientras dure el efecto.

Escenario: Activación de Cuchilla Exponencial
  Dado que han transcurrido de 3 a 4 segundos de recarga y el HUD indica "[지수 칼날!]"
  Cuando se activa la habilidad manualmente
  Entonces se DEBE trazar la curva roja $y - y_0 = e^{x - x_0}$ y su asíntota horizontal punteada
  Y ejecutar un corte brillante a través de la arena
  Y cualquier entidad enemiga en la trayectoria DEBE recibir entre -10 y -13 HP de daño directo
  Y renovar su estado de quemadura (-2 HP/tick).
```
